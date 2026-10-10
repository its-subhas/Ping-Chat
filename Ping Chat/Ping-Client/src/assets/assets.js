import background from "./background.jpg";
import favicon from "./favicon.svg";
import menu from "./menu.svg";
import search from "./search.svg";
import user from "./user.svg";
import info from "./info.svg";
import addImage from "./addImage.svg";
import send from "./send.svg";
import arrow from "./arrow.svg";
import call from "./call.svg";
import video from "./video.svg";
import group from "./group.svg";
import groupLogo from "./groupLogo.svg";
import gemini from "./gemini.svg";
import add from "./add.svg";

export const assets = {
  bg: background,
  logo: favicon,
  menu: menu,
  search: search,
  avtar: user,
  info: info,
  arrow: arrow,
  sendImage: addImage,
  send: send,
  call: call,
  video: video,
  group: group,
  groupLogo: groupLogo,
  gemini: gemini,
  add: add,
};

export const Gemini = {
  _id: "gemini_001",
  fullName: "Gemini",
  profilePic: assets.gemini,
  bio: "Your AI assistant",
};

export const chatGemini = [
  {
    senderId: "gemini_001",
    text: "Hey! How are you doing?",
    image: "",
    createdAt: new Date(),
  },
  {
    senderId: "user_002",
    text: "I'm doing great! What about you?",
    image: "",
    createdAt: "2026-09-13T10:32:00",
  },
  {
    senderId: "gemini_001",
    text: "Hello! How can I help you today?",
    image: "https://picsum.photos/300/200",
    createdAt: new Date(),
  },
  {
    senderId: "user_002",
    text: "Nice picture! 😄",
    image: "",
    createdAt: "2026-09-13T10:32:00",
  },
];

export const users = [
  {
    _id: "user_001",
    fullName: "Aarav Sharma",
    profilePic: "https://i.pravatar.cc/150?img=12",
    bio: "User Bio !",
  },
  {
    _id: "user_002",
    fullName: "Priya Singh",
    profilePic: "https://i.pravatar.cc/150?img=47",
    bio: "User Bio !",
  },
  {
    _id: "user_003",
    fullName: "Rahul Verma",
    profilePic: "https://i.pravatar.cc/150?img=33",
    bio: "User Bio !",
  },
  {
    _id: "user_004",
    fullName: "Ananya Gupta",
    profilePic: "https://i.pravatar.cc/150?img=44",
    bio: "User Bio !",
  },
  {
    _id: "user_005",
    fullName: "Rohan Mehta",
    profilePic: "https://i.pravatar.cc/150?img=11",
    bio: "User Bio !",
  },
  {
    _id: "user_006",
    fullName: "Sneha Kapoor",
    profilePic: "https://i.pravatar.cc/150?img=49",
    bio: "User Bio !",
  },
  {
    _id: "user_007",
    fullName: "Aditya Joshi",
    profilePic: "https://i.pravatar.cc/150?img=15",
    bio: "User Bio !",
  },
  {
    _id: "user_008",
    fullName: "Neha Agarwal",
    profilePic: "https://i.pravatar.cc/150?img=32",
    bio: "User Bio !",
  },
];
export const groups = [
  {
    _id: "group_001",
    groupName: "Web Development",
    groupPic:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&h=150&fit=crop",
    description: "Discuss web development, projects and coding.",
    createdBy: "user_001",
    members: ["user_001", "user_002", "user_003", "user_004"],
  },
  {
    _id: "group_002",
    groupName: "React Developers",
    groupPic:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=150&h=150&fit=crop",
    description: "React, JavaScript and frontend development.",
    createdBy: "user_003",
    members: ["user_001", "user_003", "user_005", "user_006"],
  },
  {
    _id: "group_003",
    groupName: "College Friends",
    groupPic:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&h=150&fit=crop",
    description: "Friends, college updates and fun discussions.",
    createdBy: "user_002",
    members: ["user_001", "user_002", "user_004", "user_006", "user_008"],
  },
  {
    _id: "group_004",
    groupName: "Project Team",
    groupPic:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=150&h=150&fit=crop",
    description: "Project discussion and team updates.",
    createdBy: "user_001",
    members: ["user_001", "user_003", "user_005", "user_007"],
  },
  {
    _id: "group_005",
    groupName: "Friends Zone",
    groupPic:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=150&h=150&fit=crop",
    description: "Friends and casual conversations.",
    createdBy: "user_005",
    members: ["user_002", "user_004", "user_005", "user_006", "user_008"],
  },
];

export const messages = [
  {
    senderId: "user_001",
    text: "Hey! How are you doing?",
    image: "",
    createdAt: "2026-09-13T10:30:00",
  },
  {
    senderId: "user_002",
    text: "I'm doing great! What about you?",
    image: "",
    createdAt: "2026-09-13T10:32:00",
  },
  {
    senderId: "user_001",
    text: "I'm good too. Are you free this evening?",
    image: "",
    createdAt: "2026-09-13T10:35:00",
  },
  {
    senderId: "user_002",
    text: "Yes, I'm free. Let's catch up!",
    image: "",
    createdAt: "2026-09-13T10:37:00",
  },
  {
    senderId: "user_001",
    text: "",
    image: "https://picsum.photos/300/200",
    createdAt: "2026-09-13T10:40:00",
  },
  {
    senderId: "user_002",
    text: "Nice picture! 😄",
    image: "",
    createdAt: "2026-09-13T10:42:00",
  },
];

export const groupMessages = [
  {
    _id: "group_msg_001",
    groupId: "group_001",
    senderId: "user_001",
    senderName: "Aarav Sharma",
    senderPic: "https://i.pravatar.cc/150?img=12",
    text: "Hey everyone! Welcome to the group 👋",
    image: null,
    createdAt: "2026-09-28T09:30:00",
  },
  {
    _id: "group_msg_002",
    groupId: "group_001",
    senderId: "user_002",
    senderName: "Priya Singh",
    senderPic: "https://i.pravatar.cc/150?img=47",
    text: "Hello everyone! Glad to be here 😊",
    image: null,
    createdAt: "2026-09-28T09:32:00",
  },
  {
    _id: "group_msg_003",
    groupId: "group_001",
    senderId: "user_003",
    senderName: "Rahul Verma",
    senderPic: "https://i.pravatar.cc/150?img=33",
    text: "Are we still meeting today?",
    image: null,
    createdAt: "2026-09-28T09:35:00",
  },
  {
    _id: "group_msg_004",
    groupId: "group_001",
    senderId: "user_004",
    senderName: "Neha Gupta",
    senderPic: "https://i.pravatar.cc/150?img=44",
    text: "Yes, let's meet at 6 PM.",
    image: null,
    createdAt: "2026-09-28T09:38:00",
  },
  {
    _id: "group_msg_005",
    groupId: "group_001",
    senderId: "user_002",
    senderName: "Priya Singh",
    senderPic: "https://i.pravatar.cc/150?img=47",
    text: "I'll bring the notes from our last discussion.",
    image: null,
    createdAt: "2026-09-28T09:40:00",
  },
  {
    _id: "group_msg_006",
    groupId: "group_001",
    senderId: "user_001",
    senderName: "Aarav Sharma",
    senderPic: "https://i.pravatar.cc/150?img=12",
    text: "Perfect 👍",
    image: null,
    createdAt: "2026-09-28T09:42:00",
  },
  {
    _id: "group_msg_007",
    groupId: "group_001",
    senderId: "user_003",
    senderName: "Rahul Verma",
    senderPic: "https://i.pravatar.cc/150?img=33",
    text: "Here is the design we discussed.",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=600",
    createdAt: "2026-09-28T09:45:00",
  },
  {
    _id: "group_msg_008",
    groupId: "group_001",
    senderId: "user_002",
    senderName: "Priya Singh",
    senderPic: "https://i.pravatar.cc/150?img=47",
    text: "This looks really good!",
    image: null,
    createdAt: "2026-09-28T09:48:00",
  },
  {
    _id: "group_msg_009",
    groupId: "group_001",
    senderId: "user_004",
    senderName: "Neha Gupta",
    senderPic: "https://i.pravatar.cc/150?img=44",
    text: "Should we make the header a little smaller?",
    image: null,
    createdAt: "2026-09-28T09:51:00",
  },
  {
    _id: "group_msg_010",
    groupId: "group_001",
    senderId: "user_001",
    senderName: "Aarav Sharma",
    senderPic: "https://i.pravatar.cc/150?img=12",
    text: "Yes, I think that would make it cleaner.",
    image: null,
    createdAt: "2026-09-28T09:54:00",
  },
  {
    _id: "group_msg_011",
    groupId: "group_001",
    senderId: "user_003",
    senderName: "Rahul Verma",
    senderPic: "https://i.pravatar.cc/150?img=33",
    text: "Done. I'll update it now.",
    image: null,
    createdAt: "2026-09-28T09:56:00",
  },
  {
    _id: "group_msg_012",
    groupId: "group_001",
    senderId: "user_002",
    senderName: "Priya Singh",
    senderPic: "https://i.pravatar.cc/150?img=47",
    text: "Great! 🚀",
    image: null,
    createdAt: "2026-09-28T10:00:00",
  },
];

export const media = [
  { url: "https://picsum.photos/300/200" },
  { url: "https://picsum.photos/300/200" },
  { url: "https://picsum.photos/300/200" },
  { url: "https://picsum.photos/300/200" },
  { url: "https://picsum.photos/300/200" },
  { url: "https://picsum.photos/300/200" },
  { url: "https://picsum.photos/300/200" },
  { url: "https://picsum.photos/300/200" },
  { url: "https://picsum.photos/300/200" },
  { url: "https://picsum.photos/300/200" },
  { url: "https://picsum.photos/300/200" },
];
