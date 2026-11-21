import express from 'express';
import Tuition from '../models/Tuition.js';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import { verifyToken, verifyTutor, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

//New Tuition post kra
router.post('/', verifyToken, verifyTutor, upload.single('banner'), async (req, res) => {
  try {
    const { title, subject, classLevel, mode, location, monthlyFee, daysPerWeek, description } = req.body;
    let bannerImageUrl = "";

    if (req.file) {
      const formData = new FormData();
      formData.append('image', req.file.buffer.toString('base64'));
      
      const imgbbResponse = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        formData,
        { headers: formData.getHeaders() }
      );
      bannerImageUrl = imgbbResponse.data.data.url;
    }

    const newTuition = new Tuition({
      title, subject, classLevel, mode, location, monthlyFee, daysPerWeek, description,
      bannerImage: bannerImageUrl,
      tutorName: req.user.name,
      tutorEmail: req.user.email,
    });

    await newTuition.save();
    res.status(201).json({ message: "Tuition posted successfully!", tuition: newTuition });
  } catch (error) {
    res.status(500).json({ message: "Error posting tuition", error: error.message });
  }
});

// ২. Featured Tuitions 
router.get('/featured', async (req, res) => {
  try {
    const tuitions = await Tuition.find({ approvalStatus: 'approved', isActive: true })
      .sort({ createdAt: -1 })
      .limit(6);
    res.status(200).json(tuitions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching featured tuitions", error: error.message });
  }
});

// admin show all tution
router.get('/admin/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const tuitions = await Tuition.find().sort({ createdAt: -1 });
    res.status(200).json(tuitions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all tuitions" });
  }
});

// Tutor my-shelf Tuition show
router.get('/my-tuitions', verifyToken, verifyTutor, async (req, res) => {
  try {
    const tuitions = await Tuition.find({ tutorEmail: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json(tuitions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your tuitions", error: error.message });
  }
});

// All Approved Tuition Show (Public)
router.get('/', async (req, res) => {
  try {
    const tuitions = await Tuition.find({ approvalStatus: 'approved', isActive: true }).sort({ createdAt: -1 });
    res.status(200).json(tuitions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tuitions", error: error.message });
  }
});

//  Admin Approve/Reject 
router.patch('/admin/:id/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body; 
    const tuition = await Tuition.findByIdAndUpdate(
      req.params.id, 
      { approvalStatus: status }, 
      { new: true }
    );
    if (!tuition) return res.status(404).json({ message: "Tuition not found" });
    
    res.status(200).json({ message: `Tuition ${status} successfully`, tuition });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
});

//  Active/Close 
router.patch('/:id/toggle', verifyToken, verifyTutor, async (req, res) => {
  try {
    const tuition = await Tuition.findById(req.params.id);
    if (!tuition) return res.status(404).json({ message: "Tuition not found" });
    if (tuition.tutorEmail !== req.user.email) return res.status(403).json({ message: "Not authorized" });

    tuition.isActive = !tuition.isActive;
    await tuition.save();
    res.status(200).json({ message: "Status updated", tuition });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
});

//  Tuition delete
router.delete('/:id', verifyToken, verifyTutor, async (req, res) => {
  try {
    const tuition = await Tuition.findById(req.params.id);
    if (!tuition) return res.status(404).json({ message: "Tuition not found" });
    if (tuition.tutorEmail !== req.user.email) return res.status(403).json({ message: "Not authorized" });

    await Tuition.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Tuition deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting tuition" });
  }
});

//  specific tution show
router.get('/:id', async (req, res) => {
  try {
    const tuition = await Tuition.findById(req.params.id);
    if (!tuition) return res.status(404).json({ message: "Tuition not found" });
    res.status(200).json(tuition);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tuition" });
  }
});

export default router;