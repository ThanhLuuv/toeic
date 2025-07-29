import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AudioPlayer from '../components/AudioPlayer';
import FloatingTimer from '../components/TestPart1/FloatingTimer';
import TestResults from '../components/TestPart2/TestResults';
import part2Data from '../data/toeic_part2.json';

interface Question {
  id: number;
  type: string;
  question: string;
  choices: {
    A: string;
    B: string;
    C: string;
  };
  choicesVi?: {
    A: string;
    B: string;
    C: string;
  };
  correctAnswer: string;
  explanation: string;
  tips: string;
  audio: string;
  typeAnswer: string; // Correct field name from JSON data
}



const TestPart2: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
  const [showTranscript, setShowTranscript] = useState(false);
  const [questionTypeSelected, setQuestionTypeSelected] = useState<string>('');
  const [answerTypeSelected, setAnswerTypeSelected] = useState<string>('');
  const [showAnswerChoices, setShowAnswerChoices] = useState(false);
  const [questionTypeCorrect, setQuestionTypeCorrect] = useState<boolean | null>(null);
  const [answerTypeCorrect, setAnswerTypeCorrect] = useState<boolean | null>(null);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [showAutoPlayNotification, setShowAutoPlayNotification] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);
  // Thêm state cho bước chọn loại câu hỏi/đáp án
  const [typeStep, setTypeStep] = useState<1 | 2>(1);

  // Các type câu hỏi và đáp án có sẵn (tiếng Anh)
  const questionTypes = [
    { key: 'WH-question', label: 'WH-question (What, Where, When, Who, Why, How)' },
    { key: 'Yes/No-question', label: 'Yes/No question' },
    { key: 'Statement-Response', label: 'Statement-Response' },
    { key: 'Choice', label: 'Choice question' },
  ];

  const answerTypes = [
    { key: 'location', label: 'Location (office, store, at, in)' },
    { key: 'time', label: 'Time (next week, at 3 p.m., tomorrow, last year)' },
    { key: 'person', label: 'Person (Mr., Mrs., Ms., manager, customer, receptionist, he, she,...)' },
    { key: 'reason', label: 'Reason (because, due to, the reason is...)' },
    { key: 'yes_no', label: 'Yes/No response (Yes, I did. / No, I haven’t./ Not yet)' },
    { key: 'agreement', label: 'Agreement/Disagreement (I agree, Sure, I don’t think so)' },
    { key: 'solution', label: 'Solution/Suggestion (Let’s..., Why don’t we..., How about...)' },
    { key: 'choice', label: 'Choice (A or B? / I’ll take the first one / I prefer...)' },
    { key: 'other', label: 'Other (General information not fitting above categories)' },
  ];  

  const currentQuestion = questions[currentQuestionIndex];

  // Hàm xác định loại đáp án đúng dựa vào câu hỏi và đáp án đúng
  const handleAnswerTypeSelect = (typeKey: string) => {
    const correctAnswerType = currentQuestion.typeAnswer;
    const isCorrect = typeKey === correctAnswerType;
    setAnswerTypeSelected(typeKey);
    setAnswerTypeCorrect(isCorrect);
  };

  const handleQuestionTypeSelect = (typeKey: string) => {
    const isCorrect = typeKey === currentQuestion.type;
    setQuestionTypeSelected(typeKey);
    setQuestionTypeCorrect(isCorrect);
  };

  // Bấm Continue khi cả hai loại đều đúng
  const handleTypeSelection = () => {
    if (questionTypeCorrect && answerTypeCorrect) {
      setShowAnswerChoices(true);
    }
  };

  const resetTypeSelection = () => {
    setQuestionTypeSelected('');
    setAnswerTypeSelected('');
    setShowAnswerChoices(false);
    setShowTranscript(false);
    setQuestionTypeCorrect(null);
    setAnswerTypeCorrect(null);
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    setShowTranscript(true);
  };

  const handleTranslateOption = (choice: string, optionText: HTMLSpanElement, button: HTMLButtonElement) => {
    const currentText = optionText.textContent;
    const currentButtonText = button.textContent;

    if (currentButtonText === 'Dịch') {
      // Kiểm tra xem có bản dịch không
      if (currentQuestion.choicesVi && currentQuestion.choicesVi[choice as keyof typeof currentQuestion.choicesVi]) {
        optionText.textContent = currentQuestion.choicesVi[choice as keyof typeof currentQuestion.choicesVi];
        button.textContent = 'English';
      } else {
        // Fallback: hiển thị bản dịch giả
        const englishText = currentQuestion.choices[choice as keyof typeof currentQuestion.choices];
        optionText.textContent = `[Bản dịch] ${englishText}`;
        button.textContent = 'English';
      }
    } else {
      // Quay lại tiếng Anh
      optionText.textContent = currentQuestion.choices[choice as keyof typeof currentQuestion.choices];
      button.textContent = 'Dịch';
    }
  };

  const handleFinishTest = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    const correctAnswers = questions.filter(q => userAnswers[q.id] === q.correctAnswer).length;
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const getQuestionStatus = (questionId: number) => {
    if (!userAnswers[questionId]) return 'unanswered';
    return userAnswers[questionId] === questions.find(q => q.id === questionId)?.correctAnswer ? 'correct' : 'incorrect';
  };

  const nextQuestion = () => {
    setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1));
    resetTypeSelection();
  };

  const previousQuestion = () => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
    resetTypeSelection();
  };

  // Tự động phát audio khi chuyển câu hỏi
  useEffect(() => {
    if (currentQuestion && isTestStarted && autoPlayEnabled && hasUserInteracted) {
      // Delay nhỏ để đảm bảo audio element đã được render
      const timer = setTimeout(() => {
        const audioElement = document.querySelector('audio') as HTMLAudioElement;
        if (audioElement) {
          // Reset audio về đầu
          audioElement.currentTime = 0;
          // Phát audio
          audioElement.play().then(() => {
            // Hiển thị thông báo khi audio bắt đầu phát
            setShowAutoPlayNotification(true);
            setTimeout(() => setShowAutoPlayNotification(false), 2000);
          }).catch(error => {
            console.log('Auto-play failed:', error);
            // Disable auto-play if it fails
            setAutoPlayEnabled(false);
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, currentQuestion, isTestStarted, autoPlayEnabled, hasUserInteracted]);



  useEffect(() => {
    console.log('TestPart2 useEffect - testId:', testId);
    
    if (!testId) {
      console.log('No testId, redirecting to /part2');
      navigate('/part2');
      return;
    }
    
    // Tách testId: part2-test1
    const match = testId.match(/^part2-test([0-9]+)$/);
    console.log('Match result:', match);
    
    if (!match) {
      console.log('Invalid testId format:', testId, 'redirecting to /part2');
      navigate('/part2');
      return;
    }
    
    const testIndex = parseInt(match[1], 10) - 1;
    console.log('Test index:', testIndex, 'Test number:', match[1]);
    
    // Lấy tất cả questions từ tất cả levels
    let allQuestions: any[] = [];
    const allKeys = Object.keys(part2Data);
    console.log('All keys in part2Data:', allKeys);
    
    for (let level = 1; level <= 3; level++) {
      const levelKey = `level${level}`;
      // Tìm key có thể có dấu cách ở cuối
      const foundKey = allKeys.find(k => k.trim() === levelKey);
      console.log('Looking for key:', levelKey, 'Found:', foundKey);
      
      if (foundKey) {
        const questions = (part2Data as any)[foundKey] || [];
        console.log('Questions found for level:', level, 'Count:', questions.length);
        allQuestions = allQuestions.concat(questions);
      } else {
        // Thử tìm key với dấu cách ở cuối
        const foundKeyWithSpace = allKeys.find(k => k === `${levelKey} `);
        console.log('Looking for key with space:', `${levelKey} `, 'Found:', foundKeyWithSpace);
        
        if (foundKeyWithSpace) {
          const questions = (part2Data as any)[foundKeyWithSpace] || [];
          console.log('Questions found for level:', level, 'Count:', questions.length);
          allQuestions = allQuestions.concat(questions);
        } else {
          console.log('Key not found for level:', levelKey);
          console.log('Available keys:', allKeys);
        }
      }
    }
    
    console.log('Total questions:', allQuestions.length);
    
    const QUESTIONS_PER_TEST = 10; // Giảm xuống 10 câu mỗi bài test
    const startIndex = testIndex * QUESTIONS_PER_TEST;
    const endIndex = (testIndex + 1) * QUESTIONS_PER_TEST;
    console.log('Start index:', startIndex, 'End index:', endIndex);
    
    const testQuestions = allQuestions.slice(startIndex, endIndex);
    console.log('Test questions loaded:', testQuestions.length);
    console.log('Test questions:', testQuestions);
    
    if (testQuestions.length === 0) {
      console.log('No questions found for this test, redirecting to /part2');
      console.log('Start index:', startIndex, 'End index:', endIndex, 'Total questions:', allQuestions.length);
      navigate('/part2');
      return;
    }
    
    // Đảm bảo có ít nhất 1 question
    if (testQuestions.length < 1) {
      console.log('Not enough questions for this test, redirecting to /part2');
      navigate('/part2');
      return;
    }
    
    setQuestions(testQuestions);
    setIsTestStarted(true);
  }, [testId, navigate]);

  if (showResults) {
    return (
      <TestResults
        questions={questions}
        userAnswers={userAnswers}
        score={calculateScore()}
        onRetry={() => {
          setShowResults(false);
          setUserAnswers({});
          setCurrentQuestionIndex(0);
          setTimeRemaining(1800);
          resetTypeSelection();
        }}
        onBackToPart={() => navigate('/part2')}
      />
    );
  }

  console.log('Render - questions length:', questions.length);
  console.log('Render - currentQuestionIndex:', currentQuestionIndex);
  console.log('Render - currentQuestion:', currentQuestion);
  console.log('Render - questions array:', questions);

  if (!currentQuestion || questions.length === 0) {
    console.log('No currentQuestion or questions, showing loading...');
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }



  const correctAnswers = questions.filter(q => userAnswers[q.id] === q.correctAnswer).length;
  const incorrectAnswers = questions.filter(q => userAnswers[q.id] && userAnswers[q.id] !== q.correctAnswer).length;
  const skippedAnswers = questions.length - Object.keys(userAnswers).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Part 2 - Question-Response</h1>
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
                </div>
                
                {/* Audio Player */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-800">Audio</h3>
                    <button
                      onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        autoPlayEnabled
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {autoPlayEnabled ? 'Auto-play ON' : 'Auto-play OFF'}
                    </button>
                  </div>
                  <AudioPlayer audioSrc={currentQuestion.audio} />
                </div>

                {/* Type Selection Section */}
                {!showAnswerChoices && (
                  <div className="mb-6 relative min-h-[320px]">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">1. Choose the question type:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {questionTypes.map((type) => {
                        let buttonClass = "p-3 text-left rounded-lg border-2 transition-all ";
                        if (questionTypeSelected === type.key) {
                          if (questionTypeCorrect === true) {
                            buttonClass += "border-green-500 bg-green-50";
                          } else if (questionTypeCorrect === false) {
                            buttonClass += "border-red-500 bg-red-50";
                          } else {
                            buttonClass += "border-blue-500 bg-blue-50";
                          }
                        } else {
                          buttonClass += "border-gray-200 hover:border-gray-300";
                        }
                        return (
                          <button
                            key={type.key}
                            onClick={() => handleQuestionTypeSelect(type.key)}
                            className={buttonClass}
                          >
                            <div className="font-medium text-gray-800">{type.label}</div>
                          </button>
                        );
                      })}
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3 mt-6">2. Choose the appropriate answer type:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-20">
                      {answerTypes.map((type) => {
                        let buttonClass = "p-3 text-left rounded-lg border-2 transition-all ";
                        if (answerTypeSelected === type.key) {
                          if (answerTypeCorrect === true) {
                            buttonClass += "border-green-500 bg-green-50";
                          } else if (answerTypeCorrect === false) {
                            buttonClass += "border-red-500 bg-red-50";
                          } else {
                            buttonClass += "border-green-500 bg-green-50";
                          }
                        } else {
                          buttonClass += "border-gray-200 hover:border-gray-300";
                        }
                        return (
                          <button
                            key={type.key}
                            onClick={() => handleAnswerTypeSelect(type.key)}
                            className={buttonClass}
                          >
                            <div className="font-medium text-gray-800">{type.label}</div>
                          </button>
                        );
                      })}
                    </div>
                    {/* Có thể thêm hướng dẫn hoặc thông báo nếu chọn sai */}
                    {answerTypeCorrect === false && (
                      <div className="text-red-600 text-center font-medium mt-2">Incorrect answer type, please try again.</div>
                    )}
                    {/* Nút Continue sticky dưới card */}
                    {questionTypeCorrect && answerTypeCorrect && (
                      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, background: 'linear-gradient(to top, #fff 90%, transparent)'}} className="flex justify-center">
                        <button
                          onClick={handleTypeSelection}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg"
                        >
                          Continue to answer selection
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Answer Choices - Only show after type selection */}
                {showAnswerChoices && (
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
                                {/* Ẩn text đáp án sau khi đã chọn, chỉ hiển thị khi chưa chọn */}
                                {userAnswers[currentQuestion.id] === undefined ? (
                                  <p className="text-gray-400 italic">Click để chọn đáp án</p>
                                ) : null}
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
                )}

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
                        ? 'bg-blue-400 text-white'
                        : getQuestionStatus(question.id) === 'correct'
                        ? 'bg-green-100 text-green-700'
                        : getQuestionStatus(question.id) === 'incorrect'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      resetTypeSelection();
                    }}
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
                  className="w-full py-3 px-4 rounded-lg font-medium transition-all bg-green-600 text-white hover:bg-green-600"
                  onClick={handleFinishTest}
                >
                  Finish Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* {isTestStarted && (
        <FloatingTimer timeRemaining={timeRemaining} />
      )} */}
    </div>
  );
};

export default TestPart2; 