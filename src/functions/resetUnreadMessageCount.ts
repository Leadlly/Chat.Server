import mongoose from "mongoose";
import { Chat } from "../models/chat";

export const resetUnreadMessageCount = async (receiver: string, room: string) => {
  try {
    const unreadChats = await Chat.find({
      receiver: new mongoose.Types.ObjectId(receiver),
      chatRoom: room,
      isRead: false
    });

    // Update each unread chat to be read
    await Promise.all(
      unreadChats.map(async (chat) => {
        chat.isRead = true;
        return chat.save(); 
      })
    );

    return { message: "Messages updated" };
  } catch (error) {
    console.error("Error updating unread messages:", error); 
    return { error: "Failed to update messages" }; 
  }
};
