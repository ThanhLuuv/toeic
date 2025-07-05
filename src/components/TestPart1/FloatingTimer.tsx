import React from 'react';

interface FloatingTimerProps {
  timeRemaining: number;
}

const FloatingTimer: React.FC<FloatingTimerProps> = ({ timeRemaining }) => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  return (
    <div className="floating-timer fixed top-20 right-6 px-4 py-3 rounded-xl z-50">
      <div className="flex items-center space-x-2">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span className="font-mono font-semibold text-gray-800">
          {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
        </span>
      </div>
    </div>
  );
};

export default FloatingTimer;