import express from 'express';
import { getChats, getGroupChats } from '../controllers/chat';

const router = express.Router()

router.post('/get', getChats)
router.post('/group/get', getGroupChats)

export default router;