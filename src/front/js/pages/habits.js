import React from 'react';
import { Container, Box, Button, Dialog, DialogTitle, DialogContent, TextField } from '@mui/material';
import { DragDropContext } from 'react-beautiful-dnd';
import useHabits from './components/useHabitsHooks';

const Habits = () => {
    const {
        habits,
        isModalOpen,
        availableHabits,
        selectedHabit,
        handleOpenModal,
        handleCloseModal,
        handleAddHabit,
        handleDragEnd,
        handleSaveChanges,
        handleSearch,
        handleDeleteHabit,
        handleOpenHabitDetail,
        handleCloseHabitDetail,
    } = useHabits();

    return (
        <Container>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Box display="flex" justifyContent="space-between">
                    {Object.keys(habits).map((levelKey, index) => (
                        <HabitLevel
                            key={levelKey}
                            habits={habits[levelKey]}
                            levelIndex={index + 1}
                            handleDeleteHabit={handleDeleteHabit}
                            handleOpenModal={handleOpenModal}
                        />
                    ))}
                </Box>
            </DragDropContext>
            <Button onClick={handleSaveChanges}>SAVE CHANGES</Button>

            {/* AddHabitModal Component */}
            {/* Insert your AddHabitModal component here */}

            {/* HabitDetailModal Component */}
            {/* Insert your HabitDetailModal component here */}
        </Container>
    );
};

export default Habits;
