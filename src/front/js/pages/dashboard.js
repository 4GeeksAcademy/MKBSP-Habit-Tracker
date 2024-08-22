import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DatePicker from '@mui/lab/DatePicker';
import Animation from '../component/animation';
import Levels from '../component/levels';
import Graph from '../component/dashboardGraph';
import Streaks from '../component/streaks';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [habits, setHabits] = useState([]);
    const [historicData, setHistoricData] = useState([]);
    const [dailyScore, setDailyScore] = useState(0);
    const [comparisonScore, setComparisonScore] = useState(0);
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHabits = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const response = await fetch(`/api/getUserHabits/${userId}/${level}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const result = await response.json();
                if (response.ok) {
                    setHabits(result.user_habits);
                } else {
                    console.error('Failed to fetch habits:', result.message);
                }
            } catch (error) {
                console.error('Error fetching habits:', error);
            }
        };

        fetchHabits();
    }, [level]);

    return (
        <Grid container spacing={3} sx={{ padding: 3 }}>
            {/* Top Section */}
            <Grid item xs={12}>
                <Typography variant="h4">Welcome, {user ? user.name : 'Stranger'}</Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="h6">Daily Score: {dailyScore}/10</Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="h6">
                    Compared to last 3 days: {comparisonScore > 0 ? '+' : ''}{comparisonScore}%
                </Typography>
            </Grid>

            {/* Date Navigation */}
            <Grid item xs={12}>
                <DatePicker
                    value={selectedDate}
                    onChange={(newDate) => setSelectedDate(newDate)}
                    renderInput={(params) => <TextField {...params} />}
                />
            </Grid>

            {/* Middle Section */}
            <Grid item xs={6}>
                <Animation />
            </Grid>
            <Grid item xs={6}>
                <Levels
                    habits={habits}
                    onHabitClick={handleHabitClick}
                    onHabitCheck={handleHabitCheck}
                    onLevelUp={handleLevelUp}
                    isPremium={user?.isPremium}
                />
            </Grid>

            {/* Bottom Section */}
            <Grid item xs={12}>
                <Graph data={historicData} />
            </Grid>
            <Grid item xs={12}>
                {selectedHabit && <Streaks habit={selectedHabit} />}
            </Grid>
        </Grid>
    );
};

export default Dashboard;