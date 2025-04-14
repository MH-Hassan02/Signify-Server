import express from "express";
import { createChat, getUserChats } from "../controllers/chatController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Create a new chat
router.post("/", authMiddleware, createChat);

// Get all chats for the current user
router.get("/", authMiddleware, getUserChats);

export default router;
