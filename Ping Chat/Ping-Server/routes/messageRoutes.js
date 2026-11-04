import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  deleteMessage,
  getMessages,
  getUsersForSidebar,
  markMessageAsSeen,
  sendMessage,
} from "../controllers/messageController.js";
import { chatWithGemini } from "../controllers/geminiController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.post("/gemini", protectRoute, chatWithGemini);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);
messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.delete("/delete/:messageId", protectRoute, deleteMessage);

export default messageRouter;
