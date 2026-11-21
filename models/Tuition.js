import mongoose from 'mongoose';

const tuitionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  classLevel: { type: String, required: true },
  mode: { type: String, enum: ['Online', 'Offline'], required: true },
  location: { type: String },
  monthlyFee: { type: Number, required: true },
  daysPerWeek: { type: Number, required: true },
  bannerImage: { type: String },
  description: { type: String, required: true },
  tutorName: { type: String, required: true },
  tutorEmail: { type: String, required: true },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Tuition', tuitionSchema);