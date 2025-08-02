import React from 'react';
import { GrammarQuestion } from '../../types/grammar';

interface GrammarQuestionSidebarProps {
  questions: GrammarQuestion[];
  currentQuestionIndex: number;
  userAnswers: { [key: string]: string };
  onQuestionClick: (index: number) => void;
}

const GrammarQuestionSidebar: React.FC<GrammarQuestionSidebarProps> = ({
  questions,
  currentQuestionIndex,
  userAnswers,
  onQuestionClick
}) => {
  const getQuestionStatus = (index: number) => {
    const question = questions[index];
    if (index === currentQuestionIndex) {
      return 'current';
    }
    if (userAnswers[question.id]) {
      return 'answered';
    }
    return 'unanswered';
  };

  const getStatusClass = (index: number) => {
    const question = questions[index];
    const status = getQuestionStatus(index);
    const isAnswered = userAnswers[question.id];
    const isCorrect = isAnswered && isAnswered === question.correctAnswer;
    
    switch (status) {
      case 'current':
        return 'bg-green-500 text-white border-green-500';
      case 'answered':
        return isCorrect 
          ? 'bg-green-100 text-green-800 border-green-300' 
          : 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  return (
    <div className="w-60 bg-white shadow-lg border-r border-gray-200 h-screen flex flex-col sticky top-0">
      {/* Header - Fixed */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Danh sách câu hỏi</h3>
      </div>
      
      {/* Questions Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const status = getQuestionStatus(index);
              const isAnswered = userAnswers[question.id];
              const isCorrect = isAnswered && isAnswered === question.correctAnswer;
              
              return (
                <button
                  key={question.id}
                  onClick={() => onQuestionClick(index)}
                  className={`
                    w-10 h-10 rounded-lg border-2 font-medium text-sm transition-all duration-200
                    ${getStatusClass(index)}
                    ${status === 'current' ? 'ring-2 ring-green-300' : ''}
                    hover:shadow-md
                  `}
                  title={`Câu ${index + 1}${isAnswered ? (isCorrect ? ' - Đúng' : ' - Sai') : ''}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Footer - Fixed */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Tiến độ:</span>
            <span>{Object.keys(userAnswers).length}/{questions.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(Object.keys(userAnswers).length / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrammarQuestionSidebar; 