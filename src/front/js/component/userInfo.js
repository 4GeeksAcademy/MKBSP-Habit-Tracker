import React, { useState, useEffect, useCallback } from 'react';
import { TextField, Button, Box } from '@mui/material';

const UserInfo = React.memo(({ user, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [userData, setUserData] = useState(user);

  useEffect(() => {
    setUserData(user);
  }, [user]);

  const handleEdit = useCallback(() => setEditing(true), []);

  const handleCancel = useCallback(() => {
    setEditing(false);
    setUserData(user);
  }, [user]);

  const handleChange = useCallback((e) => {
    setUserData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const response = await fetch(`/api/updateUser/${user.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        onUpdate(userData);
        setEditing(false);
      } else {
        console.error('Failed to update user info');
      }
    } catch (error) {
      console.error('Error updating user info:', error);
    }
  }, [user.id, userData, onUpdate]);

  return (
    <Box>
      {editing ? (
        <>
          <TextField
            name="username"
            label="Username"
            value={userData.username || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="email"
            label="Email"
            value={userData.email || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Button onClick={handleSave} variant="contained" sx={{ mr: 1 }}>Save</Button>
          <Button onClick={handleCancel} variant="outlined">Cancel</Button>
        </>
      ) : (
        <>
          <TextField
            label="Username"
            value={userData.username || ''}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Email"
            value={userData.email || ''}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
          />
          <Button onClick={handleEdit} variant="contained">Edit</Button>
        </>
      )}
    </Box>
  );
});

export default UserInfo;