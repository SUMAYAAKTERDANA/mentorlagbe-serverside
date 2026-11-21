import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("mentorlagbe");
const upload = multer({ storage: multer.memoryStorage() });

// Admin Only
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await db.collection("user").find().sort({ createdAt: -1 }).toArray();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

// Admin Only
router.patch('/:id/role', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const result = await db.collection("user").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { role } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating role", error: error.message });
  }
});

// myshelf profile update
router.patch('/profile', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { name, phone, bio } = req.body;
    let imageUrl = "";

    
    if (req.file) {
      const formData = new FormData();
      formData.append('image', req.file.buffer.toString('base64'));
      
      const imgbbResponse = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        formData,
        { headers: formData.getHeaders() }
      );
      imageUrl = imgbbResponse.data.data.url;
    }

    const updateData = { name, phone, bio };
    if (imageUrl) updateData.image = imageUrl; 

    
    const result = await db.collection("user").updateOne(
      { email: req.user.email },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) return res.status(404).json({ message: "User not found" });
    
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
});

export default router;