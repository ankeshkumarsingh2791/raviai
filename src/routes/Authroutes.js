const express = require("express");
const router = express.Router();
const { register, login, logout, getMe, sendOtp } = require("../controllers/authController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.post("/send-otp", sendOtp);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", isAuthenticated, getMe);
   // ← add before register

module.exports = router;