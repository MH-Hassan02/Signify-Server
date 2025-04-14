import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

// Send a message
export const sendMessage = async (req, res) => {
  const { text, sender, receiver, chatId } = req.body;

  try {
    if (!chatId || !text || !sender || !receiver) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const message = await Message.create({
      chat: chatId,
      sender: sender,
      receiver: receiver,
      text: text,
    });

    // Update the chat document with the new message
    const chat = await Chat.findById(chatId);
    chat.messages.push(message._id);
    await chat.save();

    // Update the last message and unread count for both sender and receiver
    const senderUser = await User.findById(sender).select("-password"); // Exclude password
    const receiverUser = await User.findById(receiver).select("-password");

    // Update last message for both sender and receiver
    senderUser.contacts.forEach((contact) => {
      if (contact._id.toString() === receiver) {
        contact.lastMessage = text;
      }
    });
    receiverUser.contacts.forEach((contact) => {
      if (contact._id.toString() === sender) {
        contact.lastMessage = text;
      }
    });

    // Update unread count for the receiver
    receiverUser.contacts.forEach((contact) => {
      if (contact._id.toString() === sender) {
        contact.unreadCountForReceiver += 1;
      }
    });

    // Save updated contact information
    await senderUser.save();
    await receiverUser.save();

    if (!req.io) {
      console.log("Error: req.io is not available.");
      return res.status(500).json({ message: "Socket.io is not connected" });
    }

    req.io.to(receiver).emit("message received", message);

    res.status(201).json(message);
  } catch (err) {
    console.error("Error while sending message:", err);
    res.status(500).json({ message: "Error sending message", error: err });
  }
};

export const getMessages = async (req, res) => {
  const { userId, contactId } = req.params;
  try {
    const chat = await Chat.findOne({
      users: { $all: [userId, contactId] },
    });

    if (!chat) {
      return;
    }

    const messages = await Message.find({ chat: chat._id })
      .sort({ createdAt: 1 })
      .populate("sender", "username profilePic");

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error retrieving messages", error: err });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Update messages status as 'read' for the specific sender and receiver
    const updatedMessages = await Message.updateMany(
      {
        sender: senderId,
        receiver: receiverId,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    if (updatedMessages.modifiedCount > 0) {
      req.io.to(senderId).emit("messages read", { senderId, receiverId });
      req.io.to(receiverId).emit("messages read", { senderId, receiverId });
    }

    res.status(200).json({
      success: true,
      message: `Marked ${updatedMessages.modifiedCount} messages as read.`,
    });
  } catch (err) {
    console.error("Error marking messages as read:", err);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
};
