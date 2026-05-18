const { Router } = require("express");
const { authenticate } = require("../../middleware/auth");
const { authorize } = require("../../middleware/rbac");
const ctrl = require("./analytics.controller");

const router = Router();

router.use(authenticate);
router.use(authorize("EXAMINER", "ADMIN"));

router.get("/exam/:examId", ctrl.getExamStats);
router.get("/exam/:examId/grades", ctrl.getGradeBoundaries);
router.get("/institution/:institutionId", ctrl.getCourseAnalytics);

module.exports = router;
