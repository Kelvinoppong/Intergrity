const { Router } = require("express");
const { authenticate } = require("../../middleware/auth");
const { authorize } = require("../../middleware/rbac");
const ctrl = require("./student.controller");

const router = Router();

router.use(authenticate);

router.get("/", authorize("EXAMINER", "ADMIN"), ctrl.getStudents);
router.get("/:studentId/exams", ctrl.getStudentExams);
router.patch("/:id/toggle-status", authorize("ADMIN"), ctrl.toggleStudentStatus);

module.exports = router;
