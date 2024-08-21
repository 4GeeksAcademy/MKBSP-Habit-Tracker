
import React, { useEffect, useState } from 'react'; 
import { Container, Box, Button } from '@mui/material';
import { DragDropContext } from 'react-beautiful-dnd';
import useHabits from '../component/useHabitsHooks';
import HabitLevel from '../component/habitLevel';
import HabitDetailModal from '../component/habitDetailCard';
import AddHabitModal from '../component/addHabitModal';


const Habits = () => {
    const {
        habits,
        isModalOpen,
        availableHabits,
        selectedHabit,
        currentLevel,
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

    const [initialHabits, setInitialHabits] = useState(habits);

    // Set initial habits state when component mounts
    useEffect(() => {
        setInitialHabits(habits);
    }, []);

    const hasUnsavedChanges = JSON.stringify(initialHabits) !== JSON.stringify(habits);

    // useEffect to handle beforeunload event
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = ''; // This triggers the confirmation dialog
            }
        };

        // Add event listener for beforeunload
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

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

            <AddHabitModal
                isModalOpen={isModalOpen}
                handleCloseModal={handleCloseModal}
                handleSearch={handleSearch}
                availableHabits={availableHabits}
                handleAddHabit={handleAddHabit}
                handleOpenHabitDetail={handleOpenHabitDetail}
            />

            <HabitDetailModal
                selectedHabit={selectedHabit}
                handleCloseHabitDetail={handleCloseHabitDetail}
                handleAddHabit={handleAddHabit}
                currentLevel={currentLevel}
            />
        </Container>
    );
};

export default Habits;