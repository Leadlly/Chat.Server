import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import Redis from 'ioredis';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const redis = new Redis();
const redisPublisher = new Redis();
const redisSubscriber = new Redis();

redisSubscriber.subscribe('chat-messages');

// Handle new WebSocket connections
io.on('connection', (socket) => {
  console.log('Client connected');

  // Handle incoming messages
  socket.on('sendMessage', (message: string) => {
    console.log('Received message:', message);
    redisPublisher.publish('chat-messages', message);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Listen for messages from Redis
redisSubscriber.on('message', (channel, message) => {
  if (channel === 'chat-messages') {
    io.emit('receiveMessage', message);
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Chat server listening on port ${PORT}`);
});
