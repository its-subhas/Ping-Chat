import { toast } from "react-hot-toast";
import axios from "../lib/axios.js";
import { getSocket } from "./auth.js";
import { useEffect, useRef } from "react";
import {
  setUsers,
  setMessages,
  addMessage,
  setUnseenMessages,
  incrementUnseenMessage,
  removeMessage,
  messageSeen,
} from "../store/ChatSlice.js";

export const getUsers = async (dispatch) => {
  try {
    const { data } = await axios.get("/api/messages/users");

    if (data.success) {
      dispatch(setUsers(data.users));
      dispatch(setUnseenMessages(data.unseenMessages));
    } else {
      toast.error(data.message || "Failed to load users!");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};

export const getMessages = async (userId, dispatch) => {
  try {
    const { data } = await axios.get(`/api/messages/${userId}`);

    if (data.success) {
      dispatch(setMessages(data.messages));
    } else {
      toast.error(data.message || "Failed to load messages!");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};

export const sendMessage = async (messageData, userId, dispatch) => {
  try {
    const { data } = await axios.post(
      `/api/messages/send/${userId}`,
      messageData,
    );

    if (data.success) {
      dispatch(addMessage(data.newMessage));
    } else {
      toast.error(data.message || "Failed to send message!");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};

export const deleteMessage = async (messageId, receiverUserId, dispatch) => {
  try {
    const { data } = await axios.delete(`/api/messages/delete/${messageId}`, {
      data: { receiverUserId },
    });

    if (data.success) {
      dispatch(removeMessage(messageId));
      toast.success("Message deleted successfully!");
    } else {
      toast.error(data.message || "Failed to delete message!");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};

export const useSubscribeToMessages = (selectedUser, dispatch, authUser) => {
  const selectedUserIdRef = useRef(selectedUser?._id);
  const authUserIdRef = useRef(authUser?._id);

  useEffect(() => {
    selectedUserIdRef.current = selectedUser?._id;
    authUserIdRef.current = authUser?._id;
  }, [selectedUser?._id, authUser?._id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = async (newMessage) => {
      const selectedUserId = selectedUserIdRef.current?.toString();
      const authUserId = authUserIdRef.current?.toString();

      const senderId = newMessage.senderId?.toString();
      const receiverId = newMessage.receiverId?.toString();

      if (selectedUserId === senderId || selectedUserId === receiverId) {
        dispatch(addMessage(newMessage));

        if (receiverId === authUserId) {
          try {
            await axios.put(`/api/messages/mark/${newMessage._id}`);
          } catch (error) {
            console.error("Failed to mark message as seen:", error);
          }
        }
      } else if (senderId !== authUserId) {
        dispatch(incrementUnseenMessage(senderId));
      }
    };

    const handleMessageDeleted = ({ messageId }) => {
      dispatch(removeMessage(messageId));
    };

    const handleMessageSeen = ({ messageId }) => {
      dispatch(messageSeen(messageId));
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messageSeen", handleMessageSeen);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messageSeen", handleMessageSeen);
    };
  }, [dispatch]);
};

export const chatWithGemini = async (
  message,
  history = [],
  images = [],
  signal,
) => {
  try {
    if (!message?.trim() && images.length === 0) {
      toast.error("Message or image is required!");
      return null;
    }

    const { data } = await axios.post(
      "/api/messages/gemini",
      {
        message,
        history,
        images,
      },
      { signal },
    );

    if (data.success) {
      return data;
    }

    toast.error(data.message || "Failed to generate response!");
    return null;
  } catch (error) {
    if (error.code === "ERR_CANCELED") return null;

    toast.error(
      error.response?.data?.message || "Failed to generate response!",
    );
    return null;
  }
};

export const updateAIAutoReply = async (aiAutoReply) => {
  try {
    const { data } = await axios.put("/api/auth/ai-auto-reply", {
      aiAutoReply,
    });
    return data;
  } catch (error) {
    console.log(error.response?.data?.message || error.message);
    return { success: false };
  }
};
