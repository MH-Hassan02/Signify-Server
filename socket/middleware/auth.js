export function authenticateSocket(socket, next) {
  // Here you can add authentication logic if needed
  // For example, verify token from handshake auth
  // const token = socket.handshake.auth.token;
  
  // For now, we'll just let all connections through
  next();
} 