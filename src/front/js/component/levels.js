import React, { useState } from 'react';

const Levels = ({ level, habits }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const handleDateChange = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + direction);
        setCurrentDate(newDate);
    };

    const handleHabitCompletion = async (habitId, completed) => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`/api/completeHabit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_habit_id: habitId,
                    date: currentDate.toISOString().split('T')[0],
                    completed: completed
                })
            });

            if (!response.ok) {
                console.error('Failed to complete habit');
            }
        } catch (error) {
            console.error('Error completing habit:', error);
        }
    };

    return (
        <div className="levels">
            <div className="levels-header">
                <button onClick={() => handleDateChange(-1)}>{"<"}</button>
                <span>{`Level ${level} - ${currentDate.toDateString()}`}</span>
                <button onClick={() => handleDateChange(1)}>{">"}</button>
            </div>
            <ul>
                {habits.map(habit => (
                    <li key={habit.habit_id}>
                        <input
                            type="checkbox"
                            id={`habit-${habit.habit_id}`}
                            checked={habit.completed || false}
                            onChange={(e) => handleHabitCompletion(habit.habit_id, e.target.checked)}
                        />
                        <label htmlFor={`habit-${habit.habit_id}`}>{habit.title}</label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Levels;
