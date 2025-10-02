import { Chat } from "../models/chat"

export const saveChats = async(sender: string, receiver: string, message: string, room: string, sendBy: string, chatType?: string) =>{
try {
await Chat.create({
sender, receiver, message, chatRoom: room, senderName: sendBy, chatType
})
console.log(`Chat saved successfully for room: ${room}, sender: ${sender}`);
} catch (error) {
console.error(`Error saving chat for room: ${room}, sender: ${sender}:`, error);
// Consider re-throwing the error or implementing a retry mechanism here
}
    }
}
