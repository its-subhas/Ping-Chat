import { createSlice } from "@reduxjs/toolkit";

export const messagesSlice = createSlice({
  name: "messages",
  initialState: [],
  reducers: {
    setMessages: (state, action) => action.payload,
    addMessage: (state, action) => {
      state.push(action.payload);

      state.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    },
    removeMessage: (state, action) => {
      return state.filter((message) => message._id !== action.payload);
    },
    messageSeen: (state, action) => {
      return state.map((message) =>
        message._id === action.payload ? { ...message, seen: true } : message,
      );
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

export const showEmojiPickerSlice = createSlice({
  name: "showEmojiPicker",
  initialState: false,
  reducers: {
    setShowEmojiPicker: (state, action) => action.payload,
  },
});

export const { setMessages, addMessage, removeMessage, messageSeen } =
  messagesSlice.actions;
export const { setUsers } = usersSlice.actions;
export const { setUnseenMessages, incrementUnseenMessage, clearUnseenMessage } =
  unseenMessagesSlice.actions;
export const { setShowEmojiPicker } = showEmojiPickerSlice.actions;
