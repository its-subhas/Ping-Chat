import { useEffect, useRef, useState } from "react";
import { assets } from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import EmojiPicker from "emoji-picker-react";
import {
  setaudioCall,
  setCallFrom,
  setCallTo,
  setcallType,
  setIncoming,
  setInfoUser,
  setSelectedUser,
  setvideoCall,
  addGeminiMessage,
  clearGeminiMessages,
} from "../store/slice";

import { setAuthUser } from "../store/AuthSlice";

import {
  deleteMessage,
  getMessages,
  sendMessage,
  useSubscribeToMessages,
  chatWithGemini,
  updateAIAutoReply,
} from "../lib/chat.js";
import {
  saveGeminiImage,
  getGeminiImage,
  fileToBase64,
  clearGeminiImages,
} from "../lib/geminiImages.js";
import { setMessages, setShowEmojiPicker } from "../store/ChatSlice.js";
import { toast } from "react-hot-toast";

import { getSocket } from "../lib/auth.js";

// Chat container component for displaying messages and chat controls.
function ChatContainer() {
  // Used to navigate between routes.
  const navigate = useNavigate();

  // Used to reference the end of the messages list for scrolling.
  const scrollEnd = useRef();

  // Gets the selected user from Redux.
  const selectedUser = useSelector((state) => state.selectedUser);
  const messages = useSelector((state) => state.messages);
  const authUser = useSelector((state) => state.authUser);
  const onlineUser = useSelector((state) => state.onlineUser);
  const showEmojiPicker = useSelector((state) => state.showEmojiPicker);
  const incoming = useSelector((state) => state.incoming);
  const users = useSelector((state) => state.users);

  // Stores the currently selected user for the info.
  const infoUser = useSelector((state) => state.infoUser);

  // Gets the audio call state from Redux.
  const audioCall = useSelector((state) => state.audioCall);

  // Gets the video call state from Redux.
  const videoCall = useSelector((state) => state.videoCall);

  const geminiMessages = useSelector((state) => state.geminiMessages);

  const [geminiLoading, setGeminiLoading] = useState(false);

  const isGemini = selectedUser?._id === "gemini_001";

  const hasMessages = isGemini
    ? geminiMessages.length > 0
    : messages.length > 0;

  // Used to indicate AI chat active or not.
  // const [aiChat, setAiChat] = useState(false);

  // Used to dispatch Redux actions.
  const dispatch = useDispatch();

  useSubscribeToMessages(selectedUser, dispatch, authUser);

  const [openMenu, setOpenMenu] = useState(null);

  const menuRef = useRef(null);

  const [input, setInput] = useState("");

  const [typing, setTyping] = useState(false);

  const socket = getSocket();

  const typingTimeout = useRef(null);

  const geminiBatchRef = useRef([]);
  const geminiActiveBatchRef = useRef([]);
  const geminiTimerRef = useRef(null);
  const geminiControllerRef = useRef(null);
  const geminiRequestIdRef = useRef(0);
  const geminiMessagesRef = useRef(geminiMessages);

  useEffect(() => {
    geminiMessagesRef.current = geminiMessages;
  }, [geminiMessages]);

  const cancelGeminiRequest = () => {
    geminiRequestIdRef.current++;
    geminiControllerRef.current?.abort();
    geminiControllerRef.current = null;
    setGeminiLoading(false);
  };

  const handleNewGeminiChat = () => {
    clearTimeout(geminiTimerRef.current);
    geminiTimerRef.current = null;

    cancelGeminiRequest();

    geminiBatchRef.current = [];
    geminiActiveBatchRef.current = [];
    geminiMessagesRef.current = [];

    geminiMessages.forEach((msg) => {
      if (msg.imageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(msg.imageUrl);
      }
    });

    clearGeminiImages();
    dispatch(clearGeminiMessages());

    setInput("");
    setOpenMenu(null);
    dispatch(setShowEmojiPicker(false));
  };

  const scheduleGeminiRequest = () => {
    clearTimeout(geminiTimerRef.current);

    geminiTimerRef.current = setTimeout(async () => {
      const batch = [...geminiBatchRef.current];

      if (!batch.length) return;

      geminiBatchRef.current = [];
      geminiActiveBatchRef.current = batch;

      const requestId = ++geminiRequestIdRef.current;
      const controller = new AbortController();

      geminiControllerRef.current = controller;

      const batchIds = new Set(batch.map((item) => item.id));

      const message = batch
        .map((item) => item.text?.trim())
        .filter(Boolean)
        .join("\n");

      let completed = false;

      try {
        const previousMessages = geminiMessagesRef.current.filter(
          (msg) => !batchIds.has(msg.id),
        );

        const textMessages = previousMessages
          .filter((msg) => msg.text?.trim())
          .slice(-5);

        const imageMessages = previousMessages
          .filter((msg) => msg.role === "user" && msg.imageId)
          .slice(-1);

        const historyIds = new Set(
          [...textMessages, ...imageMessages].map((msg) => msg.id),
        );

        const selectedHistory = previousMessages.filter((msg) =>
          historyIds.has(msg.id),
        );

        const history = await Promise.all(
          selectedHistory.map(async (msg) => {
            const parts = [];

            if (msg.text?.trim()) {
              parts.push({ text: msg.text });
            }

            if (msg.role === "user" && msg.imageId) {
              const file = getGeminiImage(msg.imageId);

              if (file) {
                try {
                  const data = await fileToBase64(file);

                  parts.push({
                    inlineData: {
                      mimeType:
                        file.type === "image/jpg" ? "image/jpeg" : file.type,
                      data,
                    },
                  });
                } catch {
                  // Continue without this previous image.
                }
              }
            }

            return {
              role: msg.role === "gemini" ? "model" : "user",
              parts,
            };
          }),
        ).then((history) => history.filter((msg) => msg.parts.length > 0));

        if (
          requestId !== geminiRequestIdRef.current ||
          controller.signal.aborted
        )
          return;
        const imageResults = await Promise.all(
          batch.map(async (item) => {
            try {
              return (
                item.image ||
                (item.imagePromise ? await item.imagePromise : null)
              );
            } catch {
              return null;
            }
          }),
        );

        if (
          requestId !== geminiRequestIdRef.current ||
          controller.signal.aborted
        )
          return;

        const images = imageResults.filter(Boolean);

        if (!message && images.length === 0) {
          completed = true;
          return;
        }

        setGeminiLoading(true);

        const response = await chatWithGemini(
          message,
          history,
          images,
          controller.signal,
        );

        if (
          requestId !== geminiRequestIdRef.current ||
          controller.signal.aborted
        )
          return;

        if (response?.success) {
          completed = true;

          if (response.reply) {
            dispatch(
              addGeminiMessage({
                id: crypto.randomUUID(),
                role: "gemini",
                text: response.reply,
                imageUrl: null,
                createdAt: new Date().toISOString(),
              }),
            );
          }
        }
      } finally {
        if (requestId === geminiRequestIdRef.current) {
          if (!completed && !controller.signal.aborted) {
            geminiBatchRef.current = [...batch, ...geminiBatchRef.current];
          }

          geminiControllerRef.current = null;
          geminiActiveBatchRef.current = [];
          setGeminiLoading(false);
        }
      }
    }, 1500);
  };

  const queueGeminiMessage = (message) => {
    if (geminiControllerRef.current) {
      geminiBatchRef.current = [
        ...geminiActiveBatchRef.current,
        ...geminiBatchRef.current,
      ];

      cancelGeminiRequest();
    }

    geminiBatchRef.current.push(message);
    scheduleGeminiRequest();
  };

  useEffect(() => {
    const requestIdRef = geminiRequestIdRef;
    const timerRef = geminiTimerRef;
    const controllerRef = geminiControllerRef;
    const batchRef = geminiBatchRef;
    const activeBatchRef = geminiActiveBatchRef;

    return () => {
      clearTimeout(timerRef.current);

      requestIdRef.current++;

      controllerRef.current?.abort();
      controllerRef.current = null;

      batchRef.current = [];
      activeBatchRef.current = [];
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (input.trim() === "") return;

    if (isGemini) {
      const message = input.trim();
      const messageId = crypto.randomUUID();

      dispatch(
        addGeminiMessage({
          id: messageId,
          role: "user",
          text: message,
          imageUrl: null,
          createdAt: new Date().toISOString(),
        }),
      );

      setInput("");

      queueGeminiMessage({
        id: messageId,
        text: message,
        image: null,
      });

      return;
    }

    const message = input.trim();
    setInput("");

    clearTimeout(typingTimeout.current);

    if (
      socket &&
      authUser?._id &&
      selectedUser?._id &&
      selectedUser?._id !== "gemini_001"
    ) {
      socket.emit("userStopTyping", {
        receiverId: selectedUser._id,
        senderId: authUser._id,
      });
    }

    setTyping(false);

    await sendMessage({ text: message }, selectedUser._id, dispatch);
  };

  const handleSendImage = async (e) => {
    e.preventDefault();

    const file = e.target.files[0];
    e.target.value = "";

    if (
      !file ||
      !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
        file.type,
      )
    ) {
      toast.error("Select a JPG, JPEG, PNG or WEBP image!");
      return;
    }

    if (isGemini) {
      const imageId = crypto.randomUUID();
      const imageUrl = URL.createObjectURL(file);
      const message = input.trim();

      saveGeminiImage(imageId, file);

      dispatch(
        addGeminiMessage({
          id: imageId,
          role: "user",
          text: message,
          imageUrl,
          imageId,
          createdAt: new Date().toISOString(),
        }),
      );

      setInput("");

      const imagePromise = fileToBase64(file)
        .then((data) => ({
          mimeType: file.type === "image/jpg" ? "image/jpeg" : file.type,
          data,
        }))
        .catch(() => {
          toast.error("Failed to process image!");
          return null;
        });

      queueGeminiMessage({
        id: imageId,
        text: message,
        image: null,
        imagePromise,
      });

      return;
    }

    const reader = new FileReader();

    reader.onloadend = async () => {
      await sendMessage({ image: reader.result }, selectedUser._id, dispatch);
    };

    reader.readAsDataURL(file);
  };

  const handleDeleteMessages = async (messageId) => {
    if (!messageId || !selectedUser?._id) return;

    await deleteMessage(messageId, selectedUser._id, dispatch);
  };

  const handleToggleAIAutoReply = async () => {
    const response = await updateAIAutoReply(!authUser?.aiAutoReply);

    if (response?.success) {
      dispatch(
        setAuthUser({
          ...authUser,
          aiAutoReply: response.aiAutoReply,
        }),
      );

      toast.success(
        response.aiAutoReply ? "Auto Reply Enabled !" : "Auto Reply Disabled !",
      );
    } else {
      toast.error("Failed to update AI Auto-Reply!");
    }
  };

  useEffect(() => {
    if (!selectedUser?._id || selectedUser._id === "gemini_001") {
      dispatch(setMessages([]));
      return;
    }

    getMessages(selectedUser._id, dispatch);
  }, [selectedUser?._id, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Automatically scrolls to the latest message when messages change.
  useEffect(() => {
    requestAnimationFrame(() => {
      scrollEnd.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [messages, geminiMessages, typing, geminiLoading]);

  useEffect(() => {
    dispatch(setShowEmojiPicker(false));
  }, [selectedUser?._id, dispatch]);

  useEffect(() => {
    if (
      !socket ||
      !authUser?._id ||
      !selectedUser?._id ||
      selectedUser?._id === "gemini_001"
    )
      return;

    const handleTyping = ({ receiverId, senderId, typingValue }) => {
      if (receiverId === authUser._id && senderId === selectedUser._id) {
        setTyping(typingValue);
      }
    };

    socket.on("isTyping", handleTyping);

    return () => {
      socket.off("isTyping", handleTyping);
      setTyping(false);
    };
  }, [selectedUser?._id, authUser?._id, socket]);

  useEffect(() => {
    if (!socket || !authUser?._id || audioCall || videoCall) return;

    const handleIncomingAudioCall = ({
      receiverId,
      senderId,
      type,
      incoming,
    }) => {
      if (receiverId === authUser._id && !audioCall && !videoCall) {
        const callFrom = users.find((user) => user._id === senderId);

        if (callFrom) {
          dispatch(setaudioCall(true));
          dispatch(setcallType(type));
          dispatch(setIncoming(incoming));
          dispatch(setCallFrom(callFrom));
        }
      }
    };

    const handleIncomingVideoCall = ({
      receiverId,
      senderId,
      type,
      incoming,
    }) => {
      if (receiverId === authUser._id && !audioCall && !videoCall) {
        const callFrom = users.find((user) => user._id === senderId);
        if (callFrom) {
          dispatch(setvideoCall(true));
          dispatch(setcallType(type));
          dispatch(setIncoming(incoming));
          dispatch(setCallFrom(callFrom));
        }
      }
    };

    socket.on("incomingAudioCall", handleIncomingAudioCall);
    socket.on("incomingVideoCall", handleIncomingVideoCall);

    return () => {
      socket.off("incomingAudioCall", handleIncomingAudioCall);
      socket.off("incomingVideoCall", handleIncomingVideoCall);
      // dispatch(setIncoming(false));
    };
  }, [authUser?._id, socket, dispatch, audioCall, videoCall, users]);

  useEffect(() => {
    if (incoming) {
      navigate("/calls");
    }
  }, [incoming, navigate]);

  return selectedUser ? (
    // Main chat container for the selected user.
    <div
      className={`h-full min-w-0 overflow-hidden relative backdrop-blur-lg ${
        infoUser ? "max-md:hidden" : ""
      }`}
    >
      {/* Chat header with user information and call controls. */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 py-3 px-3 sm:px-4 border-b border-stone-500">
        <div
          className="flex gap-2 items-center justify-center min-w-0 cursor-pointer"
          onClick={() => {
            if (window.matchMedia("(max-width: 767px)").matches) {
              dispatch(setInfoUser(true));
            }
          }}
        >
          <img
            src={selectedUser?.profilePic || assets.avtar}
            alt="profile"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shrink-0"
          />

          {/* Selected user's name and online status. */}
          <p className="flex-1 min-w-0 text-base sm:text-lg text-white flex items-center gap-2 truncate">
            <span className="truncate">{selectedUser?.fullName}</span>
            {(isGemini || onlineUser.includes(selectedUser?._id)) && (
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            )}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-5 shrink-0">
          {/* Audio and video call buttons. */}
          {selectedUser._id !== "gemini_001" && (
            <>
              <img
                onClick={() => {
                  if (!audioCall && !videoCall) {
                    dispatch(setaudioCall(true));
                    dispatch(setcallType("Audio"));
                    dispatch(setCallTo(selectedUser));

                    socket.emit("audioCallOffer", {
                      receiverId: selectedUser._id,
                      senderId: authUser._id,
                    });

                    navigate("/calls");
                  }

                  if (audioCall || videoCall) {
                    navigate("/calls");
                    return;
                  }
                }}
                src={assets.call}
                alt="call"
                className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer"
              />

              <img
                onClick={() => {
                  if (!audioCall && !videoCall) {
                    dispatch(setvideoCall(true));
                    dispatch(setcallType("Video"));
                    dispatch(setCallTo(selectedUser));

                    socket.emit("videoCallOffer", {
                      receiverId: selectedUser._id,
                      senderId: authUser._id,
                    });

                    navigate("/calls");
                  }

                  if (audioCall || videoCall) {
                    navigate("/calls");
                    return;
                  }
                }}
                src={assets.video}
                alt="video"
                className="w-6 h-6 sm:w-7 sm:h-7 cursor-pointer"
              />
            </>
          )}

          {/* Mobile back button. */}
          <img
            onClick={() => {
              dispatch(setSelectedUser(null));
              dispatch(setShowEmojiPicker(false));
            }}
            className="md:hidden w-5 h-5 cursor-pointer shrink-0"
            src={assets.arrow}
            alt="back"
          />

          {/* Desktop info button. */}
          <img
            onClick={() => dispatch(setInfoUser(!infoUser))}
            src={assets.info}
            alt="info"
            className="max-md:hidden w-6 h-6 sm:w-7 sm:h-7 cursor-pointer shrink-0"
          />
        </div>
      </div>

      {/* Messages section. */}

      {hasMessages ? (
        <div className="flex flex-col h-[calc(100%-116px)] overflow-y-auto px-2 sm:px-3 py-3 pb-6">
          {selectedUser._id !== "gemini_001"
            ? messages.map((msg, index) => {
                const isSent = msg.senderId === authUser._id;
                const messageId = msg._id || index;

                return (
                  <div
                    key={messageId}
                    className={`flex items-end gap-1.5 sm:gap-2 mb-3 sm:mb-4 ${
                      isSent ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isSent && (
                      <img
                        src={selectedUser?.profilePic || assets.avtar}
                        alt="profile"
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0"
                      />
                    )}

                    <div className="flex flex-col max-w-[75%] sm:max-w-[65%]">
                      <div
                        className={`flex items-center ${
                          isSent ? "justify-end" : ""
                        }`}
                      >
                        {/* Three dots + Delete menu */}
                        {isSent && (
                          <div
                            ref={openMenu === messageId ? menuRef : null}
                            className="flex items-center mr-1"
                          >
                            {openMenu === messageId && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleDeleteMessages(messageId);
                                  setOpenMenu(null);
                                }}
                                className="mr-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-red-400 hover:bg-gray-700 hover:text-red-300 transition text-xs whitespace-nowrap shadow-lg cursor-pointer"
                              >
                                Delete
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenu(
                                  openMenu === messageId ? null : messageId,
                                )
                              }
                              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white transition cursor-pointer"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-4 h-4"
                              >
                                <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                              </svg>
                            </button>
                          </div>
                        )}

                        {/* Message */}
                        {msg.image ? (
                          <img
                            src={msg.image}
                            alt="message"
                            onLoad={() => {
                              requestAnimationFrame(() => {
                                scrollEnd.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "end",
                                });
                              });
                            }}
                            className={`max-w-full w-auto max-h-64 rounded-lg border border-gray-700 object-cover transition-all duration-200 ${
                              openMenu === messageId
                                ? "max-[400px]:max-w-[85%] max-[400px]:max-h-48 max-[329px]:max-w-[70vw] max-[329px]:max-h-36 max-[280px]:max-w-[60vw] max-[280px]:max-h-28 max-[250px]:max-w-[50vw] max-[250px]:max-h-24 max-[235px]:max-w-[45vw] max-[235px]:max-h-20 max-[220px]:max-w-[40vw] max-[220px]:max-h-16 max-[202px]:max-w-[35vw] max-[202px]:max-h-14 max-[195px]:max-w-[30vw] max-[195px]:max-h-12 max-[185px]:max-w-[25vw] max-[185px]:max-h-10"
                                : ""
                            }`}
                          />
                        ) : (
                          <p
                            className={`min-w-0 p-2 sm:p-2.5 text-xs sm:text-sm font-light break-words [overflow-wrap:anywhere] bg-violet-500/30 text-white ${
                              isSent
                                ? "rounded-lg rounded-br-none"
                                : "rounded-lg rounded-bl-none"
                            }`}
                          >
                            {msg.text}
                          </p>
                        )}
                      </div>

                      {/* Message timestamp */}
                      <div
                        className={`flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs mt-1 ${
                          isSent ? "justify-end" : "justify-start"
                        }`}
                      >
                        {isSent && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 22 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`w-4 h-4 ${
                              msg.seen ? "text-green-400" : "text-gray-400"
                            }`}
                          >
                            <path d="m1 8 4 4L14 3" />
                            <path d="m8 8 4 4L21 3" />
                          </svg>
                        )}

                        <span>{formatMessageTime(msg.createdAt)}</span>
                      </div>
                    </div>

                    {/* Current user's avatar */}
                    {isSent && (
                      <img
                        src={authUser.profilePic || assets.avtar}
                        alt="profile"
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0"
                      />
                    )}
                  </div>
                );
              })
            : geminiMessages.map((msg) => {
                const isSent = msg.role === "user";

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-1.5 sm:gap-2 mb-3 sm:mb-4 ${
                      isSent ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isSent && (
                      <img
                        src={selectedUser?.profilePic || assets.avtar}
                        alt="profile"
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0"
                      />
                    )}

                    <div className="flex flex-col max-w-[75%] sm:max-w-[65%]">
                      <div className="flex items-center">
                        {msg.imageUrl ? (
                          <img
                            src={msg.imageUrl}
                            alt="message"
                            onLoad={() => {
                              requestAnimationFrame(() => {
                                scrollEnd.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "end",
                                });
                              });
                            }}
                            className="max-w-full w-auto max-h-64 rounded-lg border border-gray-700 object-cover"
                          />
                        ) : (
                          <p
                            className={`min-w-0 p-2 sm:p-2.5 text-xs sm:text-sm font-light break-words [overflow-wrap:anywhere] text-white ${
                              isSent
                                ? "bg-violet-500/30 rounded-lg rounded-br-none"
                                : "bg-[#282142] rounded-lg rounded-bl-none"
                            }`}
                          >
                            {msg.text}
                          </p>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs mt-1 ${
                          isSent ? "justify-end" : "justify-start"
                        }`}
                      >
                        {isSent && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 22 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={"w-4 h-4 text-green-400"}
                          >
                            <path d="m1 8 4 4L14 3" />
                            <path d="m8 8 4 4L21 3" />
                          </svg>
                        )}

                        <span>{formatMessageTime(msg.createdAt)}</span>
                      </div>
                    </div>

                    {isSent && (
                      <img
                        src={authUser?.profilePic || assets.avtar}
                        alt="profile"
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0"
                      />
                    )}
                  </div>
                );
              })}

          {typing && (
            <div className="flex items-end gap-2 mb-3 sm:mb-4 shrink-0">
              <img
                src={selectedUser?.profilePic || assets.avtar}
                alt="profile"
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
              <div className="flex items-center gap-1.5 rounded-xl rounded-bl-none bg-[#282142] px-4 py-3">
                <span className="text-xs text-gray-400 mr-1">Typing</span>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
              </div>
            </div>
          )}

          {isGemini && geminiLoading && (
            <div className="flex items-end gap-2 mb-3 shrink-0">
              <img
                src={selectedUser?.profilePic || assets.avtar}
                alt="Gemini"
                className="w-7 h-7 rounded-full object-cover"
              />

              <div className="flex items-center gap-1.5 rounded-xl rounded-bl-none bg-[#282142] px-4 py-3">
                <span className="text-xs text-gray-400 mr-1">Gemini</span>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.3s]" />
              </div>
            </div>
          )}

          <div ref={scrollEnd} className="shrink-0" />
        </div>
      ) : (
        <div className="flex flex-col h-[calc(100%-116px)] overflow-y-auto px-2 sm:px-3 py-3 pb-6">
          {!typing && (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Start Chat!
            </div>
          )}

          {typing && (
            <div className="flex items-end gap-2 mb-3 sm:mb-4 shrink-0">
              <img
                src={selectedUser?.profilePic || assets.avtar}
                alt="profile"
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
              <div className="flex items-center gap-1.5 rounded-xl rounded-bl-none bg-[#282142] px-4 py-3">
                <span className="text-xs text-gray-400 mr-1">Typing</span>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" />
              </div>
            </div>
          )}
          <div ref={scrollEnd} className="shrink-0" />
        </div>
      )}

      {/* Message input section. */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 sm:gap-3 p-2 sm:p-1">
        <div className="relative min-w-0 flex-1 flex items-center bg-gray-100/12 px-2 sm:px-3 rounded-full border border-gray-700/50">
          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-3 z-50 cursor-pointer">
              <EmojiPicker
                onEmojiClick={(emojiData) =>
                  setInput((prev) => prev + emojiData.emoji)
                }
                theme="dark"
                height={350}
                width={300}
              />
            </div>
          )}

          {/* Emoji button on the left */}
          <button
            type="button"
            onClick={() => {
              dispatch(setShowEmojiPicker(!showEmojiPicker));
            }}
            aria-label="Open emoji picker"
            className="shrink-0 p-1.5 sm:p-2 text-gray-400 hover:text-yellow-400 transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="w-5 h-5 sm:w-6 sm:h-6"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                strokeLinecap="round"
                d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"
              />
            </svg>
          </button>

          {/* Message text input. */}
          <input
            type="text"
            onChange={(e) => {
              setInput(e.target.value);

              const value = e.target.value;

              if (
                !socket ||
                !authUser?._id ||
                !selectedUser?._id ||
                selectedUser?._id === "gemini_001"
              )
                return;

              if (value.trim() === "") return;

              clearTimeout(typingTimeout.current);

              socket.emit("userTyping", {
                receiverId: selectedUser._id,
                senderId: authUser._id,
              });

              if (value.trim()) {
                typingTimeout.current = setTimeout(() => {
                  socket.emit("userStopTyping", {
                    receiverId: selectedUser._id,
                    senderId: authUser._id,
                  });
                }, 1500);
              } else {
                socket.emit("userStopTyping", {
                  receiverId: selectedUser._id,
                  senderId: authUser._id,
                });
              }
            }}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            placeholder="Send a message"
            className="min-w-0 flex-1 text-xs sm:text-sm p-2.5 sm:p-3 bg-transparent border-none outline-none text-white placeholder-gray-400"
          />

          {/* Reset assistant chat button. */}
          {selectedUser._id === "gemini_001" && (
            <button
              type="button"
              onClick={handleNewGeminiChat}
              title="reset"
              className="shrink-0 p-1.5 sm:p-2 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-gray-400 hover:text-green-400 transition-colors"
              >
                <path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
          )}

          {selectedUser._id !== "gemini_001" && (
            <button
              type="button"
              onClick={handleToggleAIAutoReply}
              title="Toggle AI Auto-Reply"
              className="shrink-0 p-1.5 sm:p-2 cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                className={`w-5 h-5 sm:w-6 sm:h-6 transition ${
                  authUser?.aiAutoReply ? "text-green-400" : "text-gray-400"
                }`}
                fill="currentColor"
              >
                <path d="M12 2C13.2 6.8 17.2 10.8 22 12C17.2 13.2 13.2 17.2 12 22C10.8 17.2 6.8 13.2 2 12C6.8 10.8 10.8 6.8 12 2Z" />
              </svg>
            </button>
          )}

          {/* Hidden image upload input. */}
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/jpeg, image/jpg, image/png, image/webp"
            hidden
          />

          {/* Image upload button. */}
          <label htmlFor="image" className="shrink-0">
            <img
              src={assets.sendImage}
              alt="image"
              className="w-5 h-5 mr-1 sm:mr-2 cursor-pointer"
            />
          </label>
        </div>

        {/* Send message button. */}
        <img
          src={assets.send}
          onClick={handleSendMessage}
          alt="send"
          className="w-8 h-8 sm:w-9 sm:h-9 p-2 cursor-pointer bg-green-500 rounded-full shrink-0"
        />
      </div>
    </div>
  ) : (
    // Empty state shown when no user is selected.
    <div className="h-full min-w-0 flex flex-col items-center justify-center gap-2 text-gray-500 px-4 text-center">
      <img src={assets.logo} alt="message" className="w-12 sm:w-16 h-auto" />

      <p className="text-base sm:text-lg font-medium text-white">Start Chat!</p>
    </div>
  );
}

export default ChatContainer;
