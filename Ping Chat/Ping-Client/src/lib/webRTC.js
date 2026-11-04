
const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const createWebRTC = ({socket,senderId,videoCall,remoteUserId,onLocalStream,onRemoteStream,onConnectionState,}) => {

  let peerConnection = null;
  let localStream = null;
  let pendingCandidates = [];

  const createPeer = () => {

    if (peerConnection) return peerConnection;

    peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (event) => {

      if (event.candidate) {
        socket.emit("iceCandidate", {
          receiverId: remoteUserId,
          senderId,
          candidate: event.candidate,
        });
      }

    };


    peerConnection.ontrack = (event) => {
      onRemoteStream?.(event.streams[0]);
    };

    peerConnection.onconnectionstatechange = () => {
      onConnectionState?.(peerConnection.connectionState);
    };

    return peerConnection;

  };

  const getLocalStream = async () => {

    if (localStream) return localStream;

    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: videoCall,
    });

    onLocalStream?.(localStream);

    return localStream;

  };


  const addLocalTracks = async () => {

    const stream = await getLocalStream();
    const peer = createPeer();

    stream.getTracks().forEach((track) => {

      peer.addTrack(track, stream);

    });

    return peer;

  };



  const addPendingCandidates = async () => {

    for (const candidate of pendingCandidates) {

      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));

    }

    pendingCandidates = [];

  };



  const startCall = async () => {

    const peer = await addLocalTracks();
    const offer = await peer.createOffer();

    await peer.setLocalDescription(offer);

    socket.emit("webrtcOffer", {

      receiverId: remoteUserId,
      senderId,
      offer,

    });

  };




  const handleOffer = async (offer) => {


    const peer = await addLocalTracks();

    await peer.setRemoteDescription(new RTCSessionDescription(offer));

    await addPendingCandidates();

    const answer = await peer.createAnswer();

    await peer.setLocalDescription(answer);

    socket.emit("webrtcAnswer", {

      receiverId: remoteUserId,
      senderId,
      answer,

    });

  };



  const handleAnswer = async (answer) => {

    if (!peerConnection) return;

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer),
    );

    await addPendingCandidates();

  };



  const handleIceCandidate = async (candidate) => {

    if (!peerConnection || !peerConnection.remoteDescription) {

      pendingCandidates.push(candidate);
      return;

    }

    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));

  };



  const offerHandler = ({ senderId: incomingSenderId, offer }) => {

    if (incomingSenderId !== remoteUserId) return;

    handleOffer(offer).catch(console.error);

  };



  const answerHandler = ({ senderId: incomingSenderId, answer }) => {

    if (incomingSenderId !== remoteUserId) return;

    handleAnswer(answer).catch(console.error);

  };



  const candidateHandler = ({ senderId: incomingSenderId, candidate }) => {

    if (incomingSenderId !== remoteUserId) return;

    handleIceCandidate(candidate).catch(console.error);

  };



  socket.on("webrtcOffer", offerHandler);
  socket.on("webrtcAnswer", answerHandler);
  socket.on("iceCandidate", candidateHandler);



  const closeCall = () => {

    socket.off("webrtcOffer", offerHandler);
    socket.off("webrtcAnswer", answerHandler);
    socket.off("iceCandidate", candidateHandler);

    localStream?.getTracks().forEach((track) => track.stop());
    peerConnection?.close();

    peerConnection = null;
    localStream = null;
    pendingCandidates = [];

  };



  return {startCall,closeCall,getLocalStream,getLocalStreamInstance: () => localStream,};

};
