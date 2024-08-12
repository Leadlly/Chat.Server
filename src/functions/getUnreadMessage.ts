import mongoose from "mongoose";
import { Chat } from "../models/chat";

export const getUnreadMessages = async( receiver: string, room: string) =>{
   try {
    const unreadChatsCount = await Chat.countDocuments({
        receiver: new mongoose.Types.ObjectId(receiver),
        chatRoom: room,
        isRead: false
    })

    return unreadChatsCount

   } catch (error) {
    console.log(error)
   }
}