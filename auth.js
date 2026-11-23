import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { jwt } from "better-auth/plugins";
import dotenv from 'dotenv';
dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);
const db = client.db("mentorlagbe");

export const auth = betterAuth({
  database: mongodbAdapter(db),
 
  baseURL: process.env.BETTER_AUTH_URL || "https://mentorlagbe-serverside.onrender.com",
  basePath: "/api/auth",
  
  trustedOrigins: [
   "https://mentorlagbe-clientside-u9i8.vercel.app",
    "http://localhost:3000"
  ],
  emailAndPassword: { 
    enabled: true 
  },
  user: {
    additionalFields: {
      role: { 
        type: "string", 
        required: false, 
        defaultValue: "student", 
        input: true 
      },
    },
  },
  plugins: [
    jwt(),
  ],
});