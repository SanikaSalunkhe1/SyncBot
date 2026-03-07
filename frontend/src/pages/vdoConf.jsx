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
    meetVideoContainer: {
        height: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    topBar: {
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,10,15,0.98)',
        backdropFilter: 'blur(10px)',
        flexShrink: 0,
        zIndex: 100,
    },
    topBarLogo: {
        color: '#00d2d3',
        fontWeight: '700',
        fontSize: '18px',
        letterSpacing: '-0.3px',
    },
    topBarCenter: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        color: 'rgba(255,255,255,0.5)',
    },
    topBarRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    participantBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '4px 12px',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
    },
    mainBody: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
    },
    videoArea: {
        flex: 1,
        position: 'relative',
        background: '#06060c',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    conferenceView: {
        width: '100%',
        height: '100%',
        display: 'grid',
        gap: '6px',
        padding: '12px',
        alignContent: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
    },
    videoTile: {
        position: 'relative',
        borderRadius: '10px',
        overflow: 'hidden',
        background: '#111118',
        border: '1px solid rgba(255,255,255,0.06)',
    },
    remoteVideo: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        background: '#111118',
    },
    videoNameTag: {
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        borderRadius: '6px',
        padding: '3px 10px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#fff',
        letterSpacing: '0.01em',
        maxWidth: '180px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    waitingOverlay: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        height: '100%',
        color: 'rgba(255,255,255,0.2)',
    },
    // Self PiP
    selfPipWrapper: {
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        zIndex: 50,
        width: '160px',
    },
    meetUserVideo: {
        width: '160px',
        borderRadius: '10px',
        border: '2px solid rgba(0,210,211,0.45)',
        background: '#111118',
        boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
        aspectRatio: '4/3',
        objectFit: 'cover',
        display: 'block',
    },
    // Chat sidebar
    chatSidebar: {
        width: '320px',
        flexShrink: 0,
        background: '#fff',
        borderLeft: '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    chatHeader: {
        padding: '16px 20px',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        fontWeight: '700',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#111',
        background: '#fff',
        flexShrink: 0,
    },
    chatSubtitle: {
        fontSize: '12px',
        color: '#999',
        fontWeight: '400',
        marginTop: '2px',
    },
    chattingDisplay: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: '#fff',
    },
    messageBubble: {
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
    },
    messageSender: {
        fontSize: '12px',
        fontWeight: '700',
        color: '#00a8a9',
        letterSpacing: '0.01em',
    },
    messageText: {
        fontSize: '13.5px',
        color: '#333',
        lineHeight: 1.5,
        background: '#f4f4f8',
        borderRadius: '0 8px 8px 8px',
        padding: '8px 12px',
        display: 'inline-block',
        maxWidth: '100%',
        wordBreak: 'break-word',
    },
    noMessages: {
        color: '#bbb',
        fontSize: '13px',
        textAlign: 'center',
        marginTop: '20px',
    },
    chattingArea: {
        padding: '12px 14px',
        borderTop: '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        gap: '8px',
        background: '#fff',
        flexShrink: 0,
    },
    chatInput: {
        flex: 1,
        padding: '10px 14px',
        background: '#f0f0f5',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '8px',
        color: '#222',
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
        whiteSpace: 'nowrap',
    },
    bottomContainers: {
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        background: 'rgba(10,10,15,0.98)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
        zIndex: 200,
        padding: '0 20px',
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
    iconBtnActive: {
        background: 'rgba(0,210,211,0.18)',
        border: '1px solid rgba(0,210,211,0.4)',
        color: '#00d2d3',
    },
    iconBtnOff: {
        background: 'rgba(229,57,53,0.18)',
        border: '1px solid rgba(229,57,53,0.4)',
        color: '#e53935',
    },
    endBtn: {
        width: '48px',
        height: '48px',
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
        margin: '0 6px',
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
    timerChip: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.45)',
        fontFamily: 'monospace',
        letterSpacing: '0.05em',
        marginLeft: '8px',
    },
}

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
    People: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
    ),
    Hand: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 7c0-1.38-1.12-2.5-2.5-2.5-.05 0-.09.01-.14.01C18.12 3.42 17.03 2.5 15.75 2.5c-.39 0-.75.09-1.08.24C14.35 1.74 13.49 1 12.5 1c-.88 0-1.63.5-2.03 1.23C10.23 2.09 9.98 2 9.7 2 8.31 2 7.2 3.12 7.2 4.5v5.89c-.43-.42-1.01-.7-1.65-.7C4.12 9.69 3 10.81 3 12.2c0 .61.22 1.17.59 1.61L7.8 19.4C8.97 20.98 11.17 22 13.5 22c3.87 0 7-3.13 7-7V7zM18.5 15c0 2.76-2.24 5-5 5-1.69 0-3.28-.79-4.28-2.12l-4.12-5.62.07-.06c.15-.13.33-.2.53-.2.41 0 .8.32.8.73v3.27h1V4.5c0-.28.22-.5.5-.5s.5.22.5.5V11h1V3.75c0-.69.56-1.25 1.25-1.25S12 3.06 12 3.75V11h1V4.25c0-.69.56-1.25 1.25-1.25s1.25.56 1.25 1.25V11h1V7c0-.28.22-.5.5-.5s.5.22.5.5v8z"/>
        </svg>
    ),
    Record: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="8"/>
        </svg>
    ),
}

function useCallTimer(started) {
    const [elapsed, setElapsed] = useState(0);
    useEffect(() => {
        if (!started) return;
        const interval = setInterval(() => setElapsed(s => s + 1), 1000);
        return () => clearInterval(interval);
    }, [started]);
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    const pad = n => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export default function VideoMeetComponent() {
    var socketRef = useRef();
    let socketIdRef = useRef();

    // FIX: Separate refs for lobby preview and in-meeting self video
    let lobbyVideoRef = useRef();
    let meetingVideoRef = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState(true);
    let [audio, setAudio] = useState(true);
    let [screen, setScreen] = useState(false);
    // FIX: Default screenAvailable to true — always show button, handle error on click
    let [screenAvailable, setScreenAvailable] = useState(true);
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    const videoRef = useRef([]);
    let [videos, setVideos] = useState([]);
    let [inputFocused, setInputFocused] = useState(false);
    let [handRaised, setHandRaised] = useState(false);
    let [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
    let [participantNames, setParticipantNames] = useState({});
    const chatEndRef = useRef(null);
    const callTimer = useCallTimer(!askForUsername);

    const meetingName = window.location.pathname.split('/').pop().replace(/_/g, ' ') || 'Meeting';

    const getPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            window.localStream = stream;
            setVideoAvailable(true);
            setAudioAvailable(true);
            // Try attaching immediately; the useEffect below handles it if ref isn't ready yet
            if (lobbyVideoRef.current) {
                lobbyVideoRef.current.srcObject = stream;
            } else {
                // Retry after DOM has painted
                setTimeout(() => {
                    if (lobbyVideoRef.current) {
                        lobbyVideoRef.current.srcObject = stream;
                    }
                }, 200);
            }
        } catch (error) {
            console.log('Camera/mic error:', error);
            try {
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                window.localStream = audioStream;
                setVideoAvailable(false);
                setAudioAvailable(true);
            } catch (e) {
                setVideoAvailable(false);
                setAudioAvailable(false);
            }
        }
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            setScreenAvailable(true);
        } else {
            setScreenAvailable(false);
        }
    };

    useEffect(() => {
        getPermissions();
    }, []);

    // Attach stream to lobby video element once the ref is mounted and stream is ready
    useEffect(() => {
        if (askForUsername && lobbyVideoRef.current && window.localStream) {
            lobbyVideoRef.current.srcObject = window.localStream;
        }
    }, [askForUsername, lobbyVideoRef.current]);

    // Once meeting starts, attach existing stream to the meeting video element
    useEffect(() => {
        if (!askForUsername && meetingVideoRef.current && window.localStream) {
            meetingVideoRef.current.srcObject = window.localStream;
        }
    }, [askForUsername]);

    // FIX: When video toggle changes, update stream and re-attach to meeting ref
    // 1. Fix the useEffect dependency array

    useEffect(() => {
        if (askForUsername) return;
        updateLocalStream();
    }, [video, audio , videoAvailable, audioAvailable]);   //add deps

// 2. Use a callback ref or setTimeout to attach stream after meeting mounts

    useEffect(() => {
    if (!askForUsername) {
        setTimeout(() => {
            if (meetingVideoRef.current && window.localStream) {
                meetingVideoRef.current.srcObject = window.localStream;
            }
        }, 100); // wait for DOM to render the meeting video element
    }
    }, [askForUsername]);

    const updateLocalStream = async () => {
        try {
            if (!video && !audio) {
                // Both off — use black/silence
                const blackSilence = new MediaStream([black(), silence()]);
                window.localStream = blackSilence;
                if (meetingVideoRef.current) meetingVideoRef.current.srcObject = blackSilence;
                broadcastNewStream(blackSilence);
                return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: video && videoAvailable,
                audio: audio && audioAvailable,
            });
            window.localStream = stream;
            // FIX: Always re-attach to meeting video element after stream update
            if (meetingVideoRef.current) {
                meetingVideoRef.current.srcObject = stream;
            }
            broadcastNewStream(stream);
            stream.getTracks().forEach(track => {
                track.onended = () => {
                    setVideo(false);
                    setAudio(false);
                };
            });
        } catch (e) {
            console.log('getUserMedia error:', e);
        }
    };

    const broadcastNewStream = (stream) => {
        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            try { connections[id].addStream(stream); } catch (e) {}
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                }).catch(e => console.log(e));
            }).catch(e => console.log(e));
        }
    };

    // FIX: Screen share — always attempt, handle errors gracefully
    const startScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            window.localStream = stream;
            if (meetingVideoRef.current) {
                meetingVideoRef.current.srcObject = stream;
            }
            broadcastNewStream(stream);
            setScreen(true);
            // When user stops sharing via browser UI
            stream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };
        } catch (e) {
            console.log('Screen share error:', e);
            setScreen(false);
        }
    };

    const stopScreenShare = async () => {
        setScreen(false);
        // Revert to camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: video && videoAvailable,
                audio: audio && audioAvailable,
            });
            window.localStream = stream;
            if (meetingVideoRef.current) {
                meetingVideoRef.current.srcObject = stream;
            }
            broadcastNewStream(stream);
        } catch (e) {
            console.log('Revert camera error:', e);
        }
    };

    const handleScreen = () => {
        if (screen) {
            stopScreenShare();
        } else {
            startScreenShare();
        }
    };

    let gotMessageFromServer = (fromId, message) => {
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

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });
        socketRef.current.on('signal', gotMessageFromServer);
        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href);
            socketIdRef.current = socketRef.current.id;
            socketRef.current.on('chat-message', addMessage);
            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
                setParticipantNames(prev => { const n = { ...prev }; delete n[id]; return n; });
            });
            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    };
                    connections[socketListId].onaddstream = (event) => {
                        let videoExists = videoRef.current.find(v => v.socketId === socketListId);
                        if (videoExists) {
                            setVideos(videos => {
                                const updatedVideos = videos.map(v =>
                                    v.socketId === socketListId ? { ...v, stream: event.stream } : v);
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            let newVideo = { socketId: socketListId, stream: event.stream, autoplay: true, playsinline: true };
                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream);
                    } else {
                        const bs = new MediaStream([black(), silence()]);
                        window.localStream = bs;
                        connections[socketListId].addStream(bs);
                    }
                });
                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue;
                        try { connections[id2].addStream(window.localStream); } catch (e) {}
                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }));
                            }).catch(e => console.log(e));
                        }).catch(e => console.log(e));
                    }
                }
            });
        });
    };

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    };

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    };

    const handleRecording = () => {
        if (isRecording) {
            // Stop recording
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            setIsRecording(false);
        } else {
            // Start recording — capture all visible video streams + audio
            try {
                const streams = [];
                // Add remote participant streams
                videoRef.current.forEach(v => { if (v.stream) streams.push(v.stream); });
                // Add local stream
                if (window.localStream) streams.push(window.localStream);

                // Merge all tracks into one composite stream
                const allTracks = [];
                streams.forEach(s => s.getTracks().forEach(t => allTracks.push(t)));

                const compositeStream = new MediaStream(allTracks);

                recordedChunksRef.current = [];
                const options = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
                    ? { mimeType: 'video/webm;codecs=vp9' }
                    : { mimeType: 'video/webm' };

                const recorder = new MediaRecorder(compositeStream, options);
                mediaRecorderRef.current = recorder;

                recorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) {
                        recordedChunksRef.current.push(e.data);
                    }
                };

                recorder.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${meetingName.replace(/\s+/g, '_')}_recording_${Date.now()}.webm`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    recordedChunksRef.current = [];
                };

                recorder.start(1000); // collect data every second
                setIsRecording(true);
            } catch (e) {
                console.error('Recording error:', e);
            }
        }
    };

    let handleVideo = () => { setVideo(v => !v); };
    let handleAudio = () => { setAudio(a => !a); };

    let handleEndCall = () => {
        try {
            if (meetingVideoRef.current && meetingVideoRef.current.srcObject) {
                meetingVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        } catch (e) {}
        window.location.href = "/";
    };

    let handleRaiseHand = () => {
        setHandRaised(h => !h);
        if (!handRaised && socketRef.current) {
            socketRef.current.emit('chat-message', `✋ ${username} raised their hand`, username);
        }
    };

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prev) => [...prev, { sender, data }]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prev) => prev + 1);
        }
    };

    let sendMessage = () => {
        if (!message.trim()) return;
        socketRef.current.emit('chat-message', message, username);
        setMessage("");
    };

    let connect = () => {
        setAskForUsername(false);
        connectToSocketServer();
    };

    // Auto-scroll chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const getGridStyle = (count) => {
        const base = { ...styles.conferenceView };
        if (count === 0) return { ...base, gridTemplateColumns: '1fr' };
        if (count === 1) return { ...base, gridTemplateColumns: '1fr', gridTemplateRows: '1fr' };
        if (count === 2) return { ...base, gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr' };
        if (count <= 4) return { ...base, gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' };
        return { ...base, gridTemplateColumns: 'repeat(3, 1fr)' };
    };

    const totalParticipants = videos.length + 1;

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
                .pip-self { transition: all 0.2s; }
                .pip-self:hover { transform: scale(1.03); }
                .record-dot { animation: blink 1s infinite; }
                @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
            `}</style>

            {askForUsername ? (
                /* ── LOBBY ── */
                <div style={styles.lobbyWrapper}>
                    <div style={styles.lobbyCard}>
                        <div style={styles.lobbyHeader}>
                            <div style={styles.logo}>SyncMeet</div>
                            <div style={styles.lobbyTitle}>Enter into Lobby</div>
                            <div style={styles.lobbySubtitle}>
                                Joining: <strong style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>{meetingName}</strong>
                            </div>
                        </div>

                        {/* FIX: Lobby uses its own ref so the stream isn't lost on meeting mount */}
                        <div style={styles.videoPreviewBox}>
                            <video ref={lobbyVideoRef} autoPlay muted style={styles.videoPreview}></video>
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
                /* ── MEETING ROOM ── */
                <div style={styles.meetVideoContainer}>
                    {/* TOP BAR */}
                    <div style={styles.topBar}>
                        <div style={styles.topBarLogo}>SyncMeet</div>
                        <div style={styles.topBarCenter}>
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'capitalize' }}>
                                {meetingName}
                            </span>
                            <span style={styles.timerChip}>{callTimer}</span>
                            {isRecording && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#e53935', fontSize: '11px', fontWeight: '700', marginLeft: '8px' }}>
                                    <span className="record-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e53935', display: 'inline-block' }}></span>
                                    REC
                                </span>
                            )}
                        </div>
                        <div style={styles.topBarRight}>
                            <div style={styles.participantBadge}>
                                <Icons.People />
                                {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}
                            </div>
                            {username && (
                                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{username}</span>
                            )}
                        </div>
                    </div>

                    {/* MAIN BODY */}
                    <div style={styles.mainBody}>
                        {/* VIDEO AREA */}
                        <div style={styles.videoArea}>
                            <div style={getGridStyle(videos.length)}>
                                {videos.map((v) => (
                                    <div key={v.socketId} style={styles.videoTile}>
                                        <video
                                            style={styles.remoteVideo}
                                            data-socket={v.socketId}
                                            ref={ref => { if (ref && v.stream) ref.srcObject = v.stream; }}
                                            autoPlay
                                        />
                                        <div style={styles.videoNameTag}>
                                            {participantNames[v.socketId] || 'Participant'}
                                        </div>
                                    </div>
                                ))}
                                {videos.length === 0 && (
                                    <div style={styles.waitingOverlay}>
                                        <Icons.Video />
                                        <span style={{ fontSize: '14px' }}>Waiting for others to join...</span>
                                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.15)' }}>Share the meeting link to invite people</span>
                                    </div>
                                )}
                            </div>

                            {/* FIX: Self PiP uses meetingVideoRef — separate from lobby ref */}
                            <div className="pip-self" style={styles.selfPipWrapper}>
                                <video
                                    ref={meetingVideoRef}
                                    style={styles.meetUserVideo}
                                    autoPlay
                                    muted
                                />
                                <div style={{
                                    background: 'rgba(0,0,0,0.6)',
                                    borderRadius: '0 0 8px 8px',
                                    padding: '3px 8px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#00d2d3',
                                    textAlign: 'center',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                }}>
                                    {username || 'You'} (You)
                                </div>
                                {handRaised && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-8px',
                                        right: '-8px',
                                        background: '#fbbf24',
                                        borderRadius: '50%',
                                        width: '26px',
                                        height: '26px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                                    }}>✋</div>
                                )}
                            </div>
                        </div>

                        {/* CHAT SIDEBAR */}
                        <div style={styles.chatSidebar}>
                            <div style={styles.chatHeader}>
                                <div>
                                    <div>Chat</div>
                                    <div style={styles.chatSubtitle}>{messages.length} message{messages.length !== 1 ? 's' : ''}</div>
                                </div>
                                {newMessages > 0 && (
                                    <div style={{
                                        background: '#00d2d3',
                                        color: '#fff',
                                        borderRadius: '99px',
                                        fontSize: '11px',
                                        fontWeight: '800',
                                        minWidth: '20px',
                                        height: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0 6px',
                                        cursor: 'pointer',
                                    }} onClick={() => setNewMessages(0)}>
                                        {newMessages > 99 ? '99+' : newMessages} new
                                    </div>
                                )}
                            </div>
                            <div style={styles.chattingDisplay}>
                                {messages.length !== 0 ? messages.map((item, index) => (
                                    <div style={styles.messageBubble} key={index}>
                                        <div style={styles.messageSender}>{item.sender}</div>
                                        <div style={styles.messageText}>{item.data}</div>
                                    </div>
                                )) : (
                                    <div style={styles.noMessages}>No Messages Yet</div>
                                )}
                                <div ref={chatEndRef} />
                            </div>
                            <div style={styles.chattingArea}>
                                <input
                                    style={styles.chatInput}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Enter Your chat"
                                    onKeyDown={e => e.key === 'Enter' && message.trim() && sendMessage()}
                                />
                                <button style={styles.sendBtn} onClick={sendMessage}>SEND</button>
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM CONTROLS */}
                    <div style={styles.bottomContainers}>
                        {/* Camera toggle */}
                        <button
                            className="icon-btn"
                            style={{ ...styles.iconBtn, ...(!video ? styles.iconBtnOff : {}) }}
                            onClick={handleVideo}
                            title={video ? "Turn off camera" : "Turn on camera"}
                        >
                            {video ? <Icons.Video /> : <Icons.VideoOff />}
                        </button>

                        {/* Mic toggle */}
                        <button
                            className="icon-btn"
                            style={{ ...styles.iconBtn, ...(!audio ? styles.iconBtnOff : {}) }}
                            onClick={handleAudio}
                            title={audio ? "Mute" : "Unmute"}
                        >
                            {audio ? <Icons.Mic /> : <Icons.MicOff />}
                        </button>

                        {/* FIX: Screen share — always visible, no conditional rendering */}
                        {screenAvailable && (
                            <button
                                className="icon-btn"
                                style={{ ...styles.iconBtn, ...(screen ? styles.iconBtnActive : {}) }}
                                onClick={handleScreen}
                                title={screen ? "Stop sharing screen" : "Share screen"}
                            >
                                {screen ? <Icons.Screen /> : <Icons.ScreenOff />}
                            </button>
                        )}

                        {/* Raise hand */}
                        <button
                            className="icon-btn"
                            style={{
                                ...styles.iconBtn,
                                ...(handRaised ? { background: 'rgba(251,191,36,0.2)', border: '1px solid rgba(251,191,36,0.5)', color: '#fbbf24' } : {})
                            }}
                            onClick={handleRaiseHand}
                            title={handRaised ? "Lower hand" : "Raise hand"}
                        >
                            <Icons.Hand />
                        </button>

                        {/* Record */}
                        <button
                            className="icon-btn"
                            style={{
                                ...styles.iconBtn,
                                ...(isRecording ? { background: 'rgba(229,57,53,0.2)', border: '1px solid rgba(229,57,53,0.5)', color: '#e53935' } : {})
                            }}
                            onClick={handleRecording}
                            title={isRecording ? "Stop recording" : "Start recording"}
                        >
                            <Icons.Record />
                        </button>

                        {/* End call */}
                        <button style={styles.endBtn} onClick={handleEndCall} title="End call">
                            <Icons.CallEnd />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}