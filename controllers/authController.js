import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    console.log(req.body);
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      contacts: [],
      chats: [],
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    const userInfo = {
      username: user.username,
      email: user.email,
    };

    res.json({ message: "Login successful", user: userInfo });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const fetchUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateProfile = async (req, res) => {
  const { username, phone, password } = req.body;

  try {
    const { userId } = req.params;
    console.log(userId, "userId");
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, phone, password },
      { new: true, runValidators: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found." });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "No account with that email found." });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters long" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};
