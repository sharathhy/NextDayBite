import { useState, useEffect } from 'react';

// Custom hook to get the current time, updating every 30 seconds
export const useCurrentTime = (updateInterval = 30000) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Set initial time immediately
    setCurrentTime(new Date());
    
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => {
      clearInterval(timerId);
    };
  }, [updateInterval]);
  
  return currentTime;
};






















