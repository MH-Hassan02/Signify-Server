import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
    profilePic: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    statusMessage: { type: String, default: "This is my account" },
    contacts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
    ],
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat", default: [] }],
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
