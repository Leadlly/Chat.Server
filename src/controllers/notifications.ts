import { NextFunction, Request, Response } from 'express';
import { getUnreadMessages } from '../functions/getUnreadMessage';
import { CustomError } from '../middleware/error';

interface GetUnreadNotificationsRequestBody {
  receiver: string;
  room: string;
}

export const getUnreadNotifications = async (req: Request<{}, {}, GetUnreadNotificationsRequestBody>, res: Response, next: NextFunction) => {
  try {
    const { receiver, room } = req.body;

    if (!receiver || !room) {
      return res.status(400).json({
        success: false,
        message: 'Receiver and room are required fields.',
      });
    }

    const notificationCount = await getUnreadMessages(receiver, room);

    console.log(notificationCount, "here is notircaiotn count")
    res.status(200).json({
      success: true,
      messageCount: notificationCount,
    });
  } catch (error) {
    next(new CustomError((error as Error).message));
  }
};
