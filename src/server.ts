import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './db';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('join room', (phoneNumber: string) => {
    socket.join(phoneNumber);
    console.log(`User with ID: ${socket.id} joined room: ${phoneNumber}`);
  });

  socket.on('chat message', ({ room, message }: { room: string; message: string }) => {
    io.to(room).emit('chat message', message);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const PORT = 3000;
connectDB();
server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
