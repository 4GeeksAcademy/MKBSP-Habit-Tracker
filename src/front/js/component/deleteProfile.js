import React, { useState, useCallback } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';

const DeleteAccount = React.memo(({ user }) => {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleClickOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const handleConfirmChange = useCallback((event) => {
    setConfirmText(event.target.value);
  }, []);

  const handleDelete = useCallback(async () => {
    if (confirmText === `${user.username} delete`) {
      try {
        const response = await fetch(`/api/deleteUser/${user.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          console.log('Account deleted successfully');
          // Handle post-deletion logic (e.g., redirect to login page)
        } else {
          console.error('Failed to delete account');
        }
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    } else {
      console.error('Incorrect confirmation text');
    }
  }, [confirmText, user.username, user.id]);

  return (
    <>
      <Button variant="outlined" color="error" onClick={handleClickOpen}>
        Delete Account
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To delete your account, please type "{user.username} delete" in the field below:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={confirmText}
            onChange={handleConfirmChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={confirmText !== `${user.username} delete`}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );

});

export default DeleteAccount;