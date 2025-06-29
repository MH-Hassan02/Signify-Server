export function setupCallHandlers(io, socket) {
  socket.on('call-user', ({ to, offer, from }) => {
    if (!to || !offer || !from) return;
    socket.to(to).emit('incoming-call', { offer, from });
  });

  socket.on('answer-call', ({ to, answer }) => {
    if (!to || !answer) return;
    socket.to(to).emit('call-accepted', { answer });
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
    if (!to || !candidate) return;
    socket.to(to).emit('ice-candidate', { candidate });
  });

  socket.on('call-received', ({ to }) => {
    if (!to) return;
    socket.to(to).emit('call-received');
  });

  socket.on('end-call', ({ to }) => {
    if (!to) return;
    socket.to(to).emit('call-ended');
    console.log("Ended Call");
  });
} 