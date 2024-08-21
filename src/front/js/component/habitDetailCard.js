import React from 'react';
import { Dialog, DialogTitle, DialogContent, Button, Box } from '@mui/material'; // Import necessary MUI components


const HabitDetailModal = ({ selectedHabit, handleCloseHabitDetail, handleAddHabit, currentLevel }) => (
    <Dialog open={!!selectedHabit} onClose={handleCloseHabitDetail}>
        <DialogTitle>{selectedHabit?.title}</DialogTitle>
        <DialogContent>
            <p>{selectedHabit?.description}</p>
            <Button onClick={() => handleAddHabit(selectedHabit)}>Add to Level {currentLevel}</Button>
        </DialogContent>
    </Dialog>
);

export default HabitDetailModal;