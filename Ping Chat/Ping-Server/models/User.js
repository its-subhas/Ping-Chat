import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    fullName: {
      type: String,
      required: true,
      minlength: 1,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 7,
    },

    profilePic: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      required: true,
      minlength: 1,
      trim: true,
      default: "Hey, I am using Ping!",
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("Users", UserSchema);

export default User;
