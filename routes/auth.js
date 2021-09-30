const express = require("express");

const router = express.Router();

// middleware
const { requireSignin } = require("../middlewares");

// controllers
const { register, login, logout, currentUser, forgotPassword, sendTestEmail, resetPassword } = require("../controllers/auth");

///dddd
const {sendRegisterEmail} = require("../controllers/auth");
///dddd

router.post("/reg", sendRegisterEmail);
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/current-user", requireSignin, currentUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);
router.get("/send-email", sendTestEmail);

module.exports = router;