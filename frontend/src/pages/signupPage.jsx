import React, { useState , useContext } from 'react';
import { useNavigate , Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  InputAdornment,
} from '@mui/material';
import { Person, Email } from '@mui/icons-material';

export default function SignupPage() {
  // const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });

  const navigate = useNavigate();
  const { handleRegister } = useContext(AuthContext);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if(!formData.username || !formData.email)  return;

  try {
    await handleRegister(
      formData.username,
      formData.email,
    );
    // handleRegister already navigates to login on success
  } catch (err) {
    console.error("Signup error details:", err);
    const errorMsg = err.response?.data?.message || err.message || "Registration failed";
    alert(errorMsg);
  }
};

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };


  const handleSignInClick = () => {
    navigate('/auth/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Left Side - Image */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Image */}
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80"
          alt="Signup background"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        
        {/* Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)',
          }}
        />
        
        {/* Content Over Image */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'white',
            width: '80%',
            zIndex: 1,
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            Welcome Back
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 300, opacity: 0.9 }}>
            Join our community and start your journey today
          </Typography>
        </Box>
      </Box>

      {/* Right Side - Signup Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: 5,
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: '#1a1a1a',
              }}
            >
              Create Account
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mb: 4,
                color: '#666',
              }}
            >
              Enter your details to create an account
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                value={formData.username}
                onChange={handleChange('username')}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                value={formData.email}
                onChange={handleChange('email')}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#667eea' }} />
                    </InputAdornment>
                  ),
                }}
              />


              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5)',
                  },
                }}
              >
                Sign Up
              </Button>

              <Typography
                variant="body2"
                sx={{
                  mt: 3,
                  textAlign: 'center',
                  color: '#666',
                }}
              >
                Already have an account?{' '}
                {/* <Box
                  component="span"
                  sx={{
                    color: '#667eea',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  Sign In
                </Box> */}

                <Link
                to="/auth/login"
                style={{
                  color : '#667eea' , 
                  fontWeight : 600 , 
                  textDecoration : "none" , 
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                >
                  Sign In
                </Link>
              </Typography>
            </form>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}