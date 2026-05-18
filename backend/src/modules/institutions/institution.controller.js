const prisma = require("../../config/db");
const { AppError } = require("../../middleware/errorHandler");

async function createInstitution(req, res, next) {
  try {
    const { name, shortName, logoUrl } = req.body;
    const institution = await prisma.institution.create({
      data: { name, shortName, logoUrl },
    });
    res.status(201).json({ success: true, data: institution });
  } catch (err) {
    if (err.code === "P2002") {
      return next(new AppError("Institution name already exists", 409));
    }
    next(err);
  }
}

async function getInstitutions(_req, res, next) {
  try {
    const institutions = await prisma.institution.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: institutions });
  } catch (err) {
    next(err);
  }
}

async function getInstitution(req, res, next) {
  try {
    const inst = await prisma.institution.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { users: true, exams: true } } },
    });
    if (!inst) throw new AppError("Institution not found", 404);
    res.json({ success: true, data: inst });
  } catch (err) {
    next(err);
  }
}

async function updateInstitution(req, res, next) {
  try {
    const { name, shortName, logoUrl } = req.body;
    const inst = await prisma.institution.update({
      where: { id: req.params.id },
      data: { name, shortName, logoUrl },
    });
    res.json({ success: true, data: inst });
  } catch (err) {
    next(err);
  }
}

module.exports = { createInstitution, getInstitutions, getInstitution, updateInstitution };
