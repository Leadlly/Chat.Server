import { Request, Response } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { db } from '../db';


export const joinRoom = async (req: Request, res: Response, io: SocketIOServer) => {
    try {
        const User = db.collection('users');
        const Mentor = db.collection('mentors');
        const { email: useremail } = req.body;

        // Find the user by their email
        const user = await User.findOne({ email: useremail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has a mentor assigned
        if (!user.mentor) {
            return res.status(404).json({ message: 'Mentor not assigned to this user' });
        }

        // Extract mentor details
        const mentor = await Mentor.findOne({ _id: user.mentor.id });

        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        // Emit an event to the specific room
         io.emit('join room', { useremail, mentor: mentor.firstname, mentoremail: mentor.email });

        // Respond with mentor details
        res.status(200).json({ message: `User ${useremail} joined with mentor ${mentor.email}` });

    } catch (error) {
        console.error('Error in joinRoom:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const sendMessage = async (req: Request, res: Response, io: SocketIOServer) => {
    try {
        const { message, useremail } = req.body;

        const User = db.collection('users');
        const Mentor = db.collection('mentors');

        const user = await User.findOne({ useremail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.mentor) {
            return res.status(404).json({ message: 'Mentor not assigned to this user' });
        }

        const mentorId = user.mentor.id;

        // Find the mentor by ID
        const mentor = await Mentor.findOne({ _id: mentorId });

        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        // Emit message event to the mentor's room
        io.to(mentor.email).emit('chat message', { useremail, message });

        res.status(200).json({ message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const joinMentorRoom = async (req: Request, res: Response, io: SocketIOServer) => {
    try {
        const Student = db.collection('users');
        const { userEmail } = req.body;

        // Find the mentor by their email
        const student = await Student.findOne({ email: userEmail });

        if (!student) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        // Emit an event that instructs the socket to join the room
        io.emit('join mentor room', { userEmail });

        res.status(200).json({ message: `Mentor ${userEmail} joined room` });

    } catch (error) {
        console.error('Error in joinMentorRoom:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
