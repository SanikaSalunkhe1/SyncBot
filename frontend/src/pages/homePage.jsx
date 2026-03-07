import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { 
  Button, 
  IconButton, 
  TextField, 
  Box, 
  Typography,
  Container,
  Paper,
  InputAdornment,
  alpha
} from '@mui/material';
import {
  Restore as RestoreIcon,
  VideoCall as VideoCallIcon,
  Logout as LogoutIcon,
  Videocam as VideocamIcon,
  ArrowForward as ArrowForwardIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, #1cb3c7 0%, #1a9cb1 100%)`,
  color: 'white',
  fontWeight: 600,
  padding: '12px 32px',
  borderRadius: '12px',
  boxShadow: '0 4px 15px rgba(28, 179, 199, 0.3)',
  transition: 'all 0.3s ease',
  textTransform: 'none',
  '&:hover': {
    background: `linear-gradient(45deg, #1a9cb1 0%, #1cb3c7 100%)`,
    boxShadow: '0 6px 20px rgba(28, 179, 199, 0.4)',
    transform: 'translateY(-2px)'
  },
  '&:active': {
    transform: 'translateY(0)'
  }
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '20px',
  padding: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#1cb3c7',
        borderWidth: '2px'
      }
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: '#1cb3c7'
    }
  },
  '& .MuiInputBase-input': {
    color: 'white',
    fontSize: '16px',
    padding: '16px 14px'
  }
}));

const NavButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'rgba(28, 179, 199, 0.1)',
  color: '#1cb3c7',
  borderRadius: '12px',
  padding: '12px',
  margin: '0 8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(28, 179, 199, 0.2)',
    transform: 'translateY(-2px)'
  }
}));

export default function HomePage() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { addToUserHistory, logout } = useContext(AuthContext);

  const handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) return;
    await addToUserHistory(meetingCode);
    navigate(`/meet/${meetingCode}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleJoinVideoCall();
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      color: 'white',
      overflow: 'hidden'
    }}>
      {/* Navigation Bar */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(10, 10, 10, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        py: 2,
        px: 4
      }}>
        <Container maxWidth="xl">
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer'
              }} onClick={() => navigate('/')}>
                <Typography variant="h4" sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(45deg, #1cb3c7 30%, #ffffff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px'
                }}>
                  SyncMeet
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <NavButton 
                  onClick={() => navigate('/history')}
                  title="Meeting History"
                >
                  <HistoryIcon />
                </NavButton>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  ml: 1,
                  mr: 2
                }}>
                  History
                </Typography>
              </Box>
              
              <Button
                onClick={logout}
                startIcon={<LogoutIcon />}
                sx={{
                  color: '#ff6b6b',
                  border: '1px solid rgba(255, 107, 107, 0.3)',
                  borderRadius: '12px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderColor: '#ff6b6b',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ pt: 15 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 6,
          alignItems: 'center',
          minHeight: 'calc(100vh - 200px)'
        }}>
          {/* Left Panel */}
          <Box>
            <GlassCard elevation={0}>
              <Typography variant="h1" sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 800,
                lineHeight: 1.2,
                mb: 3,
                background: 'linear-gradient(45deg, #ffffff 30%, #1cb3c7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Premium Video Calls,
                <br />
                <Box component="span" sx={{ color: '#1cb3c7' }}>
                  Seamless Experience
                </Box>
              </Typography>
              
              <Typography variant="h6" sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 5,
                fontSize: '1.2rem',
                lineHeight: 1.6
              }}>
                Experience crystal-clear video calls with SyncMeet. Join meetings instantly 
                or start your own. Quality communication for quality connections.
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{
                  color: '#1cb3c7',
                  mb: 2,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <VideocamIcon /> Join a Meeting
                </Typography>
                
                <Box sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  <StyledTextField
                    fullWidth
                    variant="outlined"
                    placeholder="Enter meeting code"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value)}
                    onKeyPress={handleKeyPress}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: '#1cb3c7',
                            animation: 'pulse 2s infinite'
                          }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        height: '56px'
                      }
                    }}
                  />
                  
                  <GradientButton
                    onClick={handleJoinVideoCall}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      height: '56px',
                      minWidth: '140px'
                    }}
                  >
                    Join Now
                  </GradientButton>
                </Box>
                
                <Typography variant="caption" sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  mt: 1,
                  display: 'block'
                }}>
                  Press Enter to join quickly
                </Typography>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                gap: 3,
                flexWrap: 'wrap'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#1cb3c7'
                  }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    HD Video Quality
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#1cb3c7'
                  }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    End-to-End Encrypted
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#1cb3c7'
                  }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    No Time Limits
                  </Typography>
                </Box>
              </Box>
            </GlassCard>
          </Box>

          {/* Right Panel */}
          <Box sx={{
            position: 'relative',
            display: { xs: 'none', md: 'block' }
          }}>
            <Box sx={{
              position: 'relative',
              zIndex: 1,
              '& img': {
                width: '100%',
                height: 'auto',
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                transform: 'perspective(1000px) rotateY(-10deg)',
                transition: 'transform 0.5s ease',
                '&:hover': {
                  transform: 'perspective(1000px) rotateY(0deg)'
                }
              }
            }}>
              <img 
                srcSet="/mobile2.png" 
                alt="SyncMeet Video Call Interface"
                style={{ objectFit: 'contain' }}
              />
            </Box>
            
            {/* Decorative elements */}
            <Box sx={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(28, 179, 199, 0.1) 0%, transparent 70%)',
              zIndex: 0
            }} />
            
            <Box sx={{
              position: 'absolute',
              bottom: -60,
              left: -60,
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(28, 179, 199, 0.05) 0%, transparent 70%)',
              zIndex: 0
            }} />
          </Box>
        </Box>

        {/* Floating Animation */}
        <style jsx="true">{`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </Container>
    </Box>
  );
}