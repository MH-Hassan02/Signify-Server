export function setupUserHandlers(io, socket, connectedUsers) {
  socket.on('setup', (userData) => {
    if (!userData?._id) return;
    socket.join(userData._id);
    connectedUsers.add(socket.id);
    socket.emit('connected');
  });
} 