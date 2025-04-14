import express from "express";
import { sendMessage, getMessages, markAsRead } from "../controllers/messageController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Send a message
router.post("/", authMiddleware, sendMessage);

// Get messages for a chat
router.get("/:userId/:contactId", authMiddleware, getMessages);

// Mark messages as read for a particular receiver
router.put("/markAsRead", authMiddleware, markAsRead)
  

export default router;
