import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import cookieParser from "cookie-parser";
import chatRoutes from "./routes/chat.js";
import messageRoutes from "./routes/message.js";
import contactsRoutes from "./routes/contacts.js";
import uploadRoutes from "./routes/upload.js";
import http from "http";
import { initializeSocket } from "./socket/index.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CLIENT_URL.split(",").map(origin => origin.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Initialize socket.io
const io = initializeSocket(server, allowedOrigins);

// Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/auth", authRoutes);
app.use("/chats", chatRoutes);
app.use("/messages", messageRoutes);
app.use("/contacts", contactsRoutes);
app.use("/upload", uploadRoutes);

connectDB();
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
