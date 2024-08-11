import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import ConnectToDB, { db } from './db';
import chatRouter from './routes/chat.route';
import cors from 'cors';
import expressWinston from 'express-winston'
import winston from 'winston'
import { logger } from './utils/winstonLogger';
import errorMiddleware from './middleware/error'
import { saveChats } from './functions/saveChats';

ConnectToDB();

const app = express();

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.cli(),
    ),
    meta: true,
    expressFormat: true,
    colorize: true,
  }),
);


app.use(express.json());
app.use(cors({
  origin:  ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Basic route to verify server is working
app.get('/', (req, res) => {
  res.send("Chat server is working fine");
});

// API routes
app.use('/api/chat', chatRouter);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  socket.on('student_joining_room', ({ userEmail }) => {
    socket.join(userEmail);
    console.log(`User with ID: ${socket.id} joining room: ${userEmail}`);
  });


  socket.on('mentor_joining_room', ({ userEmail }) => {
    // Leave any previous room the user might be in
    const rooms = Array.from(socket.rooms);
    rooms.forEach((room) => {
        socket.leave(room);
        console.log(`User with ID: ${socket.id} left room: ${room}`);
    });

    // Join the new room
    socket.join(userEmail);
    console.log(`User with ID: ${socket.id} joining mentor room: ${userEmail}`);
  });

  socket.on('chat_message', async ({ sender, receiver, message, timestamp, sendBy, room, socketId }) => {
  
    try {
      io.to(room).emit('room_message', { message, timestamp, sendBy });
      console.log("Message send", room);
      await saveChats(sender, receiver, message, room, sendBy)
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = 8000;

app.use(errorMiddleware);

server.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
