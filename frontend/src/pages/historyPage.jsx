import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Container,
  Grid,
  Chip,
  Paper,
  Skeleton,
  alpha,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Home as HomeIcon,
  History as HistoryIcon,
  Videocam as VideocamIcon,
  AccessTime as AccessTimeIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: 'rgba(28, 179, 199, 0.5)',
    boxShadow: '0 12px 40px rgba(28, 179, 199, 0.15)',
    '& .join-button': {
      opacity: 1,
      transform: 'translateX(0)'
    }
  }
}));

const EmptyStateCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.03)',
  border: '2px dashed rgba(255, 255, 255, 0.1)',
  borderRadius: '20px',
  padding: theme.spacing(8, 4),
  textAlign: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: 'rgba(28, 179, 199, 0.3)',
    background: 'rgba(28, 179, 199, 0.02)'
  }
}));

const JoinButton = styled(IconButton)(({ theme }) => ({
  background: 'linear-gradient(45deg, #1cb3c7 0%, #1a9cb1 100%)',
  color: 'white',
  opacity: 0,
  transform: 'translateX(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #1a9cb1 0%, #1cb3c7 100%)',
    transform: 'translateX(10px) scale(1.1)'
  }
}));

const NavButton = styled(IconButton)(({ theme }) => ({
  background: 'rgba(28, 179, 199, 0.1)',
  color: '#1cb3c7',
  borderRadius: '12px',
  padding: '12px',
  marginRight: '16px',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(28, 179, 199, 0.2)',
    transform: 'translateY(-2px)'
  }
}));

export default function HistoryPage() {
  const { getHistoryOfUser, addToUserHistory } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} • ${hours}:${minutes}`;
  };

  const getDayDifference = (dateString) => {
    const meetingDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - meetingDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const handleJoinMeeting = async (meetingCode) => {
    try {
      await addToUserHistory(meetingCode);
      navigate(`/meet/${meetingCode}`);
    } catch (error) {
      console.error('Failed to join meeting:', error);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      color: 'white',
      py: 8
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 6
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NavButton onClick={() => navigate("/home")}>
              <HomeIcon />
            </NavButton>
            <Box>
              <Typography variant="h3" sx={{
                fontWeight: 800,
                background: 'linear-gradient(45deg, #1cb3c7 30%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <HistoryIcon sx={{ fontSize: 36 }} />
                Meeting History
              </Typography>
              <Typography variant="body1" sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mt: 1
              }}>
                View and rejoin your recent meetings
              </Typography>
            </Box>
          </Box>

          <Chip
            label={`${meetings.length} Meetings`}
            sx={{
              background: 'rgba(28, 179, 199, 0.1)',
              color: '#1cb3c7',
              fontWeight: 600,
              fontSize: '0.9rem',
              px: 2,
              py: 1
            }}
          />
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 6 }} />

        {/* Loading State */}
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((item) => (
              <Grid item xs={12} md={6} key={item}>
                <Skeleton
                  variant="rounded"
                  height={120}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px'
                  }}
                />
              </Grid>
            ))}
          </Grid>
        ) : meetings.length === 0 ? (
          // Empty State
          <EmptyStateCard elevation={0}>
            <HistoryIcon sx={{
              fontSize: 80,
              color: 'rgba(255, 255, 255, 0.1)',
              mb: 3
            }} />
            <Typography variant="h5" sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              mb: 2,
              fontWeight: 600
            }}>
              No Meeting History Yet
            </Typography>
            <Typography variant="body1" sx={{
              color: 'rgba(255, 255, 255, 0.5)',
              mb: 4,
              maxWidth: '400px',
              mx: 'auto'
            }}>
              Your joined meetings will appear here. Start by joining a meeting from the home page.
            </Typography>
            <IconButton
              onClick={() => navigate("/home")}
              sx={{
                background: 'linear-gradient(45deg, #1cb3c7 0%, #1a9cb1 100%)',
                color: 'white',
                borderRadius: '12px',
                px: 4,
                py: 1.5,
                '&:hover': {
                  background: 'linear-gradient(45deg, #1a9cb1 0%, #1cb3c7 100%)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Go to Home
              <ArrowForwardIcon sx={{ ml: 1 }} />
            </IconButton>
          </EmptyStateCard>
        ) : (
          // Meetings List
          <Grid container spacing={3}>
            {meetings.map((meeting, index) => (
              <Grid item xs={12} md={6} key={meeting.meetingCode + index}>
                <StyledCard onClick={() => handleJoinMeeting(meeting.meetingCode)}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2
                    }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CodeIcon sx={{ fontSize: 20, color: '#1cb3c7' }} />
                          <Typography variant="h6" sx={{
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '1.1rem'
                          }}>
                            {meeting.meetingCode}
                          </Typography>
                        </Box>
                        
                        <Chip
                          label={getDayDifference(meeting.date)}
                          size="small"
                          sx={{
                            background: 'rgba(28, 179, 199, 0.15)',
                            color: '#1cb3c7',
                            fontSize: '0.75rem',
                            height: '24px',
                            mb: 2
                          }}
                        />
                      </Box>

                      <JoinButton className="join-button" size="small">
                        <VideocamIcon fontSize="small" />
                      </JoinButton>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon sx={{ 
                          fontSize: 16, 
                          color: 'rgba(255, 255, 255, 0.6)' 
                        }} />
                        <Typography variant="body2" sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.85rem'
                        }}>
                          {formatDate(meeting.date)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        width: '4px', 
                        height: '4px', 
                        borderRadius: '50%', 
                        background: 'rgba(255, 255, 255, 0.3)' 
                      }} />
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon sx={{ 
                          fontSize: 16, 
                          color: 'rgba(255, 255, 255, 0.6)' 
                        }} />
                        <Typography variant="body2" sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.85rem'
                        }}>
                          {new Date(meeting.date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Progress bar for time indicator */}
                    <Box sx={{ 
                      width: '100%', 
                      height: '3px', 
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '2px',
                      mt: 2,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{
                        width: `${Math.min(index * 20 + 30, 100)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #1cb3c7 0%, rgba(28, 179, 199, 0.5) 100%)',
                        borderRadius: '2px'
                      }} />
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Decorative elements */}
        <Box sx={{
          position: 'fixed',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(28, 179, 199, 0.05) 0%, transparent 70%)',
          zIndex: 0
        }} />
        
        <Box sx={{
          position: 'fixed',
          bottom: -150,
          left: -150,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(28, 179, 199, 0.03) 0%, transparent 70%)',
          zIndex: 0
        }} />
      </Container>
    </Box>
  );
}

