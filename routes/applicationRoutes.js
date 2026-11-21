import express from 'express';
import Application from '../models/Application.js';
import { verifyToken, verifyStudent, verifyTutor } from '../middleware/authMiddleware.js';

const router = express.Router();

// new Application submit kra(Student Only)
router.post('/', verifyToken, verifyStudent, async (req, res) => {
  try {
    const { tuitionId, tuitionTitle, subject, monthlyFee, tutorEmail, studentPhone, preferredSchedule, studentNote } = req.body;

    // duplicate check
    const existingApp = await Application.findOne({ tuitionId, studentEmail: req.user.email });
    if (existingApp) {
      return res.status(400).json({ message: "You have already applied for this tuition." });
    }

    const newApplication = new Application({
      tuitionId, tuitionTitle, subject, monthlyFee, tutorEmail,
      studentName: req.user.name,
      studentEmail: req.user.email,
      studentPhone, preferredSchedule, studentNote
    });

    await newApplication.save();
    res.status(201).json({ message: "Application submitted successfully", application: newApplication });
  } catch (error) {
    res.status(500).json({ message: "Error submitting application", error: error.message });
  }
});


router.get('/my-applications', verifyToken, verifyStudent, async (req, res) => {
  try {
    const applications = await Application.find({ studentEmail: req.user.email }).sort({ appliedAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applications" });
  }
});

// Application show(Tutor Only)
router.get('/tutor-applications', verifyToken, verifyTutor, async (req, res) => {
  try {
    const applications = await Application.find({ tutorEmail: req.user.email }).sort({ appliedAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applications" });
  }
});

// Accept/Reject 
router.patch('/:id/status', verifyToken, verifyTutor, async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!application) return res.status(404).json({ message: "Application not found" });
    res.status(200).json({ message: `Application ${status} successfully`, application });
  } catch (error) {
    res.status(500).json({ message: "Error updating application status" });
  }
});


router.delete('/:id', verifyToken, verifyStudent, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });
    if (application.status !== 'pending') return res.status(400).json({ message: "Cannot delete processed application" });

    await Application.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Application cancelled" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting application" });
  }
});

export default router;