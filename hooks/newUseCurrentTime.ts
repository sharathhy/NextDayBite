import { useState, useEffect } from "react";

export const useCurrentTimeNew = (updateInterval = 30000) => {
  const getCurrentTimestamp = () =>
    new Date().toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const [currentTime, setCurrentTime] = useState(getCurrentTimestamp());

  useEffect(() => {
    setCurrentTime(getCurrentTimestamp());
    const timerId = setInterval(() => {
      setCurrentTime(getCurrentTimestamp());
    }, updateInterval);

    return () => clearInterval(timerId);
  }, [updateInterval]);

  return currentTime;
};
