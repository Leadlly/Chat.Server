import mongoose from "mongoose";


const chatSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  chatRoom: { type: String },
  senderName: { type: String },
});

export const Chat = mongoose.model('Chat', chatSchema);