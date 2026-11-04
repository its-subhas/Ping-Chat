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
      required: false,
      minlength: 7,
    },

    profilePic: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      required: false,
      minlength: 1,
      trim: true,
      default: "Hey, I am using Ping!",
    },

    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    aiAutoReply: {
  type: Boolean,
  default: false,
},
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("Users", UserSchema);

export default User;
