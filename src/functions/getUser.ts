import mongoose from "mongoose";
import { db } from "../db";

export const getUserInfo = async (userId: string) => {
  try {
    const user = await db.collection("users").findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (user) {
      return { source: "users", data: user };
    }

    const mentor = await db.collection("mentors").findOne({ _id: new mongoose.Types.ObjectId(userId) });
    if (mentor) {
      return { source: "mentors", data: mentor };
    }

    return { success: false, message: "No user exists corresponding to this id" };

  } catch (error) {
    console.error("Error fetching user info:", error);
    throw new Error("Unable to retrieve user information");
  }
};
