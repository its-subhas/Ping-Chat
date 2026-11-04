import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useDispatch, useSelector } from "react-redux";
import {
  setaudioCall,
  setCallFrom,
  setCallTo,
  setIncoming,
  setvideoCall,
} from "../store/slice";
import { useEffect, useState } from "react";
import { getSocket } from "../lib/auth";

function AudioVideoCallPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = getSocket();

  const authUser = useSelector((state) => state.authUser);
  const callTo = useSelector((state) => state.callTo);
  const callFrom = useSelector((state) => state.callFrom);
  const audioCall = useSelector((state) => state.audioCall);
  const videoCall = useSelector((state) => state.videoCall);
  const callType = useSelector((state) => state.callType);
  const incoming = useSelector((state) => state.incoming);

  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [shareScreen, setshareScreen] = useState(false);

  const handleScreenShare = () => {
    if (shareScreen) {
      setshareScreen(false);
      setIsMuted(false);
      setIsVideoOff(false);
      setIsSpeakerOn(true);
    } else {
      setshareScreen(true);
      setIsMuted(true);
      setIsVideoOff(true);
      setIsSpeakerOn(false);
    }
  };

  const endCalls = () => {
    socket.emit("endOutgoingCalls", {
      receiverId: callTo._id,
      senderId: authUser._id,
    });

    dispatch(setaudioCall(false));
    dispatch(setvideoCall(false));
    dispatch(setCallTo(null));
    dispatch(setCallFrom(null));

    setshareScreen(false);
    setIsVideoOff(false);
    setIsMuted(false);
    setIsSpeakerOn(true);
    dispatch(setIncoming(false));

    navigate("/");
  };

  const rejectCalls = () => {
    socket.emit("rejectIncomingCalls", {
      receiverId: callFrom._id,
      senderId: authUser._id,
    });

    dispatch(setaudioCall(false));
    dispatch(setvideoCall(false));
    dispatch(setCallTo(null));
    dispatch(setCallFrom(null));

    setIsVideoOff(false);
    setIsMuted(false);
    setIsSpeakerOn(true);
    dispatch(setIncoming(false));

    navigate("/");
  };

  const returnToChat = () => {
    navigate("/");
  };

  const acceptCalls = () => {
    socket.emit("acceptIncomingCalls", {
      receiverId: callFrom._id,
      senderId: authUser._id,
    });
    navigate("/connectedCalls");
  };

  useEffect(() => {
    if (!socket || !authUser?._id) return;

    const handleRejectCalls = ({ receiverId, senderId, reject }) => {
      if (receiverId === authUser._id && senderId === callTo._id && reject) {
        dispatch(setaudioCall(false));
        dispatch(setvideoCall(false));
        dispatch(setCallTo(null));
        dispatch(setCallFrom(null));

        setIsVideoOff(false);
        setIsMuted(false);
        setIsSpeakerOn(true);
        dispatch(setIncoming(false));
        navigate("/");
      }
    };

    const handleEndCalls = ({ receiverId, senderId, end }) => {
      if (receiverId === authUser._id && senderId === callFrom._id && end) {
        dispatch(setaudioCall(false));
        dispatch(setvideoCall(false));
        dispatch(setCallTo(null));
        dispatch(setCallFrom(null));

        setIsVideoOff(false);
        setIsMuted(false);
        setIsSpeakerOn(true);
        dispatch(setIncoming(false));
        navigate("/");
      }
    };

    const handleAcceptCalls = ({ receiverId, senderId, accept }) => {
      if (receiverId === authUser._id && senderId === callTo._id && accept) {
        navigate("/connectedCalls");
      }
    };

    socket.on("rejectCalls", handleRejectCalls);
    socket.on("endCalls", handleEndCalls);
    socket.on("acceptCalls", handleAcceptCalls);

    return () => {
      socket.off("rejectCalls", handleRejectCalls);
      socket.off("endCalls", handleEndCalls);
      socket.off("acceptCalls", handleAcceptCalls);
    };
  }, [
    authUser?._id,
    socket,
    dispatch,
    audioCall,
    videoCall,
    callTo,
    navigate,
    callFrom,
  ]);

  return (
    <>
      {incoming ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 p-2 xs:p-3 sm:p-5 md:p-6">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#282142] to-[#151020] p-7 text-center text-white shadow-2xl sm:p-9">
            <div className="absolute left-0 top-0 h-40 w-full bg-violet-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-3 flex items-center justify-center gap-2 text-sm font-medium text-violet-300">
                <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-green-500/10 px-2 py-1 text-[10px] sm:text-xs text-green-400">
                  {videoCall ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6"
                    >
                      <rect x="3" y="5" width="13" height="14" rx="2" />
                      <path d="m16 10 5-3v10l-5-3" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 3.18 2 2 0 0 1 4.08 1h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.79a2 2 0 0 1-.45 2.11L8.06 8.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.7A2 2 0 0 1 22 16.92Z" />
                    </svg>
                  )}
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                  </span>
                  Incoming {callType} Call
                </span>
              </div>

              <div className="relative mx-auto mt-8 h-28 w-28">
                <div className="absolute inset-0 animate-ping rounded-full border border-violet-400/30" />
                <div className="absolute -inset-2 rounded-full border border-violet-400/20" />
                <img
                  src={callFrom.profilePic || assets.avtar}
                  alt="Caller"
                  className="relative h-28 w-28 rounded-full border-4 border-violet-400/40 object-cover shadow-xl"
                />
              </div>

              <h2 className="mt-6 truncate text-2xl font-semibold">
                {callFrom.fullName || "Unknown Caller"}
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                {videoCall ? "Video calling you" : "Calling you"}
              </p>

              <div className="mt-10 flex items-center justify-center gap-12">
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={rejectCalls}
                    aria-label="Reject call"
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/20 transition hover:scale-105 hover:bg-red-600 active:scale-95 cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-7 w-7 rotate-[135deg]"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 3.18 2 2 0 0 1 4.08 1h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.79a2 2 0 0 1-.45 2.11L8.06 8.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.7A2 2 0 0 1 22 16.92Z" />
                    </svg>
                  </button>
                  <span className="text-sm text-gray-300">Decline</span>
                </div>

                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={acceptCalls}
                    aria-label="Accept call"
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/20 transition hover:scale-105 hover:bg-green-600 active:scale-95 cursor-pointer"
                  >
                    {videoCall ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-7 w-7"
                      >
                        <rect x="3" y="5" width="13" height="14" rx="2" />
                        <path d="m16 10 5-3v10l-5-3" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-7 w-7"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 3.18 2 2 0 0 1 4.08 1h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.79a2 2 0 0 1-.45 2.11L8.06 8.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.7A2 2 0 0 1 22 16.92Z" />
                      </svg>
                    )}
                  </button>
                  <span className="text-sm text-gray-300">Accept</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : callTo && audioCall !== videoCall ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 p-2 xs:p-3 sm:p-5 md:p-6">
          <div className="flex w-full max-w-xs sm:max-w-sm md:max-w-md flex-col rounded-2xl sm:rounded-3xl border border-white/10 bg-[#181229]/95 p-4 sm:p-6 md:p-7 text-white shadow-2xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs md:text-sm text-gray-400">
                  {callType} Call
                </p>

                <h1 className="mt-1 truncate text-base sm:text-lg md:text-xl font-semibold">
                  {callTo?.fullName || "Unknown"}
                </h1>
              </div>

              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-green-500/10 px-2 py-1 text-[10px] sm:text-xs text-green-400">
                {videoCall ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6"
                  >
                    <rect x="3" y="5" width="13" height="14" rx="2" />
                    <path d="m16 10 5-3v10l-5-3" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 3.18 2 2 0 0 1 4.08 1h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.79a2 2 0 0 1-.45 2.11L8.06 8.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.7A2 2 0 0 1 22 16.92Z" />
                  </svg>
                )}
                <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-400 animate-pulse" />
                Connecting
              </span>
            </div>

            <div className="flex flex-col items-center py-6 sm:py-8 md:py-9">
              <div className="relative">
                <div className="absolute -inset-1.5 sm:-inset-2 rounded-full bg-violet-500/20 animate-ping" />

                <img
                  src={callTo?.profilePic || assets.avtar}
                  alt={"Profile"}
                  className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-full border-4 border-violet-500/40 object-cover"
                />
              </div>

              <p className="mt-4 sm:mt-5 text-center text-[11px] sm:text-xs md:text-sm text-gray-400">
                Waiting for response
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5">
              {videoCall && (
                <button
                  type="button"
                  onClick={() => {
                    setIsVideoOff(!isVideoOff);
                  }}
                  className="flex h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-gray-200 hover:bg-white/20 active:scale-95 transition cursor-pointer"
                  title="Video Call"
                  aria-label="Video Call"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6"
                  >
                    <rect x="3" y="5" width="13" height="14" rx="2" />
                    <path d="m16 10 5-3v10l-5-3" />
                    {isVideoOff && <path d="M3 3l18 18" strokeWidth="2" />}
                  </svg>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsMuted(!isMuted);
                }}
                className="flex h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-gray-200 hover:bg-white/20 active:scale-95 transition cursor-pointer"
                title="Mute"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6"
                >
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
                  <path d="M12 19v3" />
                  <path d="M8 22h8" />
                  {isMuted && <path d="M3 3l18 18" strokeWidth="2" />}
                </svg>
              </button>

              <button
                type="button"
                onClick={endCalls}
                className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 active:scale-95 transition cursor-pointer"
                title="End Call"
                aria-label="End Call"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 sm:h-7 sm:w-7 rotate-[135deg]"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 3.18 2 2 0 0 1 4.08 1h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.79a2 2 0 0 1-.45 2.11L8.06 8.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.7A2 2 0 0 1 22 16.92Z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSpeakerOn(!isSpeakerOn);
                }}
                className="flex h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-gray-200 hover:bg-white/20 active:scale-95 transition cursor-pointer"
                title="Speaker"
                aria-label="Speaker"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6"
                >
                  <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                  {isSpeakerOn ? (
                    <>
                      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                      <path d="M19 5a10 10 0 0 1 0 14" />
                    </>
                  ) : (
                    <path d="m16 9 5 6m0-6-5 6" />
                  )}
                </svg>
              </button>

              {videoCall && (
                <button
                  type="button"
                  onClick={handleScreenShare}
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full text-gray-200 active:scale-95 transition cursor-pointer ${
                    shareScreen
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                  title="Share Screen"
                  aria-label="Share Screen"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 md:h-6 md:w-6"
                  >
                    <rect x="3" y="4" width="18" height="13" rx="2" />
                    <path d="M12 17v4m-4 0h8m-4-13v6m-3-3 3-3 3 3" />
                  </svg>
                </button>
              )}
            </div>
            {/* 
            <button
              type="button"
              onClick={returnToChat}
              className="mt-4 sm:mt-5 w-full rounded-xl bg-white/5 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-300 hover:bg-white/10 active:scale-[0.99] transition cursor-pointer"
            >
              Return to Chat
            </button> */}
          </div>
        </div>
      ) : (
        <div className="flex min-h-dvh w-full items-center justify-center overflow-y-auto p-3 sm:p-5 md:p-6 text-white">
          <div className="w-full max-w-xs sm:max-w-md md:max-w-lg rounded-2xl sm:rounded-3xl border border-gray-600 bg-[#282142]/80 p-5 sm:p-6 md:p-8 text-center shadow-lg">
            <div className="mb-3 sm:mb-4 flex justify-center">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-white/5">
                <span className="text-xl sm:text-2xl md:text-3xl">
                  {" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 3.18 2 2 0 0 1 4.08 1h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.79a2 2 0 0 1-.45 2.11L8.06 8.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.7A2 2 0 0 1 22 16.92Z" />
                  </svg>
                </span>
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
