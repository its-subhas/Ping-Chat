import { configureStore } from "@reduxjs/toolkit";
import {
  selectedUserSlice,
  groupSlice,
  videoCallSlice,
  audioCallSlice,
  selectedGroupSlice,
  infoUserSlice,
  infoGroupSlice,
  createGroupSlice,
} from "./slice";
import { authUserSlice, onlineUserSlice, tokenSlice } from "./AuthSlice";
import {
  chatSelectedUserSlice,
  messagesSlice,
  unseenMessagesSlice,
  usersSlice,
} from "./ChatSlice";

const store = configureStore({
  reducer: {
    selectedUser: selectedUserSlice.reducer,
    group: groupSlice.reducer,
    selectedGroup: selectedGroupSlice.reducer,
    audioCall: audioCallSlice.reducer,
    videoCall: videoCallSlice.reducer,
    infoUser: infoUserSlice.reducer,
    infoGroup: infoGroupSlice.reducer,
    createGroup: createGroupSlice.reducer,

    // Connect to Backend

    token: tokenSlice.reducer,
    authUser: authUserSlice.reducer,
    onlineUser: onlineUserSlice.reducer,

    // Chat

    messages: messagesSlice.reducer,
    unseenMessages: unseenMessagesSlice.reducer,
    users: usersSlice.reducer,
    chatSelectedUser: chatSelectedUserSlice.reducer,
  },
});

export default store;
