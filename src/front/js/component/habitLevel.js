import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Box, Button } from '@mui/material';

const HabitLevel = ({ habits, levelIndex, handleDeleteHabit, handleOpenModal }) => {
    return (
        <Droppable droppableId={`level${levelIndex}`}>
            {(provided) => (
                <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    p={2}
                    border={1}
                    borderColor="grey.500"
                >
                    <h3>{`Level ${levelIndex}`}</h3>
                    {habits.map((habit, idx) => (
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
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => handleDeleteHabit(habit.habit_id, levelIndex)}
                                    >
                                        Delete
                                    </Button>
                                </Box>
                            )}
                        </Draggable>
                    ))}
                    {provided.placeholder}
                    <Button onClick={() => handleOpenModal(levelIndex)}>Add Habit</Button>
                </Box>
            )}
        </Droppable>
    );
};

export default HabitLevel;
