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
    socket.join(userData._id);
    connectedUsers.add(socket.id);
    console.log(`🔐 User setup: ${userData.username} (${userData._id})`);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`📥 User joined chat room: ${room}`);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.on("new message", (message) => {
    const chat = message.chat;
    if (!chat?.users) return console.error("Chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === message.sender._id) return;

      socket.in(user._id).emit("message received", message);
    });

    console.log(`📨 New message from ${message.sender.username} in chat ${chat._id}`);
  });

  // ---------- Video Call Signaling ----------
  socket.on("call-user", ({ to, offer, from }) => {
    console.log(`📞 Calling user ${to} from ${from.username}`);
    socket.to(to).emit("incoming-call", { offer, from });
  });

  socket.on("answer-call", ({ to, answer }) => {
    console.log(`✅ Answering call to ${to}`);
    socket.to(to).emit("call-accepted", { answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    console.log(`🧊 Forwarding ICE candidate to ${to}`);
    socket.to(to).emit("ice-candidate", { candidate });
  });

  socket.on("end-call", ({ to }) => {
    console.log(`📴 Ending call for ${to}`);
    socket.to(to).emit("call-ended");
  });

  // ---------- Cleanup ----------
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
