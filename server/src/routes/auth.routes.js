import express from "express";
import {
  signup,
  login,
  logout,
  getCurrentUser,
  verifyLoginOtp,
  verifySignupOtp,
  resendSignupOtp,
} from "../controllers/auth.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/verify-signup-otp", verifySignupOtp);

router.post("/resend-signup-otp", resendSignupOtp);

router.post("/login", login);

router.post("/verify-login-otp", verifyLoginOtp);

router.post("/logout", authMiddleware, logout);

router.get("/me", authMiddleware, getCurrentUser);

export default router;