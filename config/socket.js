import { Server } from "socket.io";

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("setup", (userData) => {
      socket.join(userData._id);
      console.log(`User ${userData._id} connected`);
      socket.emit("connected");
    });

    socket.on("new message", (message) => {
      const { receiver } = message;
      io.to(receiver).emit("message received", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
};

export default initSocket;
