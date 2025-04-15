import admin from "firebase-admin";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("../config/firebase-service-account.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const googleAuth = async (req, res) => {
  const { email, username, googleId, profilePic } = req.body;
  console.log("req.body", req.body);

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ username, email, googleId, profilePic });
      await user.save();
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Set token in HTTP-only cookie (just like in your login function)
    res.cookie("token", token, { 
      httpOnly: true, 
      secure: true, 
      sameSite: "None" 
    });

    // Return user info (without token)
    const userInfo = {
      username: user.username,
      email: user.email,
    };

    res.status(200).json({ message: "Google Sign-In successful", user: userInfo });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
};