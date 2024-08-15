import { NextFunction, Request, Response } from 'express';
import { getUnreadMessages } from '../functions/getUnreadMessage';
import { CustomError } from '../middleware/error';

export const getUnreadNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodyData = req.body;

    if (!bodyData) {
      return res.status(400).json({
        success: false,
        message: 'Body data is required.',
      });
    }

    const unreadCount: { messageCount: number; room: string }[] = [];

    for (const data of bodyData) {
      const notificationCount = await getUnreadMessages(data.receiver, data.room);
      unreadCount.push({
        messageCount: notificationCount!,
        room: data.room,
      });
    }

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    next(new CustomError((error as Error).message));
  }
};
