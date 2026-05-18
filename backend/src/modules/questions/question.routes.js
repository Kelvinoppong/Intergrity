const { Router } = require("express");
const { authenticate } = require("../../middleware/auth");
const { authorize } = require("../../middleware/rbac");
const ctrl = require("./question.controller");

const router = Router();

router.use(authenticate);

router.post("/exam/:examId", authorize("EXAMINER", "ADMIN"), ctrl.addQuestion);
router.post("/exam/:examId/bulk", authorize("EXAMINER", "ADMIN"), ctrl.addBulkQuestions);
router.get("/exam/:examId", ctrl.getQuestions);
router.put("/:id", authorize("EXAMINER", "ADMIN"), ctrl.updateQuestion);
router.delete("/:id", authorize("EXAMINER", "ADMIN"), ctrl.deleteQuestion);

module.exports = router;
