const prisma = require("../../config/db");
const { AppError } = require("../../middleware/errorHandler");

async function createVenue(req, res, next) {
  try {
    const { name, examId, capacity, invigilatorId } = req.body;
    const venue = await prisma.venue.create({
      data: { name, examId, capacity, invigilatorId },
    });
    res.status(201).json({ success: true, data: venue });
  } catch (err) {
    next(err);
  }
}

async function getVenues(req, res, next) {
  try {
    const where = {};
    if (req.query.examId) where.examId = req.query.examId;
    if (req.user.role === "INVIGILATOR") {
      where.invigilatorId = req.user.id;
    }

    const venues = await prisma.venue.findMany({
      where,
      include: {
        invigilator: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { seatingAssignments: true, invigilatorReports: true } },
      },
    });
    res.json({ success: true, data: venues });
  } catch (err) {
    next(err);
  }
}

async function createReport(req, res, next) {
  try {
    const { venueId, content, severity } = req.body;
    const report = await prisma.invigilatorReport.create({
      data: { venueId, authorId: req.user.id, content, severity: severity || "info" },
    });
    res.status(201).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
}

async function getReports(req, res, next) {
  try {
    const where = {};
    if (req.query.venueId) where.venueId = req.query.venueId;

    const reports = await prisma.invigilatorReport.findMany({
      where,
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
        venue: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: reports });
  } catch (err) {
    next(err);
  }
}

async function assignSeating(req, res, next) {
  try {
    const { venueId, assignments } = req.body;

    const created = await prisma.$transaction(
      assignments.map((a) =>
        prisma.seatingAssignment.upsert({
          where: { sessionId: a.sessionId },
          create: { venueId, sessionId: a.sessionId, seatX: a.seatX, seatY: a.seatY, seatLabel: a.seatLabel },
          update: { seatX: a.seatX, seatY: a.seatY, seatLabel: a.seatLabel },
        })
      )
    );

    res.json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
}

module.exports = { createVenue, getVenues, createReport, getReports, assignSeating };
