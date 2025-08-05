import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { part5Service, Part5Question } from '../services/part5Service';
import { BackButton } from '../components/common/BackButton';
import TestResults from '../components/TestPart5/TestResults';

interface Answer {
  selected: string;
  correct: string;
  isCorrect: boolean;
  skipped: boolean;
}

const QUESTIONS_PER_TEST = 30; // Part 5 typically has 30 questions

const TestPart5: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy testId, category, level từ state
  const testIdRaw = location.state?.testId || 'vocabulary-test1';
  let category = location.state?.category || 'vocabulary';
  let level = location.state?.level || 'basic';
  let testNumber = 1;

  if (typeof testIdRaw === 'string' && testIdRaw.includes('-test')) {
    const parts = testIdRaw.split('-');
    category = parts[0];
    testNumber = parseInt(parts[1].replace('test', ''), 10);
  } else {
    testNumber = typeof testIdRaw === 'number' ? testIdRaw : 1;
  }
  
  const [part5Questions, setPart5Questions] = useState<Part5Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: Answer }>({});
  const [showResults, setShowResults] = useState(false);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [showChoiceTexts, setShowChoiceTexts] = useState(false);
  const [translatedChoices, setTranslatedChoices] = useState<{[key: string]: boolean}>({});
  
  // Load questions from Firebase
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        let questions: Part5Question[] = [];
        
        if (category === 'all') {
          questions = await part5Service.getAllQuestions();
        } else {
          questions = await part5Service.getQuestionsByType(category);
        }
        
        setPart5Questions(questions);
      } catch (err) {
        setError('Không thể tải dữ liệu câu hỏi. Vui lòng thử lại sau.');
        console.error('Error loading questions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [category]);
  
  // Lọc questions theo category và lấy test questions
  const filteredQuestions = part5Questions;
  const sortedQuestions = filteredQuestions.sort((a, b) => a.questionNumber - b.questionNumber);
  const testQuestions = sortedQuestions.slice(0, QUESTIONS_PER_TEST);
  
  const currentQuestion = testQuestions[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    if (isTestStarted && !showResults) {
      const interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      setTimer(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  }, [isTestStarted, showResults]);

  const startTest = () => {
    setIsTestStarted(true);
    setTimeSpent(0);
  };

  const handleAnswerSelect = (answer: string) => {
    if (!currentQuestion) return;
    
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: {
        selected: answer,
        correct: currentQuestion.correctAnswer,
        isCorrect,
        skipped: false
      }
    }));
    
    setShowChoiceTexts(true); // Show all choice texts when answered
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowChoiceTexts(false); // Reset choice text display for new question
      setShowExplanation(false);
      setTranslatedChoices({}); // Reset translation state
    } else {
      finishTest();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      // Check if the previous question was answered to show choice texts
      const prevAnswer = userAnswers[currentQuestionIndex - 1];
      setShowChoiceTexts(!!prevAnswer);
      setShowExplanation(!!prevAnswer);
      setTranslatedChoices({}); // Reset translation state
    }
  };

  const finishTest = () => {
    setShowResults(true);
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  };

  const calculateScore = () => {
    const answeredQuestions = Object.values(userAnswers);
    const correctAnswers = answeredQuestions.filter(answer => answer.isCorrect).length;
    const totalQuestions = testQuestions.length;
    return Math.round((correctAnswers / totalQuestions) * 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index: number) => {
    const answer = userAnswers[index];
    if (!answer) return 'unanswered';
    return answer.isCorrect ? 'correct' : 'incorrect';
  };

  const toggleChoiceTranslation = (choice: string) => {
    setTranslatedChoices(prev => ({
      ...prev,
      [choice]: !prev[choice]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <TestResults
        score={score}
        questions={testQuestions}
        userAnswers={userAnswers}
        timeSpent={timeSpent}
                 onRetry={() => {
           setShowResults(false);
           setUserAnswers({});
           setCurrentQuestionIndex(0);
           setTimeSpent(0);
           setIsTestStarted(false);
           setShowChoiceTexts(false);
           setShowExplanation(false);
           setTranslatedChoices({});
         }}
        onBack={() => navigate('/part5')}
      />
    );
  }

  if (!isTestStarted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <BackButton onClick={() => navigate('/part5')} />
          
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-8">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
              TOEIC Part 5 - Incomplete Sentences
            </h1>
            
            <div className="space-y-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-blue-800 mb-2">Thông tin bài test:</h2>
                <ul className="text-blue-700 space-y-1">
                  <li>• Loại câu hỏi: {category === 'vocabulary' ? 'Từ vựng' : 'Ngữ pháp'}</li>
                  <li>• Số câu hỏi: {testQuestions.length}</li>
                  <li>• Thời gian: Không giới hạn</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Hướng dẫn:</h3>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Chọn từ phù hợp nhất để hoàn thành câu</li>
                  <li>• Có thể xem lại câu hỏi trước đó</li>
                  <li>• Bài test sẽ tự động kết thúc khi hoàn thành tất cả câu hỏi</li>
                </ul>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={startTest}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                Bắt đầu làm bài
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
               <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <BackButton onClick={() => navigate('/part5')} />
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Câu {currentQuestionIndex + 1} / {testQuestions.length}
            </div>
            <div className="text-sm text-gray-600">
              Thời gian: {formatTime(timeSpent)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Tiến độ</span>
            <span>{Math.round(((currentQuestionIndex + 1) / testQuestions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / testQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {currentQuestion.question}
              </h2>
            </div>

                         {/* Answer Choices */}
             <div className="bg-gray-100 rounded-2xl p-6 max-w-lg mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-5 text-center">Chọn câu trả lời đúng nhất</h3>
               
                                 <div className="grid gap-4">
                   {(['A', 'B', 'C', 'D'] as const).map((key) => {
                     const choice = currentQuestion.choices[key];
                     if (!choice) return null;
                     
                     const isSelected = userAnswers[currentQuestionIndex]?.selected === key;
                     const isCorrect = currentQuestion.correctAnswer === key;
                     const showResult = userAnswers[currentQuestionIndex];
                     
                     return (
                     <div
                       key={key}
                       className={`bg-white border-2 border-gray-200 rounded-[50px] p-1 transition-all duration-300 ${
                         showResult
                           ? key === currentQuestion.correctAnswer
                             ? 'border-green-500 bg-green-50'
                             : key === userAnswers[currentQuestionIndex]?.selected
                             ? 'border-red-500 bg-red-50'
                             : 'border-gray-200'
                           : isSelected
                           ? 'border-blue-500 bg-blue-50 cursor-pointer hover:border-blue-600 hover:shadow-lg hover:-translate-y-0.5'
                           : 'border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-lg hover:-translate-y-0.5'
                       }`}
                       onClick={() => !showResult && handleAnswerSelect(key)}
                     >
                       <div className="flex items-center">
                         <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                           {key}
                         </div>
                         <div className="flex-1">
                           {translatedChoices[key] ? (
                             <div className="text-lg text-gray-800 mb-1">{choice.vietnamese}</div>
                           ) : (
                             <div className="text-lg text-gray-800 mb-1">{choice.english}</div>
                           )}
                         </div>
                         <button
                           className="text-gray-400 hover:text-blue-500 text-base cursor-pointer p-2 rounded-full transition-all duration-200 ml-3 flex-shrink-0 hover:bg-blue-50"
                           onClick={(e) => {
                             e.stopPropagation();
                             toggleChoiceTranslation(key);
                           }}
                           title={translatedChoices[key] ? "Hiện tiếng Anh" : "Hiện tiếng Việt"}
                         >
                           📖
                         </button>
                       </div>
                     </div>
                   );
                   })}
                 </div>
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Giải thích:</h3>
                <p className="text-blue-700">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentQuestionIndex === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            Câu trước
          </button>

          <div className="flex space-x-2">
            {Array.from({ length: testQuestions.length }, (_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestionIndex(index);
                  // Check if the question was answered to show choice texts
                  const answer = userAnswers[index];
                  setShowChoiceTexts(!!answer);
                  setShowExplanation(!!answer);
                  setTranslatedChoices({}); // Reset translation state
                }}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : getQuestionStatus(index) === 'correct'
                    ? 'bg-green-500 text-white'
                    : getQuestionStatus(index) === 'incorrect'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={nextQuestion}
              disabled={currentQuestionIndex === testQuestions.length - 1}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentQuestionIndex === testQuestions.length - 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {currentQuestionIndex === testQuestions.length - 1 ? 'Câu tiếp' : 'Câu tiếp'}
            </button>
            <button
              onClick={finishTest}
              className="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Kết thúc
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPart5; 