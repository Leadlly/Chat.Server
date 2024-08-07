import mongoose from "mongoose"
import { db } from "../db"

export const getStudentDetails = async(studentId: string)  => {
    try {
        const User = db.collection("users")

        const student = User.findOne({_id: new mongoose.Types.ObjectId(studentId)})
        if(!student) return 

        return student
    } catch (error) {
        console.log(error)
    }
}