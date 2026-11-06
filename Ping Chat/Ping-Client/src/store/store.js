import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { resetStore } from "./storeActions.js";
import {
  selectedUserSlice,
  videoCallSlice,
  audioCallSlice,
  infoUserSlice,
  groupSlice,
  selectedGroupSlice,
  infoGroupSlice,
  createGroupSlice,
  LoadingSlice,
  incomingSlice,
  callTypeSlice,
  callFromSlice,
  callToSlice,
  geminiMessagesSlice,
} from "./slice";
import { authUserSlice, onlineUserSlice, tokenSlice } from "./AuthSlice";
import {
  messagesSlice,
  messageCacheSlice,
  showEmojiPickerSlice,
  unseenMessagesSlice,
  usersSlice,
} from "./ChatSlice";

const appReducer = combineReducers({
  selectedUser: selectedUserSlice.reducer,
  group: groupSlice.reducer,
  selectedGroup: selectedGroupSlice.reducer,
  audioCall: audioCallSlice.reducer,
  videoCall: videoCallSlice.reducer,
  infoUser: infoUserSlice.reducer,
  infoGroup: infoGroupSlice.reducer,
  createGroup: createGroupSlice.reducer,
  loading: LoadingSlice.reducer,

  // Connect to Backend

  token: tokenSlice.reducer,
  authUser: authUserSlice.reducer,
  onlineUser: onlineUserSlice.reducer,

  // Chat

  backHelper: backHelperSlice.reducer,
  geminiMessages: geminiMessagesSlice.reducer,
  messages: messagesSlice.reducer,
  messageCache: messageCacheSlice.reducer,
  unseenMessages: unseenMessagesSlice.reducer,
  users: usersSlice.reducer,
  showEmojiPicker: showEmojiPickerSlice.reducer,

  // calls
  incoming: incomingSlice.reducer,
  callType: callTypeSlice.reducer,
  callFrom: callFromSlice.reducer,
  callTo: callToSlice.reducer,
});

const rootReducer = (state, action) => {
  if (action.type === resetStore.type) {
    state = undefined;
  }

  return appReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
});

export default store;
