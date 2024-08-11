
type Data = {
    room: string,
    receiver: string
}

export interface GroupMessage {
    data: Data[], 
    sender: string, 
    message: string, 
    timestamp: string, 
    sendBy: string, 
    socketId: string 
}