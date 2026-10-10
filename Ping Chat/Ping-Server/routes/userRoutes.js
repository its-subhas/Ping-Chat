import express from "express";
import {signup, login, updateProfile, checkAuth,} from "../controllers/userController.js";
import {validateSignup, validateLogin, validateUpdateProfile,} from "../middleware/validator.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", validateSignup, signup);
userRouter.post("/login", validateLogin, login);
userRouter.put("/update-profile", protectRoute, validateUpdateProfile, updateProfile,);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;
