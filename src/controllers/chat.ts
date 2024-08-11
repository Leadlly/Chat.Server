import { Request, Response, NextFunction } from "express";
import { CustomError } from "../middleware/error";
import { Chat } from "../models/chat";

interface ChatMessage {
    message: string;
    timestamp: string;
    sendBy?: string;
  }

export const getChats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { mentorId, studentId } = req.body;
         const { limit = 30, skip = 0 } = req.query

    
        if (!mentorId || !studentId) {
            return next(new CustomError("MentorId and StudentId must be provided", 400));
        }

        const chatLimit = parseInt(limit as string, 10);
        const chatSkip = parseInt(skip as string, 10);

        const chat = await Chat.find({
            $or: [
                { sender: mentorId, receiver: studentId },
                { sender: studentId, receiver: mentorId }
            ]
        })
            .sort({ timestamp: -1 })
            .skip(chatSkip)        
            .limit(chatLimit);    

        if (chat.length === 0) {
            return next(new CustomError("No chats found", 404));
        }

        const formattedChats: ChatMessage[] = chat.reverse().map(doc => ({
            message: doc.message,      
            timestamp: doc.timestamp.toISOString(), 
            sendBy: doc.senderName || "Unknown"        
        }));

        res.status(200).json({messages: formattedChats});
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
};

export const getGroupChats = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { mentorId, studentId, chatType} = req.body;
         const { limit = 30, skip = 0 } = req.query

    
        if (!mentorId && !studentId) {
            return next(new CustomError("MentorId and StudentId must be provided", 400));
        }

        const chatLimit = parseInt(limit as string, 10);
        const chatSkip = parseInt(skip as string, 10);

        const chat = await Chat.find({
           sender: mentorId,
           receiver: studentId,
           chatType
        })
            .sort({ timestamp: -1 })
            .skip(chatSkip)        
            .limit(chatLimit);    

        if (chat.length === 0) {
            return next(new CustomError("No chats found", 404));
        }

        const formattedChats: ChatMessage[] = chat.reverse().map(doc => ({
            message: doc.message,      
            timestamp: doc.timestamp.toISOString(), 
            sendBy: doc.senderName || "Unknown"        
        }));

        res.status(200).json({messages: formattedChats});
    } catch (error) {
        next(new CustomError((error as Error).message));
    }
};