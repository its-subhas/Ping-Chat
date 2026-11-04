import { setAuthUser, setOnlineUser, setToken } from "../store/AuthSlice.js";
import axios from "./axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { resetStore } from "../store/storeActions.js";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

let socket = null;

export const initializeAuth = async (dispatch) => {
  try {
    const { data } = await axios.post("/api/auth/refresh");

    if (!data?.success || !data?.token) {
      clearAuthState(dispatch);
      return false;
    }

    dispatch(setToken(data.token));
    return await checkAuth(dispatch);
  } catch {
    clearAuthState(dispatch);
    return false;
  }
};

export const checkAuth = async (dispatch) => {
  try {
    const { data } = await axios.get("/api/auth/check");

    if (!data?.success || !data?.user) {
      clearAuthState(dispatch);
      return false;
    }

    dispatch(setAuthUser(data.user));
    connectSocket(data.user, dispatch);
    return true;
  } catch {
    clearAuthState(dispatch);
    return false;
  }
};

export const googleLogin = () => {
  window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
};

export const login = async (state, credentials, dispatch) => {
  try {
    const { data } = await axios.post(`/api/auth/${state}`, credentials);

    if (data?.success && data?.token) {
      dispatch(setToken(data.token));
      dispatch(setAuthUser(data.userData));
      connectSocket(data.userData, dispatch);
      toast.success(data.message);
      return true;
    } else {
      toast.error(data?.message);
      return false;
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Authentication failed!");
    return false;
  }
};

export const logout = async (dispatch) => {
  try {
    const { data } = await axios.post("/api/auth/logout");

    if (data?.success && data?.message) {
      toast.success(data.message);
      clearAuthState(dispatch);
      return true;
    } else {
      toast.error(data?.message);
      clearAuthState(dispatch);
      return false;
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Something went wrong!");
    clearAuthState(dispatch);
    return false;
  }
};

const clearAuthState = (dispatch) => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  dispatch(resetStore());
};

export const updateProfile = async (body, dispatch) => {
  try {
    const { data } = await axios.put("/api/auth/update-profile", body);

    if (data?.success && data?.user) {
      dispatch(setAuthUser(data.user));
      toast.success(data.message || "Profile updated successfully!");
      return true;
    } else {
      toast.error(data?.message);
      return false;
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "Profile update failed!");
    return false;
  }
};

export const connectSocket = (userData, dispatch) => {
  if (!userData?._id || !backendUrl) return false;

  if (socket && socket.io.opts.query?.userId === userData._id) {
    if (!socket.connected) socket.connect();
    return true;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  dispatch(setOnlineUser([]));

  socket = io(backendUrl, {
    query: {
      userId: userData._id,
    },
  });

  socket.on("getOnlineUsers", (userIds) => {
    dispatch(setOnlineUser(userIds));
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection failed:", error.message);
  });

  return true;
};

export const getSocket = () => socket;
