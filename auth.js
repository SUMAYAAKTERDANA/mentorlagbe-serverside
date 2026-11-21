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
  baseURL: "http://localhost:5000",
  basePath: "/api/auth",
  trustedOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"],
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "student", input: true },
    },
  },
  plugins: [
    jwt(),
  ],
});