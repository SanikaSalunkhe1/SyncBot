import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, "") : "";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: emailPass
  },
  connectionTimeout: 10000, // 10 seconds timeout
  greetingTimeout: 10000,
  socketTimeout: 15000
});

// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.error("Mail transporter verification failed:", error.message);
  } else {
    console.log("Mail transporter is ready to send emails");
  }
});
