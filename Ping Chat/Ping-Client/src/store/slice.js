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

export const { setSelectedUser } = selectedUserSlice.actions;
export const { setGroup } = groupSlice.actions;
export const { setSelectedGroup } = selectedGroupSlice.actions;
export const { setaudioCall } = audioCallSlice.actions;
export const { setvideoCall } = videoCallSlice.actions;
export const { setInfoUser } = infoUserSlice.actions;
export const { setInfoGroup } = infoGroupSlice.actions;
export const { setCreateGroup } = createGroupSlice.actions;
