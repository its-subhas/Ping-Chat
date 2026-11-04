import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { assets } from "../assets/assets";
import {
  setaudioCall,
  setCallFrom,
  setCallTo,
  setIncoming,
  setvideoCall,
} from "../store/slice.js";
import { getSocket } from "../lib/auth";

import { useEffect, useRef, useState } from "react";
import { createWebRTC } from "../lib/webRTC.js";

const Calls = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const incoming = useSelector((state) => state.incoming);
  const authUser = useSelector((state) => state.authUser);
  const callTo = useSelector((state) => state.callTo);
  const callFrom = useSelector((state) => state.callFrom);
  const audioCall = useSelector((state) => state.audioCall);
  const videoCall = useSelector((state) => state.videoCall);

  const remoteUserId = incoming ? callFrom?._id : callTo?._id;

  const callTarget = incoming ? callFrom : callTo;
  const activeCall = audioCall || videoCall;
  const isVideoCall = videoCall;

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [isRemoteVideoOff, setIsRemoteVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const socket = getSocket();

  const webRTCRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const toggleMute = () => {
    const nextMuted = !isMuted;

    webRTCRef.current
      ?.getLocalStreamInstance()
      ?.getAudioTracks()
      .forEach((track) => {
        track.enabled = !nextMuted;
      });

    setIsMuted(nextMuted);
  };

  const toggleSpeaker = () => {
    const nextSpeaker = !isSpeakerOn;

    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !nextSpeaker;
    }

    setIsSpeakerOn(nextSpeaker);
  };

  const toggleVideo = () => {
    const nextVideoOff = !isVideoOff;

    webRTCRef.current
      ?.getLocalStreamInstance()
      ?.getVideoTracks()
      .forEach((track) => {
        track.enabled = !nextVideoOff;
      });

    if (socket && remoteUserId && authUser?._id) {
      socket.emit("cameraStatus", {
        receiverId: remoteUserId,
        senderId: authUser._id,
        isVideoOff: nextVideoOff,
      });
    }

    setIsVideoOff(nextVideoOff);
  };

  const toggleShareScreen = () => {
    const nextScreenShare = !screenShare;
    const localStream = webRTCRef.current?.getLocalStreamInstance();

    localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !nextScreenShare;
    });

    localStream?.getVideoTracks().forEach((track) => {
      track.enabled = !nextScreenShare;
    });

    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = nextScreenShare;
    }

    if (socket && remoteUserId && authUser?._id) {
      socket.emit("cameraStatus", {
        receiverId: remoteUserId,
        senderId: authUser._id,
        isVideoOff: nextScreenShare,
      });
    }

    setIsMuted(nextScreenShare);
    setIsVideoOff(nextScreenShare);
    setIsSpeakerOn(!nextScreenShare);
    setScreenShare(nextScreenShare);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  const endCalls = () => {
    if (socket && remoteUserId && authUser?._id) {
      socket.emit("endConnectedCalls", {
        receiverId: remoteUserId,
        senderId: authUser._id,
      });
    }

    dispatch(setaudioCall(false));
    dispatch(setvideoCall(false));
    dispatch(setCallTo(null));
    dispatch(setCallFrom(null));

    setIsRemoteVideoOff(false);
    setIsVideoOff(false);
    setIsMuted(false);
    setIsSpeakerOn(true);
    setCallDuration(0);

    dispatch(setIncoming(false));

    navigate("/");
  };

  useEffect(() => {
    if (!socket || !authUser?._id || !remoteUserId || !activeCall) return;

    let callStarted = false;
    const remoteAudio = remoteAudioRef.current;
    const remoteVideo = remoteVideoRef.current;

    const webRTC = createWebRTC({
      socket,
      senderId: authUser._id,
      videoCall,
      remoteUserId,

      onLocalStream: (stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      },

      onRemoteStream: (stream) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = stream;
          remoteAudioRef.current.play().catch(console.error);
        }

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
          remoteVideoRef.current.muted = true;
          remoteVideoRef.current.play().catch(console.error);
        }
      },
    });

    webRTCRef.current = webRTC;

    const handleReadyForWebRTC = ({ senderId }) => {
      if (senderId !== remoteUserId) return;

      if (incoming) {
        socket.emit("readyForWebRTC", {
          receiverId: remoteUserId,
          senderId: authUser._id,
        });
      } else if (!callStarted) {
        callStarted = true;

        webRTC.startCall().catch((error) => {
          console.error("Failed to start voice call:", error);
        });
      }
    };

    socket.on("readyForWebRTC", handleReadyForWebRTC);

    const handleCameraStatus = ({ senderId, isVideoOff }) => {
      if (senderId !== remoteUserId) return;
      setIsRemoteVideoOff(isVideoOff);
    };

    socket.on("cameraStatus", handleCameraStatus);

    socket.emit("readyForWebRTC", {
      receiverId: remoteUserId,
      senderId: authUser._id,
    });

    return () => {
      socket.off("readyForWebRTC", handleReadyForWebRTC);
      socket.off("cameraStatus", handleCameraStatus);

      webRTC.closeCall();

      if (remoteAudio) {
        remoteAudio.srcObject = null;
      }

      if (remoteVideo) {
        remoteVideo.srcObject = null;
      }

      webRTCRef.current = null;
    };
  }, [socket, authUser?._id, remoteUserId, activeCall, incoming, videoCall]);

  useEffect(() => {
    if (!activeCall) {
      navigate("/");
      return;
    }

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCall, navigate]);

  useEffect(() => {
    if (!socket || !authUser?._id) return;

    const handleConnectedEnds = ({ receiverId, senderId, end }) => {
      const otherUserId = incoming ? callFrom?._id : callTo?._id;

      if (receiverId === authUser._id && senderId === otherUserId && end) {
        dispatch(setaudioCall(false));
        dispatch(setvideoCall(false));
        dispatch(setCallTo(null));
        dispatch(setCallFrom(null));

        setIsRemoteVideoOff(false);
        setIsVideoOff(false);
        setIsMuted(false);
        setIsSpeakerOn(true);
        setCallDuration(0);

        dispatch(setIncoming(false));

        navigate("/");
      }
    };

    socket.on("connectedEnds", handleConnectedEnds);

    return () => {
      socket.off("connectedEnds", handleConnectedEnds);
    };
  }, [
    authUser?._id,
    socket,
    dispatch,
    navigate,
    incoming,
    callFrom?._id,
    callTo?._id,
  ]);

  if (!activeCall || !callTarget) return null;

  return (
    <div className="fixed inset-0 z-50 h-[100dvh] w-full overflow-hidden bg-[#09090f] text-white">
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {isVideoCall ? (
        <div className="relative flex h-full w-full items-center justify-center">
          {/* User Info */}

          <div className="absolute left-4 top-5 z-10 max-w-[55%] sm:left-6 sm:top-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-wide sm:text-xl">
                Ping
              </h2>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-green-500/10 px-2 py-1 text-[10px] sm:text-xs text-green-400">
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

                {formatDuration(callDuration)}
              </span>
            </div>
          </div>

          {/* Local Video */}
          <div className="absolute right-3 top-16 z-10 h-28 w-20 overflow-hidden rounded-xl border border-white/10 bg-[#282142] shadow-2xl sm:right-5 sm:top-20 sm:h-40 sm:w-28 md:right-7 md:top-6 md:h-52 md:w-36 lg:h-64 lg:w-48">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`h-full w-full object-cover ${isVideoOff ? "invisible" : ""}`}
            />

            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center px-1 text-center text-[10px] text-gray-400 sm:text-xs">
                <p className="mt-2 flex flex-col items-center gap-2 text-xs text-gray-400 sm:text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
                  >
                    <rect x="3" y="5" width="13" height="14" rx="2" />
                    <path d="m16 10 5-3v10l-5-3" />
                    {isVideoOff && <path d="M3 3l18 18" strokeWidth="2" />}
                  </svg>
                  Camera Off
                </p>
              </div>
            )}
          </div>

          {/* Remote Video */}
          <div className="absolute inset-0 flex items-center justify-center bg-[#171421]">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`h-full w-full object-cover ${isRemoteVideoOff ? "hidden" : ""}`}
            />

            {isRemoteVideoOff && (
              <div className="flex flex-col items-center px-4 text-center">
                <img
                  src={callTarget.profilePic || assets.avtar}
                  alt=""
                  className="h-28 w-28 rounded-full border-4 border-white/10 object-cover shadow-2xl sm:h-36 sm:w-36 md:h-44 md:w-44 lg:h-52 lg:w-52"
                />

                <h2 className="mt-5 max-w-[80vw] truncate text-lg font-semibold sm:text-xl md:text-2xl">
                  {callTarget.fullName || callTarget.name}
                </h2>

                <p className="mt-2 flex items-center gap-2 text-xs text-gray-400 sm:text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
                  >
                    <rect x="3" y="5" width="13" height="14" rx="2" />
                    <path d="m16 10 5-3v10l-5-3" />
                    {isRemoteVideoOff && (
                      <path d="M3 3l18 18" strokeWidth="2" />
                    )}
                  </svg>
                  Camera Off
                </p>
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-5 left-1/2 z-20 w-max max-w-[calc(100%-20px)] -translate-x-1/2 sm:bottom-8">
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#201c2d]/90 p-2 shadow-2xl backdrop-blur-xl sm:gap-4 sm:p-3 md:gap-5 md:p-4">
              <button
                type="button"
                onClick={toggleVideo}
                className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16  shrink-0 items-center justify-center rounded-full bg-white/10 text-gray-200 hover:bg-white/20 active:scale-95 transition cursor-pointer"
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
                  className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
                >
                  <rect x="3" y="5" width="13" height="14" rx="2" />
                  <path d="m16 10 5-3v10l-5-3" />
                  {isVideoOff && <path d="M3 3l18 18" strokeWidth="2" />}
                </svg>
              </button>
              <button
                type="button"
                onClick={toggleMute}
                className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-full bg-white/10 text-gray-200 hover:bg-white/20 active:scale-95 transition cursor-pointer"
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
                  className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
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
                  className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rotate-[135deg]"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 3.18 2 2 0 0 1 4.08 1h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.79a2 2 0 0 1-.45 2.11L8.06 8.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.7A2 2 0 0 1 22 16.92Z" />
                </svg>
              </button>

              <button
                type="button"
                onClick={toggleSpeaker}
                className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-full bg-white/10 text-gray-200 hover:bg-white/20 active:scale-95 transition cursor-pointer"
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
                  className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
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
              <button
                type="button"
                onClick={toggleShareScreen}
                className={`flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-full text-gray-200 active:scale-95 transition cursor-pointer ${
                  screenShare
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
                  className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
                >
                  <rect x="3" y="4" width="18" height="13" rx="2" />
                  <path d="M12 17v4m-4 0h8m-4-13v6m-3-3 3-3 3 3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Audio Call */

        <div className="relative flex h-full w-full flex-col items-center justify-center px-4 py-6">
          <div className="absolute left-5 top-5 sm:left-7 sm:top-7">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-wide sm:text-xl">
                Ping
              </h2>
              <div className="h-3 w-3 rounded-full bg-green-500 sm:h-4 sm:w-4" />
            </div>
          </div>

          {/* User Information */}

          <div className="flex w-full flex-col items-center">
            <div className="relative mb-6 sm:mb-8">
              <div className="absolute inset-0 scale-125 rounded-full bg-[#8185B2] opacity-30 blur-3xl" />

              <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-[#8185B2] to-[#282142] p-1 shadow-2xl sm:h-36 sm:w-36 md:h-44 md:w-44 lg:h-48 lg:w-48">
                <img
                  src={callTarget.profilePic || assets.avtar}
                  alt="profilePic"
                  className="h-full w-full rounded-full border-4 border-[#151321] object-cover"
                />
              </div>
            </div>

            <h1 className="max-w-[85vw] truncate text-xl font-semibold sm:text-2xl md:text-3xl">
              {callTarget.fullName || callTarget.name}
            </h1>

            <p className="mt-2 text-sm text-gray-400 sm:text-base">
              {formatDuration(callDuration)}
            </p>

            <div className="mt-6 flex h-12 items-center gap-1 sm:mt-8 sm:gap-1.5">
              {[20, 35, 48, 28, 42, 55, 32, 45, 25, 40, 30].map(
                (height, index) => (
                  <div
                    key={index}
                    className="w-1 rounded-full bg-[#8185B2] animate-pulse sm:w-1.5"
                    style={{
                      height: `${height}px`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  />
                ),
              )}
            </div>
          </div>

          {/* Audio Controls */}

          <div className="absolute bottom-[max(24px,env(safe-area-inset-bottom))] left-1/2 flex max-w-[calc(100%-24px)] -translate-x-1/2 items-center gap-3 sm:gap-6 md:gap-8">
            <button
              type="button"
              onClick={toggleMute}
              className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-full bg-white/10 text-gray-200 hover:bg-white/20 active:scale-95 transition cursor-pointer"
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
                className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
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
                className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rotate-[135deg]"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 18a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 3.18 2 2 0 0 1 4.08 1h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.79a2 2 0 0 1-.45 2.11L8.06 8.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.58 2.79.7A2 2 0 0 1 22 16.92Z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={toggleSpeaker}
              className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-full bg-white/10 text-gray-200 hover:bg-white/20 active:scale-95 transition cursor-pointer"
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
                className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Calls;
