const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Legacy command
  socket.on('inaugurate', (data) => {
    console.log(`Inaugurate event received! Broadcasting...`);
    socket.broadcast.emit('inaugurate', data);
  });

  // New specific wick lighting command
  socket.on('light-wick', (data) => {
    console.log(`Light-wick event received for wick ${data.index}! Broadcasting...`);
    socket.broadcast.emit('light-wick', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Inauguration server is running on port ${PORT}`);
});
