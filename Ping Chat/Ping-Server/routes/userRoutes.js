import express from "express";
import {
  signup,
  login,
  updateProfile,
  checkAuth,
  refreshAccessToken,
  logout,
  google,
  callback,
  updateAIAutoReply,
} from "../controllers/userController.js";
import {
  validateSignup,
  validateLogin,
  validateUpdateProfile,
} from "../middleware/validator.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", validateSignup, signup);
userRouter.post("/login", validateLogin, login);
userRouter.post("/refresh", refreshAccessToken);
userRouter.get("/check", protectRoute, checkAuth);
userRouter.put(
  "/update-profile",
  protectRoute,
  validateUpdateProfile,
  updateProfile,
);
userRouter.put("/ai-auto-reply", protectRoute, updateAIAutoReply);
userRouter.post("/logout", logout);
userRouter.get("/google", google);
userRouter.get("/google/callback", callback);

export default userRouter;
