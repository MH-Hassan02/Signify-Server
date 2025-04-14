import Chat from "../models/Chat.js";

export const createChat = async (req, res) => {
  const { userId, secondUserId } = req.body;

  try {
    let chat = await Chat.findOne({
      users: { $all: [userId, secondUserId] },
    });

    if (chat) return res.json(chat);

    chat = await Chat.create({ users: [userId, secondUserId] });

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
