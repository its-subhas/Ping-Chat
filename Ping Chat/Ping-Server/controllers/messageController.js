import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";
import { generateAutoReply as generateAutoReplyText } from "./geminiController.js";

const getImagePart = async (imageUrl) => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const mimeType = response.headers.get("content-type")?.split(";")[0];

    if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
      return null;
    }

    const data = Buffer.from(await response.arrayBuffer()).toString("base64");

    return {
      inlineData: { mimeType, data },
    };
  } catch (error) {
    console.error("Image processing error:", error.message);
    return null;
  }
};

// Get all users except the logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: userId },
    }).select("-password");

    // Count unseen messages
    const unseenMessages = {};

    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      });

      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });

    await Promise.all(promises);

    res.json({
      success: true,
      users: filteredUsers,
      unseenMessages,
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all messages for selected user

export const getMessages = async (req, res) => {
  try {
    const selectedUserId = req.params.id;
    const myId = req.user._id;

    if (!selectedUserId || !myId) {
      return res.status(500).json({
        success: false,
        message: "Internal server error!",
      });
    }

    let messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });

    const unreadMessages = messages.filter(
      (message) =>
        message.senderId.toString() === selectedUserId &&
        message.receiverId.toString() === myId.toString() &&
        !message.seen,
    );

    if (unreadMessages.length > 0) {
      await Message.updateMany(
        {
          _id: { $in: unreadMessages.map((message) => message._id) },
          receiverId: myId,
          senderId: selectedUserId,
          seen: false,
        },
        { $set: { seen: true } },
      );

      const senderSocketId = userSocketMap[selectedUserId];

      if (senderSocketId) {
        unreadMessages.forEach((message) => {
          io.to(senderSocketId).emit("messageSeen", {
            messageId: message._id.toString(),
          });
        });
      }

      // Update the returned messages so the UI shows seen ticks immediately.
      const unreadIds = new Set(
        unreadMessages.map((message) => message._id.toString()),
      );

      messages = messages.map((message) => {
        if (unreadIds.has(message._id.toString())) {
          message.seen = true;
        }
        return message;
      });
    }

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

// api to mark message as seen using message id

export const markMessageAsSeen = async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.user._id;

    if (!messageId || !userId) {
      return res.status(500).json({
        success: false,
        message: "Internal server error!",
      });
    }

    const existingMessage = await Message.findById(messageId);

    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found!",
      });
    }

    if (existingMessage.receiverId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to mark this message as seen!",
      });
    }

    const message = await Message.findOneAndUpdate(
      {
        _id: messageId,
        receiverId: userId,
        senderId: existingMessage.senderId.toString(),
        seen: false,
      },
      { $set: { seen: true } },
      { new: true },
    );

    if (message) {
      const senderSocketId = userSocketMap[message.senderId.toString()];

      if (senderSocketId) {
        io.to(senderSocketId).emit("messageSeen", {
          messageId: message._id.toString(),
        });
      }

      return res.status(200).json({
        success: true,
        message: "Message marked as seen!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message already seen!",
    });
  } catch (error) {
    console.error("Error marking message as seen:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const autoReplyQueues = new Map();
const activeAITyping = new Map();
const activeAIReplies = new Map();
const aiReplyVersions = new Map();

const getAIReplyKey = (senderId, receiverId) =>
  `${senderId.toString()}:${receiverId.toString()}`;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const emitAITyping = (senderId, receiverId, typingValue) => {
  const sender = senderId.toString();
  const receiver = receiverId.toString();
  const key = `${sender}:${receiver}`;

  if (typingValue) {
    activeAITyping.set(key, { sender, receiver });
  } else {
    activeAITyping.delete(key);
  }

  const socketId = userSocketMap[sender];

  if (socketId) {
    io.to(socketId).emit("isTyping", {
      receiverId: sender,
      senderId: receiver,
      typingValue,
    });
  }
};

export const stopAITypingForReceiver = (receiverId) => {
  const id = receiverId.toString();

  for (const queue of autoReplyQueues.values()) {
    queue.pending = queue.pending.filter(
      (job) => job.receiverId.toString() !== id,
    );
    queue.version++;
  }

  for (const [key, job] of activeAIReplies) {
    if (job.receiverId === id) {
      aiReplyVersions.set(key, (aiReplyVersions.get(key) || 0) + 1);
      emitAITyping(job.senderId, job.receiverId, false);
    }
  }
};

const stopAIReplyForManualMessage = (senderId, receiverId) => {
  const sender = senderId.toString();
  const receiver = receiverId.toString();

  const directions = [
    [sender, receiver],
    [receiver, sender],
  ];

  for (const [from, to] of directions) {
    const key = getAIReplyKey(from, to);
    aiReplyVersions.set(key, (aiReplyVersions.get(key) || 0) + 1);
  }

  const queueKey = [sender, receiver].sort().join(":");
  const queue = autoReplyQueues.get(queueKey);

  if (queue) {
    queue.pending = [];
    queue.version++;
  }

  for (const typing of [...activeAITyping.values()]) {
    if (
      (typing.sender === sender && typing.receiver === receiver) ||
      (typing.sender === receiver && typing.receiver === sender)
    ) {
      emitAITyping(typing.sender, typing.receiver, false);
    }
  }
};

const enqueueAutoReply = (
  senderId,
  receiverId,
  newMessage,
  aiReplyCount = 0,
) => {
  const key = [senderId.toString(), receiverId.toString()].sort().join(":");

  let queue = autoReplyQueues.get(key);

  if (!queue) {
    queue = { processing: false, pending: [], version: 0 };
    autoReplyQueues.set(key, queue);
  }

  queue.pending.push({
    senderId,
    receiverId,
    newMessage,
    aiReplyCount,
  });

  queue.version++;

  if (!queue.processing) {
    processAutoReplyQueue(key).catch((error) => {
      console.error("Auto-reply queue error:", error);
    });
  }
};

const processAutoReplyQueue = async (key) => {
  const queue = autoReplyQueues.get(key);

  if (!queue || queue.processing) return;

  queue.processing = true;

  try {
    while (queue.pending.length > 0) {
      while (queue.pending.length > 0) {
        const version = queue.version;
        await delay(2000);
        if (version === queue.version) break;
      }

      if (!queue.pending.length) break;

      const firstJob = queue.pending[0];
      const receiver = await User.findById(firstJob.receiverId).select(
        "aiAutoReply",
      );
      if (!queue.pending.includes(firstJob)) continue;

      if (!receiver?.aiAutoReply) {
        if (!queue.pending.includes(firstJob)) continue;
        const disabledSenderId = firstJob.senderId.toString();
        const disabledReceiverId = firstJob.receiverId.toString();
        const disabledCount = firstJob.aiReplyCount;

        queue.pending = queue.pending.filter(
          (job) =>
            job.senderId.toString() !== disabledSenderId ||
            job.receiverId.toString() !== disabledReceiverId ||
            job.aiReplyCount !== disabledCount,
        );

        continue;
      }

      const jobs = [];

      while (queue.pending.length > 0) {
        const nextJob = queue.pending[0];

        const sameDirection =
          nextJob.senderId.toString() === firstJob.senderId.toString() &&
          nextJob.receiverId.toString() === firstJob.receiverId.toString() &&
          nextJob.aiReplyCount === firstJob.aiReplyCount;

        if (!sameDirection) break;

        jobs.push(queue.pending.shift());
      }

      await processAutoReply(jobs);
    }
  } finally {
    queue.processing = false;

    if (queue.pending.length > 0) {
      processAutoReplyQueue(key).catch((error) => {
        console.error("Auto-reply queue error:", error);
      });
    } else if (autoReplyQueues.get(key) === queue) {
      autoReplyQueues.delete(key);
    }
  }
};

const processAutoReply = async (jobs) => {
  let replyKey;
  let activeJob;

  try {
    if (!jobs.length) return;

    const { senderId, receiverId, aiReplyCount } = jobs[0];

    replyKey = getAIReplyKey(senderId, receiverId);
    const replyVersion = aiReplyVersions.get(replyKey) || 0;

    activeJob = {
      senderId: senderId.toString(),
      receiverId: receiverId.toString(),
      replyVersion,
    };
    activeAIReplies.set(replyKey, activeJob);

    const receiver = await User.findById(receiverId).select("aiAutoReply");
    if (!receiver?.aiAutoReply) return;

    const messageIds = jobs.map((job) => job.newMessage._id);

    const latestMessage = jobs[jobs.length - 1].newMessage;

    const historyQuery = {
      $and: [
        {
          $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        },
        {
          $or: [
            { createdAt: { $lt: latestMessage.createdAt } },
            {
              createdAt: latestMessage.createdAt,
              _id: { $lte: latestMessage._id },
            },
          ],
        },
        { _id: { $nin: messageIds } },
      ],
    };

    const [textMessages, imageMessages] = await Promise.all([
      Message.find({
        ...historyQuery,
        text: { $nin: ["", null] },
      })
        .sort({ createdAt: -1, _id: -1 })
        .limit(5)
        .lean(),
      Message.find({
        ...historyQuery,
        image: { $nin: ["", null] },
      })
        .sort({ createdAt: -1, _id: -1 })
        .limit(1)
        .lean(),
    ]);

    const previousMessages = [
      ...new Map(
        [...textMessages, ...imageMessages].map((message) => [
          message._id.toString(),
          message,
        ]),
      ).values(),
    ].sort(
      (a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt) ||
        a._id.toString().localeCompare(b._id.toString()),
    );

    const history = await Promise.all(
      previousMessages.map(async (message) => {
        const parts = [];

        if (message.text?.trim()) {
          parts.push({ text: message.text });
        }

        if (message.image) {
          const imagePart = await getImagePart(message.image);
          if (imagePart) parts.push(imagePart);
        }

        if (!parts.length) return null;

        return {
          role:
            message.senderId.toString() === receiverId.toString()
              ? "model"
              : "user",
          parts,
        };
      }),
    );

    // Combine all incoming messages into one user turn.
    const currentParts = [];

    for (const job of jobs) {
      const message = job.newMessage;

      if (message.text?.trim()) {
        currentParts.push({ text: message.text.trim() });
      }

      if (message.image) {
        const imagePart = await getImagePart(message.image);
        if (imagePart) currentParts.push(imagePart);
      }
    }

    if (!currentParts.length) return;

    const contents = [
      ...history.filter(Boolean),
      { role: "user", parts: currentParts },
    ];

    const activeReceiverBeforeReply =
      await User.findById(receiverId).select("aiAutoReply");

    if (
      !activeReceiverBeforeReply?.aiAutoReply ||
      replyVersion !== (aiReplyVersions.get(replyKey) || 0)
    )
      return;

    emitAITyping(senderId, receiverId, true);

    let reply;

    try {
      reply = await generateAutoReplyText(contents);
    } finally {
      emitAITyping(senderId, receiverId, false);
    }

    if (replyVersion !== (aiReplyVersions.get(replyKey) || 0)) return;

    if (!reply?.trim()) return;

    // Check whether AI Auto-Reply is still enabled.
    const activeReceiver =
      await User.findById(receiverId).select("aiAutoReply");

    if (
      !activeReceiver?.aiAutoReply ||
      replyVersion !== (aiReplyVersions.get(replyKey) || 0)
    )
      return;

    if (replyVersion !== (aiReplyVersions.get(replyKey) || 0)) return;

    const aiMessage = await Message.create({
      senderId: receiverId,
      receiverId: senderId,
      text: reply.trim(),
      isAI: true,
    });

    if (replyVersion !== (aiReplyVersions.get(replyKey) || 0)) {
      await Message.deleteOne({ _id: aiMessage._id });
      return;
    }

    const senderSocketId = userSocketMap[senderId.toString()];
    const receiverSocketId = userSocketMap[receiverId.toString()];

    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", aiMessage);
    }

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", aiMessage);
    }

    // Maximum 5 AI replies in one AI-to-AI chain.
    const nextCount = aiReplyCount + 1;

    if (nextCount < 5) {
      const otherUser = await User.findById(senderId).select("aiAutoReply");

      if (otherUser?.aiAutoReply) {
        enqueueAutoReply(receiverId, senderId, aiMessage, nextCount);
      }
    }
  } catch (error) {
    console.error("AI Auto-Reply error:", error);
  } finally {
    if (replyKey && activeAIReplies.get(replyKey) === activeJob) {
      activeAIReplies.delete(replyKey);
    }
  }
};

// Send message to selected user

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    if (!text?.trim() && !image) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty!",
      });
    }

    let imageUrl;

    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "Projects/Ping/Chats",
      });
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    stopAIReplyForManualMessage(senderId, receiverId);

    const receiverSocketId = userSocketMap[receiverId.toString()];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    enqueueAutoReply(senderId, receiverId, newMessage);

    return res.status(200).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.error("Send message error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { receiverUserId } = req.body;
    const { messageId } = req.params;
    const senderUserId = req.user?._id;

    if (!receiverUserId || !messageId || !senderUserId) {
      return res.status(400).json({
        success: false,
        message: "Details are required!",
      });
    }

    const message = await Message.findOneAndDelete({
      _id: messageId,
      senderId: senderUserId,
      receiverId: receiverUserId,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or unauthorized to delete!",
      });
    }

    const receiverSocketId = userSocketMap[receiverUserId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", {
        messageId: message._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully!",
    });
  } catch (error) {
    console.error("Delete message error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
};
