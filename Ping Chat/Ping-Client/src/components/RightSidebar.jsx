
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { assets } from "../assets/assets";
import { setInfoUser, setSelectedUser } from "../store/slice";
import { setShowEmojiPicker, setBackHelper } from "../store/ChatSlice";

function RightSidebar() {
  const selectedUser = useSelector((state) => state.selectedUser);
  const messages = useSelector((state) => state.messages);
  const geminiMessages = useSelector((state) => state.geminiMessages);
  const onlineUser = useSelector((state) => state.onlineUser);
  const dispatch = useDispatch();

  const isGemini = selectedUser?._id === "gemini_001";

  const msgImages = useMemo(
    () =>
      isGemini
        ? geminiMessages
            .filter((msg) => msg.role === "user" && msg.imageUrl)
            .map((msg) => msg.imageUrl)
        : messages.filter((msg) => msg.image).map((msg) => msg.image),
    [isGemini, geminiMessages, messages],
  );

  if (!selectedUser) return null;

  return (
    <div className="bg-[#8185B2]/10 text-white w-full h-full min-w-0 flex flex-col overflow-hidden">
      <div className="h-12 sm:h-14 flex items-center justify-end px-3 sm:px-4 md:hidden shrink-0">
        <img
          data-mobile-back
          dispatch(setBackHelper(false));
          onClick={() => window.history.back()}
          src={assets.arrow}
          alt="back"
          className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer"
        />
      </div>

      <div className="shrink-0 pt-6 sm:pt-10 md:pt-12 lg:pt-16 px-3 sm:px-4 md:px-5 flex flex-col items-center text-xs font-light">
        <img
          src={selectedUser.profilePic || assets.avtar}
          alt="profile"
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shrink-0"
        />

        <h1 className="w-full max-w-full mt-3 px-2 sm:px-3 text-lg sm:text-xl font-medium flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
          {(selectedUser._id === "gemini_001" ||
            (Array.isArray(onlineUser) &&
              onlineUser.includes(selectedUser._id))) && (
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          )}

          <span className="min-w-0 break-words [overflow-wrap:anywhere]">
            {selectedUser.fullName}
          </span>

          {(selectedUser.verified || selectedUser._id === "gemini_001") && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="-1 0.235 24 24"
              fill="currentColor"
              className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400 shrink-0"
              aria-label="Verified"
              role="img"
            >
              <path
                fillRule="evenodd"
                d="M9.401 3.003c.807-1.026 2.391-1.026 3.198 0l.854 1.086 1.376-.201c1.3-.19 2.486.759 2.613 2.066l.135 1.384 1.274.558c1.203.527 1.673 1.97 1.037 3.12l-.674 1.219.674 1.219c.636 1.15.166 2.593-1.037 3.12l-1.274.558-.135 1.384c-.127 1.307-1.313 2.256-2.613 2.066l-1.376-.201-.854 1.086c-.807 1.026-2.391 1.026-3.198 0l-.854-1.086-1.376.201c-1.3.19-2.486-.759-2.613-2.066l-.135-1.384-1.274-.558c-1.203-.527-1.673-1.97-1.037-3.12l.674-1.219-.674-1.219c-.636-1.15-.166-2.593 1.037-3.12l1.274-.558.135-1.384c.127-1.307 1.313-2.256 2.613-2.066l1.376.201.854-1.086Zm4.793 7.873a.75.75 0 0 0-1.116-1.002l-2.81 3.13-1.374-1.374a.75.75 0 1 0-1.06 1.06l1.934 1.935a.75.75 0 0 0 1.088-.029l3.338-3.72Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </h1>

        {selectedUser.verified && (
          <p className="mt-1 px-2 text-xs sm:text-sm text-gray-400 text-center break-all">
            {selectedUser.email}
          </p>
        )}

        <p className="w-full max-w-xs mt-2 px-2 text-center text-xs sm:text-sm text-gray-300 break-words leading-relaxed">
          {selectedUser.bio}
        </p>
      </div>

      <hr className="border-[#ffffff50] my-4 sm:my-5 shrink-0" />

      <div className="flex-1 min-h-0 px-3 sm:px-4 md:px-5 pb-4 flex flex-col overflow-hidden">
        <p className="text-sm sm:text-base shrink-0">Media</p>

        {msgImages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            No Images!
          </div>
        )}

        {msgImages.length > 0 && (
          <div className="mt-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 opacity-80">
              {msgImages.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  onClick={() =>
                    window.open(url, "_blank", "noopener,noreferrer")
                  }
                  className="w-full aspect-square min-w-0 cursor-pointer rounded-md overflow-hidden"
                >
                  <img
                    src={url}
                    alt="media"
                    className="w-full h-full object-cover rounded-md hover:opacity-80 transition"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 px-3 sm:px-4 md:px-5 py-3 sm:py-4 bg-[#282142]/30">
        <button
          onClick={() => {
            dispatch(setSelectedUser(null));
            dispatch(setInfoUser(false));
            dispatch(setShowEmojiPicker(false));
          }}
          className="w-full bg-gradient-to-r from-purple-400 to-violet-600 text-white text-sm font-light py-2.5 sm:py-3 px-6 rounded-full cursor-pointer hover:opacity-90 transition"
        >
          Close Chat
        </button>
      </div>
    </div>
  );
}

export default RightSidebar;
