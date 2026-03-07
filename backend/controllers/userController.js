import User from "../models/userModel.js";
import httpsStatus from "http-status";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { transporter } from "../config/mail.js";
import { generateRandomPassword , generateMeetingCode } from "../utils/generatePassword.js";

// User Registration
export const register = async (req, res) => {
  const { email, username } = req.body;

  if (!email || !username) {
    return res.status(httpsStatus.BAD_REQUEST).json({ message: "All fields are required" });
  }

  try {
    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(httpsStatus.CONFLICT).json({ message: "User with given email or username already exists" });
    }

    const plainPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Generate unique meeting code
    const meetingCode = generateMeetingCode();

    // Create user
    await User.create({
      email,
      username,
      password: hashedPassword ,
      meetingCode
    });

    // Send password to email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "SyncMeet - Your Account Password",
        text: `Welcome to SyncMeet!\n\nYour account has been created successfully.\n\nUsername: ${username}\nPassword: ${plainPassword}\n\nYour Personal Meeting Code: ${meetingCode}\n\nUse this meeting code to start or join meetings.
            \n\nPlease change your password after logging in for the first time.\n\nBest regards,\nSyncMeet Team`
      });
      console.log("Email sent successfully to:", email);
    } catch (mailErr) {
      console.error("Failed to send email:", mailErr);
      return res.status(httpsStatus.CREATED).json({ 
        message: "User registered successfully but failed to send email. Contact support."
      });
    }

    return res.status(httpsStatus.CREATED).json({ message: "User registered successfully. Please check your email for the password." });

  } catch (err) {
    console.error("Error during registration:", err);
    return res.status(httpsStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error. Registration failed." });
  }
};

// User Login
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(httpsStatus.BAD_REQUEST).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(httpsStatus.NOT_FOUND).json({ message: "User not found. Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(httpsStatus.UNAUTHORIZED).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(httpsStatus.OK).json({ message: "Login successful", token });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(httpsStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error. Login failed." });
  }
};
