import express from "express";
import dotenv from "dotenv";
import { googleAuth } from "../controllers/firebaseAuth.js";
import {
  login,
  register,
  fetchUser,
  logout,
  changePassword,
  updateProfile,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/auth.js";

dotenv.config();

const router = express.Router();

router.post("/signup", register);

router.post("/login", login);

router.post("/google-signin", googleAuth);

router.get("/user", authMiddleware, fetchUser);

router.post("/logout", authMiddleware, logout);

router.post("/change-password", authMiddleware, changePassword);

router.put("/profile/:userId", authMiddleware, updateProfile)

export default router;
