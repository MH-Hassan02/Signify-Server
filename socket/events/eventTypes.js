// User events
export const USER_EVENTS = {
  SETUP: 'setup',
  CONNECTED: 'connected'
};

// Chat events
export const CHAT_EVENTS = {
  JOIN_CHAT: 'join chat',
  NEW_MESSAGE: 'new message',
  MESSAGE_RECEIVED: 'message received',
  TYPING: 'typing',
  STOP_TYPING: 'stop typing'
};

// Call events
export const CALL_EVENTS = {
  CALL_USER: 'call-user',
  INCOMING_CALL: 'incoming-call',
  ANSWER_CALL: 'answer-call',
  CALL_ACCEPTED: 'call-accepted',
  ICE_CANDIDATE: 'ice-candidate',
  END_CALL: 'end-call',
  CAll_ENDED: 'call-ended',
}; 



// io.on("connection", (socket) => {
//   console.log("✅ New socket connected:", socket.id);

//   socket.on("setup", (userData) => {
//     if (!userData?._id) return;
//     socket.join(userData._id); // Join user room
//     connectedUsers.add(socket.id);
//     socket.emit("connected");
//   });

//   socket.on("join chat", (chatId) => {
//     if (!chatId) return;
//     socket.join(chatId);
//   });

//   socket.on("new message", (message) => {
//     const { chatId, receiver, sender } = message || {};
//     if (!chatId || !receiver) return;

//     socket.to(chatId).emit("message received", message);

//     // Optional: notify receiver personally
//     if (sender?._id !== receiver) {
//       socket.to(receiver).emit("message received", message);
//     }
//   });

//   socket.on("typing", ({ to, from }) => {
//     console.log(to, "to")
//     console.log(from, "from")
//     if (!to || !from) return;
//     socket.to(to).emit("typing", { from });
//   });

//   socket.on("stop typing", ({ to, from }) => {
//     if (!to || !from) return;
//     socket.to(to).emit("stop typing", { from });
//   });

//   // ==== VIDEO CALL EVENTS ====
//   socket.on("call-user", ({ to, offer, from }) => {
//     if (!to || !offer || !from) return;
//     socket.to(to).emit("incoming-call", { offer, from });
//   });

//   socket.on("answer-call", ({ to, answer }) => {
//     if (!to || !answer) return;
//     socket.to(to).emit("call-accepted", { answer });
//   });

//   socket.on("ice-candidate", ({ to, candidate }) => {
//     if (!to || !candidate) return;
//     socket.to(to).emit("ice-candidate", { candidate });
//   });

//   socket.on("end-call", ({ to }) => {
//     console.log(to, "to")
//     if (!to) return;
//     socket.to(to).emit("call-ended");
//     console.log("Ended Call")
//   });

//   socket.on("disconnect", () => {
//     console.log("❌ Socket disconnected:", socket.id);
//     connectedUsers.delete(socket.id);
//   });
// });