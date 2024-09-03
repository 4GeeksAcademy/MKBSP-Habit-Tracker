import React, { useState, useEffect } from 'react';
import { Typography, Checkbox, FormControlLabel, Button } from '@mui/material';

const Level = ({ level, habits, selectedDate, onLevelChange }) => {
    const [habitStates, setHabitStates] = useState([]);

    useEffect(() => {
        // Initialize habit states when habits or selectedDate changes
        const initializeHabitStates = async () => {
            const token = localStorage.getItem('access_token');
            const updatedHabitStates = await Promise.all(habits.map(async (habit) => {
                try {
                    const response = await fetch(`https://effective-meme-g5455q947rf9jwr-3001.app.github.dev/api/getHabitPerformance/${habit.user_habit_id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const performanceData = await response.json();
                        const completionForDate = performanceData.performance.find(
                            p => p.date === selectedDate.toISOString().split('T')[0]
                        );
                        return { ...habit, completed: completionForDate ? completionForDate.completed : false };
                    }
                } catch (error) {
                    console.error('Error fetching habit performance:', error);
                }
                return { ...habit, completed: false };
            }));
            setHabitStates(updatedHabitStates);
        };

        initializeHabitStates();
    }, [habits, selectedDate]);

    const handleHabitCompletion = async (userHabitId, completed) => {
        const token = localStorage.getItem('access_token');
        console.log('Handling habit completion for userHabitId:', userHabitId);
        console.log('Completed status:', completed);
        console.log('Selected date:', selectedDate.toISOString().split('T')[0]);

        try {
            const requestBody = {
                user_habit_id: userHabitId,
                date: selectedDate.toISOString().split('T')[0],
                completed: completed
            };
            console.log('Request body:', JSON.stringify(requestBody, null, 2));

            const response = await fetch(`https://effective-meme-g5455q947rf9jwr-3001.app.github.dev/api/completeHabit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            const responseData = await response.json();
            console.log('Response data:', responseData);

            if (response.ok) {
                setHabitStates(prevState => {
                    const newState = prevState.map(habit =>
                        habit.user_habit_id === userHabitId ? { ...habit, completed } : habit
                    );
                    console.log('Updated habit states:', newState);
                    return newState;
                });
            } else {
                console.error('Failed to complete habit');
                console.error('Error response:', responseData);
            }
        } catch (error) {
            console.error('Error completing habit:', error);
        }
    };

    return (
        <div>
            <Typography variant="h5">Level {level}</Typography>
            {habitStates.map(habit => (
                <FormControlLabel
                    key={habit.user_habit_id}
                    control={
                        <Checkbox
                            checked={habit.completed}
                            onChange={(e) => handleHabitCompletion(habit.user_habit_id, e.target.checked)}
                        />
                    }
                    label={habit.title}
                />
            ))}
            <Button onClick={() => onLevelChange(level + 1)}>Next Level</Button>
            {level > 1 && <Button onClick={() => onLevelChange(level - 1)}>Previous Level</Button>}
        </div>
    );
};

export default Level;