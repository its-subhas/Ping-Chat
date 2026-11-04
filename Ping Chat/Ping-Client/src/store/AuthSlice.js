import { createSlice } from "@reduxjs/toolkit";

export const tokenSlice = createSlice({
  name: "token",
  initialState: localStorage.getItem("token"),
  reducers: {
    setToken: (state, action) => {
      return action.payload;
    },
  },
});

export const authUserSlice = createSlice({
  name: "authUser",
  initialState: null,
  reducers: {
    setAuthUser: (state, action) => {
      return action.payload;
    },
  },
});

export const onlineUserSlice = createSlice({
  name: "onlineUser",
  initialState: [],
  reducers: {
    setOnlineUser: (state, action) => {
      return action.payload;
    },
  },
});

export const { setToken } = tokenSlice.actions;
export const { setAuthUser } = authUserSlice.actions;
export const { setOnlineUser } = onlineUserSlice.actions;
