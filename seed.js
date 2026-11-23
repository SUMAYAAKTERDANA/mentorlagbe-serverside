import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tuition from './models/Tuition.js';

dotenv.config();

const subjects = ["Math", "Physics", "Chemistry", "English", "Programming", "IELTS"];
const classLevels = ["Class 8", "Class 9", "Class 10", "HSC", "Admission"];
const tutors = [
  { name: "Rafiq Hasan", email: "rafiq@gmail.com" },
  { name: "Nusrat Jahan", email: "nusrat@gmail.com" },
  { name: "Tanvir Ahmed", email: "tanvir@gmail.com" }
];

const generateTuitions = () => {
  const tuitions = [];
  for (let i = 1; i <= 12; i++) {
    const subject = subjects[i % subjects.length];
    const classLevel = classLevels[i % classLevels.length];
    const tutor = tutors[i % tutors.length];
    
    tuitions.push({
      title: `${subject} for ${classLevel}`,
      subject: subject,
      classLevel: classLevel,
      mode: i % 2 === 0 ? "Online" : "Offline",
      location: "Dhaka",
      monthlyFee: 3000 + (i * 500),
      daysPerWeek: 3,
     
      bannerImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1000&auto=format&fit=crop",
      description: `Expert guidance for ${subject}. Personalized attention and weekly assessments.`,
      tutorName: tutor.name,
      tutorEmail: tutor.email,
      approvalStatus: "approved",
      isActive: true,
    });
  }
  return tuitions;
};

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected for Seeding");

   
    await Tuition.deleteMany({});

    const tuitions = generateTuitions();
    await Tuition.insertMany(tuitions);
    
    console.log(`Successfully seeded ${tuitions.length} tuitions!`);
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();