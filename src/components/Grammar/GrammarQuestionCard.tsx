import React, { useState, useEffect } from 'react';
import { GrammarQuestion } from '../../types/grammar';
import GrammarOptionCard from './GrammarOptionCard';

interface GrammarQuestionCardProps {
  question: GrammarQuestion;
  onAnswer: (selectedAnswer: string, isCorrect: boolean) => void;
  onNext?: () => void;
  showExplanation?: boolean;
  userAnswer?: string;
  isLastQuestion?: boolean;
}

const GrammarQuestionCard: React.FC<GrammarQuestionCardProps> = ({ 
  question, 
  onAnswer, 
  onNext,
  showExplanation = false,
  userAnswer,
  isLastQuestion = false
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [expandedOptions, setExpandedOptions] = useState<{ [key: string]: boolean }>({});

  const handleOptionClick = (optionLabel: string) => {
    if (selectedAnswer !== null) return; // Prevent multiple selections
    
    setSelectedAnswer(optionLabel);
    setShowResult(true);
    
    const isCorrect = optionLabel === question.correctAnswer;
    onAnswer(optionLabel, isCorrect);
  };

  // Reset state when question changes
  useEffect(() => {
    if (userAnswer) {
      setSelectedAnswer(userAnswer);
      setShowResult(true);
    } else {
      setSelectedAnswer(null);
      setShowResult(false);
    }
    setExpandedOptions({});
  }, [question.id, userAnswer]);

  const toggleOptionDetails = (optionLabel: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra option
    setExpandedOptions(prev => ({
      ...prev,
      [optionLabel]: !prev[optionLabel]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {question.grammarTopic}
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {question.level}
            </span>
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-gray-800 leading-relaxed">
          {question.question}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options.map((option) => {
          const isSelected = selectedAnswer === option.label;
          const isCorrect = option.label === question.correctAnswer;
          const isWrong = isSelected && option.label !== question.correctAnswer;
          
          return (
            <GrammarOptionCard
              key={option.label}
              option={option}
              isSelected={isSelected}
              isCorrect={isCorrect}
              isWrong={isWrong}
              showResult={showResult}
              expandedOptions={expandedOptions}
              onOptionClick={handleOptionClick}
              onToggleTranslation={toggleOptionDetails}
            />
          );
        })}
      </div>

             {/* Explanation */}
       {showResult && (
         <div className="border-t pt-6">
           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
             <h4 className="font-semibold text-blue-800 mb-2">Giải thích:</h4>
             <p className="text-blue-700 leading-relaxed">{question.explanation}</p>
           </div>
           
           <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
             <h4 className="font-semibold text-gray-800 mb-2">Bản dịch:</h4>
             <p className="text-gray-700 leading-relaxed">{question.translation}</p>
           </div>

           {/* {question.trap && (
             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
               <h4 className="font-semibold text-yellow-800 mb-2">Lưu ý:</h4>
               <p className="text-yellow-700 leading-relaxed mb-2">{question.trap.description}</p>
             </div>
           )} */}
           
           {/* Next Button */}
           {onNext && (
             <div className="flex justify-center mt-6">
               <button
                 onClick={onNext}
                 className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
               >
                 <span>{isLastQuestion ? 'Hoàn thành' : 'Câu tiếp theo'}</span>
                 {!isLastQuestion && (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                   </svg>
                 )}
               </button>
             </div>
           )}
         </div>
       )}
    </div>
  );
};

export default GrammarQuestionCard; 