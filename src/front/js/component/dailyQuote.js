import React, { useEffect, useState } from 'react';
import { Typography, Paper } from '@mui/material';

const Quotes = () => {
  const [quote, setQuote] = useState({ text: '', author: '' });

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch('/api/daily-quote');
        if (response.ok) {
          const data = await response.json();
          setQuote(data);
        } else {
          console.error('Failed to fetch daily quote');
        }
      } catch (error) {
        console.error('Error fetching daily quote:', error);
      }
    };

    fetchQuote();
  }, []);

  return (
    <Paper elevation={3} sx={{ padding: 2, marginBottom: 2 }}>
      <Typography variant="body1" gutterBottom>
        "{quote.text}"
      </Typography>
      <Typography variant="subtitle2" align="right">
        - {quote.author}
      </Typography>
    </Paper>
  );
};

export default Quotes;