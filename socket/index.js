import { Server } from 'socket.io';
import { setupUserHandlers } from './handlers/userHandler.js';
import { setupChatHandlers } from './handlers/chatHandler.js';
import { setupCallHandlers } from './handlers/callHandler.js';
import { authenticateSocket } from './middleware/auth.js';

const connectedUsers = new Set();

export function initializeSocket(server, allowedOrigins) {
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Apply middleware
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log("✅ New socket connected:", socket.id);

    // Setup handlers for different event types
    setupUserHandlers(io, socket, connectedUsers);
    setupChatHandlers(io, socket);
    setupCallHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
      connectedUsers.delete(socket.id);
    });
  });

  return io;
} 