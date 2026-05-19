const prisma = require("../../config/db");
const { AppError } = require("../../middleware/errorHandler");

async function resolveInstitutionId(userId, explicitId) {
  if (explicitId) return explicitId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { institutionId: true },
  });
  if (user?.institutionId) return user.institutionId;

  const defaultInst = await prisma.institution.upsert({
    where: { name: "Default Institution" },
    create: { name: "Default Institution", shortName: "DEFAULT" },
    update: {},
  });
  await prisma.user.update({
    where: { id: userId },
    data: { institutionId: defaultInst.id },
  });
  return defaultInst.id;
}

async function createExam(req, res, next) {
  try {
    const {
      title, description, courseCode, courseName, durationMinutes,
      startTime, endTime, totalMarks, passingMarks, shuffleQuestions,
      allowBacktrack, institutionId,
    } = req.body;

    const resolvedInstId = await resolveInstitutionId(req.user.id, institutionId);

    const exam = await prisma.exam.create({
      data: {
        title, description, courseCode, courseName, durationMinutes,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        totalMarks: totalMarks || 0,
        passingMarks: passingMarks || 0,
        shuffleQuestions: shuffleQuestions || false,
        allowBacktrack: allowBacktrack !== false,
        createdById: req.user.id,
        institutionId: resolvedInstId,
      },
    });

    res.status(201).json({ success: true, data: exam });
  } catch (err) {
    next(err);
  }
}

async function getExams(req, res, next) {
  try {
    const where = {};
    if (req.user.role === "EXAMINER") {
      where.createdById = req.user.id;
    }
    if (req.query.institutionId) {
      where.institutionId = req.query.institutionId;
    }
    if (req.query.status) {
      where.status = req.query.status;
    }

    const exams = await prisma.exam.findMany({
      where,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { questions: true, examSessions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: exams });
  } catch (err) {
    next(err);
  }
}

async function getExam(req, res, next) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: req.params.id },
      include: {
        questions: { orderBy: { order: "asc" } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        venues: true,
        _count: { select: { examSessions: true } },
      },
    });
    if (!exam) throw new AppError("Exam not found", 404);
    res.json({ success: true, data: exam });
  } catch (err) {
    next(err);
  }
}

async function updateExam(req, res, next) {
  try {
    const exam = await prisma.exam.findUnique({ where: { id: req.params.id } });
    if (!exam) throw new AppError("Exam not found", 404);
    if (exam.createdById !== req.user.id && req.user.role !== "ADMIN") {
      throw new AppError("Not authorised", 403);
    }

    const updated = await prisma.exam.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteExam(req, res, next) {
  try {
    const exam = await prisma.exam.findUnique({ where: { id: req.params.id } });
    if (!exam) throw new AppError("Exam not found", 404);
    if (exam.createdById !== req.user.id && req.user.role !== "ADMIN") {
      throw new AppError("Not authorised", 403);
    }

    await prisma.exam.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Exam deleted" });
  } catch (err) {
    next(err);
  }
}

async function publishExam(req, res, next) {
  try {
    const exam = await prisma.exam.update({
      where: { id: req.params.id },
      data: { status: "PUBLISHED" },
    });
    res.json({ success: true, data: exam });
  } catch (err) {
    next(err);
  }
}

module.exports = { createExam, getExams, getExam, updateExam, deleteExam, publishExam };
