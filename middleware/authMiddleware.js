import dotenv from 'dotenv';
import { auth } from '../auth.js'; 
import { MongoClient } from 'mongodb';

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("mentorlagbe");

export const verifyToken = async (req, res, next) => {
  try {
    
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized: No session found" });
    }

    
    const dbUser = await db.collection("user").findOne({ email: session.user.email });

    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = {
      id: dbUser._id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden: Invalid session", error: error.message });
  }
};

export const verifyTutor = (req, res, next) => {
  if (req.user.role !== 'tutor') {
    return res.status(403).json({ message: "Access denied. Only Tutors can perform this action." });
  }
  next();
};

export const verifyStudent = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: "Access denied. Only Students can perform this action." });
  }
  next();
};
export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Only Admins can perform this action." });
  }
  next();
};