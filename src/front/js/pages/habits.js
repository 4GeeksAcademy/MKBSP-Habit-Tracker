import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Container, Box, Button, Dialog, DialogTitle, DialogContent, TextField } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Habits = () => {
    const [habits, setHabits] = useState({ level1: [], level2: [], level3: [] });
    const [isModalOpen, setModalOpen] = useState(false);
    const [availableHabits, setAvailableHabits] = useState([]);
    const [currentLevel, setCurrentLevel] = useState(null);
    const [selectedHabit, setSelectedHabit] = useState(null);

    useEffect(() => {
        // Extract user ID from the JWT token
        const token = localStorage.getItem('access_token');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.sub;

        const fetchHabits = async () => {
            const levels = [1, 2, 3];
            const fetchedHabits = {};

            for (const level of levels) {
                const response = await fetch(`https://effective-meme-g5455q947rf9jwr-3001.app.github.dev/api/getUserHabits/${userId}/${level}`, {
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

    const handleOpenModal = async (level) => {
        setCurrentLevel(level);
        try {
            const response = await fetch(`https://effective-meme-g5455q947rf9jwr-3001.app.github.dev/api/getAllHabits?timestamp=${new Date().getTime()}`);
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
        setModalOpen(false);
    };

    const handleDragEnd = (result) => {
        const { destination, source, draggableId } = result;
    
        // Check if the item was dropped outside the list
        if (!destination) {
            return;
        }
    
        // Check if the item was dropped back to its original position
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }
    
        // Reorder or move between levels
        const startLevel = habits[source.droppableId];
        const finishLevel = habits[destination.droppableId];
    
        // If moving within the same level
        if (startLevel === finishLevel) {
            const newHabitOrder = Array.from(startLevel);
            const [movedHabit] = newHabitOrder.splice(source.index, 1);
            newHabitOrder.splice(destination.index, 0, movedHabit);
    
            setHabits((prevState) => ({
                ...prevState,
                [source.droppableId]: newHabitOrder,
            }));
        } else {
            // Moving to a different level
            const startHabitOrder = Array.from(startLevel);
            const [movedHabit] = startHabitOrder.splice(source.index, 1);
    
            const finishHabitOrder = Array.from(finishLevel);
            finishHabitOrder.splice(destination.index, 0, movedHabit);
    
            setHabits((prevState) => ({
                ...prevState,
                [source.droppableId]: startHabitOrder,
                [destination.droppableId]: finishHabitOrder,
            }));
        }
    };
    

    const handleSaveChanges = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const promises = [];
            Object.keys(habits).forEach(level => {
                habits[level].forEach(habit => {
                    const payload = {
                        user_id: jwtDecode(token).sub,
                        habit_id: habit.habit_id,
                        level: level.replace('level', '')
                    };
                    promises.push(fetch('https://effective-meme-g5455q947rf9jwr-3001.app.github.dev/api/assignHabit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(payload)
                    }));
                });
            });
            await Promise.all(promises);
            console.log('Habits updated successfully!');
        } catch (error) {
            console.error('Error saving changes:', error);
        }
    };

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        const filteredHabits = availableHabits.filter(habit => habit.title.toLowerCase().includes(query));
        setAvailableHabits(filteredHabits);
    };

    const handleOpenHabitDetail = (habit) => {
        setSelectedHabit(habit);
    };

    const handleCloseHabitDetail = () => {
        setSelectedHabit(null);
    };

    const handleDeleteHabit = async (habitId, level) => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch('https://effective-meme-g5455q947rf9jwr-3001.app.github.dev/api/removeHabit', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ user_habit_id: habitId })
            });
    
            if (response.ok) {
                setHabits(prevState => {
                    const updatedHabits = {
                        ...prevState,
                        [`level${currentLevel}`]: prevState[`level${currentLevel}`].filter(habit => habit.habit_id !== habitId)
                    };
                    return updatedHabits;
                });
            } else {
                console.error('Failed to delete habit');
            }
        } catch (error) {
            console.error('Error deleting habit:', error);
        }
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
                                                    <Button variant="contained" color="secondary" onClick={() => handleDeleteHabit(habit.habit_id, index + 1)}>
                                                    Delete
                                                    </Button>
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
            <button onClick={handleSaveChanges}>SAVE CHANGES</button>

            {/* Habit Adding Modal */}
            <Dialog open={isModalOpen} onClose={handleCloseModal}>
                <DialogTitle>Add Habit</DialogTitle>
                <DialogContent>
                    <TextField placeholder="Search habits..." fullWidth margin="normal" onChange={handleSearch} />
                    {availableHabits.map(habit => (
                        <Box key={habit.uid} display="flex" justifyContent="space-between" mb={2} onClick={() => handleOpenHabitDetail(habit)}>
                            <span>{habit.title}</span>
                            <Button variant="contained" color="primary" onClick={() => handleAddHabit(habit)}>
                                Add
                            </Button>
                        </Box>
                    ))}
                </DialogContent>
            </Dialog>

            {/* Habit Detail Modal */}
            <Dialog open={!!selectedHabit} onClose={handleCloseHabitDetail}>
                <DialogTitle>{selectedHabit?.title}</DialogTitle>
                <DialogContent>
                    <p>{selectedHabit?.description}</p>
                    <Button onClick={() => handleAddHabit(selectedHabit)}>Add to Level {currentLevel}</Button>
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default Habits;