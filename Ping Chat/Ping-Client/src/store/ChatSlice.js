import { createSlice } from "@reduxjs/toolkit";

export const messagesSlice = createSlice({
  name: "messages",
  initialState: [],
  reducers: {
    setMessages: (state, action) => action.payload,
    addMessage: (state, action) => {
      state.push(action.payload);
    },
  },
});

export const usersSlice = createSlice({
  name: "users",
  initialState: [],
  reducers: {
    setUsers: (state, action) => action.payload,
  },
});

export const unseenMessagesSlice = createSlice({
  name: "unseenMessages",
  initialState: {},
  reducers: {
    setUnseenMessages: (state, action) => action.payload,
    incrementUnseenMessage: (state, action) => {
      const userId = action.payload;
      state[userId] = (state[userId] || 0) + 1;
    },
    clearUnseenMessage: (state, action) => {
      state[action.payload] = 0;
    },
  },
});

export const chatSelectedUserSlice = createSlice({
  name: "chatSelectedUser",
  initialState: null,
  reducers: {
    setChatSelectedUser: (state, action) => action.payload,
  },
});

export const { setMessages, addMessage } = messagesSlice.actions;
export const { setUsers } = usersSlice.actions;
export const { setUnseenMessages, incrementUnseenMessage, clearUnseenMessage } =
  unseenMessagesSlice.actions;
export const { setChatSelectedUser } = chatSelectedUserSlice.actions;
