const { Router } = require("express");
const { authenticate } = require("../../middleware/auth");
const { authorize } = require("../../middleware/rbac");
const ctrl = require("./monitoring.controller");

const router = Router();

router.use(authenticate);

router.post("/flag", ctrl.reportFlag);
router.get("/flags", authorize("EXAMINER", "INVIGILATOR", "ADMIN"), ctrl.getFlags);
router.get("/summary/:examId", authorize("EXAMINER", "INVIGILATOR", "ADMIN"), ctrl.getFlagSummary);

module.exports = router;
