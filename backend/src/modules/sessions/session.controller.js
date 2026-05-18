const prisma = require("../../config/db");
const redis = require("../../config/redis");
const { AppError } = require("../../middleware/errorHandler");

const AUTOSAVE_PREFIX = "autosave:";
const AUTOSAVE_TTL = 60 * 60 * 4; // 4 hours

async function startSession(req, res, next) {
  try {
    const { examId } = req.body;
    const studentId = req.user.id;

    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam || exam.status !== "PUBLISHED" && exam.status !== "ACTIVE") {
      throw new AppError("Exam not available", 400);
    }

    let session = await prisma.examSession.findUnique({
      where: { examId_studentId: { examId, studentId } },
    });

    if (session && session.status === "SUBMITTED") {
      throw new AppError("Exam already submitted", 400);
    }

    if (!session) {
      session = await prisma.examSession.create({
        data: {
          examId,
          studentId,
          status: "IN_PROGRESS",
          startedAt: new Date(),
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
        },
      });
    } else if (session.status === "DISCONNECTED" || session.status === "WAITING") {
      session = await prisma.examSession.update({
        where: { id: session.id },
        data: { status: "IN_PROGRESS", startedAt: session.startedAt || new Date() },
      });
    }

    const savedAnswers = await redis.get(`${AUTOSAVE_PREFIX}${session.id}`);

    res.json({
      success: true,
      data: {
        session,
        recoveredAnswers: savedAnswers ? JSON.parse(savedAnswers) : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function autoSave(req, res, next) {
  try {
    const { sessionId } = req.params;
    const { answers } = req.body;

    const session = await prisma.examSession.findUnique({ where: { id: sessionId } });
    if (!session || session.studentId !== req.user.id) {
      throw new AppError("Session not found", 404);
    }
    if (session.status === "SUBMITTED") {
      throw new AppError("Session already submitted", 400);
    }

    await redis.setex(
      `${AUTOSAVE_PREFIX}${sessionId}`,
      AUTOSAVE_TTL,
      JSON.stringify(answers),
    );

    res.json({ success: true, message: "Answers auto-saved" });
  } catch (err) {
    next(err);
  }
}

async function submitExam(req, res, next) {
  try {
    const { sessionId } = req.params;
    const { answers } = req.body;

    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
      include: { exam: { include: { questions: true } } },
    });
    if (!session || session.studentId !== req.user.id) {
      throw new AppError("Session not found", 404);
    }
    if (session.status === "SUBMITTED") {
      throw new AppError("Already submitted", 400);
    }

    const questionMap = new Map(session.exam.questions.map((q) => [q.id, q]));
    let totalScore = 0;
    let maxScore = 0;

    const answerRecords = [];
    for (const ans of answers) {
      const question = questionMap.get(ans.questionId);
      if (!question) continue;

      maxScore += question.marks;
      const isCorrect = JSON.stringify(question.correctAnswer) === JSON.stringify(ans.answer);
      const score = isCorrect ? question.marks : 0;
      totalScore += score;

      answerRecords.push({
        sessionId,
        questionId: ans.questionId,
        answer: ans.answer,
        isCorrect,
        score,
      });
    }

    await prisma.$transaction([
      ...answerRecords.map((a) =>
        prisma.answer.upsert({
          where: { sessionId_questionId: { sessionId: a.sessionId, questionId: a.questionId } },
          create: a,
          update: { answer: a.answer, isCorrect: a.isCorrect, score: a.score },
        })
      ),
      prisma.examSession.update({
        where: { id: sessionId },
        data: { status: "SUBMITTED", submittedAt: new Date(), score: totalScore, maxScore },
      }),
    ]);

    await redis.del(`${AUTOSAVE_PREFIX}${sessionId}`);

    res.json({
      success: true,
      data: { score: totalScore, maxScore, percentage: maxScore > 0 ? ((totalScore / maxScore) * 100).toFixed(2) : 0 },
    });
  } catch (err) {
    next(err);
  }
}

async function getSession(req, res, next) {
  try {
    const session = await prisma.examSession.findUnique({
      where: { id: req.params.sessionId },
      include: { answers: true, behavioralFlags: true },
    });
    if (!session) throw new AppError("Session not found", 404);
    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
}

async function relocateStudent(req, res, next) {
  try {
    const { sessionId } = req.params;
    const { newIpAddress, newSeatX, newSeatY, newSeatLabel } = req.body;

    const session = await prisma.examSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new AppError("Session not found", 404);

    await prisma.examSession.update({
      where: { id: sessionId },
      data: { ipAddress: newIpAddress || session.ipAddress },
    });

    if (newSeatX !== undefined && newSeatY !== undefined) {
      await prisma.seatingAssignment.upsert({
        where: { sessionId },
        create: { venueId: req.body.venueId, sessionId, seatX: newSeatX, seatY: newSeatY, seatLabel: newSeatLabel },
        update: { seatX: newSeatX, seatY: newSeatY, seatLabel: newSeatLabel },
      });
    }

    res.json({ success: true, message: "Student relocated" });
  } catch (err) {
    next(err);
  }
}

module.exports = { startSession, autoSave, submitExam, getSession, relocateStudent };
