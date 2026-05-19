const path = require("path");
const fs = require("fs");
const prisma = require("../../config/db");
const { AppError } = require("../../middleware/errorHandler");

const BRANDING_FIELDS = [
  "name",
  "shortName",
  "logoUrl",
  "primaryColor",
  "accentColor",
  "motto",
  "website",
  "contactEmail",
];

function pickBrandingFields(body) {
  const data = {};
  for (const f of BRANDING_FIELDS) {
    if (body[f] !== undefined) data[f] = body[f];
  }
  return data;
}

async function createInstitution(req, res, next) {
  try {
    const data = pickBrandingFields(req.body);
    if (!data.name) throw new AppError("Name is required", 400);
    const institution = await prisma.institution.create({ data });
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

async function getMyInstitution(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { institution: true },
    });
    if (!user?.institution) throw new AppError("No institution linked to your account", 404);
    res.json({ success: true, data: user.institution });
  } catch (err) {
    next(err);
  }
}

async function updateInstitution(req, res, next) {
  try {
    const data = pickBrandingFields(req.body);
    const inst = await prisma.institution.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, data: inst });
  } catch (err) {
    next(err);
  }
}

async function uploadLogo(req, res, next) {
  try {
    if (!req.file) throw new AppError("No file uploaded", 400);
    const publicUrl = `/uploads/logos/${req.file.filename}`;
    const inst = await prisma.institution.update({
      where: { id: req.params.id },
      data: { logoUrl: publicUrl },
    });
    res.json({ success: true, data: inst });
  } catch (err) {
    next(err);
  }
}

const uploadsDir = path.join(__dirname, "..", "..", "..", "uploads", "logos");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

module.exports = {
  createInstitution,
  getInstitutions,
  getInstitution,
  getMyInstitution,
  updateInstitution,
  uploadLogo,
  uploadsDir,
};
