import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import ConnectToDB, { db } from './db';
import chatRouter from './routes/chat.route';
import notificationRouter from './routes/notification.route'
import cors from 'cors';
import expressWinston from 'express-winston'
import winston from 'winston'
import { logger } from './utils/winstonLogger';
import errorMiddleware from './middleware/error'
import { saveChats } from './functions/saveChats';
import { GroupMessage } from './types'
import { getUserInfo } from './functions/getUser';
import { getUnreadMessages } from './functions/getUnreadMessage';
import { resetUnreadMessageCount } from './functions/resetUnreadMessageCount';
import { config } from 'dotenv';

config({
  path: './.env'
})

ConnectToDB();

const app = express();
const PORT = parseInt(process.env.PORT!);

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

console.log(process.env.MENTOR_FRONTEND_URL!, process.env.STUDENT_FRONTEND_URL!)

app.use(express.json());
app.use(cors({
  origin:  [process.env.MENTOR_FRONTEND_URL!, process.env.STUDENT_FRONTEND_URL!],
  credentials: true
}));

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: [process.env.MENTOR_FRONTEND_URL!, process.env.STUDENT_FRONTEND_URL!],
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
app.use('/api/notification', notificationRouter);


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

  socket.on('join_group', ({ userEmails }) => {

    const rooms = Array.from(socket.rooms);
    rooms.forEach((room) => {
        socket.leave(room);
        console.log(`User with ID: ${socket.id} left room: ${room}`);
    });

    userEmails.forEach((room: string) => {
        socket.join(room);
        console.log(`User with ID: ${socket.id} left room: ${room}`);
    });
  });

  socket.on('chat_message', async ({ sender, receiver, message, timestamp, sendBy, room, socketId }) => {
  
    try {
      io.to(room).emit('room_message', { message, timestamp, sendBy });
      await saveChats(sender, receiver, message, room, sendBy)
      const user = await getUserInfo(receiver)
      if (user.data) {
        const unreadCount = await getUnreadMessages(receiver, room);

        if(user.source === "mentors") {
          io.to(room).emit('mentor_notification', { room, messageCount: unreadCount }); // Emit notification event

        }

        io.to(user.data.email).emit('notification', { room, messageCount: unreadCount }); // Emit notification event
      }

    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  });

  socket.on('group_chat_message', async ({ data, sender, message, timestamp, sendBy, socketId }: GroupMessage) => {
  
    try {
      data.forEach(async(el) => {
        io.to(el.room).emit('room_message', { message, timestamp, sendBy });
        await saveChats(sender, el.receiver, message, el.room, sendBy, "announcement")
        // const user = await getUserInfo(el.receiver)
        // if (user.data) {
        //   const unreadCount = await getUnreadMessages(el.receiver, el.room);
  
        //   io.to(user.data.email).emit('notification', { room: el.room, messageCount: unreadCount }); // Emit notification event
        // }
  
        });

      io.emit("group_message", { message, timestamp, sendBy })
     
    } catch (error) {
      console.error('Error handling chat message:', error);
    }
  });

  socket.on('open_chat', async ({ userId, room }) => {
    try {
      await resetUnreadMessageCount(userId, room);
  
      const unreadCount = await getUnreadMessages(userId, room);
      io.to(room).emit('notification', { room, messageCount: unreadCount });
    } catch (error) {
      console.error('Error handling chat opening:', error);
    }
  });
  
  socket.on('mentor_open_chat', async ({ userId, room }) => {
    try {
      await resetUnreadMessageCount(userId, room);
  
      const unreadCount = await getUnreadMessages(userId, room);
      io.to(room).emit('mentor_notification', { room, messageCount: unreadCount });
    } catch (error) {
      console.error('Error handling chat opening:', error);
    }
  });


  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});


app.use(errorMiddleware);

server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server listening on port ${PORT}`);
});
