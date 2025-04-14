import Message from "../models/Message.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const searchContact = async (req, res) => {
  const { query } = req.query;

  if (!query) return res.status(400).json({ msg: "Query is required." });

  try {
    let user = null;

    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findById(query);
    }

    if (!user) {
      user = await User.findOne({
        $or: [{ email: query }, { username: query }],
      });
    }

    if (!user) return res.status(404).json({ msg: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error("Error searching user:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const addContact = async (req, res) => {
  const { userId } = req.body;
  const { user } = req;

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, msg: "User ID is required." });
  }

  try {
    const contact = await User.findById(userId);
    if (!contact) {
      return res.status(404).json({ success: false, msg: "User not found." });
    }

    if (user.id.toString() === userId) {
      return res
        .status(400)
        .json({ success: false, msg: "You cannot add yourself as a contact." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $addToSet: { contacts: userId } },
      { new: true }
    );

    const populatedUser = await User.findById(updatedUser._id).populate(
      "contacts",
      "username email profilePic"
    );

    return res.status(200).json({
      success: true,
      msg: "Contact added successfully.",
      updatedUser: populatedUser,
    });
  } catch (err) {
    console.error("Error adding contact:", err);
    return res.status(500).json({
      success: false,
      msg: "Something went wrong while adding the contact. Please try again later.",
    });
  }
};

export const fetchContacts = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all contacts for the user
    const userWithContacts = await User.findById(userId).populate(
      "contacts",
      "username email profilePic statusMessage"
    );

    const contactsWithMessages = await Promise.all(
      userWithContacts.contacts.map(async (contact) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: userId, receiver: contact._id },
            { sender: contact._id, receiver: userId },
          ],
        }).sort({ createdAt: -1 }); // Fetch the most recent message

        const lastMessageText = lastMessage ? lastMessage.text : null;
        const lastMessageTime = lastMessage ? lastMessage.createdAt : null;

        const unreadCountForReceiver = await Message.countDocuments({
          receiver: userId,
          sender: contact._id,
          isRead: false,
        });

        const unreadCountForSender = await Message.countDocuments({
          receiver: contact._id,
          sender: userId,
          isRead: false,
        });

        return {
          ...contact._doc,
          lastMessage: lastMessageText || contact.statusMessage, // If no message, use statusMessage
          lastMessageTime: lastMessageTime || null,
          unreadCountForReceiver,
          unreadCountForSender,
        };
      })
    );

    const contactsWithoutMessages = userWithContacts.contacts.filter(
      (contact) => {
        return !contactsWithMessages.some(
          (c) => c._id.toString() === contact._id.toString()
        );
      }
    );

    res.status(200).json({
      contactsWithMessages,
      contactsWithoutMessages,
    });
  } catch (err) {
    console.error("Fetch contacts error:", err);
    res.status(500).json({ msg: "Failed to fetch contacts." });
  }
};
