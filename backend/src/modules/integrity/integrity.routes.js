const { Router } = require("express");
const { authenticate } = require("../../middleware/auth");
const { authorize } = require("../../middleware/rbac");
const ctrl = require("./integrity.controller");

const router = Router();

router.use(authenticate);
router.use(authorize("EXAMINER", "ADMIN"));

router.post("/predict", ctrl.predictVenue);
router.get("/models", ctrl.getModels);
router.post("/models/switch", ctrl.switchModel);
router.get("/evaluate/all", ctrl.evaluateAll);
router.get("/evaluate/:modelName", ctrl.evaluateModel);
router.get("/predictions", ctrl.getPredictions);

module.exports = router;
