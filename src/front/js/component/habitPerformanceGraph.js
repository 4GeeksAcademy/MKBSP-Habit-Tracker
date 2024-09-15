import React, { useState, useEffect } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Typography, Box, Stack, FormControlLabel, Checkbox } from '@mui/material';

const HabitPerformanceChart = ({ userId }) => {
  const [aggregatedData, setAggregatedData] = useState([]);
  const [connectNulls, setConnectNulls] = useState(true);

  useEffect(() => {
    console.log('Component mounted. userId:', userId);
    const fetchHabitPerformance = async () => {
      try {
        console.log('Fetching habit performance for userId:', userId);
        const response = await fetch(`https://effective-meme-g5455q947rf9jwr-3001.app.github.dev/api/performanceByUser/${userId}`);
        const data = await response.json();
        console.log('Raw data from API:', data);
        const processedData = processHabitData(data);
        console.log('Processed data:', processedData);
        setAggregatedData(processedData);
      } catch (error) {
        console.error('Error fetching habit performance:', error);
      }
    };

    fetchHabitPerformance();
  }, [userId]);

  const processHabitData = (data) => {
    console.log('Processing habit data');
    const completionsByDate = {};

    data.forEach(habit => {
      habit.performance.forEach(day => {
        const date = day.date;
        if (!completionsByDate[date]) {
          completionsByDate[date] = 0;
        }
        if (day.completed) {
          completionsByDate[date]++;
        }
      });
    });

    const aggregatedData = Object.entries(completionsByDate).map(([date, completions]) => ({
      date,
      completions
    }));

    aggregatedData.sort((a, b) => new Date(a.date) - new Date(b.date));
    console.log('Aggregated data:', aggregatedData);
    return aggregatedData;
  };

  console.log('Rendering chart with data:', aggregatedData);

  return (
    <Stack sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Total Habits Completed Over Last 15 Days
      </Typography>
      <FormControlLabel
        checked={connectNulls}
        control={
          <Checkbox onChange={(event) => setConnectNulls(event.target.checked)} />
        }
        label="Connect Null Values"
        labelPlacement="end"
      />
      {aggregatedData.length > 0 ? (
        <LineChart
          xAxis={[{ 
            data: aggregatedData.map(day => day.date),
            scaleType: 'band',
          }]}
          series={[
            {
              data: aggregatedData.map(day => day.completions),
              area: true,
              connectNulls,
            },
          ]}
          height={300}
          margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
        />
      ) : (
        <Typography>No data available</Typography>
      )}
    </Stack>
  );
};

export default HabitPerformanceChart;