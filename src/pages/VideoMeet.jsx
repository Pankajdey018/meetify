import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";

import {
  Badge,
  IconButton,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
} from "@mui/material";

import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ChatIcon from "@mui/icons-material/Chat";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PeopleIcon from "@mui/icons-material/People";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";

import styles from "../styles/videoComponent.module.css";
import server from "../environment";

const server_url = server;

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export default function VideoMeetComponent() {
  const { meetingCode } = useParams();
  const meetingLink = `${window.location.origin}/meet/${meetingCode}`;

  const socketRef = useRef();
  const socketIdRef = useRef();
  const connections = useRef({});

  const [videos, setVideos] = useState([]);
  const [participants, setParticipants] = useState([]);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);

  const [showModal, setModal] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);

  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");

  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const navigate = useNavigate();

  /* ================= CAMERA ================= */

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        window.localStream = stream;

        setVideos((prev) => [
          ...prev,
          {
            socketId: "local",
            stream: stream,
          },
        ]);
      } catch (err) {
        console.log("Camera error:", err);
      }
    };

    startCamera();
  }, []);

  /* ================= SOCKET ================= */

  const connectToSocketServer = () => {
    socketRef.current = io(server_url);

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;

      socketRef.current.emit("join-meeting", meetingCode);

      setParticipants((prev) => [...prev, socketIdRef.current]);
    });

    /* ================= USER JOINED ================= */

    socketRef.current.on("user-joined", (id) => {
      if (connections.current[id]) return;

      setParticipants((prev) => [...prev, id]);

      const peer = new RTCPeerConnection(peerConfigConnections);
      connections.current[id] = peer;

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit(
            "signal",
            id,
            JSON.stringify({ ice: event.candidate }),
          );
        }
      };

      peer.ontrack = (event) => {
        setVideos((prev) => {
          const alreadyExists = prev.find((v) => v.socketId === id);
          if (alreadyExists) return prev;

          return [
            ...prev,
            {
              socketId: id,
              stream: event.streams[0],
            },
          ];
        });
      };

      window.localStream.getTracks().forEach((track) => {
        peer.addTrack(track, window.localStream);
      });

      peer.createOffer().then((offer) => {
        peer.setLocalDescription(offer);

        socketRef.current.emit("signal", id, JSON.stringify({ sdp: offer }));
      });
    });

    /* ================= SIGNAL ================= */

    socketRef.current.on("signal", (fromId, message) => {
      const signal = JSON.parse(message);

      if (!connections.current[fromId]) {
        const peer = new RTCPeerConnection(peerConfigConnections);
        connections.current[fromId] = peer;

        peer.ontrack = (event) => {
          setVideos((prev) => {
            const alreadyExists = prev.find((v) => v.socketId === fromId);
            if (alreadyExists) return prev;

            return [
              ...prev,
              {
                socketId: fromId,
                stream: event.streams[0],
              },
            ];
          });
        };

        window.localStream.getTracks().forEach((track) => {
          peer.addTrack(track, window.localStream);
        });
      }

      const peer = connections.current[fromId];

      if (signal.sdp) {
        peer
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              peer.createAnswer().then((answer) => {
                peer.setLocalDescription(answer);

                socketRef.current.emit(
                  "signal",
                  fromId,
                  JSON.stringify({ sdp: answer }),
                );
              });
            }
          });
      }

      if (signal.ice) {
        peer.addIceCandidate(new RTCIceCandidate(signal.ice));
      }
    });

    /* ================= USER LEFT ================= */

    socketRef.current.on("user-left", (id) => {
      if (connections.current[id]) {
        connections.current[id].close();
        delete connections.current[id];
      }

      setVideos((prev) => prev.filter((v) => v.socketId !== id));
      setParticipants((prev) => prev.filter((p) => p !== id));
    });

    /* ================= CHAT ================= */

    socketRef.current.on("chat-message", (data, sender, senderId) => {
      setMessages((prev) => [...prev, { sender, data }]);

      if (senderId !== socketIdRef.current) {
        setNewMessages((prev) => prev + 1);
      }
    });
  };

  /* ================= SEND MESSAGE ================= */

  const sendMessage = () => {
    socketRef.current.emit("chat-message", meetingCode, message, username);
    setMessage("");
  };

  /* ================= CONTROLS ================= */

  const connect = () => {
    setAskForUsername(false);
    connectToSocketServer();
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(meetingLink);
  };

  const handleEndCall = () => {
    navigate("/home");
  };

  /* ================= SCREEN SHARE ================= */

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const screenTrack = screenStream.getVideoTracks()[0];

      // replace video track for every peer
      Object.values(connections.current).forEach((peer) => {
        const sender = peer
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");

        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      // update local preview
      setVideos((prev) =>
        prev.map((v) =>
          v.socketId === "local" ? { ...v, stream: screenStream } : v,
        ),
      );

      // when screen sharing stops → return to camera
      screenTrack.onended = async () => {
        const camStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        const camTrack = camStream.getVideoTracks()[0];

        Object.values(connections.current).forEach((peer) => {
          const sender = peer
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");

          if (sender) {
            sender.replaceTrack(camTrack);
          }
        });

        setVideos((prev) =>
          prev.map((v) =>
            v.socketId === "local" ? { ...v, stream: camStream } : v,
          ),
        );

        window.localStream = camStream;
      };
    } catch (err) {
      console.log("Screen share error:", err);
    }
  };

  /* ================= UI ================= */

  return (
    <>
      {askForUsername ? (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#f5f7fb",
          }}
        >
          <Paper elevation={6} sx={{ p: 4, width: 420 }}>
            <Typography variant="h5" mb={2}>
              Join Meeting
            </Typography>

            <TextField
              fullWidth
              label="Your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={connect}
              disabled={!username}
            >
              Join
            </Button>
          </Paper>
        </Box>
      ) : (
        <div className={styles.meetVideoContainer}>
          <div className={styles.meetingInfoBar}>
            <span>{meetingLink}</span>
            <Button size="small" onClick={copyMeetingLink}>
              Copy
            </Button>
          </div>

          {showParticipants && (
            <div className={styles.chatRoom}>
              <h3>Participants</h3>
              {participants.map((p, i) => (
                <p key={i}>{p.slice(0, 6)}</p>
              ))}
            </div>
          )}

          {showModal && (
            <div className={styles.chatRoom}>
              <div className={styles.chatHeader}>Chat</div>

              <div className={styles.chatMessages}>
                {messages.map((m, i) => (
                  <div key={i} className={styles.chatBubble}>
                    <span className={styles.chatSender}>{m.sender}</span>
                    <span>{m.data}</span>
                  </div>
                ))}
              </div>

              <div className={styles.chatInputArea}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                />

                <Button variant="contained" onClick={sendMessage}>
                  Send
                </Button>
              </div>
            </div>
          )}

          {/* VIDEO GRID */}

          <div className={styles.videoGrid}>
            {videos
              .filter(
                (v, index, self) =>
                  index === self.findIndex((t) => t.socketId === v.socketId),
              )
              .map((v) => {
                const isLocal = v.socketId === "local";

                return (
                  <div key={v.socketId} className={styles.videoTile}>
                    {isLocal && !video ? (
                      <div className={styles.cameraOff}>
                        <Typography variant="h6">Camera Off</Typography>
                        <Typography>{username}</Typography>
                      </div>
                    ) : (
                      <video
                        autoPlay
                        playsInline
                        muted={isLocal}
                        ref={(videoEl) => {
                          if (videoEl && videoEl.srcObject !== v.stream) {
                            videoEl.srcObject = v.stream;
                          }
                        }}
                        className={styles.videoElement}
                      />
                    )}
                  </div>
                );
              })}
          </div>

          {/* CONTROLS */}

          <div className={styles.buttonContainers}>
            {/* VIDEO TOGGLE */}
            <IconButton
              onClick={() => {
                const videoTrack = window.localStream?.getVideoTracks()[0];

                if (videoTrack) {
                  const enabled = !videoTrack.enabled;
                  videoTrack.enabled = enabled;
                  setVideo(enabled);
                }
              }}
            >
              {video ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            {/* SCREEN SHARE */}
            <IconButton onClick={startScreenShare}>
              <ScreenShareIcon />
            </IconButton>

            {/* END CALL */}
            <IconButton onClick={handleEndCall}>
              <CallEndIcon />
            </IconButton>

            {/* AUDIO TOGGLE */}
            <IconButton
              onClick={() => {
                const audioTrack = window.localStream?.getAudioTracks()[0];

                if (audioTrack) {
                  const enabled = !audioTrack.enabled;
                  audioTrack.enabled = enabled;
                  setAudio(enabled);
                }
              }}
            >
              {audio ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {/* PARTICIPANTS */}
            <IconButton onClick={() => setShowParticipants(!showParticipants)}>
              <PeopleIcon />
            </IconButton>

            {/* CHAT */}
            <Badge badgeContent={newMessages}>
              <IconButton onClick={() => setModal(!showModal)}>
                <ChatIcon />
              </IconButton>
            </Badge>

            {/* COPY LINK */}
            <IconButton onClick={copyMeetingLink}>
              <ContentCopyIcon />
            </IconButton>
          </div>
        </div>
      )}
    </>
  );
}
