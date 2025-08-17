import { useState, useEffect } from "react";

const activities = [
  "Sophia sent a voice note to Alex",
  "Marcus shared a memory with Emma", 
  "Zoe sent a voice message to Tyler",
  "Olivia shared a moment with Ryan",
  "Jake sent a voice note to Mia"
];

export const ActivityBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 text-center text-sm font-medium">
      <div className="animate-fade-in">
        {activities[currentIndex]}
      </div>
    </div>
  );
};