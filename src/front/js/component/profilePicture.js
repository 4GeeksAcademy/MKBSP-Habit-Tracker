import React, { useState, useCallback, useMemo } from 'react';
import { Avatar, Button, Modal, Box } from '@mui/material';

const ProfilePicture = React.memo(({ user }) => {
  const [open, setOpen] = useState(false);
  const [picture, setPicture] = useState(user.profilePicture || '/default-avatar.jpg');

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const handleChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPicture(e.target.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const modalStyle = useMemo(() => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  }), []);

    return (
      <>
        <Avatar
          src={picture}
          sx={{ width: 100, height: 100, cursor: 'pointer' }}
          onClick={handleOpen}
        />
        <Modal open={open} onClose={handleClose}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}>
            <img src={picture} alt="Profile" style={{ width: '100%', marginBottom: 16 }} />
            <Button variant="contained" component="label">
              Change Picture
              <input type="file" hidden onChange={handleChange} accept="image/*" />
            </Button>
          </Box>
        </Modal>
      </>
    );
  }
);

export default ProfilePicture;