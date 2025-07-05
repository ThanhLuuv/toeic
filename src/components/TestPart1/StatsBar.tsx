import React from 'react';

interface StatsBarProps {
  correct: number;
  incorrect: number;
  skipped: number;
  totalAnswered: number;
}

const StatsBar: React.FC<StatsBarProps> = ({ correct, incorrect, skipped, totalAnswered }) => {
  const accuracy = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between text-sm text-gray-700">
        <div className="flex space-x-6 items-center">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>
              Correct: <span className="font-semibold text-green-600">{correct}</span>
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>
              Incorrect: <span className="font-semibold text-red-600">{incorrect}</span>
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5v14" />
            </svg>
            <span>
              Skipped: <span className="font-semibold text-gray-600">{skipped}</span>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1 font-semibold">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l0 0m0 9a9 9 0 100-18 9 9 0 000 18zm0-6a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
          <span>
            Accuracy: <span className="text-blue-600">{accuracy}%</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;