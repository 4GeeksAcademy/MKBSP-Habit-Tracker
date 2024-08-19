import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Container, Box, Button, Dialog, DialogTitle, DialogContent, TextField } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Habits = () => {
    const [habits, setHabits] = useState({ level1: [], level2: [], level3: [] });
    const [isModalOpen, setModalOpen] = useState(false);
    const [availableHabits, setAvailableHabits] = useState([]);
    const [currentLevel, setCurrentLevel] = useState(null); // To track the level where the habit is being added

    useEffect(() => {
        // Extract user ID from the JWT token
        const token = localStorage.getItem('access_token');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.sub; // Adjust this according to your JWT structure

        const fetchHabits = async () => {
            const levels = [1, 2, 3];
            const fetchedHabits = {};

            for (const level of levels) {
                const response = await fetch(`/api/getUserHabits/${userId}/${level}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const result = await response.json();
                fetchedHabits[`level${level}`] = result.user_habits || [];
            }

            setHabits(fetchedHabits);
        };

        fetchHabits();
    }, []);
    

    const handleDragEnd = (result) => {
        // Logic for drag and drop reordering and moving between levels
    };

    const handleOpenModal = async () => {
        try {
            const response = await fetch(`/api/getAllHabits?timestamp=${new Date().getTime()}`);
            const result = await response.json();
            
            if (response.ok) {
                setAvailableHabits(result.habits);
            } else {
                console.error('Failed to fetch available habits:', result.message);
            }
        } catch (error) {
            console.error('Error fetching available habits:', error);
        }   
        setModalOpen(true);
    };
    

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleAddHabit = (habit) => {
        setHabits(prevState => {
            const updatedLevel = [...prevState[`level${currentLevel}`], habit];
            return {
                ...prevState,
                [`level${currentLevel}`]: updatedLevel
            };
        });
        setModalOpen(false); // Close the modal after adding
    };

    const handleSaveChanges = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch('/api/assignHabit', {  // Replace with your actual endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(habits)  // Adjust according to the expected format
            });
    
            if (response.ok) {
                console.log('Habits updated successfully!');
            } else {
                console.error('Failed to save changes:', response.message);
            }
        } catch (error) {
            console.error('Error saving changes:', error);
        }
    };

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        const filteredHabits = availableHabits.filter(habit => habit.title.toLowerCase().includes(query));
        setAvailableHabits(filteredHabits);
    };

    return (
        <Container>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Box display="flex" justifyContent="space-between">
                    {Object.keys(habits).map((levelKey, index) => (
                        <Droppable droppableId={levelKey} key={index}>
                            {(provided) => (
                                <Box
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    p={2}
                                    border={1}
                                    borderColor="grey.500"
                                >
                                    <h3>{`Level ${index + 1}`}</h3>
                                    {habits[levelKey].map((habit, idx) => (
                                        <Draggable key={habit.habit_id} draggableId={String(habit.habit_id)} index={idx}>
                                            {(provided) => (
                                                <Box
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    p={1}
                                                    mb={1}
                                                    bgcolor="grey.200"
                                                    borderRadius={1}
                                                >
                                                    {habit.title}
                                                </Box>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                    <Button onClick={() => handleOpenModal(index + 1)}>Add Habit</Button>
                                </Box>
                            )}
                        </Droppable>
                    ))}
                </Box>
            </DragDropContext>

            {/* Habit Adding Modal */}
            <Dialog open={isModalOpen} onClose={handleCloseModal}>
                <DialogTitle>Add Habit</DialogTitle>
                <DialogContent>
                    <TextField placeholder="Search habits..." fullWidth margin="normal" onChange={handleSearch} />
                    {availableHabits.map(habit => (
                        <Box key={habit.uid} display="flex" justifyContent="space-between" mb={2}>
                            <span>{habit.title}</span>
                            <Button variant="contained" color="primary" onClick={() => handleAddHabit(habit)}>
                                Add
                            </Button>
                        </Box>
                    ))}
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default Habits;
