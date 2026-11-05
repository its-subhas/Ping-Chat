import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateNewAccessToken,
  generateNewRefreshToken,
  generateRefreshToken,
} from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import Session from "../models/Session.js";
import client from "./googleOAuth.js";
import { stopAITypingForReceiver } from "./messageController.js";

// google Signup and Login
export const google = async (req, res) => {
  try {
    const url = client.generateAuthUrl({
      access_type: "online",
      scope: ["openid", "profile", "email"],
      prompt: "select_account",
    });

    return res.redirect(url);
  } catch (error) {
    console.error("Google OAuth Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to initiate Google authentication!",
    });
  }
};

// google Signup and Login
export const callback = async (req, res) => {
  const code = req.query.code;

  try {
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code not found!",
      });
    }

    const { tokens } = await client.getToken(code);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return res.status(401).json({
        success: false,
        message: "Google email is not verified!",
      });
    }

    const { picture, name } = payload;
    const email = payload.email.toLowerCase().trim();

    const user = await User.findOne({ email });
    let newUser = null;

    if (user && payload.email_verified && !user.verified) {
      user.verified = true;
      user.verifiedAt = new Date();
      await user.save();
    }

    if (!user) {
      let googleProfilePic = "";

      if (picture) {
        try {
          const upload = await cloudinary.uploader.upload(picture, {
            folder: "Projects/Ping/Profiles",
          });
          googleProfilePic = upload.secure_url;
        } catch (error) {
          console.error("Google profile picture upload failed:", error.message);
        }
      }

      try {
        newUser = await User.create({
          profilePic: googleProfilePic,
          fullName: name,
          email,
          verified: true,
          verifiedAt: new Date(),
        });

        const sessionId = new mongoose.Types.ObjectId();
        const refreshToken = generateRefreshToken(newUser._id, sessionId);
        const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
        const accessToken = generateAccessToken(newUser._id, sessionId);

        await Session.create({
          _id: sessionId,
          userId: newUser._id,
          refreshTokenHash,
          ipAddress: req.ip,
          expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          path: "/",
          maxAge: 15 * 24 * 60 * 60 * 1000,
        });

        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          path: "/",
          maxAge: 15 * 60 * 1000,
        });

        return res.redirect(process.env.CLIENT_URL);
      } catch (error) {
        try {
          if (newUser) {
            await Session.deleteMany({ userId: newUser._id });
            await User.findByIdAndDelete(newUser._id);
          }
        } catch (cleanupError) {
          console.error("Signup cleanup failed:", cleanupError);
        }
        throw error;
      }
    }

    const oldRefreshToken = req.cookies?.refreshToken;

    if (oldRefreshToken) {
      try {
        const decoded = jwt.verify(
          oldRefreshToken,
          process.env.JWT_SECRET_REFRESH_TOKEN,
        );

        if (
          decoded.type === "refresh" &&
          decoded.sessionId &&
          decoded.userId.toString() === user._id.toString()
        ) {
          const oldSession = await Session.findOne({
            _id: decoded.sessionId,
            userId: user._id,
            revoked: false,
          });

          if (oldSession) {
            const isMatchOldRefreshToken = await bcrypt.compare(
              oldRefreshToken,
              oldSession.refreshTokenHash,
            );

            if (isMatchOldRefreshToken) {
              oldSession.revoked = true;
              oldSession.revokedAt = new Date();
              await oldSession.save();
            }
          }
        }
      } catch (error) {
        console.error("Old refresh token error:", error.message);
      }
    }

    const sessionId = new mongoose.Types.ObjectId();
    const refreshToken = generateRefreshToken(user._id, sessionId);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    const accessToken = generateAccessToken(user._id, sessionId);

    await Session.create({
      _id: sessionId,
      userId: user._id,
      refreshTokenHash,
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    return res.redirect(process.env.CLIENT_URL);
  } catch (error) {
    console.error("Google Callback Error:", error);
    return res.status(500).json({
      success: false,
      message: "Google authentication failed!",
    });
  }
};

// Signup a new user
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;

    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({
        success: false,
        message: "Missing Details!",
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({
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

    try {
      const sessionId = new mongoose.Types.ObjectId();
      const refreshToken = generateRefreshToken(newUser._id, sessionId);
      const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
      const accessToken = generateAccessToken(newUser._id, sessionId);
      const userData = await User.findById(newUser._id).select("-password");

      await Session.create({
        _id: sessionId,
        userId: newUser._id,
        refreshTokenHash,
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: 15 * 24 * 60 * 60 * 1000,
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: 15 * 60 * 1000,
      });

      return res.status(201).json({
        success: true,
        userData,
        token: accessToken,
        message: "Account created successfully!",
      });
    } catch (error) {
      try {
        await Session.deleteMany({ userId: newUser._id });
        await User.findByIdAndDelete(newUser._id);
      } catch (cleanupError) {
        console.error("Signup cleanup failed:", cleanupError);
      }

      throw error;
    }
  } catch (error) {
    console.error("Signup failed:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during signup!",
    });
  }
};

// Controller to Login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing Details!",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password!",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password!",
      });
    }

    const oldRefreshToken = req.cookies?.refreshToken;

    if (oldRefreshToken) {
      try {
        const decoded = jwt.verify(
          oldRefreshToken,
          process.env.JWT_SECRET_REFRESH_TOKEN,
        );

        if (
          decoded.type === "refresh" &&
          decoded.sessionId &&
          decoded.userId.toString() === user._id.toString()
        ) {
          const oldSession = await Session.findOne({
            _id: decoded.sessionId,
            userId: user._id,
            revoked: false,
          });

          if (oldSession) {
            const isMatchOldRefreshToken = await bcrypt.compare(
              oldRefreshToken,
              oldSession.refreshTokenHash,
            );

            if (isMatchOldRefreshToken) {
              oldSession.revoked = true;
              oldSession.revokedAt = new Date();
              await oldSession.save();
            }
          }
        }
      } catch (error) {
        console.error("Old refresh token error:", error.message);
      }
    }

    const sessionId = new mongoose.Types.ObjectId();
    const refreshToken = generateRefreshToken(user._id, sessionId);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    const accessToken = generateAccessToken(user._id, sessionId);
    const userData = await User.findById(user._id).select("-password");

    await Session.create({
      _id: sessionId,
      userId: user._id,
      refreshTokenHash,
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      userData,
      token: accessToken,
      message: "Login successful!",
    });
  } catch (error) {
    console.error("Login failed:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during login!",
    });
  }
};

// Controller to generate new Access Token using Refresh Token after page reload
export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  const accessToken = req.cookies?.accessToken;

  try {
    if (accessToken) {
      try {
        const decoded = jwt.verify(
          accessToken,
          process.env.JWT_SECRET_ACCESS_TOKEN,
        );

        if (
          decoded.type !== "access" ||
          !decoded.userId ||
          !decoded.sessionId
        ) {
          return res.status(401).json({
            success: false,
            message: "Invalid access token!",
          });
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const remainingSeconds = decoded.exp - currentTime;

        if (remainingSeconds > 5 * 60) {
          const activeSession = await Session.findOne({
            _id: decoded.sessionId,
            userId: decoded.userId,
            revoked: false,
            expiresAt: { $gt: new Date() },
          });

          if (!activeSession) {
            return res.status(401).json({
              success: false,
              message: "Session not found or expired!",
            });
          }

          return res.status(200).json({
            success: true,
            token: accessToken,
          });
        }
      } catch (error) {
        if (!(error instanceof jwt.TokenExpiredError)) {
          return res.status(401).json({
            success: false,
            message: "Invalid access token!",
          });
        }
      }
    }

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing!",
      });
    }

    let decodedRefreshToken;

    try {
      decodedRefreshToken = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET_REFRESH_TOKEN,
      );
    } catch {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired or invalid!",
      });
    }

    if (
      decodedRefreshToken.type !== "refresh" ||
      !decodedRefreshToken.userId ||
      !decodedRefreshToken.sessionId
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token!",
      });
    }

    const activeSession = await Session.findOne({
      _id: decodedRefreshToken.sessionId,
      userId: decodedRefreshToken.userId,
      revoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!activeSession) {
      return res.status(401).json({
        success: false,
        message: "Session not found or expired!",
      });
    }

    const isMatchRefreshToken = await bcrypt.compare(
      refreshToken,
      activeSession.refreshTokenHash,
    );

    if (!isMatchRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token invalid or revoked!",
      });
    }

    const remainingMs = activeSession.expiresAt.getTime() - Date.now();

    if (remainingMs <= 0) {
      return res.status(401).json({
        success: false,
        message: "Session expired, Please log in again!",
      });
    }

    const remainingSeconds = Math.floor(remainingMs / 1000);

    if (remainingSeconds <= 0) {
      return res.status(401).json({
        success: false,
        message: "Session expires too soon, Please log in again!",
      });
    }

    const accessTokenExpiry = Math.min(15 * 60, remainingSeconds);
    const accessTokenExpiryMs = accessTokenExpiry * 1000;

    const newAccessToken = generateNewAccessToken(
      decodedRefreshToken.userId,
      activeSession._id,
      accessTokenExpiry,
    );

    const newRefreshToken = generateNewRefreshToken(
      decodedRefreshToken.userId,
      activeSession._id,
      remainingSeconds,
    );

    activeSession.refreshTokenHash = await bcrypt.hash(newRefreshToken, 12);

    await activeSession.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: remainingMs,
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: accessTokenExpiryMs,
    });

    return res.status(200).json({
      success: true,
      token: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

// Controller to check if user is authenticated
export const checkAuth = (req, res) => {
  return res.json({
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

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found!, Failed to update profile!",
      });
    }
    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Updated user details successfully!",
    });
  } catch (error) {
    console.log(error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile!",
    });
  }
};

// Logout Function
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const accessToken = req.cookies?.accessToken;
    let decoded = null;

    if (accessToken) {
      try {
        const payload = jwt.verify(
          accessToken,
          process.env.JWT_SECRET_ACCESS_TOKEN,
        );

        if (payload.type === "access" && payload.userId && payload.sessionId) {
          decoded = payload;
        }
      } catch {
        decoded = null;
      }
    }

    if (!decoded && refreshToken) {
      try {
        const payload = jwt.verify(
          refreshToken,
          process.env.JWT_SECRET_REFRESH_TOKEN,
        );

        if (payload.type === "refresh" && payload.userId && payload.sessionId) {
          const session = await Session.findOne({
            _id: payload.sessionId,
            userId: payload.userId,
            revoked: false,
            expiresAt: { $gt: new Date() },
          });

          if (
            session?.refreshTokenHash &&
            (await bcrypt.compare(refreshToken, session.refreshTokenHash))
          ) {
            decoded = payload;
          }
        }
      } catch {
        decoded = null;
      }
    }

    if (decoded) {
      await Session.findOneAndUpdate(
        {
          _id: decoded.sessionId,
          userId: decoded.userId,
          revoked: false,
        },
        {
          $set: {
            revoked: true,
            revokedAt: new Date(),
          },
        },
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully!",
    });
  } catch (error) {
    console.error("Logout error:", error.message);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(500).json({
      success: false,
      message: "Logout failed!",
    });
  }
};

// Update AI Auto-Reply setting
export const updateAIAutoReply = async (req, res) => {
  try {
    const { aiAutoReply } = req.body;
    const userId = req.user?._id;

    if (typeof aiAutoReply !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid AI Auto-Reply setting!",
      });
    }

if (!aiAutoReply) {
  stopAITypingForReceiver(userId);
}

const user = await User.findByIdAndUpdate(
  userId,
  { $set: { aiAutoReply } },
  { new: true },
).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

  

    return res.status(200).json({
      success: true,
      aiAutoReply: user.aiAutoReply,
      message: "AI Auto-Reply setting updated!",
    });
  } catch (error) {
    console.error("AI Auto-Reply error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update AI Auto-Reply setting!",
    });
  }
};
