const { Router } = require("express");
const { authenticate } = require("../../middleware/auth");
const { authorize } = require("../../middleware/rbac");
const ctrl = require("./institution.controller");

const router = Router();

router.use(authenticate);

router.post("/", authorize("ADMIN"), ctrl.createInstitution);
router.get("/", ctrl.getInstitutions);
router.get("/:id", ctrl.getInstitution);
router.put("/:id", authorize("ADMIN"), ctrl.updateInstitution);

module.exports = router;
