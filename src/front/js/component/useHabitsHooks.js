import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const useHabits = () => {
    const [habits, setHabits] = useState({ level1: [], level2: [], level3: [] });
    const [isModalOpen, setModalOpen] = useState(false);
    const [availableHabits, setAvailableHabits] = useState([]);
    const [currentLevel, setCurrentLevel] = useState(null);
    const [selectedHabit, setSelectedHabit] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userId = jwtDecode(token).sub;

        const fetchHabits = async () => {
            const levels = [1, 2, 3];
            const fetchedHabits = {};

            for (const level of levels) {
                const response = await fetch(`https://effective-meme-g5455q947rf9jwr-3001.app.github.dev/api/getUserHabits/${userId}/${level}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                fetchedHabits[`level${level}`] = result.user_habits || [];
            }

            setHabits(fetchedHabits);
        };

        fetchHabits();
    }, []);

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

    const handleCloseModal = () => setModalOpen(false);

    const handleAddHabit = (habit) => {
        console.log('Habit being added:', habit);

        setHabits(prevState => {
            const updatedLevel = [...prevState[`level${currentLevel}`], habit];
            return { ...prevState, [`level${currentLevel}`]: updatedLevel };
        });
        setModalOpen(false);
    };

    const handleDragEnd = (result) => {
        const { destination, source } = result;

        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        const startLevel = habits[source.droppableId];
        const finishLevel = habits[destination.droppableId];

        let movedHabit;

        if (startLevel === finishLevel) {
            const newHabitOrder = Array.from(startLevel);
            movedHabit = newHabitOrder.splice(source.index, 1)[0];
            newHabitOrder.splice(destination.index, 0, movedHabit);

            setHabits(prevState => ({ ...prevState, [source.droppableId]: newHabitOrder }));
        } else {
            const startHabitOrder = Array.from(startLevel);
            movedHabit = startHabitOrder.splice(source.index, 1)[0];
            const finishHabitOrder = Array.from(finishLevel);
            finishHabitOrder.splice(destination.index, 0, movedHabit);

            setHabits(prevState => ({
                ...prevState,
                [source.droppableId]: startHabitOrder,
                [destination.droppableId]: finishHabitOrder,
            }));
        }

        console.log("Updated habits state:", habits);
    };

    const handleSaveChanges = async () => {
        const token = localStorage.getItem('access_token');
        const userId = jwtDecode(token).sub;
        try {
            const promises = [];
            Object.keys(habits).forEach(level => {
                habits[level].forEach(habit => {
                    const payload = {
                        user_id: userId,
                        habit_id: habit.habit_id,
                        level: level.replace('level', '')
                    };

                    console.log('Payload:', payload);

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

    const handleSearch = (query) => {
        const filteredHabits = availableHabits.filter(habit => habit.title.toLowerCase().includes(query.toLowerCase()));
        setAvailableHabits(filteredHabits);
    };

    const handleDeleteHabit = (habitId, level) => {
        setHabits(prevState => {
            const updatedHabits = {
                ...prevState,
                [`level${level}`]: prevState[`level${level}`].filter(habit => habit.habit_id !== habitId),
            };
            return updatedHabits;
        });
    };

    const handleOpenHabitDetail = (habit) => setSelectedHabit(habit);
    const handleCloseHabitDetail = () => setSelectedHabit(null);

    return {
        habits,
        isModalOpen,
        availableHabits,
        currentLevel,
        selectedHabit,
        handleOpenModal,
        handleCloseModal,
        handleAddHabit,
        handleDragEnd,
        handleSaveChanges,
        handleSearch,
        handleDeleteHabit,
        handleOpenHabitDetail,
        handleCloseHabitDetail,
    };
};

export default useHabits;