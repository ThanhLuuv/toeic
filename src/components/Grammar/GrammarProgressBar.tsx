import React from 'react';

interface GrammarProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

const GrammarProgressBar: React.FC<GrammarProgressBarProps> = ({
  currentQuestion,
  totalQuestions,
  correctAnswers,
  incorrectAnswers
}) => {
  const progress = (currentQuestion / totalQuestions) * 100;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{currentQuestion}</div>
            <div className="text-sm text-gray-500">Câu hiện tại</div>
          </div>
          <div className="text-gray-400">/</div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{totalQuestions}</div>
            <div className="text-sm text-gray-500">Tổng câu</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">{correctAnswers}</div>
            <div className="text-sm text-gray-500">Đúng</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-red-600">{incorrectAnswers}</div>
            <div className="text-sm text-gray-500">Sai</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">{accuracy.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">Độ chính xác</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div 
          className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-sm text-gray-500">
        <span>Bắt đầu</span>
        <span>Hoàn thành</span>
      </div>
    </div>
  );
};

export default GrammarProgressBar; 