import React from 'react';
import { Box, Button } from '@mui/material';
import { Draggable } from 'react-beautiful-dnd';

const HabitCard = ({ habit, index, handleDeleteHabit }) => (
    <Draggable key={habit.habit_id} draggableId={String(habit.habit_id)} index={index}>
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
                    onClick={() => handleDeleteHabit(userId, habit.habit_id, levelIndex)}
                >
                    Delete
                </Button>

            </Box>
        )}
    </Draggable>
);

export default HabitCard;
