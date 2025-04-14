import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    googleId: { type: String, unique: true },
    profilePic: {
      type: String,
      default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat", default: [] }],
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
