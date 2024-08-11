import { Chat } from "../models/chat"

export const saveChats = async(sender: string, receiver: string, message: string, room: string, sendBy: string, chatType?: string) =>{
    try {
        await Chat.create({
            sender, receiver, message, chatRoom: room, senderName: sendBy, chatType
        })

        console.log("chat saved success")
    } catch (error) {
        console.log(error)
    }
}
