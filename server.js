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
import { Server } from "socket.io";
import http from "http";

dotenv.config();
const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CLIENT_URL.split(",").map(origin => origin.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 🧠 Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

const connectedUsers = new Set();

io.on("connection", (socket) => {
  console.log("✅ New socket connected:", socket.id);

  socket.on("setup", (userData) => {
    if (!userData?._id) return;
    socket.join(userData._id); // Join user room
    connectedUsers.add(socket.id);
    socket.emit("connected");
  });

  socket.on("join chat", (chatId) => {
    if (!chatId) return;
    socket.join(chatId);
  });

  socket.on("new message", (message) => {
    const { chatId, receiver, sender } = message || {};
    if (!chatId || !receiver) return;

    socket.to(chatId).emit("message received", message);

    // Optional: notify receiver personally
    if (sender?._id !== receiver) {
      socket.to(receiver).emit("message received", message);
    }
  });

  socket.on("typing", ({ to, from }) => {
    if (!to || !from) return;
    socket.to(to).emit("typing", { from });
  });

  socket.on("stop typing", ({ to, from }) => {
    if (!to || !from) return;
    socket.to(to).emit("stop typing", { from });
  });

  // ==== VIDEO CALL EVENTS ====
  socket.on("call-user", ({ to, offer, from }) => {
    if (!to || !offer || !from) return;
    socket.to(to).emit("incoming-call", { offer, from });
  });

  socket.on("answer-call", ({ to, answer }) => {
    if (!to || !answer) return;
    socket.to(to).emit("call-accepted", { answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    if (!to || !candidate) return;
    socket.to(to).emit("ice-candidate", { candidate });
  });

  socket.on("end-call", ({ to }) => {
    console.log(to, "to")
    if (!to) return;
    socket.to(to).emit("call-ended");
    console.log("Ended Call")
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
    connectedUsers.delete(socket.id);
  });
});

app.use("/auth", authRoutes);
app.use("/chats", chatRoutes);
app.use("/messages", messageRoutes);
app.use("/contacts", contactsRoutes);
app.use("/upload", uploadRoutes);

connectDB();
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
