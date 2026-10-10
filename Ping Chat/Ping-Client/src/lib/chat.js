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
} from "../store/ChatSlice.js";

export const getUsers = async (dispatch) => {
  try {
    const { data } = await axios.get("/api/messages/users");

    if (data.success) {
      dispatch(setUsers(data.users));
      dispatch(setUnseenMessages(data.unseenMessages));
    } else {
      toast.error(data.message || "Failed to load users");
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
      toast.error(data.message || "Failed to load messages");
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
      toast.error(data.message || "Failed to send message");
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
  }
};

export const useSubscribeToMessages = (selectedUser, dispatch) => {
  const selectedUserIdRef = useRef(selectedUser?._id);

  useEffect(() => {
    selectedUserIdRef.current = selectedUser?._id;
  }, [selectedUser?._id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = async (newMessage) => {
      const selectedUserId = selectedUserIdRef.current;

      if (selectedUserId === newMessage.senderId) {
        dispatch(addMessage(newMessage));

        try {
          await axios.put(`/api/messages/mark/${newMessage._id}`);
        } catch (error) {
          console.error("Failed to mark message as seen:", error);
        }
      } else {
        dispatch(incrementUnseenMessage(newMessage.senderId));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [dispatch]);
};
