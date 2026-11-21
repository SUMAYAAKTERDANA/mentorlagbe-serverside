import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']); 

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import mongoose from 'mongoose';

import tuitionRoutes from './routes/tuitionRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true,               
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], 
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"]
}));


app.all("/api/auth/*splat", toNodeHandler(auth));

// Body Parser 
app.use(express.json());


app.use('/api/tuitions', tuitionRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes); 

app.get('/', (req, res) => {
  res.send('MentorLagbe Server is running!');
});

// MongoDB 
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully!"))
  .catch((err) => console.log("MongoDB Connection Error:", err));


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});