import React, { useEffect, useState } from 'react';
import { Typography, Paper } from '@mui/material';

const Quotes = () => {
  const [quote, setQuote] = useState({ text: '', author: '' });

  useEffect(() => {
    const fetchQuote = async () => {
      const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
      const storedQuote = localStorage.getItem('dailyQuote');
      const storedDate = localStorage.getItem('quoteDate');

      if (storedQuote && storedDate === today) {
        // Use the stored quote if it's from today
        setQuote(JSON.parse(storedQuote));
        console.log("Using cached quote");
      } else {
        try {
          console.log("Fetching new quote from API Ninjas");
          const response = await fetch(
            'https://api.api-ninjas.com/v1/quotes?category=happiness',
            {
              headers: {
                'X-Api-Key': 'wULAN7kEXbiD1MssUfJGMES0UuRHA4gNMYU1SOTi'
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              const newQuote = {
                text: data[0].quote,
                author: data[0].author
              };
              setQuote(newQuote);
              // Store the new quote and today's date in localStorage
              localStorage.setItem('dailyQuote', JSON.stringify(newQuote));
              localStorage.setItem('quoteDate', today);
              console.log("Stored new quote in cache");
            } else {
              console.error('Unexpected data format');
            }
          } else {
            console.error('Failed to fetch daily quote');
          }
        } catch (error) {
          console.error('Error fetching daily quote:', error);
        }
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