import { createSlice } from "@reduxjs/toolkit";

export const selectedUserSlice = createSlice({
  name: "selectedUser",
  initialState: null,
  reducers: {
    setSelectedUser: (state, action) => {
      return action.payload;
    },
  },
});

export const groupSlice = createSlice({
  name: "group",
  initialState: false,
  reducers: {
    setGroup: (state, action) => {
      return action.payload;
    },
  },
});

export const selectedGroupSlice = createSlice({
  name: "selectedGroup",
  initialState: false,
  reducers: {
    setSelectedGroup: (state, action) => {
      return action.payload;
    },
  },
});

export const audioCallSlice = createSlice({
  name: "audioCall",
  initialState: false,
  reducers: {
    setaudioCall: (state, action) => {
      return action.payload;
    },
  },
});

export const videoCallSlice = createSlice({
  name: "videoCall",
  initialState: false,
  reducers: {
    setvideoCall: (state, action) => {
      return action.payload;
    },
  },
});

export const infoUserSlice = createSlice({
  name: "infoUser",
  initialState: false,
  reducers: {
    setInfoUser: (state, action) => {
      return action.payload;
    },
  },
});

export const infoGroupSlice = createSlice({
  name: "infoGroup",
  initialState: false,
  reducers: {
    setInfoGroup: (state, action) => {
      return action.payload;
    },
  },
});

export const createGroupSlice = createSlice({
  name: "createGroup",
  initialState: false,
  reducers: {
    setCreateGroup: (state, action) => {
      return action.payload;
    },
  },
});

export const LoadingSlice = createSlice({
  name: "loading",
  initialState: false,
  reducers: {
    setLoginLoading: (state, action) => {
      return action.payload;
    },
    setLogoutLoading: (state, action) => {
      return action.payload;
    },
    setAuthLoading: (state, action) => {
      return action.payload;
    },
    setProfileLoading: (state, action) => {
      return action.payload;
    },
  },
});

export const incomingSlice = createSlice({
  name: "incoming",
  initialState: false,
  reducers: {
    setIncoming: (state, action) => {
      return action.payload;
    },
  },
});

export const callTypeSlice = createSlice({
  name: "callType",
  initialState: "",
  reducers: {
    setcallType: (state, action) => {
      return action.payload;
    },
  },
});

export const callFromSlice = createSlice({
  name: "callFrom",
  initialState: null,
  reducers: {
    setCallFrom: (state, action) => {
      return action.payload;
    },
  },
});

export const callToSlice = createSlice({
  name: "callTo",
  initialState: null,
  reducers: {
    setCallTo: (state, action) => {
      return action.payload;
    },
  },
});

export const geminiMessagesSlice = createSlice({
  name: "geminiMessages",
  initialState: [],
  reducers: {
    addGeminiMessage: (state, action) => {
      state.push(action.payload);
    },
    clearGeminiMessages: () => {
      return [];
    },
  },
});

export const { addGeminiMessage, clearGeminiMessages } =
  geminiMessagesSlice.actions;

export const { setCallTo } = callToSlice.actions;
export const { setCallFrom } = callFromSlice.actions;
export const { setcallType } = callTypeSlice.actions;
export const { setIncoming } = incomingSlice.actions;
export const { setProfileLoading } = LoadingSlice.actions;
export const { setAuthLoading } = LoadingSlice.actions;
export const { setLoginLoading } = LoadingSlice.actions;
export const { setLogoutLoading } = LoadingSlice.actions;
export const { setSelectedUser } = selectedUserSlice.actions;
export const { setGroup } = groupSlice.actions;
export const { setSelectedGroup } = selectedGroupSlice.actions;
export const { setaudioCall } = audioCallSlice.actions;
export const { setvideoCall } = videoCallSlice.actions;
export const { setInfoUser } = infoUserSlice.actions;
export const { setInfoGroup } = infoGroupSlice.actions;
export const { setCreateGroup } = createGroupSlice.actions;
