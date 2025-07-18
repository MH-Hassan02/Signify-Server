export function setupCallHandlers(io, socket) {
  socket.on('call-user', ({ to, offer, from }) => {
    if (!to || !offer || !from) return;
    console.log('Call-user event:', { to, from: from._id });
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
    console.log('Call-received event from socket', socket.id, 'to', to);
    socket.to(to).emit('call-received');
  });

  socket.on('end-call', ({ to }) => {
    if (!to) return;
    socket.to(to).emit('call-ended');
    console.log("Ended Call");
  });

  // Sign Language Translation Socket Handlers
  socket.on('sign-language-toggle', ({ to, isActive, from }) => {
    if (!to || !from) return;
    console.log('Sign-language-toggle event:', { to, from, isActive });
    socket.to(to).emit('sign-language-toggle', { isActive, from });
  });

  socket.on('gesture-detected', ({ to, gesture, from }) => {
    if (!to || !gesture || !from) return;
    console.log('Gesture-detected event:', { to, from, gesture });
    socket.to(to).emit('gesture-detected', { gesture, from });
  });

  socket.on('transcript-update', ({ to, transcript, from }) => {
    if (!to || !transcript || !from) return;
    console.log('Transcript-update event:', { to, from, transcript: transcript.substring(0, 50) + '...' });
    socket.to(to).emit('transcript-update', { transcript, from });
  });
}