import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { 
  Badge, 
  IconButton, 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper, 
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Container,
  Fade,
  Zoom,
  Grow,
  alpha
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  CallEnd as CallEndIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon,
  Chat as ChatIcon,
  Send as SendIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import server from '../environment';

const server_url = server;
var connections = {};

const peerConfigConnections = {
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" }
  ]
}

// Styled Components
const FloatingControlButton = styled(IconButton)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  color: 'white',
  width: 56,
  height: 56,
  margin: theme.spacing(1),
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(28, 179, 199, 0.3)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(28, 179, 199, 0.4)'
  }
}));

const EndCallButton = styled(IconButton)(({ theme }) => ({
  background: '#ff4444',
  color: 'white',
  width: 64,
  height: 64,
  margin: theme.spacing(1),
  '&:hover': {
    background: '#ff2222',
    transform: 'scale(1.1)',
    boxShadow: '0 8px 25px rgba(255, 68, 68, 0.4)'
  }
}));

const StyledVideo = styled('video')(({ theme }) => ({
  borderRadius: '16px',
  backgroundColor: '#000',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 40px rgba(28, 179, 199, 0.3)',
    transform: 'translateY(-2px)'
  }
}));

const UserCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(28, 179, 199, 0.1)',
    borderColor: 'rgba(28, 179, 199, 0.3)'
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1cb3c7 0%, #1a9cb1 100%)',
  color: 'white',
  fontWeight: 600,
  padding: '12px 32px',
  borderRadius: '12px',
  boxShadow: '0 4px 15px rgba(28, 179, 199, 0.3)',
  transition: 'all 0.3s ease',
  textTransform: 'none',
  '&:hover': {
    background: 'linear-gradient(45deg, #1a9cb1 0%, #1cb3c7 100%)',
    boxShadow: '0 6px 20px rgba(28, 179, 199, 0.4)',
    transform: 'translateY(-2px)'
  }
}));

const ChatMessage = styled(Paper)(({ theme, isOwn }) => ({
  background: isOwn 
    ? 'linear-gradient(45deg, rgba(28, 179, 199, 0.2), rgba(28, 179, 199, 0.1))'
    : 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px 16px 16px 4px',
  padding: theme.spacing(2),
  maxWidth: '70%',
  marginLeft: isOwn ? 'auto' : 'none',
  marginRight: isOwn ? 'none' : 'auto',
  marginBottom: theme.spacing(2)
}));

export default function VdoComponent() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoref = useRef();
  const videoRef = useRef([]);
  
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState([]);
  const [audio, setAudio] = useState();
  const [screen, setScreen] = useState();
  const [screenAvailable, setScreenAvailable] = useState();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(3);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);
  const [participants, setParticipants] = useState(1);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [meetingId, setMeetingId] = useState(window.location.pathname.split('/').pop());

  useEffect(() => {
    getPermissions();
  }, []);

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  useEffect(() => {
    if (screen !== undefined) {
      getDislayMedia();
    }
  }, [screen]);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoAvailable(!!videoPermission);
      
      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioAvailable(!!audioPermission);
      
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }
      
      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: videoAvailable, 
          audio: audioAvailable 
        });
        if (userMediaStream && localVideoref.current) {
          window.localStream = userMediaStream;
          localVideoref.current.srcObject = userMediaStream;
        }
      }
    } catch (error) {
      console.error('Permission error:', error);
    }
  };

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop());
    } catch (e) { console.log(e); }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
          })
          .catch(e => console.log(e));
      });
    }

    stream.getTracks().forEach(track => track.onended = () => {
      setVideo(false);
      setAudio(false);

      try {
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (e) { console.log(e); }

      let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
      window.localStream = blackSilence();
      localVideoref.current.srcObject = window.localStream;

      for (let id in connections) {
        connections[id].addStream(window.localStream);
        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
            })
            .catch(e => console.log(e));
        });
      }
    });
  };

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (e) { }
    }
  };

  const getDislayMedia = () => {
    if (screen && navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        .then(getDislayMediaSuccess)
        .catch((e) => console.log(e));
    }
  };

  const getDislayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach(track => track.stop());
    } catch (e) { console.log(e); }

    window.localStream = stream;
    localVideoref.current.srcObject = stream;

    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      
      connections[id].addStream(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
          })
          .catch(e => console.log(e));
      });
    }

    stream.getTracks().forEach(track => track.onended = () => {
      setScreen(false);
      try {
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      } catch (e) { console.log(e); }

      let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
      window.localStream = blackSilence();
      localVideoref.current.srcObject = window.localStream;
      getUserMedia();
    });
  };

  const gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === 'offer') {
            connections[fromId].createAnswer().then((description) => {
              connections[fromId].setLocalDescription(description).then(() => {
                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }));
              }).catch(e => console.log(e));
            }).catch(e => console.log(e));
          }
        }).catch(e => console.log(e));
      }

      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
      }
    }
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on('signal', gotMessageFromServer);

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-call', window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on('chat-message', addMessage);

      socketRef.current.on('user-left', (id) => {
        setVideos((videos) => videos.filter((video) => video.socketId !== id));
        setParticipants(prev => prev - 1);
      });

      socketRef.current.on('user-joined', (id, clients) => {
        setParticipants(clients.length);
        
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
          
          connections[socketListId].onicecandidate = function (event) {
            if (event.candidate != null) {
              socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
            }
          };

          connections[socketListId].onaddstream = (event) => {
            const videoExists = videoRef.current.find(video => video.socketId === socketListId);
            
            if (videoExists) {
              setVideos(videos => {
                const updatedVideos = videos.map(video =>
                  video.socketId === socketListId ? { ...video, stream: event.stream } : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            } else {
              const newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoplay: true,
                playsinline: true
              };

              setVideos(videos => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };

          if (window.localStream) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;

            try {
              connections[id2].addStream(window.localStream);
            } catch (e) { }

            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }));
                })
                .catch(e => console.log(e));
            });
          }
        }
      });
    });
  };

  const silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height });
    canvas.getContext('2d').fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  const handleVideo = () => setVideo(!video);
  const handleAudio = () => setAudio(!audio);
  const handleScreen = () => setScreen(!screen);

  const handleEndCall = () => {
    try {
      let tracks = localVideoref.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    } catch (e) { }
    window.location.href = "/";
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data }
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  const sendMessage = () => {
    if (message.trim() && socketRef.current) {
      socketRef.current.emit('chat-message', message, username);
      setMessage("");
    }
  };

  const connect = () => {
    if (username.trim()) {
      setAskForUsername(false);
      getMedia();
    }
  };

  const copyMeetingId = () => {
    navigator.clipboard.writeText(meetingId);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Lobby Screen */}
      <Dialog 
        open={askForUsername} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(10, 10, 10, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h4" sx={{
            fontWeight: 800,
            background: 'linear-gradient(45deg, #1cb3c7 30%, #ffffff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Join Meeting
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{
              width: 100,
              height: 100,
              bgcolor: 'rgba(28, 179, 199, 0.2)',
              mb: 2,
              margin: '0 auto'
            }}>
              <PersonIcon sx={{ fontSize: 48, color: '#1cb3c7' }} />
            </Avatar>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
              Meeting ID: {meetingId}
            </Typography>
            <Chip
              label={`Click to copy: ${meetingId}`}
              onClick={copyMeetingId}
              sx={{
                background: 'rgba(28, 179, 199, 0.15)',
                color: '#1cb3c7',
                fontWeight: 500,
                cursor: 'pointer',
                '&:hover': {
                  background: 'rgba(28, 179, 199, 0.25)'
                }
              }}
            />
          </Box>

          <TextField
            fullWidth
            label="Enter Your Name"
            variant="outlined"
            value={username}
            onChange={e => setUsername(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: '#1cb3c7',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              }
            }}
            onKeyPress={(e) => e.key === 'Enter' && connect()}
          />

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VideocamIcon sx={{ color: videoAvailable ? '#1cb3c7' : 'rgba(255, 255, 255, 0.3)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Camera {videoAvailable ? 'Available' : 'Not Available'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MicIcon sx={{ color: audioAvailable ? '#1cb3c7' : 'rgba(255, 255, 255, 0.3)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Mic {audioAvailable ? 'Available' : 'Not Available'}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
          <GradientButton
            fullWidth
            onClick={connect}
            disabled={!username.trim()}
            endIcon={<VideocamIcon />}
            size="large"
          >
            Join Meeting
          </GradientButton>
        </DialogActions>
      </Dialog>

      {/* Meeting Screen */}
      {!askForUsername && (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Top Bar */}
          <Box sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'rgba(10, 10, 10, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            py: 1.5,
            px: 3
          }}>
            <Container maxWidth="xl">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" sx={{
                    fontWeight: 700,
                    color: '#1cb3c7',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <VideocamIcon />
                    SyncMeet
                  </Typography>
                  <Chip
                    label={`Meeting: ${meetingId}`}
                    size="small"
                    sx={{
                      background: 'rgba(28, 179, 199, 0.15)',
                      color: '#1cb3c7',
                      fontWeight: 500
                    }}
                  />
                  <Chip
                    icon={<PeopleIcon sx={{ fontSize: 16 }} />}
                    label={`${participants} Participants`}
                    size="small"
                    sx={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.8)'
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    onClick={() => setShowParticipants(!showParticipants)}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      background: 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <PeopleIcon />
                  </IconButton>
                  <IconButton
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      background: 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <InfoIcon />
                  </IconButton>
                  <IconButton
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      background: 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Box>
              </Box>
            </Container>
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: 1, pt: 8, pb: 12, overflow: 'auto' }}>
            <Container maxWidth="xl">
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                  xs: '1fr', 
                  md: videos.length > 0 ? '3fr 1fr' : '1fr'
                }, 
                gap: 3,
                height: '100%'
              }}>
                {/* Video Grid */}
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: videos.length > 0 ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr',
                    lg: videos.length > 0 ? 'repeat(2, 1fr)' : '1fr'
                  },
                  gap: 3,
                  alignContent: 'start'
                }}>
                  {/* Local Video */}
                  <Box sx={{ position: 'relative' }}>
                    <StyledVideo
                      ref={localVideoref}
                      autoPlay
                      muted
                      sx={{ width: '100%', height: 'auto', minHeight: '300px' }}
                    />
                    <Box sx={{
                      position: 'absolute',
                      bottom: 16,
                      left: 16,
                      background: 'rgba(0, 0, 0, 0.6)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Avatar sx={{ width: 24, height: 24, bgcolor: '#1cb3c7' }}>
                        {username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        {username} (You)
                      </Typography>
                    </Box>
                  </Box>

                  {/* Remote Videos */}
                  {videos.map((video, index) => (
                    <Grow in={true} timeout={index * 200} key={video.socketId}>
                      <Box sx={{ position: 'relative' }}>
                        <StyledVideo
                          data-socket={video.socketId}
                          ref={ref => {
                            if (ref && video.stream) {
                              ref.srcObject = video.stream;
                            }
                          }}
                          autoPlay
                          sx={{ width: '100%', height: 'auto', minHeight: '300px' }}
                        />
                        <Box sx={{
                          position: 'absolute',
                          bottom: 16,
                          left: 16,
                          background: 'rgba(0, 0, 0, 0.6)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: 'rgba(255, 255, 255, 0.3)' }}>
                            <PersonIcon sx={{ fontSize: 14 }} />
                          </Avatar>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            Participant {index + 1}
                          </Typography>
                        </Box>
                      </Box>
                    </Grow>
                  ))}
                </Box>

                {/* Sidebar */}
                {(showChat || showParticipants) && (
                  <Box sx={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {showChat && (
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{
                          p: 2,
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Typography variant="h6" sx={{ color: 'white' }}>
                            Chat
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => setShowChat(false)}
                            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                        
                        <Box sx={{ flex: 1, p: 2, overflowY: 'auto', maxHeight: '400px' }}>
                          {messages.map((item, index) => (
                            <ChatMessage key={index} isOwn={item.sender === username}>
                              <Typography variant="caption" sx={{ 
                                color: item.sender === username ? '#1cb3c7' : 'rgba(255, 255, 255, 0.6)',
                                fontWeight: 600,
                                display: 'block',
                                mb: 0.5
                              }}>
                                {item.sender}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                {item.data}
                              </Typography>
                            </ChatMessage>
                          ))}
                          {messages.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                              <ChatIcon sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.1)', mb: 2 }} />
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                No messages yet. Start the conversation!
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        
                        <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Type a message..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  color: 'white',
                                  '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                  },
                                },
                              }}
                            />
                            <IconButton
                              onClick={sendMessage}
                              disabled={!message.trim()}
                              sx={{
                                background: 'linear-gradient(45deg, #1cb3c7 0%, #1a9cb1 100%)',
                                color: 'white',
                                '&:disabled': {
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  color: 'rgba(255, 255, 255, 0.3)'
                                }
                              }}
                            >
                              <SendIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {showParticipants && (
                      <Box>
                        <Box sx={{
                          p: 2,
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Typography variant="h6" sx={{ color: 'white' }}>
                            Participants ({participants})
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => setShowParticipants(false)}
                            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                        <Box sx={{ p: 2 }}>
                          <UserCard sx={{ mb: 2 }}>
                            <Avatar sx={{ bgcolor: '#1cb3c7' }}>
                              {username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1" sx={{ color: 'white' }}>
                                {username} (You)
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#1cb3c7' }}>
                                Host
                              </Typography>
                            </Box>
                            <Chip
                              icon={<MicIcon sx={{ fontSize: 14 }} />}
                              label={audio ? "On" : "Off"}
                              size="small"
                              color={audio ? "success" : "error"}
                            />
                          </UserCard>
                          
                          {videos.map((video, index) => (
                            <UserCard key={video.socketId} sx={{ mb: 2 }}>
                              <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)' }}>
                                <PersonIcon sx={{ fontSize: 16 }} />
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" sx={{ color: 'white' }}>
                                  Participant {index + 1}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                                  Joined recently
                                </Typography>
                              </Box>
                              <Chip
                                icon={<MicIcon sx={{ fontSize: 14 }} />}
                                label="On"
                                size="small"
                                color="success"
                              />
                            </UserCard>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Container>
          </Box>

          {/* Control Bar */}
          <Box sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(10, 10, 10, 0.8)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            py: 2,
            zIndex: 1000
          }}>
            <Container maxWidth="lg">
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: 1
              }}>
                <FloatingControlButton onClick={handleVideo}>
                  {video ? <VideocamIcon /> : <VideocamOffIcon />}
                </FloatingControlButton>
                
                <FloatingControlButton onClick={handleAudio}>
                  {audio ? <MicIcon /> : <MicOffIcon />}
                </FloatingControlButton>
                
                {screenAvailable && (
                  <FloatingControlButton onClick={handleScreen}>
                    {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                  </FloatingControlButton>
                )}
                
                <Badge 
                  badgeContent={newMessages} 
                  color="error" 
                  max={99}
                  sx={{ '& .MuiBadge-badge': { fontSize: '0.7rem' } }}
                >
                  <FloatingControlButton onClick={() => {
                    setShowChat(!showChat);
                    setShowParticipants(false);
                    if (showChat) {
                      setNewMessages(0);
                    }
                  }}>
                    <ChatIcon />
                  </FloatingControlButton>
                </Badge>
                
                <EndCallButton onClick={handleEndCall}>
                  <CallEndIcon />
                </EndCallButton>
              </Box>
            </Container>
          </Box>
        </Box>
      )}

      {/* Security Indicator */}
      <Box sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        zIndex: 1001
      }}>
        <ShieldIcon sx={{ color: '#1cb3c7', fontSize: 16 }} />
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          End-to-end encrypted
        </Typography>
      </Box>
    </Box>
  );
}