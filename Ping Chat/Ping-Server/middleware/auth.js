import Session from "../models/Session.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.accessToken ||
      (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing!",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_ACCESS_TOKEN);

    if (decoded.type !== "access" || !decoded.userId || !decoded.sessionId) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token!",
      });
    }

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

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Access token expired!",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token!",
      });
    }

    console.error("Authentication error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
