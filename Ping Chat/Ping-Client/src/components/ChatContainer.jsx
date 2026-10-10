import { useEffect, useRef, useState } from "react";
import { assets, chatGemini } from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setaudioCall,
  setInfoUser,
  setSelectedUser,
  setvideoCall,
} from "../store/slice";

import {
  getMessages,
  sendMessage,
  useSubscribeToMessages,
} from "../lib/chat.js";
import { setMessages } from "../store/ChatSlice.js";

import { toast } from "react-hot-toast";

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

  // Stores the currently selected user for the info.
  const infoUser = useSelector((state) => state.infoUser);

  // Gets the audio call state from Redux.
  const audioCall = useSelector((state) => state.audioCall);

  // Gets the video call state from Redux.
  const videoCall = useSelector((state) => state.videoCall);

  // Used to indicate AI chat active or not.
  const [aiChat, setAiChat] = useState(false);

  // Used to dispatch Redux actions.
  const dispatch = useDispatch();

  useSubscribeToMessages(selectedUser, dispatch);

  const [openMenu, setOpenMenu] = useState(null);

  const menuRef = useRef(null);

  const [input, setInput] = useState("");

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;
    await sendMessage({ text: input.trim() }, selectedUser._id, dispatch);
    setInput("");
  };

  const handleSendImage = async (e) => {
    e.preventDefault();

    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result }, selectedUser._id, dispatch);
    };

    reader.readAsDataURL(file);
    e.target.value = "";
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
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
            {onlineUser.includes(selectedUser?._id) && (
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
                  navigate("/calls");
                  !audioCall && !videoCall && dispatch(setaudioCall(true));
                }}
                src={assets.call}
                alt="call"
                className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer"
              />

              <img
                onClick={() => {
                  navigate("/calls");
                  !audioCall && !videoCall && dispatch(setvideoCall(true));
                }}
                src={assets.video}
                alt="video"
                className="w-6 h-6 sm:w-7 sm:h-7 cursor-pointer"
              />
            </>
          )}

          {/* Mobile back button. */}
          <img
            onClick={() => dispatch(setSelectedUser(null))}
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
                                console.log("Delete message:", messageId);
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
                          className="max-w-full w-auto max-h-64 rounded-lg border border-gray-700 object-cover"
                        />
                      ) : (
                        <p
                          className={`p-2 sm:p-2.5 text-xs sm:text-sm font-light break-words bg-violet-500/30 text-white ${
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
                    <p
                      className={`text-gray-500 text-[10px] sm:text-xs mt-1 ${
                        isSent ? "text-right" : "text-left"
                      }`}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </p>
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
          : chatGemini.map((msg, index) => {
              const isSent = msg.senderId === "user_002";
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
                                console.log(
                                  "Delete Gemini message:",
                                  messageId,
                                );
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
                          className="max-w-full w-auto max-h-64 rounded-lg border border-gray-700 object-cover"
                        />
                      ) : (
                        <p
                          className={`p-2 sm:p-2.5 text-xs sm:text-sm font-light break-words bg-violet-500/30 text-white ${
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
                    <p
                      className={`text-gray-500 text-[10px] sm:text-xs mt-1 ${
                        isSent ? "text-right" : "text-left"
                      }`}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>

                  {/* Current user's avatar */}
                  {isSent && (
                    <img
                      src={assets.avtar}
                      alt="profile"
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0"
                    />
                  )}
                </div>
              );
            })}

        <div ref={scrollEnd} />
      </div>

      {/* Message input section. */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 sm:gap-3 p-2 sm:p-1">
        <div className="min-w-0 flex-1 flex items-center bg-gray-100/12 px-2 sm:px-3 rounded-full border border-gray-700/50">
          {/* Message text input. */}
          <input
            type="text"
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === "Enter" ? handleSendMessage(e) : null)}
            placeholder="Send a message"
            className="min-w-0 flex-1 text-xs sm:text-sm p-2.5 sm:p-3 bg-transparent border-none outline-none text-white placeholder-gray-400"
          />

          {/* AI chatbot button. */}
          <button
            type="button"
            onClick={() => setAiChat(!aiChat)}
            className="shrink-0 p-1.5 sm:p-2 cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              className={`w-5 h-5 sm:w-6 sm:h-6 transition ${
                aiChat ? "text-green-400" : "text-gray-400"
              }`}
              fill="currentColor"
            >
              <path d="M12 2C13.2 6.8 17.2 10.8 22 12C17.2 13.2 13.2 17.2 12 22C10.8 17.2 6.8 13.2 2 12C6.8 10.8 10.8 6.8 12 2Z" />
            </svg>
          </button>

          {/* Hidden image upload input. */}
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
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
