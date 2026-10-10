import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

// Signup a new user
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;

  try {
    if (!fullName || !email || !password || !bio) {
      return res.json({
        success: false,
        message: "Missing Details!",
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.json({
        success: false,
        message: "Account already exists!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    const userData = await User.findById(newUser._id).select("-password");

    res.json({
      success: true,
      userData,
      token,
      message: "Account created successfully!",
    });
  } catch (error) {
    console.log(error.message);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Controller to Login a user

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Missing Details!",
      });
    }

    const userData = await User.findOne({ email });

    if (!userData) {
      return res.json({
        success: false,
        message: "User not found!",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      return res.json({
        success: false,
        message: "Invalid credentials!",
      });
    }

    const token = generateToken(userData._id);

    const user = await User.findById(userData._id).select("-password");

    res.json({
      success: true,
      userData: user,
      token,
      message: "Login successful!",
    });
  } catch (error) {
    console.log(error.message);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Controller to check if user is authenticated

export const checkAuth = (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

// Controller to update user profile details

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName, bio } = req.body;

    if (!fullName || !bio) {
      return res.status(400).json({
        success: false,
        message: "Full Name and Bio are required!",
      });
    }

    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required, Please login first!",
      });
    }

    const updateData = { fullName, bio };

    if (profilePic) {
      const upload = await cloudinary.uploader.upload(profilePic, {
        folder: "Projects/Ping/Profiles",
      });
      updateData.profilePic = upload.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    res.json({
      success: true,
      user: updatedUser,
      message: "Updated user details successfully!",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
