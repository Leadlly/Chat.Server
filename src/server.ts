import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import ConnectToDB from './db';
import chatRouter from './routes/chat.route';
import cors from 'cors';
import expressWinston from 'express-winston'
import winston from 'winston'
import { logger } from './utils/winstonLogger';

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

  socket.on('join_room', ({ useremail }) => {
    console.log(`User with ID: ${socket.id} joining room: ${useremail}`);
    socket.join(useremail);
  });


  socket.on('join_mentor_room', ({ useremail }) => {
    console.log(`User with ID: ${socket.id} joining room: ${useremail}`);
    socket.join(useremail);
  });

  socket.on('chat_message', ({ room, message }) => {
    io.to(room).emit('chat message', message);
  });

  // Handle disconnection
  // socket.on('disconnect', () => {
  //   console.log(`User disconnected: ${socket.id}`);
  // });
});

const PORT = 8000;

server.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
