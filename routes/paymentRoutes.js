import express from 'express';
import { MongoClient } from 'mongodb';
import { verifyToken, verifyAdmin } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("mentorlagbe");

// admin see all payment
router.get('/admin/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const payments = await db.collection("payments").find().sort({ paidAt: -1 }).toArray();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error: error.message });
  }
});


router.post('/success', verifyToken, async (req, res) => {
  try {
    const { planName, amount, transactionId, stripeSessionId } = req.body;

    // payment document creat
    const newPayment = {
      userEmail: req.user.email,
      userName: req.user.name,
      userRole: req.user.role,
      planName: planName || "Pro Plan",
      amount: amount || 15,
      currency: "usd",
      transactionId: transactionId || "txn_" + Date.now(),
      stripeSessionId: stripeSessionId || "sess_" + Date.now(),
      paymentStatus: "paid",
      paidAt: new Date(),
    };

    // live payments collection save
    await db.collection("payments").insertOne(newPayment);

    // user plan pro kra
    await db.collection("user").updateOne(
      { email: req.user.email },
      { $set: { plan: "pro" } }
    );

    res.status(200).json({ message: "Payment recorded successfully", payment: newPayment });
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ message: "Error processing payment", error: error.message });
  }
});

export default router;