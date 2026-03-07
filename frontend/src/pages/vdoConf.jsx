import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import server from '../environment';

const server_url = server;
var connections = {};
const peerConfigConnections = {
    "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }]
}

const styles = {
    root: {
        fontFamily: "'Syne', 'Inter', sans-serif",
        background: '#0a0a0f',
        minHeight: '100vh',
        color: '#fff',
    },
    // ── LOBBY ──
    lobbyWrapper: {
        minHeight: '100vh',
        background: 'radial-gradient(ellipse 80% 60% at 70% 40%, rgba(0,210,211,0.07) 0%, transparent 65%), #0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    lobbyCard: {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(0,210,211,0.18)',
        borderRadius: '20px',
        padding: '48px 52px',
        width: '100%',
        maxWidth: '480px',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 8px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,210,211,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
    },
    lobbyHeader: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    logo: {
        color: '#00d2d3',
        fontSize: '22px',
        fontWeight: '700',
        letterSpacing: '-0.5px',
        marginBottom: '8px',
    },
    lobbyTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#fff',
        lineHeight: 1.2,
        letterSpacing: '-0.5px',
    },
    lobbySubtitle: {
        fontSize: '14px',
        color: 'rgba(255,255,255,0.45)',
        fontWeight: '400',
    },
    divider: {
        height: '1px',
        background: 'rgba(255,255,255,0.07)',
    },
    videoPreviewBox: {
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#111118',
        aspectRatio: '16/9',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoPreview: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    },
    videoOverlay: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)',
        pointerEvents: 'none',
    },
    noVideoPlaceholder: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        color: 'rgba(255,255,255,0.3)',
        fontSize: '13px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    inputLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
    },
    input: {
        width: '100%',
        padding: '13px 16px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '15px',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
    },
    connectBtn: {
        width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, #00d2d3 0%, #00a8a9 100%)',
        border: 'none',
        borderRadius: '10px',
        color: '#0a0a0f',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        letterSpacing: '0.02em',
        transition: 'opacity 0.2s, transform 0.15s',
        fontFamily: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    // ── MEETING ROOM ──────────────────────────────────────────
    meetVideoContainer: {
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
    },
    topBar: {
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,10,15,0.95)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    topBarLogo: {
        color: '#00d2d3',
        fontWeight: '700',
        fontSize: '18px',
        letterSpacing: '-0.3px',
    },
    conferenceView: {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '8px',
        padding: '16px',
        alignContent: 'start',
    },
    remoteVideo: {
        width: '100%',
        borderRadius: '12px',
        background: '#111118',
        aspectRatio: '16/9',
        objectFit: 'cover',
    },
    meetUserVideo: {
        position: 'fixed',
        bottom: '88px',
        right: '20px',
        width: '180px',
        borderRadius: '12px',
        border: '2px solid rgba(0,210,211,0.4)',
        zIndex: 50,
        background: '#111118',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    },
    bottomContainers: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        background: 'rgba(10,10,15,0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        zIndex: 200,
    },
    iconBtn: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.06)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.2s',
        fontSize: '18px',
        outline: 'none',
    },
    endBtn: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        border: 'none',
        background: '#e53935',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '18px',
        outline: 'none',
    },
    chatRoom: {
        position: 'fixed',
        right: '20px',
        top: '70px',
        bottom: '80px',
        width: '320px',
        background: 'rgba(15,15,22,0.97)',
        border: '1px solid rgba(0,210,211,0.15)',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 150,
        overflow: 'hidden',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
    },
    chatHeader: {
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        fontWeight: '700',
        fontSize: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    chattingDisplay: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
    },
    messageBubble: {
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '10px',
        padding: '10px 14px',
    },
    messageSender: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#00d2d3',
        marginBottom: '4px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    messageText: {
        fontSize: '13px',
        color: 'rgba(255,255,255,0.85)',
        lineHeight: 1.5,
    },
    chattingArea: {
        padding: '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        gap: '8px',
    },
    chatInput: {
        flex: 1,
        padding: '10px 14px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '13px',
        outline: 'none',
        fontFamily: 'inherit',
    },
    sendBtn: {
        padding: '10px 16px',
        background: '#00d2d3',
        border: 'none',
        borderRadius: '8px',
        color: '#0a0a0f',
        fontWeight: '700',
        fontSize: '13px',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    badge: {
        position: 'relative',
        display: 'inline-flex',
    },
    badgeDot: {
        position: 'absolute',
        top: '-4px',
        right: '-4px',
        background: '#00d2d3',
        color: '#0a0a0f',
        borderRadius: '99px',
        fontSize: '10px',
        fontWeight: '800',
        minWidth: '18px',
        height: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 4px',
    },
}

// SVG icons inline
const Icons = {
    Video: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/>
        </svg>
    ),
    VideoOff: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 6.5l-4 4V7a1 1 0 0 0-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/>
        </svg>
    ),
    Mic: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
    ),
    MicOff: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
        </svg>
    ),
    CallEnd: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28a16.8 16.8 0 0 0-2.66-1.85.996.996 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>
        </svg>
    ),
    Screen: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
        </svg>
    ),
    ScreenOff: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.79 18.21L3.79 .21 2.5 1.5l2.56 2.56C4.39 4.36 4 4.94 4 5.61V18H0v2h18.11l1.68 1.68 1.29-1.29-1.28-1.18zM6 16V5.89L16.11 16H6zm14 0h-1.79l2 2H22V6c0-1.1-.9-2-2-2H7.68l2 2H20v10z"/>
        </svg>
    ),
    Chat: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
    ),
    CameraIcon: () => (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="rgba(255,255,255,0.2)">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
    ),
}

export default function VideoMeetComponent() {
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModal, setModal] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([])
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    const videoRef = useRef([])
    let [videos, setVideos] = useState([])
    let [inputFocused, setInputFocused] = useState(false);

    useEffect(() => { getPermissions(); }, []);

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then(() => {}).catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) { setVideoAvailable(true); } else { setVideoAvailable(false); }
            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) { setAudioAvailable(true); } else { setAudioAvailable(false); }
            if (navigator.mediaDevices.getDisplayMedia) { setScreenAvailable(true); } else { setScreenAvailable(false); }
            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) { localVideoref.current.srcObject = userMediaStream; }
                }
            }
        } catch (error) { console.log(error); }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) { getUserMedia(); }
    }, [video, audio])

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let getUserMediaSuccess = (stream) => {
        try { window.localStream.getTracks().forEach(track => track.stop()) } catch (e) { console.log(e) }
        window.localStream = stream;
        localVideoref.current.srcObject = stream;
        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                }).catch(e => console.log(e))
            })
        }
        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false); setAudio(false);
            try { let tracks = localVideoref.current.srcObject.getTracks(); tracks.forEach(track => track.stop()) } catch (e) { console.log(e) }
            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence(); localVideoref.current.srcObject = window.localStream;
            for (let id in connections) {
                connections[id].addStream(window.localStream);
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description).then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    }).catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess).then(() => {}).catch((e) => console.log(e))
        } else {
            try { let tracks = localVideoref.current.srcObject.getTracks(); tracks.forEach(track => track.stop()) } catch (e) {}
        }
    }

    let getDislayMediaSuccess = (stream) => {
        try { window.localStream.getTracks().forEach(track => track.stop()) } catch (e) { console.log(e) }
        window.localStream = stream; localVideoref.current.srcObject = stream;
        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            connections[id].addStream(window.localStream);
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                }).catch(e => console.log(e))
            })
        }
        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);
            try { let tracks = localVideoref.current.srcObject.getTracks(); tracks.forEach(track => track.stop()) } catch (e) { console.log(e) }
            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence(); localVideoref.current.srcObject = window.localStream;
            getUserMedia();
        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message);
        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }
            if (signal.ice) { connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e)) }
        }
    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });
        socketRef.current.on('signal', gotMessageFromServer);
        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href);
            socketIdRef.current = socketRef.current.id;
            socketRef.current.on('chat-message', addMessage);
            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
            });
            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    };
                    connections[socketListId].onaddstream = (event) => {
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);
                        if (videoExists) {
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video);
                                videoRef.current = updatedVideos; return updatedVideos;
                            });
                        } else {
                            let newVideo = { socketId: socketListId, stream: event.stream, autoplay: true, playsinline: true };
                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos; return updatedVideos;
                            });
                        }
                    };
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream);
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }
                });
                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue;
                        try { connections[id2].addStream(window.localStream) } catch (e) {}
                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                            }).catch(e => console.log(e))
                        })
                    }
                }
            });
        });
    }

    let silence = () => {
        let ctx = new AudioContext(); let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start(); ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    }

    let handleVideo = () => { setVideo(!video); }
    let handleAudio = () => { setAudio(!audio); }
    useEffect(() => { if (screen !== undefined) { getDislayMedia(); } }, [screen])
    let handleScreen = () => { setScreen(!screen); }
    let handleEndCall = () => {
        try { let tracks = localVideoref.current.srcObject.getTracks(); tracks.forEach(track => track.stop()) } catch (e) {}
        window.location.href = "/";
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [...prevMessages, { sender: sender, data: data }]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prev) => prev + 1);
        }
    };

    let sendMessage = () => {
        socketRef.current.emit('chat-message', message, username);
        setMessage("");
    }

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    return (
        <div style={styles.root}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                input:focus { border-color: rgba(0,210,211,0.5) !important; box-shadow: 0 0 0 3px rgba(0,210,211,0.1) !important; }
                button:hover { opacity: 0.88; }
                button:active { transform: scale(0.97); }
                .icon-btn:hover { background: rgba(255,255,255,0.12) !important; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(0,210,211,0.3); border-radius: 4px; }
            `}</style>

            {askForUsername ? (
                <div style={styles.lobbyWrapper}>
                    <div style={styles.lobbyCard}>
                        <div style={styles.lobbyHeader}>
                            <div style={styles.logo}>SyncMeet</div>
                            <div style={styles.lobbyTitle}>Enter into Lobby</div>
                            <div style={styles.lobbySubtitle}>Set up your camera and join the meeting</div>
                        </div>

                        <div style={styles.videoPreviewBox}>
                            <video ref={localVideoref} autoPlay muted style={styles.videoPreview}></video>
                            <div style={styles.videoOverlay}></div>
                        </div>

                        <div style={styles.divider}></div>

                        <div style={styles.inputGroup}>
                            <label style={styles.inputLabel}>Your Display Name</label>
                            <input
                                style={{
                                    ...styles.input,
                                    borderColor: inputFocused ? 'rgba(0,210,211,0.5)' : 'rgba(255,255,255,0.1)',
                                    boxShadow: inputFocused ? '0 0 0 3px rgba(0,210,211,0.1)' : 'none',
                                }}
                                type="text"
                                placeholder="e.g. Alex Johnson"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                onFocus={() => setInputFocused(true)}
                                onBlur={() => setInputFocused(false)}
                                onKeyDown={e => e.key === 'Enter' && username.trim() && connect()}
                            />
                        </div>

                        <button
                            style={{
                                ...styles.connectBtn,
                                opacity: !username.trim() ? 0.5 : 1,
                                cursor: !username.trim() ? 'not-allowed' : 'pointer',
                            }}
                            onClick={connect}
                            disabled={!username.trim()}
                        >
                            <Icons.Video />
                            Join Meeting
                        </button>
                    </div>
                </div>
            ) : (
                <div style={styles.meetVideoContainer}>
                    <div style={styles.topBar}>
                        <div style={styles.topBarLogo}>SyncMeet</div>
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                            {username && <span style={{ color: 'rgba(255,255,255,0.7)' }}>{username}</span>}
                        </div>
                    </div>

                    <div style={styles.conferenceView}>
                        {videos.map((v) => (
                            <div key={v.socketId} style={{ position: 'relative' }}>
                                <video
                                    style={styles.remoteVideo}
                                    data-socket={v.socketId}
                                    ref={ref => { if (ref && v.stream) { ref.srcObject = v.stream; } }}
                                    autoPlay
                                ></video>
                            </div>
                        ))}
                        {videos.length === 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'rgba(255,255,255,0.2)', flexDirection: 'column', gap: '12px' }}>
                                <Icons.Video />
                                <span style={{ fontSize: '14px' }}>Waiting for others to join...</span>
                            </div>
                        )}
                    </div>

                    {showModal && (
                        <div style={styles.chatRoom}>
                            <div style={styles.chatHeader}>
                                <Icons.Chat />
                                <span>Chat</span>
                            </div>
                            <div style={styles.chattingDisplay}>
                                {messages.length !== 0 ? messages.map((item, index) => (
                                    <div style={styles.messageBubble} key={index}>
                                        <div style={styles.messageSender}>{item.sender}</div>
                                        <div style={styles.messageText}>{item.data}</div>
                                    </div>
                                )) : (
                                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
                                        No messages yet
                                    </div>
                                )}
                            </div>
                            <div style={styles.chattingArea}>
                                <input
                                    style={styles.chatInput}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    onKeyDown={e => e.key === 'Enter' && message.trim() && sendMessage()}
                                />
                                <button style={styles.sendBtn} onClick={sendMessage}>Send</button>
                            </div>
                        </div>
                    )}

                    <video style={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

                    <div style={styles.bottomContainers}>
                        <button className="icon-btn" style={styles.iconBtn} onClick={handleVideo} title={video ? "Turn off camera" : "Turn on camera"}>
                            {video ? <Icons.Video /> : <Icons.VideoOff />}
                        </button>
                        <button style={styles.endBtn} onClick={handleEndCall} title="End call">
                            <Icons.CallEnd />
                        </button>
                        <button className="icon-btn" style={styles.iconBtn} onClick={handleAudio} title={audio ? "Mute" : "Unmute"}>
                            {audio ? <Icons.Mic /> : <Icons.MicOff />}
                        </button>
                        {screenAvailable && (
                            <button className="icon-btn" style={styles.iconBtn} onClick={handleScreen} title={screen ? "Stop sharing" : "Share screen"}>
                                {screen ? <Icons.Screen /> : <Icons.ScreenOff />}
                            </button>
                        )}
                        <div style={styles.badge}>
                            <button className="icon-btn" style={styles.iconBtn} onClick={() => { setModal(!showModal); setNewMessages(0); }} title="Chat">
                                <Icons.Chat />
                            </button>
                            {newMessages > 0 && (
                                <div style={styles.badgeDot}>{newMessages > 99 ? '99+' : newMessages}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}