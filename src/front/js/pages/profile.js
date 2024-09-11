import React, { useState, useEffect, useCallback } from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import DeleteAccount from '../component/deleteProfile';
import ProfilePicture from '../component/profilePicture';
import UserInfo from '../component/userInfo';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('No access token found');
      setLoading(false);
      return;
    }
    const userId = jwtDecode(token).sub;
    console.log('Fetching user data for userId:', userId);
    try {
      const response = await fetch(`https://effective-meme-g5455q947rf9jwr-3001.app.github.dev/api/getUser/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        console.log('Fetched user data:', userData);
        setUser(userData);
      } else {
        setError(`Failed to fetch user data. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Error fetching user data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  if (!user) {
    return <Typography>User not found or not authenticated.</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography>Username: {user.username}</Typography>
          <ProfilePicture user={user} />
          <UserInfo user={user} />
          <DeleteAccount user={user} />
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;