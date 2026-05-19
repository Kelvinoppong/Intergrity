const { Router } = require("express");
const path = require("path");
const multer = require("multer");
const { authenticate } = require("../../middleware/auth");
const { authorize } = require("../../middleware/rbac");
const ctrl = require("./institution.controller");

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, ctrl.uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = [".png", ".jpg", ".jpeg", ".svg", ".webp"].includes(ext) ? ext : ".png";
    cb(null, `${req.params.id}-${Date.now()}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

router.use(authenticate);

router.get("/me", ctrl.getMyInstitution);
router.post("/", authorize("ADMIN"), ctrl.createInstitution);
router.get("/", ctrl.getInstitutions);
router.get("/:id", ctrl.getInstitution);
router.put("/:id", authorize("ADMIN", "EXAMINER"), ctrl.updateInstitution);
router.post("/:id/logo", authorize("ADMIN", "EXAMINER"), upload.single("logo"), ctrl.uploadLogo);

module.exports = router;
