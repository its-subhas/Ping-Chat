import { useEffect, useRef, useState } from "react";
import { assets, groupMessages } from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setaudioCall,
  setInfoGroup,
  setSelectedGroup,
  setvideoCall,
} from "../store/slice";

function GroupChatContainer() {
  const navigate = useNavigate();

  const scrollEnd = useRef();

  const selectedGroup = useSelector((state) => state.selectedGroup);

  const infoGroup = useSelector((state) => state.infoGroup);

  const audioCall = useSelector((state) => state.audioCall);

  const videoCall = useSelector((state) => state.videoCall);

  const [aiChat, setAiChat] = useState(false);

  const dispatch = useDispatch();

  const [openMenu, setOpenMenu] = useState(null);

  const menuRef = useRef(null);

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

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  return selectedGroup ? (
    <div
      className={`h-full min-w-0 overflow-hidden relative backdrop-blur-lg ${
        infoGroup ? "max-md:hidden" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-4 py-3 px-3 sm:px-4 border-b border-stone-500">
        <div
          className="flex gap-2 items-center justify-center min-w-0 cursor-pointer"
          onClick={() => {
            if (window.matchMedia("(max-width: 767px)").matches) {
              dispatch(setInfoGroup(true));
            }
          }}
        >
          <img
            src={selectedGroup?.groupPic || assets.avtar}
            alt="profile"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shrink-0"
          />

          <p className="flex-1 min-w-0 text-base sm:text-lg text-white flex items-center gap-2 truncate">
            <span className="truncate">{selectedGroup?.groupName}</span>
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-5 shrink-0">
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

          <img
            onClick={() => dispatch(setSelectedGroup(null))}
            className="md:hidden w-5 h-5 cursor-pointer shrink-0"
            src={assets.arrow}
            alt="back"
          />

          <img
            onClick={() => dispatch(setInfoGroup(!infoGroup))}
            src={assets.info}
            alt="info"
            className="max-md:hidden w-6 h-6 sm:w-7 sm:h-7 cursor-pointer shrink-0"
          />
        </div>
      </div>

      <div className="flex flex-col h-[calc(100%-116px)] overflow-y-auto px-2 sm:px-3 py-3 pb-6">
        {groupMessages.map((msg, index) => {
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
                  src={msg.senderPic || assets.avtar}
                  alt={msg.senderName || "profile"}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0"
                />
              )}

              <div className="flex flex-col max-w-[75%] sm:max-w-[65%]">
                {!isSent && (
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-1">
                    {msg.senderName}
                  </p>
                )}

                <div
                  className={`flex items-center ${isSent ? "justify-end" : ""}`}
                >
                  {/* Three dots + Delete menu - LEFT side of sent message */}
                  {isSent && (
                    <div
                      ref={openMenu === messageId ? menuRef : null}
                      className="flex items-center mr-1"
                    >
                      {/* Delete menu */}
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

                      {/* Three dots */}
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu(openMenu === messageId ? null : messageId)
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

                {/* Message time */}
                <p
                  className={`text-gray-500 text-[10px] sm:text-xs mt-1 ${
                    isSent ? "text-right" : "text-left"
                  }`}
                >
                  {formatMessageTime(msg.createdAt)}
                </p>
              </div>

              {/* Sent user avatar */}
              {isSent && (
                <img
                  src={msg.senderPic || assets.avtar}
                  alt={msg.senderName || "profile"}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 sm:gap-3 p-2 sm:p-1">
        <div className="min-w-0 flex-1 flex items-center bg-gray-100/12 px-2 sm:px-3 rounded-full border border-gray-700/50">
          <input
            type="text"
            placeholder="Send a message"
            className="min-w-0 flex-1 text-xs sm:text-sm p-2.5 sm:p-3 bg-transparent border-none outline-none text-white placeholder-gray-400"
          />

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

          <input type="file" id="image" accept="image/png, image/jpeg" hidden />

          <label htmlFor="image" className="shrink-0">
            <img
              src={assets.sendImage}
              alt="image"
              className="w-5 h-5 mr-1 sm:mr-2 cursor-pointer"
            />
          </label>
        </div>

        <img
          src={assets.send}
          alt="send"
          className="w-8 h-8 sm:w-9 sm:h-9 p-2 cursor-pointer bg-green-500 rounded-full shrink-0"
        />
      </div>
    </div>
  ) : (
    <div className="h-full min-w-0 flex flex-col items-center justify-center gap-2 text-gray-500 px-4 text-center">
      <img src={assets.logo} alt="message" className="w-12 sm:w-16 h-auto" />

      <p className="text-base sm:text-lg font-medium text-white">Start Chat!</p>
    </div>
  );
}

export default GroupChatContainer;
