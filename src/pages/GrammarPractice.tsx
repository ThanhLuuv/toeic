import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GrammarQuestionCard from '../components/Grammar/GrammarQuestionCard';
import GrammarQuestionSidebar from '../components/Grammar/GrammarQuestionSidebar';
import GrammarResults from '../components/Grammar/GrammarResults';
import { grammarService } from '../services/grammarService';
import { GrammarQuestion } from '../types/grammar';

const GrammarPractice: React.FC = () => {
  const { topicName } = useParams<{ topicName: string }>();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<GrammarQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [topicDisplayName, setTopicDisplayName] = useState<string>('');

  useEffect(() => {
    loadQuestions();
  }, [topicName]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      let fetchedQuestions: GrammarQuestion[] = [];

      if (topicName === 'mixed') {
        fetchedQuestions = await grammarService.getAllQuestions(15);
        setTopicDisplayName('Tổng hợp');
      } else if (topicName === 'beginner') {
        fetchedQuestions = await grammarService.getQuestionsByLevel('Beginner', 10);
        setTopicDisplayName('Cơ bản');
      } else if (topicName === 'advanced') {
        fetchedQuestions = await grammarService.getQuestionsByLevel('Advanced', 10);
        setTopicDisplayName('Nâng cao');
      } else {
        // Decode topic name từ URL
        const decodedTopicName = decodeURIComponent(topicName!);
        setTopicDisplayName(decodedTopicName);
        
        // Tìm câu hỏi theo topic name sử dụng method mới
        fetchedQuestions = await grammarService.getQuestionsByTopicName(decodedTopicName, 10);
      }

      // Shuffle questions for better practice
      fetchedQuestions = shuffleArray(fetchedQuestions);
      setQuestions(fetchedQuestions);
    } catch (err) {
      setError('Không thể tải câu hỏi. Vui lòng thử lại sau.');
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };



  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleAnswer = (selectedAnswer: string, isCorrect: boolean) => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Update user answers
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedAnswer
    }));

    // Update correct answers count
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }

    // Don't auto-advance to next question, let user navigate manually
  };

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleFinishTest = () => {
    setShowResults(true);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setCorrectAnswers(0);
    setShowResults(false);
    // Shuffle questions again
    setQuestions(shuffleArray([...questions]));
  };

  const handleBackToTopics = () => {
    navigate('/grammar');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={loadQuestions}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Thử lại
            </button>
            <button
              onClick={() => navigate('/grammar')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Về danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Không có câu hỏi</h2>
          <p className="text-gray-600 mb-4">Chưa có câu hỏi nào cho chủ đề này.</p>
          <button
            onClick={() => navigate('/grammar')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Về danh sách chủ đề
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-6">
          <GrammarResults
            questions={questions}
            userAnswers={userAnswers}
            correctAnswers={correctAnswers}
            totalQuestions={questions.length}
            onRestart={handleRestart}
            onBackToTopics={handleBackToTopics}
          />
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const incorrectAnswers = Object.keys(userAnswers).length - correctAnswers;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <GrammarQuestionSidebar
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        userAnswers={userAnswers}
        onQuestionClick={handleQuestionClick}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Luyện tập: {topicDisplayName}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="text-green-600 font-medium">{correctAnswers}</span> đúng / 
                  <span className="text-red-600 font-medium"> {incorrectAnswers}</span> sai
                </div>
                {Object.keys(userAnswers).length === questions.length && (
                  <button
                    onClick={handleFinishTest}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Hoàn thành
                  </button>
                )}
                <button
                  onClick={() => navigate('/grammar')}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 p-6 overflow-y-auto">
          <GrammarQuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
            showExplanation={true}
            userAnswer={userAnswers[currentQuestion.id]}
            isLastQuestion={currentQuestionIndex === questions.length - 1}
          />
        </div>
      </div>
    </div>
  );
};

export default GrammarPractice; 