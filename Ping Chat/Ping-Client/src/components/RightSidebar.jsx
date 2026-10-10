import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { assets } from "../assets/assets";
import { setInfoUser, setSelectedUser } from "../store/slice";

// Right sidebar component that displays the selected user's profile and media.
function RightSidebar() {
  const selectedUser = useSelector((state) => state.selectedUser);
  const messages = useSelector((state) => state.messages);
  const onlineUser = useSelector((state) => state.onlineUser);
  const dispatch = useDispatch();

  const msgImages = useMemo(
    () => messages.filter((msg) => msg.image).map((msg) => msg.image),
    [messages],
  );

  if (!selectedUser) return null;

  return (
    <div className="bg-[#8185B2]/10 text-white w-full h-full min-w-0 flex flex-col overflow-hidden">
      {/* Back button */}
      <div className="h-12 sm:h-14 flex items-center justify-end px-3 sm:px-4 md:hidden shrink-0">
        <img
          onClick={() => dispatch(setInfoUser(false))}
          src={assets.arrow}
          alt="back"
          className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer"
        />
      </div>

      {/* Selected user's profile information */}
      <div className="shrink-0 pt-6 sm:pt-10 md:pt-12 lg:pt-16 px-3 sm:px-4 md:px-5 flex flex-col items-center text-xs font-light">
        <img
          src={selectedUser.profilePic || assets.avtar}
          alt="profile"
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shrink-0"
        />

        {/* User name and online status */}
        <h1 className="w-full max-w-full px-2 sm:px-5 mt-3 text-lg sm:text-xl font-medium flex items-center justify-center gap-2 text-center">
          {Array.isArray(onlineUser) &&
            onlineUser.includes(selectedUser._id) && (
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            )}
          <span className="min-w-0 break-words">{selectedUser.fullName}</span>
        </h1>

        {/* User bio */}
        <p className="w-full max-w-xs px-2 text-center text-xs sm:text-sm text-gray-300 break-words leading-relaxed">
          {selectedUser.bio}
        </p>
      </div>

      {/* Divider */}
      <hr className="border-[#ffffff50] my-4 sm:my-5 shrink-0" />

      {/* Media section */}
      <div className="flex-1 min-h-0 px-3 sm:px-4 md:px-5 pb-4 flex flex-col overflow-hidden">
        <p className="text-sm sm:text-base shrink-0">Media</p>

        {/* Only images scroll */}
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
      </div>

      {/* Close chat */}
      <div className="shrink-0 px-3 sm:px-4 md:px-5 py-3 sm:py-4 bg-[#282142]/30">
        <button
          onClick={() => {
            dispatch(setSelectedUser(null));
            dispatch(setInfoUser(false));
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
