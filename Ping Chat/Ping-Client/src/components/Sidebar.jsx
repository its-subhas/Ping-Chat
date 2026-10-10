import { useNavigate } from "react-router-dom";
import { assets, Gemini } from "../assets/assets";
import { useDispatch, useSelector } from "react-redux";
import { setGroup, setSelectedUser } from "../store/slice";
import { useEffect, useRef, useState } from "react";
import { logout } from "../lib/auth.js";
import { getUsers } from "../lib/chat.js";

import { clearUnseenMessage } from "../store/ChatSlice.js";

// Sidebar component for navigation, user selection, calls, and group chat.
function Sidebar() {
  const authUser = useSelector((state) => state.authUser);
  const users = useSelector((state) => state.users);
  const unseenMessages = useSelector((state) => state.unseenMessages);
  const onlineUser = useSelector((state) => state.onlineUser);
  const selectedUser = useSelector((state) => state.selectedUser);
  const group = useSelector((state) => state.group);
  const audioCall = useSelector((state) => state.audioCall);
  const videoCall = useSelector((state) => state.videoCall);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showMenu, setShowMenu] = useState(false);
  const [input, setInput] = useState("");
  const menuRef = useRef(null);

  const returnToCall = () => {
    navigate("/calls");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    getUsers(dispatch);
  }, [dispatch]);

  const filteredUsers = Array.isArray(users)
    ? users.filter((user) =>
        user.fullName?.toLowerCase().includes(input.toLowerCase()),
      )
    : [];

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-3 sm:p-4 md:p-5 rounded-r-xl overflow-y-auto text-white ${
        selectedUser ? "max-md:hidden" : ""
      }`}
    >
      <div className="pb-4 sm:pb-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={assets.logo}
              alt="Ping logo"
              className="w-8 h-8 sm:w-9 sm:h-9 shrink-0"
            />

            <span className="text-xl sm:text-2xl font-bold tracking-wide">
              Ping
            </span>
          </div>

          <div
            onClick={returnToCall}
            className={`${
              audioCall || videoCall ? "flex" : "hidden"
            } items-center gap-1.5 cursor-pointer`}
          >
            <img
              src={audioCall ? assets.call : assets.video}
              alt="calls"
              className="w-5 h-5 sm:w-6 sm:h-6"
            />

            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          </div>

          <div ref={menuRef} className="relative py-2 shrink-0">
            <img
              onClick={() => setShowMenu(!showMenu)}
              src={authUser?.profilePic || assets.avtar}
              alt="menu"
              className="w-9 h-9 min-w-9 min-h-9 object-cover cursor-pointer rounded-full"
            />

            {showMenu && (
              <div className="absolute top-full right-0 z-20 w-32 sm:w-36 max-w-[calc(100vw-1.5rem)] p-4 sm:p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100">
                <p
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/profile");
                  }}
                  className="cursor-pointer text-xs sm:text-sm hover:text-violet-400 transition"
                >
                  Profile
                </p>

                <hr className="my-2 border-t border-gray-500" />

                <p
                  onClick={() => logout(dispatch)}
                  className="cursor-pointer text-xs sm:text-sm hover:text-red-400 transition"
                >
                  Logout
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 sm:mt-5 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-full bg-[#282142] border border-gray-600">
          <img
            src={assets.search}
            alt="search"
            className="w-4 h-4 opacity-70 shrink-0"
          />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search User"
            className="w-full min-w-0 bg-transparent outline-none border-none text-xs sm:text-sm text-white placeholder-gray-400"
          />
        </div>

        <div className="mt-4 sm:mt-5 flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-2xl bg-[#282142] border border-gray-600">
          <div
            onClick={() => {
              dispatch(setSelectedUser(Gemini));
              dispatch(setGroup(false));
            }}
            className="flex items-center gap-2 min-w-0 cursor-pointer"
          >
            <img
              src={assets.gemini}
              alt="Gemini"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
            />

            <p
              className={`${
                selectedUser ? "hidden" : "text-sm sm:text-base truncate"
              }`}
            >
              Gemini
            </p>
          </div>

          <div
            onClick={() => {
              if (!group) {
                dispatch(setSelectedUser(null));
                dispatch(setGroup(true));
              }
            }}
            className="flex items-center gap-2 min-w-0 cursor-pointer"
          >
            <img
              src={assets.group}
              alt="Group"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
            />

            <p
              className={`${
                selectedUser ? "hidden" : "text-sm sm:text-base truncate"
              }`}
            >
              Group
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {filteredUsers.map((user) => (
          <div
            onClick={() => {
              dispatch(setSelectedUser(user));
              dispatch(setGroup(false));
              dispatch(clearUnseenMessage(user._id));
            }}
            key={user._id}
            className={`relative flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 pl-3 sm:pl-4 rounded-md cursor-pointer transition ${
              selectedUser?._id === user._id
                ? "bg-[#0891B2]/50"
                : "hover:bg-white/5"
            }`}
          >
            <img
              src={user?.profilePic || assets.avtar}
              alt="profile picture"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
            />

            <div className="flex flex-col leading-5 min-w-0 pr-6">
              <p className="text-sm sm:text-base truncate">{user.fullName}</p>

              {Array.isArray(onlineUser) && onlineUser.includes(user._id) ? (
                <span className="text-green-400 text-[10px] sm:text-xs">
                  Online
                </span>
              ) : (
                <span className="text-neutral-400 text-[10px] sm:text-xs">
                  Offline
                </span>
              )}
            </div>

            {(unseenMessages?.[user._id] || 0) > 0 && (
              <p className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-3 text-[10px] sm:text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
                {unseenMessages[user._id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
