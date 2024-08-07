import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import ConnectToDB, { db } from './db';
import chatRouter from './routes/chat.route';
import cors from 'cors';
import expressWinston from 'express-winston'
import winston from 'winston'
import { logger } from './utils/winstonLogger';
import { getStudentDetails } from './functions/getStudent';

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

  socket.on('join_room', ({ userEmail }) => {
    console.log(`User with ID: ${socket.id} joining room: ${userEmail}`);
    socket.join(userEmail);
  });


  socket.on('join_mentor_room', ({ userEmail }) => {
    socket.join(userEmail);
    console.log(`User with ID: ${socket.id} joining mentor room: ${userEmail}`);
  });

  socket.on('chat_message', async ({ sender, message, timestamp, sendBy, room, studentId, socketId }) => {
    console.log("Chat message received");

    try {
      if(studentId) {
        const data = await getStudentDetails(studentId); 
        if (data) {
          socket.join(data.email)
          // Emit the message to the room associated with the student's email
          io.to(data.email).emit('room_message', { sender, message, timestamp, sendBy });
          console.log(`message send to ${data.email} from ${socketId}` )
        } else {
          console.error('Student details not found or email is missing');
          console.log(`message send to ${room} from ${socketId}` )

        }
      } else {
        socket.join(room)

        io.to(room).emit('room_message', { sender, message, timestamp, sendBy });
      }
   
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
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
