import React, { useState } from 'react';
import { Part5Question } from '../../services/part5Service';

interface Answer {
  selected: string;
  correct: string;
  isCorrect: boolean;
  skipped: boolean;
}

interface TestResultsProps {
  score: number;
  questions: Part5Question[];
  userAnswers: { [key: number]: Answer };
  timeSpent: number;
  onRetry: () => void;
  onBack: () => void;
}

const TestResults: React.FC<TestResultsProps> = ({ 
  score, 
  questions, 
  userAnswers, 
  timeSpent,
  onRetry, 
  onBack 
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);

  const correctAnswers = Object.values(userAnswers).filter(answer => answer.isCorrect).length;
  const incorrectAnswers = Object.values(userAnswers).filter(answer => !answer.isCorrect && !answer.skipped).length;
  const skippedAnswers = questions.length - Object.keys(userAnswers).length;

  const toggleQuestionExpansion = (questionIndex: number) => {
    setExpandedQuestions(prev => 
      prev.includes(questionIndex) 
        ? prev.filter(q => q !== questionIndex)
        : [...prev, questionIndex]
    );
  };

  const getQuestionStatus = (questionIndex: number) => {
    const answer = userAnswers[questionIndex];
    if (!answer) return 'skipped';
    return answer.isCorrect ? 'correct' : 'incorrect';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct': return 'text-green-600 bg-green-50 border-green-200';
      case 'incorrect': return 'text-red-600 bg-red-50 border-red-200';
      case 'skipped': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'incorrect':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'skipped':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Xuất sắc!';
    if (score >= 80) return 'Rất tốt!';
    if (score >= 70) return 'Tốt!';
    if (score >= 60) return 'Khá!';
    if (score >= 50) return 'Trung bình!';
    return 'Cần cải thiện!';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Kết quả bài test
          </h1>
          <div className="text-lg text-gray-600">
            TOEIC Part 5 - Incomplete Sentences
          </div>
        </div>

        {/* Score Summary */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Main Score */}
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
                {score}%
              </div>
              <div className="text-xl font-semibold text-gray-800 mb-2">
                {getScoreMessage(score)}
              </div>
              <div className="text-gray-600">
                {correctAnswers} / {questions.length} câu đúng
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-800 font-medium">Đúng:</span>
                <span className="text-green-800 font-bold">{correctAnswers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-red-800 font-medium">Sai:</span>
                <span className="text-red-800 font-bold">{incorrectAnswers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-800 font-medium">Bỏ qua:</span>
                <span className="text-gray-800 font-bold">{skippedAnswers}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-800 font-medium">Thời gian:</span>
                <span className="text-blue-800 font-bold">{formatTime(timeSpent)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Chi tiết từng câu hỏi
          </h2>
          
          <div className="space-y-4">
            {questions.map((question, index) => {
              const status = getQuestionStatus(index);
              const answer = userAnswers[index];
              const isExpanded = expandedQuestions.includes(index);

              return (
                <div key={index} className={`border rounded-lg p-4 ${getStatusColor(status)}`}>
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(status)}
                      <span className="font-semibold">Câu {index + 1}</span>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        status === 'correct' ? 'bg-green-100 text-green-800' :
                        status === 'incorrect' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {status === 'correct' ? 'Đúng' : 
                         status === 'incorrect' ? 'Sai' : 'Bỏ qua'}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleQuestionExpansion(index)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {isExpanded ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Question Content */}
                  <div className="mb-3">
                    <p className="text-gray-800 font-medium">{question.question}</p>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-4 space-y-3">
                      {/* Choices */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700">Các lựa chọn:</h4>
                        {Object.entries(question.choices).map(([key, choice]) => {
                          const isCorrect = key === question.correctAnswer;
                          const isSelected = answer?.selected === key;
                          
                          let choiceClass = "p-2 rounded border ";
                          if (isCorrect) {
                            choiceClass += "bg-green-100 border-green-300";
                          } else if (isSelected && !isCorrect) {
                            choiceClass += "bg-red-100 border-red-300";
                          } else {
                            choiceClass += "bg-gray-50 border-gray-200";
                          }

                          return (
                            <div key={key} className={choiceClass}>
                              <div className="flex items-center">
                                <span className={`font-semibold mr-2 ${
                                  isCorrect ? 'text-green-700' : 
                                  isSelected && !isCorrect ? 'text-red-700' : 
                                  'text-gray-600'
                                }`}>
                                  {key}.
                                </span>
                                <div>
                                  <div className="font-medium">{choice.english}</div>
                                  <div className="text-sm text-gray-500">{choice.vietnamese}</div>
                                </div>
                                {isCorrect && (
                                  <svg className="w-4 h-4 text-green-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* User Answer */}
                      {answer && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-1">Đáp án của bạn:</h4>
                          <p className="text-blue-700">
                            {answer.selected} - {question.choices[answer.selected as keyof typeof question.choices]?.english}
                          </p>
                        </div>
                      )}

                      {/* Correct Answer */}
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-1">Đáp án đúng:</h4>
                        <p className="text-green-700">
                          {question.correctAnswer} - {question.choices[question.correctAnswer as keyof typeof question.choices]?.english}
                        </p>
                      </div>

                      {/* Explanation */}
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-1">Giải thích:</h4>
                        <p className="text-yellow-700">{question.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-4xl mx-auto mt-8 flex justify-center space-x-4">
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Làm lại bài test
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResults; 