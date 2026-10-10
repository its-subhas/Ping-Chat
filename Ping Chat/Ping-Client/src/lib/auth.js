import { setAuthUser, setOnlineUser, setToken } from "../store/AuthSlice.js";
import axios from "./axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

let socket = null;

export const checkAuth = async (dispatch) => {
  try {
    const { data } = await axios.get("/api/auth/check");

    if (data.success) {
      dispatch(setAuthUser(data.user));
      connectSocket(data.user, dispatch);
    } else {
      logout(dispatch);
    }
  } catch (error) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }

    localStorage.removeItem("token");
    dispatch(setToken(null));
    dispatch(setAuthUser(null));
    dispatch(setOnlineUser([]));

    toast.error(error.response?.data?.message || "Authentication failed!");
  }
};

export const login = async (state, credentials, dispatch) => {
  try {
    const { data } = await axios.post(`/api/auth/${state}`, credentials);

    if (data.success) {
      localStorage.setItem("token", data.token);

      dispatch(setToken(data.token));
      dispatch(setAuthUser(data.userData));

      connectSocket(data.userData, dispatch);

      toast.success(data.message);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Authentication failed!");
  }
};

export const logout = (dispatch) => {
  try {
    if (socket) {
      socket.disconnect();
      socket = null;
    }

    localStorage.removeItem("token");

    dispatch(setToken(null));
    dispatch(setAuthUser(null));
    dispatch(setOnlineUser([]));

    toast.success("Logged out successfully!");
  } catch (error) {
    toast.error(error.message || "Something went wrong!");
  }
};

export const updateProfile = async (body, dispatch) => {
  try {
    const { data } = await axios.put("/api/auth/update-profile", body);

    if (data.success) {
      dispatch(setAuthUser(data.user));
      toast.success(data.message || "Profile updated successfully!");
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Profile update failed!");
  }
};

export const connectSocket = (userData, dispatch) => {
  if (!userData?._id) return;

  if (socket?.connected) return;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(backendUrl, {
    query: {
      userId: userData._id,
    },
  });

  socket.on("getOnlineUsers", (userIds) => {
    dispatch(setOnlineUser(userIds));
  });
};

export const getSocket = () => socket;
