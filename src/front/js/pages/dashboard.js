import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Animation from '../component/animation';
import Levels from '../component/levels';
import Graph from '../component/dashboardGraph';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [habits, setHabits] = useState([]);
    const level = 1; // Assuming we're fetching habits for level 1 for now

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
                <Typography variant="h4">Welcome, [UserName]</Typography>
            </Grid>
            <Grid item xs={3}>
                <Typography variant="h6">Score for the day: [XX/XX]</Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="h6">[Placeholder text]</Typography>
            </Grid>
            <Grid item xs={3}>
                <Typography variant="h6">"Quote of the Day, [Author]"</Typography>
            </Grid>

            {/* Middle Section */}
            <Grid item xs={6}>
                <Animation />
            </Grid>
            <Grid item xs={6}>
                <Levels level={level} habits={habits} />
            </Grid>

            {/* Bottom Section */}
            <Grid item xs={12}>
                <Graph />
            </Grid>
            <Grid item xs={12}>
                {/* Streaks component will go here */}
                <Typography variant="h6">[Streaks]</Typography>
            </Grid>
        </Grid>
    );
};

export default Dashboard;
