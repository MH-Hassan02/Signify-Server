import Chat from "../models/Chat.js";
import User from "../models/User.js";

export const createChat = async (req, res) => {
  const { userId, secondUserId } = req.body;

  try {
    let chat = await Chat.findOne({
      users: { $all: [userId, secondUserId] },
    });

    if (chat) return res.json(chat);

    chat = await Chat.create({ users: [userId, secondUserId] });

    await Promise.all([
      User.findByIdAndUpdate(userId, {
        $addToSet: { chats: chat._id },
      }),
      User.findByIdAndUpdate(secondUserId, {
        $addToSet: { chats: chat._id },
      }),
    ]);

    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: "Error creating chat", error: err });
  }
};

// Get all chats for the current user
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user._id })
      .populate("users", "username profilePic") // Populate user info for easier use in frontend
      .populate("lastMessage");

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving chats", error: err });
  }
};
