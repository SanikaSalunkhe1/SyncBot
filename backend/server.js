import dotenv from "dotenv";
dotenv.config();

//to check env variables are loaded
console.log("EMAIL:", process.env.EMAIL_USER);
console.log("PASS:", process.env.EMAIL_PASS ? "LOADED" : "MISSING");


import express from "express";
import connectDB from "./config/db.js";
import { createServer } from "node:http";
import cors from "cors";
import connectToSocket from "./controllers/socketManager.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
const server = createServer(app);
connectToSocket(server);

app.set("port", process.env.PORT || 8000);
// app.use(cors());

// CORS: allow Vercel frontend in production, open in local dev
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map(o => o.trim())
  : null;

const corsOptions = allowedOrigins
  ? {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman) or matching origins
        if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS: " + origin));
        }
      },
      credentials: true
    }
  : {};
app.use(cors(corsOptions));

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

app.use("/api/v1/users", userRoutes);

app.get("/", (req, res) => {
  res.send("SyncMeet Backend is running");
});

const start = async () => {
  await connectDB();
  server.listen(app.get("port"), () => {
    console.log(`Server is running on port ${app.get("port")}`);
  });
};

start();
