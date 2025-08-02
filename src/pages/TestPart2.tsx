import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AudioPlayer from '../components/AudioPlayer';
import TestResults from '../components/TestPart2/TestResults';
import { BackButton } from '../components/common/BackButton';
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
  const [questionTypeSelected, setQuestionTypeSelected] = useState<string>('');
  const [answerTypeSelected, setAnswerTypeSelected] = useState<string>('');
  const [showAnswerChoices, setShowAnswerChoices] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [hasUserInteracted, setHasUserInteracted] = useState(true);
  // State for draggable navigation position
  const [navPosition, setNavPosition] = useState({ x: window.innerWidth - 200, y: window.innerHeight / 2 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

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
    setAnswerTypeSelected(typeKey);
  };

  const handleQuestionTypeSelect = (typeKey: string) => {
    setQuestionTypeSelected(typeKey);
  };

  // Bấm Continue khi đã chọn cả hai loại
  const handleTypeSelection = () => {
    if (questionTypeSelected && answerTypeSelected) {
      setShowAnswerChoices(true);
    }
  };

  const resetTypeSelection = () => {
    setQuestionTypeSelected('');
    setAnswerTypeSelected('');
    setShowAnswerChoices(false);
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleTranslateOption = (choice: string, optionText: HTMLSpanElement, button: HTMLButtonElement) => {
    const currentButtonText = button.textContent?.trim();
    console.log('Translate button clicked:', { choice, currentButtonText, hasChoicesVi: !!currentQuestion.choicesVi });

    if (currentButtonText === 'Dịch') {
      // Kiểm tra xem có bản dịch không
      if (currentQuestion.choicesVi && currentQuestion.choicesVi[choice as keyof typeof currentQuestion.choicesVi]) {
        const vietnameseText = currentQuestion.choicesVi[choice as keyof typeof currentQuestion.choicesVi];
        console.log('Switching to Vietnamese:', vietnameseText);
        optionText.textContent = vietnameseText;
        button.textContent = 'English';
      } else {
        // Fallback: hiển thị bản dịch giả
        const englishText = currentQuestion.choices[choice as keyof typeof currentQuestion.choices];
        console.log('No Vietnamese translation, showing fallback');
        optionText.textContent = `[Bản dịch] ${englishText}`;
        button.textContent = 'English';
      }
    } else {
      // Quay lại tiếng Anh
      const englishText = currentQuestion.choices[choice as keyof typeof currentQuestion.choices];
      console.log('Switching back to English:', englishText);
      optionText.textContent = englishText;
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

  // Drag handlers for navigation
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - navPosition.x,
      y: e.clientY - navPosition.y
    });
  }, [navPosition]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      
      requestAnimationFrame(() => {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Keep within viewport bounds
        const maxX = window.innerWidth - 200; // Navigation width
        const maxY = window.innerHeight - 300; // Navigation height
        
        setNavPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

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
          audioElement.play().catch(error => {
            console.log('Auto-play failed:', error);
            // Disable auto-play if it fails
            setAutoPlayEnabled(false);
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, currentQuestion, isTestStarted, autoPlayEnabled, hasUserInteracted]);

  // Debug: Kiểm tra khi nào nút dịch được render
  useEffect(() => {
    if (userAnswers[currentQuestion?.id]) {
      console.log('Answer selected, Dịch buttons should be visible');
      console.log('Current question has choicesVi:', !!currentQuestion?.choicesVi);
    }
  }, [userAnswers, currentQuestion]);



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





  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Part 2 - Question-Response</h1>
        </div>

        <div className="flex justify-center mb-20">
          {/* Main Content */}
          <div className="w-full max-w-4xl">
            <div className="bg-white rounded-2xl p-8 shadow-lg relative">
              {/* Auto-play Button - Fixed to top right of card */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-md ${
                    autoPlayEnabled
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                >
                  {autoPlayEnabled ? '🔊 Auto ON' : '🔇 Auto OFF'}
                </button>
              </div>
              
              {/* Question Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Câu {currentQuestionIndex + 1} / {questions.length}
                  </h2>
                </div>
                
                {/* Audio Player */}
                <div className="mb-6">
                  <AudioPlayer audioSrc={currentQuestion.audio} />
                </div>

                {/* Type Selection Section */}
                {!showAnswerChoices && (
                  <div className="mb-6 relative min-h-[320px] pb-20">
                    <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-2">1</span>
                      Choose the question type:
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {questionTypes.map((type) => {
                        let buttonClass = "px-3 py-1 rounded-full border transition-all duration-200 text-sm whitespace-nowrap ";
                        if (questionTypeSelected === type.key) {
                          buttonClass += "border-blue-300 bg-blue-50 text-blue-600 shadow-sm";
                        } else {
                          buttonClass += "border-gray-200 hover:border-blue-200 hover:bg-blue-50/30";
                        }
                        return (
                          <button
                            key={type.key}
                            onClick={() => handleQuestionTypeSelect(type.key)}
                            className={buttonClass}
                          >
                            {type.label}
                          </button>
                        );
                      })}
                    </div>
                    <h3 className="text-base font-semibold text-gray-800 mb-3 mt-6 flex items-center">
                      <span className="bg-green-100 text-green-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-2">2</span>
                      Choose the appropriate answer type:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {answerTypes.map((type) => {
                        let buttonClass = "px-3 py-1 rounded-full border transition-all duration-200 text-sm whitespace-nowrap ";
                        if (answerTypeSelected === type.key) {
                          buttonClass += "border-blue-300 bg-blue-50 text-blue-600 shadow-sm";
                        } else {
                          buttonClass += "border-gray-200 hover:border-blue-200 hover:bg-blue-50/30";
                        }
                        return (
                          <button
                            key={type.key}
                            onClick={() => handleAnswerTypeSelect(type.key)}
                            className={buttonClass}
                          >
                            {type.label}
                          </button>
                        );
                      })}
                    </div>

                    
                    {/* Nút Continue sticky dưới card */}
                    {questionTypeSelected && answerTypeSelected && (
                      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, background: 'linear-gradient(to top, #fff 95%, transparent)'}} className="flex justify-center">
                        <button
                          onClick={handleTypeSelection}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full font-medium transition-colors shadow-lg"
                        >
                          Continue
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
                      
                      let buttonClass = "w-full text-left px-4 py-2 rounded-lg border transition-all ";
                      if (isSelected) {
                        if (isCorrect) {
                          buttonClass += "border-green-400 bg-green-100 text-green-800 font-semibold";
                        } else {
                          buttonClass += "border-red-400 bg-red-100 text-red-800";
                        }
                      } else if (showResult && isCorrect) {
                        buttonClass += "border-green-400 bg-green-100 text-green-800 font-semibold";
                      } else {
                        buttonClass += "border-gray-200 hover:bg-blue-50";
                      }

                      return (
                        <div key={choice}>
                          <div className={buttonClass}>
                            <div className="flex items-start">
                              <span className="font-semibold text-gray-600 mr-3 min-w-[20px]">
                                {choice}.
                              </span>
                              <div className="flex-1">
                                {/* Ẩn text đáp án sau khi đã chọn, chỉ hiển thị khi chưa chọn */}
                                {userAnswers[currentQuestion.id] === undefined ? (
                                  <button
                                    className="w-full text-left"
                                    onClick={() => handleAnswerSelect(currentQuestion.id, choice)}
                                  >
                                    <p className="text-gray-400 italic">Click để chọn đáp án</p>
                                  </button>
                                ) : (
                                  <div className="flex items-center">
                                    <span className="option-text">{currentQuestion.choices[choice as keyof typeof currentQuestion.choices]}</span>
                                    <button
                                      className="translate-option-btn bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs hover:bg-blue-200 ml-1 flex-shrink-0"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('Dịch button clicked for choice:', choice);
                                        console.log('Button element:', e.currentTarget);
                                        console.log('Previous element:', e.currentTarget.previousElementSibling);
                                        handleTranslateOption(
                                          choice,
                                          e.currentTarget.previousElementSibling as HTMLSpanElement,
                                          e.currentTarget as HTMLButtonElement
                                        );
                                      }}
                                      type="button"
                                    >
                                      Dịch
                                    </button>
                                  </div>
                                )}
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
                          </div>
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
                      className={`px-5 py-2.5 rounded-full font-medium transition-colors ${
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
                      className={`px-5 py-2.5 rounded-full font-medium transition-colors ${
                        currentQuestionIndex === questions.length - 1
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Next Question
                    </button>
                  </div>
                )}

                {/* Explanation Section */}
                {userAnswers[currentQuestion.id] !== undefined && (
                  <div className="mt-6">
                    {/* Question Transcript */}
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Question:</h4>
                      <div className="text-sm text-blue-900">
                        {currentQuestion.question}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="mb-2">
                        <span className="font-semibold text-gray-700">Explanation:</span>
                        <p className="text-gray-600 mt-1">{currentQuestion.explanation}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Tips:</span>
                        <p className="text-gray-600 mt-1">{currentQuestion.tips}</p>
                      </div>
                    </div>
                    
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>



        {/* Back Button */}
        <BackButton onClick={() => navigate('/part2')} text="← Back" />

        {/* Question Navigation - Draggable */}
        <div 
          className="fixed z-50 cursor-move select-none"
          style={{
            left: navPosition.x,
            top: navPosition.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div 
            className="bg-white rounded-2xl p-4 shadow-lg border-2 border-gray-200 hover:border-blue-300 transition-colors"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-800">Question Navigation</h3>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            </div>
              
              <div className="grid grid-cols-5 gap-1 mb-4">
                {questions.map((question, index) => (
                  <button
                    key={question.id}
                    className={`w-8 h-8 rounded-md text-xs font-medium transition-all ${
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

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Answered:</span>
                  <span className="font-semibold">{Object.keys(userAnswers).length}/{questions.length}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-semibold">
                    {Math.round((Object.keys(userAnswers).length / questions.length) * 100)}%
                  </span>
                </div>

                <button
                  className="w-full py-2 px-3 rounded-lg text-sm font-medium transition-all bg-green-600 text-white hover:bg-green-700"
                  onClick={handleFinishTest}
                >
                  Finish Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default TestPart2; 