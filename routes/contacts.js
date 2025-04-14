import express from "express";
import authMiddleware from "../middleware/auth.js";
import { addContact, fetchContacts, searchContact } from "../controllers/contactsController.js";

const router = express.Router();

router.get("/users/search", authMiddleware, searchContact)
router.post("/add", authMiddleware, addContact)
router.get("/getAll", authMiddleware, fetchContacts)

export default router;