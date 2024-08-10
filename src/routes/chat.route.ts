import express from 'express';
import { io } from '../server';
import { getChats } from '../controllers/chat';

const router = express.Router()

router.post('/get', getChats)

export default router;