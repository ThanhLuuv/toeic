import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import part2Data from '../data/toeic_part2.json';
import AudioPlayer from '../components/TestPart1/AudioPlayer';
import FloatingTimer from '../components/TestPart1/FloatingTimer';

interface Question {
  id: number;
  type: string;
  question: string;
  choices: {
    A: string;
    B: string;
    C: string;
  };
  choicesVi: {
    A: string;
    B: string;
    C: string;
  };
  correctAnswer: string;
  explanation: string;
  tips: string;
  audio: string;
}

// Simple TestResults component for Part 2
const TestResultsPart2: React.FC<{
  questions: Question[];
  userAnswers: { [key: number]: string };
  score: number;
  onRetry: () => void;
  onBackToPart: () => void;
}> = ({ questions, userAnswers, score, onRetry, onBackToPart }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h1 className="text-3xl font-bold mb-2">Kết quả Part 2</h1>
              <p className="text-blue-100">Điểm số: {score}%</p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{score}%</div>
                  <div className="text-lg font-semibold text-blue-800 mb-1">Điểm chính</div>
                  <div className="text-sm text-blue-600">
                    {questions.filter(q => userAnswers[q.id] === q.correctAnswer).length}/{questions.length} câu đúng
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={onRetry}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Làm lại
                </button>
                <button
                  onClick={onBackToPart}
                  className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Về Part 2
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestPart2: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { testId, level } = location.state || {};

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
  const [showTranscript, setShowTranscript] = useState(false);

  const loadQuestions = useCallback(() => {
    console.log('Loading questions for level:', level);
    // Sửa logic để lấy đúng key - thêm dấu cách vào cuối để match với JSON
    const levelKey = `${level} `; // Thêm dấu cách vào cuối
    console.log('Level key:', levelKey);
    console.log('Available keys in part2Data:', Object.keys(part2Data));
    
    const levelQuestions = (part2Data as any)[levelKey] || [];
    console.log('Level questions found:', levelQuestions.length);
    
    // Lấy 25 câu hỏi cho test
    const testQuestions = levelQuestions.slice(0, 25);
    console.log('Test questions:', testQuestions.length);
    setQuestions(testQuestions);
  }, [level]);

  useEffect(() => {
    console.log('TestPart2 useEffect - testId:', testId, 'level:', level);
    if (testId && level) {
      loadQuestions();
      setStartTime(new Date());
      setIsTestStarted(true);
    } else {
      console.log('Missing testId or level, redirecting to /part2');
      navigate('/part2');
    }
  }, [testId, level, loadQuestions, navigate]);

  useEffect(() => {
    if (isTestStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isTestStarted, timeRemaining]);

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    setShowTranscript(true);
  };

  const handleTranslateOption = (choice: string, optionText: HTMLSpanElement, button: HTMLButtonElement) => {
    const originalText = currentQuestion.choices[choice as keyof typeof currentQuestion.choices];
    const translatedText = currentQuestion.choicesVi[choice as keyof typeof currentQuestion.choicesVi];
    if (optionText.textContent === originalText) {
      optionText.textContent = translatedText;
      button.textContent = 'Gốc';
    } else {
      optionText.textContent = originalText;
      button.textContent = 'Dịch';
    }
  };

  const handleFinishTest = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      if (userAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const getQuestionStatus = (questionId: number) => {
    if (userAnswers[questionId]) {
      return userAnswers[questionId] === questions.find(q => q.id === questionId)?.correctAnswer ? 'correct' : 'incorrect';
    }
    return 'unanswered';
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1));
    setShowTranscript(false);
  };

  const previousQuestion = () => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
    setShowTranscript(false);
  };

  if (showResults) {
    return (
      <TestResultsPart2
        questions={questions}
        userAnswers={userAnswers}
        score={calculateScore()}
        onRetry={() => {
          setUserAnswers({});
          setCurrentQuestionIndex(0);
          setShowResults(false);
          setStartTime(new Date());
          setTimeRemaining(1800);
        }}
        onBackToPart={() => navigate('/part2')}
      />
    );
  }

  if (questions.length === 0) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const correctAnswers = questions.filter(q => userAnswers[q.id] === q.correctAnswer).length;
  const incorrectAnswers = questions.filter(q => userAnswers[q.id] && userAnswers[q.id] !== q.correctAnswer).length;
  const skippedAnswers = questions.length - Object.keys(userAnswers).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Part 2 - Question-Response</h1>
          {/* <p className="text-gray-600">Test: {testId}</p> */}
        </div>

        {/* Stats Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow z-40">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between text-sm text-gray-700">
            <div className="flex space-x-6 items-center">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>
                  Correct: <span className="font-semibold text-green-600">{correctAnswers}</span>
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>
                  Incorrect: <span className="font-semibold text-red-600">{incorrectAnswers}</span>
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5v14" />
                </svg>
                <span>
                  Skipped: <span className="font-semibold text-gray-600">{skippedAnswers}</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1 font-semibold">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l0 0m0 9a9 9 0 100-18 9 9 0 000 18zm0-6a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
              <span>
                Progress: <span className="text-blue-600">{Math.round((Object.keys(userAnswers).length / questions.length) * 100)}%</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              {/* Question Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Câu {currentQuestionIndex + 1} / {questions.length}
                  </h2>
                  {/* <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {currentQuestion.type}
                  </span> */}
                </div>
                
                {/* Audio Player */}
                <div className="mb-6">
                  <AudioPlayer audioSrc={currentQuestion.audio} />
                </div>

                {/* Question Text - Ẩn đi vì thi nghe */}
                {/* <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Question:</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {currentQuestion.question}
                  </p>
                </div> */}
              </div>

              {/* Answer Choices */}
              <div className="space-y-4">
                {['A', 'B', 'C'].map((choice) => {
                  const isSelected = userAnswers[currentQuestion.id] === choice;
                  const isCorrect = currentQuestion.correctAnswer === choice;
                  const showResult = userAnswers[currentQuestion.id] !== undefined;
                  
                  let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all ";
                  if (isSelected) {
                    if (isCorrect) {
                      buttonClass += "border-green-500 bg-green-50";
                    } else {
                      buttonClass += "border-red-500 bg-red-50";
                    }
                  } else if (showResult && isCorrect) {
                    buttonClass += "border-green-500 bg-green-50";
                  } else {
                    buttonClass += "border-gray-200 hover:border-gray-300";
                  }

                  return (
                    <div key={choice}>
                      <button
                        className={buttonClass}
                        onClick={() => handleAnswerSelect(currentQuestion.id, choice)}
                        disabled={userAnswers[currentQuestion.id] !== undefined}
                      >
                        <div className="flex items-start">
                          <span className="font-semibold text-gray-600 mr-3 min-w-[20px]">
                            {choice}.
                          </span>
                          <div className="flex-1">
                            {/* Ẩn text đáp án, chỉ hiển thị khi đã chọn */}
                            {/* {userAnswers[currentQuestion.id] !== undefined ? (
                              <>
                                <p className="text-gray-800 mb-1">{currentQuestion.choices[choice as keyof typeof currentQuestion.choices]}</p>
                                <p className="text-sm text-gray-600">{currentQuestion.choicesVi[choice as keyof typeof currentQuestion.choicesVi]}</p>
                              </>
                            ) : (
                              <p className="text-gray-400 italic">Click để chọn đáp án</p>
                            )} */}
                          </div>
                          {/* Icon đúng/sai */}
                          {showResult && (
                            <div className="ml-2">
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
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Next Question Button */}
              {userAnswers[currentQuestion.id] !== undefined && (
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      currentQuestionIndex === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <button
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      currentQuestionIndex === questions.length - 1
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Next Question
                  </button>
                </div>
              )}

              {/* Transcript and Translation Section */}
              {userAnswers[currentQuestion.id] !== undefined && (
                <div className="mt-6 space-y-4">
                  {/* Show explanation when answer is selected */}
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <div className="mb-2">
                        <span className="font-semibold text-gray-700">Explanation:</span>
                        <p className="text-gray-600 mt-1">{currentQuestion.explanation}</p>
                        </div>
                        <div>
                        <span className="font-semibold text-gray-700">Tips:</span>
                        <p className="text-gray-600 mt-1">{currentQuestion.tips}</p>
                        </div>
                    </div>
                  {/* Question Transcript */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Question:</h4>
                    <div className="text-sm text-blue-900 mb-2">
                      {currentQuestion.question}
                    </div>
                  </div>

                  {/* Answer Options with Translation */}
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Answer Options:</h4>
                    <ul className="list-none space-y-2">
                      {['A', 'B', 'C'].map((choice) => (
                        <li key={choice} className="transcript-line flex items-center justify-between" data-option-index={choice.charCodeAt(0) - 65}>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-blue-600">({choice})</span>
                            <span className="option-text">{currentQuestion.choices[choice as keyof typeof currentQuestion.choices]}</span>
                          </div>
                          <button
                            className="translate-option-btn bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs hover:bg-blue-200"
                            onClick={(e) =>
                              handleTranslateOption(
                                choice,
                                e.currentTarget.previousElementSibling?.querySelector('.option-text') as HTMLSpanElement,
                                e.currentTarget as HTMLButtonElement
                              )
                            }
                          >
                            Dịch
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Navigation</h3>
              
              <div className="grid grid-cols-5 gap-2 mb-6">
                {questions.map((question, index) => (
                  <button
                    key={question.id}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      index === currentQuestionIndex
                        ? 'bg-blue-500 text-white'
                        : getQuestionStatus(question.id) === 'correct'
                        ? 'bg-green-100 text-green-700'
                        : getQuestionStatus(question.id) === 'incorrect'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Answered:</span>
                  <span className="font-semibold">{Object.keys(userAnswers).length}/{questions.length}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-semibold">
                    {Math.round((Object.keys(userAnswers).length / questions.length) * 100)}%
                  </span>
                </div>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    Object.keys(userAnswers).length === questions.length
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={handleFinishTest}
                  disabled={Object.keys(userAnswers).length !== questions.length}
                >
                  Finish Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isTestStarted && (
        <FloatingTimer timeRemaining={timeRemaining} />
      )}
    </div>
  );
};

export default TestPart2; 