const { Router } = require("express");
const { register, login, refreshToken, getProfile } = require("./auth.controller");
const { authenticate } = require("../../middleware/auth");
const { registerValidation, loginValidation } = require("../../utils/validators");

const router = Router();

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refresh", refreshToken);
router.get("/profile", authenticate, getProfile);

module.exports = router;
