import express from 'express';
import { joinMentorRoom, joinRoom, sendMessage } from '../controllers';
import { io } from '../server';

const router = express.Router()

router.post('/user/joinroom', (req, res) => joinRoom(req, res, io));
router.post('/user/sendmessage', (req, res) => sendMessage(req, res, io));
router.post('/mentor/joinroom', (req, res) => joinMentorRoom(req, res, io));

export default router;