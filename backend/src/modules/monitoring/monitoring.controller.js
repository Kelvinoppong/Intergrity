const prisma = require("../../config/db");
const { AppError } = require("../../middleware/errorHandler");

async function reportFlag(req, res, next) {
  try {
    const { sessionId, flagType, metadata } = req.body;

    const session = await prisma.examSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new AppError("Session not found", 404);

    const flag = await prisma.behavioralFlag.create({
      data: {
        sessionId,
        studentId: session.studentId,
        flagType,
        metadata,
      },
    });

    res.status(201).json({ success: true, data: flag });
  } catch (err) {
    next(err);
  }
}

async function getFlags(req, res, next) {
  try {
    const where = {};
    if (req.query.sessionId) where.sessionId = req.query.sessionId;
    if (req.query.studentId) where.studentId = req.query.studentId;
    if (req.query.flagType) where.flagType = req.query.flagType;

    const flags = await prisma.behavioralFlag.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: flags });
  } catch (err) {
    next(err);
  }
}

async function getFlagSummary(req, res, next) {
  try {
    const { examId } = req.params;

    const sessions = await prisma.examSession.findMany({
      where: { examId },
      include: {
        behavioralFlags: true,
        student: { select: { id: true, firstName: true, lastName: true, studentId: true } },
      },
    });

    const summary = sessions.map((s) => ({
      studentId: s.studentId,
      student: s.student,
      totalFlags: s.behavioralFlags.length,
      flagBreakdown: s.behavioralFlags.reduce((acc, f) => {
        acc[f.flagType] = (acc[f.flagType] || 0) + 1;
        return acc;
      }, {}),
    }));

    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}

module.exports = { reportFlag, getFlags, getFlagSummary };
