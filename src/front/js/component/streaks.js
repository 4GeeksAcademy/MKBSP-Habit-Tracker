import React from 'react';
import PropTypes from 'prop-types';

const Streaks = ({ currentStreak, longestStreak }) => {
    return (
        <div className="streaks-container">
            <h3>Streaks</h3>
            <div className="streak-info">
                <p>Current Streak: <span className="streak-count">{currentStreak}</span> days</p>
                <p>Longest Streak: <span className="streak-count">{longestStreak}</span> days</p>
            </div>
        </div>
    );
};

Streaks.propTypes = {
    currentStreak: PropTypes.number.isRequired,
    longestStreak: PropTypes.number.isRequired,
};

export default Streaks;