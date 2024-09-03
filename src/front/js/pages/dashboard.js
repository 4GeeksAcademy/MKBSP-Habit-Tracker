import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { jwtDecode } from 'jwt-decode';
import Level from '../component/levels';
import Quotes from '../component/dailyQuote'; 

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [habits, setHabits] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [level, setLevel] = useState(1);

    useEffect(() => {
        // Fetch user data
        const fetchUserData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.error('No access token found');
                return;
            }
            const userId = jwtDecode(token).sub;
            try {
                const response = await fetch(`https://effective-meme-g5455q947rf9jwr-3001.app.github.dev/api/getUser/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    console.error('Failed to fetch user data');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        // Fetch habits for the current level
        const fetchHabits = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                console.error('No access token found');
                return;
            }
            const userId = jwtDecode(token).sub;
            try {
                const response = await fetch(`https://effective-meme-g5455q947rf9jwr-3001.app.github.dev/api/getUserHabits/${userId}/${level}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const habitsData = await response.json();
                    setHabits(habitsData.user_habits);
                } else {
                    console.error('Failed to fetch habits');
                }
            } catch (error) {
                console.error('Error fetching habits:', error);
            }
        };

        if (user) {
            fetchHabits();
        }
    }, [user, level]);

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
    };

    const handleLevelChange = (newLevel) => {
        setLevel(newLevel);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={3} sx={{ padding: 3 }}>
                <Grid item xs={12}>
                    <Typography variant="h4">Welcome, {user ? user.username : 'User'}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Quotes />  
                </Grid>
                <Grid item xs={12}>
                    <DatePicker
                        label="Select Date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Level
                        level={level}
                        habits={habits}
                        selectedDate={selectedDate}
                        onLevelChange={handleLevelChange}
                    />
                </Grid>
            </Grid>
        </LocalizationProvider>
    );
};

export default Dashboard;