import express from 'express';
import { getUnreadNotifications } from '../controllers/notifications';

const router = express.Router()

router.post('/unread', getUnreadNotifications)

export default router;