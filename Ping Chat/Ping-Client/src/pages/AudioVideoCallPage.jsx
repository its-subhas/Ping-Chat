import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useDispatch, useSelector } from "react-redux";
import { setaudioCall, setvideoCall } from "../store/slice";

function AudioVideoCallPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedUser = useSelector((state) => state.selectedUser);
  const selectedGroup = useSelector((state) => state.selectedGroup);
  const audioCall = useSelector((state) => state.audioCall);
  const videoCall = useSelector((state) => state.videoCall);

  const activeCall = audioCall || videoCall;
  const isGroupCall = !!selectedGroup;
  const callTarget = selectedUser || selectedGroup;

  const callName =
    selectedUser?.fullName || selectedGroup?.groupName || "Unknown";

  const callImage =
    selectedUser?.profilePic || selectedGroup?.groupPic || assets.avtar;

  const callType = audioCall ? "Audio Call" : "Video Call";

  const callTitle = isGroupCall ? `${callType} - Group Call` : callType;

  const endCall = () => {
    dispatch(setaudioCall(false));
    dispatch(setvideoCall(false));
    navigate("/");
  };

  const returnToChat = () => {
    navigate("/");
  };

  return (
    <>
      {callTarget && activeCall ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 p-2 xs:p-3 sm:p-5 md:p-6">
          <div className="flex w-full max-w-xs sm:max-w-sm md:max-w-md flex-col rounded-2xl sm:rounded-3xl border border-white/10 bg-[#181229]/95 p-4 sm:p-6 md:p-7 text-white shadow-2xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs md:text-sm text-gray-400">
                  {callTitle}
                </p>

                <h1 className="mt-1 truncate text-base sm:text-lg md:text-xl font-semibold">
                  {callName}
                </h1>

                {isGroupCall && (
                  <p className="mt-1 text-[10px] sm:text-xs text-violet-400">
                    Group conversation
                  </p>
                )}
              </div>

              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-green-500/10 px-2 py-1 text-[10px] sm:text-xs text-green-400">
                <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-400 animate-pulse" />
                Connecting
              </span>
            </div>

            <div className="flex flex-col items-center py-6 sm:py-8 md:py-9">
              <div className="relative">
                <div className="absolute -inset-1.5 sm:-inset-2 rounded-full bg-violet-500/20 animate-ping" />

                <img
                  src={callImage}
                  alt={callName}
                  className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-full border-4 border-violet-500/40 object-cover"
                />
              </div>

              <p className="mt-4 sm:mt-5 text-center text-[11px] sm:text-xs md:text-sm text-gray-400">
                {isGroupCall
                  ? "Waiting for group members..."
                  : "Waiting for response..."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5">
              <button
                type="button"
                className="flex h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-base sm:text-lg hover:bg-white/20 active:scale-95 transition cursor-pointer"
                title="Mute"
              >
                🎤
              </button>

              <button
                type="button"
                onClick={endCall}
                className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-full bg-red-500 text-lg sm:text-xl hover:bg-red-600 active:scale-95 transition cursor-pointer"
                title="End Call"
              >
                📞
              </button>

              <button
                type="button"
                className="flex h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-base sm:text-lg hover:bg-white/20 active:scale-95 transition cursor-pointer"
                title="Speaker"
              >
                🔊
              </button>
            </div>

            <button
              type="button"
              onClick={returnToChat}
              className="mt-4 sm:mt-5 w-full rounded-xl bg-white/5 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-300 hover:bg-white/10 active:scale-[0.99] transition cursor-pointer"
            >
              Return to Chat
            </button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-dvh w-full items-center justify-center overflow-y-auto p-3 sm:p-5 md:p-6 text-white">
          <div className="w-full max-w-xs sm:max-w-md md:max-w-lg rounded-2xl sm:rounded-3xl border border-gray-600 bg-[#282142]/80 p-5 sm:p-6 md:p-8 text-center shadow-lg">
            <div className="mb-3 sm:mb-4 flex justify-center">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-white/5">
                <span className="text-xl sm:text-2xl md:text-3xl">📞</span>
              </div>
            </div>

            <h2 className="text-base sm:text-lg md:text-2xl font-semibold">
              No Active Audio/Video Call
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-xs sm:text-sm md:text-base text-gray-400">
              Start a call from a chat to see it here.
            </p>

            <button
              type="button"
              onClick={returnToChat}
              className="mt-4 sm:mt-5 w-full rounded-lg bg-violet-600 px-5 py-2.5 sm:w-auto sm:min-w-40 text-xs sm:text-sm md:text-base hover:bg-violet-700 active:scale-95 transition cursor-pointer"
            >
              Return to Chat
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AudioVideoCallPage;
