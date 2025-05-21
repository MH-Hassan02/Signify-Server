export function setupChatHandlers(io, socket) {
  socket.on('join chat', (chatId) => {
    if (!chatId) return;
    socket.join(chatId);
  });

  socket.on('new message', (message) => {
    const { chatId, receiver, sender } = message || {};
    if (!chatId || !receiver) return;

    socket.to(chatId).emit('message received', message);

    // Optional: notify receiver personally
    if (sender?._id !== receiver) {
      socket.to(receiver).emit('message received', message);
    }
  });

  socket.on('typing', ({ to, from }) => {
    if (!to || !from) return;
    socket.to(to).emit('typing', { from });
  });

  socket.on('stop typing', ({ to, from }) => {
    if (!to || !from) return;
    socket.to(to).emit('stop typing', { from });
  });
} 