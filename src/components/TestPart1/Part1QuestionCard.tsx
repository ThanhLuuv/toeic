import React, { useState, useEffect } from 'react';

interface Option {
  label: string;
  text: string;
  translation?: string;
  type?: string;
}

interface Question {
  id: string | number;
  question: string;
  options: Option[];
  correctAnswer: string;
  explanation?: string;
  translation?: string;
  tips?: string;
  audio?: string;
  image?: string;
  imageDescription?: string;
  grammarTopic?: string;
  level?: string;
  choices?: { [key: string]: string };
  choicesVi?: { [key: string]: string };
}

interface UniversalQuestionCardProps {
  question: Question;
  onAnswer: (selectedAnswer: string, isCorrect: boolean) => void;
  onNext?: () => void;
  showExplanation?: boolean;
  userAnswer?: string;
  isLastQuestion?: boolean;
  testType?: 'part1' | 'part2' | 'part3' | 'grammar' | 'chatbot';
  currentQuestionIndex?: number;
  totalQuestions?: number;
  showOptionsBeforeAnswer?: boolean; // For Part1, Part2 - hide options until answered
  audioComponent?: React.ReactNode;
  imageComponent?: React.ReactNode;
  vocabularyComponent?: React.ReactNode;
  vocabularyCompleted?: boolean;
}

const UniversalQuestionCard: React.FC<UniversalQuestionCardProps> = ({ 
  question, 
  onAnswer, 
  onNext,
  showExplanation = false,
  userAnswer,
  isLastQuestion = false,
  testType = 'grammar',
  currentQuestionIndex,
  totalQuestions,
  showOptionsBeforeAnswer = true,
  audioComponent,
  imageComponent,
  vocabularyComponent,
  vocabularyCompleted = true
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
    e.stopPropagation();
    setExpandedOptions(prev => ({
      ...prev,
      [optionLabel]: !prev[optionLabel]
    }));
  };

  // Convert choices object to options array for Part2, Part3
  const getOptions = (): Option[] => {
    console.log('getOptions - question.options:', question.options);
    console.log('getOptions - question.choices:', question.choices);
    console.log('getOptions - question.choicesVi:', question.choicesVi);
    
    if (question.options) {
      console.log('getOptions - returning question.options');
      return question.options;
    }
    
    if (question.choices) {
      const options = Object.entries(question.choices).map(([key, value]) => ({
        label: key,
        text: value,
        translation: question.choicesVi?.[key] || '',
        type: 'choice'
      }));
      console.log('getOptions - returning derived options:', options);
      return options;
    }
    
    console.log('getOptions - returning empty array');
    return [];
  };

  const options = getOptions();
  
  // Debug: Log options for troubleshooting
  console.log('UniversalQuestionCard - options:', options);
  console.log('UniversalQuestionCard - question:', question);
  console.log('UniversalQuestionCard - vocabularyCompleted:', vocabularyCompleted);

  const getOptionClass = (option: Option) => {
    const isSelected = selectedAnswer === option.label;
    const isCorrect = option.label === question.correctAnswer;
    const isWrong = isSelected && option.label !== question.correctAnswer;
    
    if (!showResult) {
      return isSelected 
        ? 'border-green-500 bg-green-50' 
        : 'border-gray-200 hover:border-green-300 hover:bg-green-50';
    }

    if (isCorrect) {
      return 'border-green-500 bg-green-100 text-green-800';
    }
    
    if (isWrong) {
      return 'border-red-500 bg-red-100 text-red-800';
    }
    
    return 'border-gray-200 bg-gray-50';
  };

  const renderOption = (option: Option) => {
    const isSelected = selectedAnswer === option.label;
    const isCorrect = option.label === question.correctAnswer;
    const isWrong = isSelected && option.label !== question.correctAnswer;
    const showResult = selectedAnswer !== null;
    
    return (
      <div
        key={option.label}
        onClick={() => handleOptionClick(option.label)}
        className={`p-2 border-2 rounded-full cursor-pointer transition-all duration-200 ${getOptionClass(option)}`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-semibold text-sm">
            {option.label}
          </div>
          <div className="flex-1">
            {/* For Part1, Part2 - hide text until answered */}
            {!showOptionsBeforeAnswer && !showResult ? (
              <div className="font-medium text-lg mb-1 text-gray-400 italic">
                Click để chọn đáp án
              </div>
            ) : (
              <div className="font-medium text-lg mb-1">
                {showResult && expandedOptions[option.label] && option.translation
                  ? `${option.translation}`
                  : option.text
                }
              </div>
            )}
          </div>
          
          {/* Translation toggle button - show after answer for all test types */}
          {showResult && option.translation && (
            <button
              onClick={(e) => toggleOptionDetails(option.label, e)}
              className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title={expandedOptions[option.label] ? "Xem tiếng Anh" : "Xem bản dịch"}
            >
              {expandedOptions[option.label] ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          )}
          
          {/* Result icons - Hide for Part1 */}
          {showResult && testType !== 'part1' && (
            <div className="flex-shrink-0 ml-2">
              {isSelected && isCorrect && (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {isSelected && !isCorrect && (
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {!isSelected && isCorrect && (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {question.grammarTopic && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {question.grammarTopic}
              </span>
            )}
            {question.level && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {question.level}
              </span>
            )}
            {testType && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {testType.toUpperCase()}
              </span>
            )}
          </div>
          {currentQuestionIndex !== undefined && totalQuestions !== undefined && (
            <span className="text-gray-600 text-sm">
              Câu {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-medium text-gray-800 leading-relaxed">
          {question.question}
        </h3>
      </div>

      {/* Audio Component */}
      {audioComponent && (
        <div className="mb-6">
          {audioComponent}
        </div>
      )}

      {/* Image Component */}
      {imageComponent && (
        <div className="mb-6">
          {imageComponent}
        </div>
      )}

      {/* Vocabulary Component */}
      {vocabularyComponent && !vocabularyCompleted && (
        <div className="mb-6">
          {vocabularyComponent}
        </div>
      )}

      {/* Options - Only show if vocabulary is completed or no vocabulary */}
      {vocabularyCompleted && (
        <div className="space-y-3 mb-6">
          {options.map(renderOption)}
        </div>
      )}

      {/* Explanation */}
      {showResult && (
        <div className="border-t pt-6">
          {question.explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">Giải thích:</h4>
              <p className="text-blue-700 leading-relaxed">{question.explanation}</p>
            </div>
          )}
          
          {question.translation && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">Bản dịch:</h4>
              <p className="text-gray-700 leading-relaxed">{question.translation}</p>
            </div>
          )}

          {question.tips && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Tips:</h4>
              <p className="text-yellow-700 leading-relaxed">{question.tips}</p>
            </div>
          )}
          
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

export default UniversalQuestionCard; 