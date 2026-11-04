export const voiceCall = async (io, socket, userSocketMap) => {
  socket.on("audioCallOffer", ({ receiverId, senderId }) => {
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingAudioCall", {
        receiverId,
        senderId,
        type: "Audio",
        incoming: true,
      });
    }
  });

  socket.on("videoCallOffer", ({ receiverId, senderId }) => {
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingVideoCall", {
        receiverId,
        senderId,
        type: "Video",
        incoming: true,
      });
    }
  });

  socket.on("rejectIncomingCalls", ({ receiverId, senderId }) => {
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("rejectCalls", {
        receiverId,
        senderId,
        reject: true,
      });
    }
  });

  socket.on("endOutgoingCalls", ({ receiverId, senderId }) => {
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("endCalls", {
        receiverId,
        senderId,
        end: true,
      });
    }
  });

  socket.on("acceptIncomingCalls", ({ receiverId, senderId }) => {
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("acceptCalls", {
        receiverId,
        senderId,
        accept: true,
      });
    }
  });

  socket.on("endConnectedCalls", ({ receiverId, senderId }) => {
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("connectedEnds", {
        receiverId,
        senderId,
        end: true,
      });
    }
  });

  // Web RTC

  socket.on("readyForWebRTC", ({ receiverId, senderId }) => {
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("readyForWebRTC", {
        senderId,
      });
    }
  });

  socket.on("webrtcOffer", ({ receiverId, senderId, offer }) => {
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("webrtcOffer", {
        senderId,
        offer,
      });
    }
  });

  socket.on("webrtcAnswer", ({ receiverId, senderId, answer }) => {
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("webrtcAnswer", {
        senderId,
        answer,
      });
    }
  });

  socket.on("iceCandidate", ({ receiverId, senderId, candidate }) => {
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("iceCandidate", {
        senderId,
        candidate,
      });
    }
  });

  socket.on("cameraStatus", ({ receiverId, senderId, isVideoOff }) => {
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("cameraStatus", {
        senderId,
        isVideoOff,
      });
    }
  });
};
