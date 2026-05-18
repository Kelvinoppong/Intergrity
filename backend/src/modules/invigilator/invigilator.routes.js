const { Router } = require("express");
const { authenticate } = require("../../middleware/auth");
const { authorize } = require("../../middleware/rbac");
const ctrl = require("./invigilator.controller");

const router = Router();

router.use(authenticate);

router.post("/venues", authorize("EXAMINER", "ADMIN"), ctrl.createVenue);
router.get("/venues", ctrl.getVenues);
router.post("/reports", authorize("INVIGILATOR", "ADMIN"), ctrl.createReport);
router.get("/reports", authorize("EXAMINER", "INVIGILATOR", "ADMIN"), ctrl.getReports);
router.post("/seating", authorize("INVIGILATOR", "ADMIN"), ctrl.assignSeating);

module.exports = router;
