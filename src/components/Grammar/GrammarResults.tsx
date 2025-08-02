import React from 'react';
import { GrammarQuestion } from '../../types/grammar';

interface GrammarResultsProps {
  questions: GrammarQuestion[];
  userAnswers: { [key: string]: string };
  correctAnswers: number;
  totalQuestions: number;
  onRestart: () => void;
  onBackToTopics: () => void;
}

const GrammarResults: React.FC<GrammarResultsProps> = ({
  questions,
  userAnswers,
  correctAnswers,
  totalQuestions,
  onRestart,
  onBackToTopics
}) => {
  const accuracy = (correctAnswers / totalQuestions) * 100;
  const incorrectAnswers = totalQuestions - correctAnswers;

  const getPerformanceMessage = () => {
    if (accuracy >= 90) return { message: 'Xuất sắc!', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (accuracy >= 80) return { message: 'Tốt!', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (accuracy >= 70) return { message: 'Khá!', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (accuracy >= 60) return { message: 'Trung bình', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { message: 'Cần cải thiện', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8 text-center">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${performance.bgColor} mb-6`}>
          <span className={`text-3xl font-bold ${performance.color}`}>
            {accuracy.toFixed(0)}%
          </span>
        </div>
        
        <h2 className={`text-2xl font-bold ${performance.color} mb-4`}>
          {performance.message}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
            <div className="text-gray-600">Câu đúng</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{incorrectAnswers}</div>
            <div className="text-gray-600">Câu sai</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{totalQuestions}</div>
            <div className="text-gray-600">Tổng câu</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Làm lại bài này
          </button>
          <button
            onClick={onBackToTopics}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Về danh sách chủ đề
          </button>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Chi tiết từng câu</h3>
        
        <div className="space-y-4">
          {questions.map((question, index) => {
            const userAnswer = userAnswers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            
            return (
              <div
                key={question.id}
                className={`border rounded-lg p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                      Câu {index + 1}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {isCorrect ? 'Đúng' : 'Sai'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{question.grammarTopic}</span>
                </div>
                
                <p className="text-gray-800 mb-2 font-medium">{question.question}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Đáp án của bạn: </span>
                    <span className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {userAnswer || 'Không trả lời'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Đáp án đúng: </span>
                    <span className="font-medium text-green-600">{question.correctAnswer}</span>
                  </div>
                </div>
                
                {!isCorrect && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-blue-800 text-sm">
                      <span className="font-medium">Giải thích:</span> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GrammarResults; 