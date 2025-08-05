import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { part1Service, Part1Question } from '../services/part1Service';
import AudioPlayer from '../components/AudioPlayer';
import StatsBar from '../components/TestPart1/StatsBar';
import VocabularyPanel from '../components/TestPart1/VocabularyPanel';
import TestResults from '../components/TestPart1/TestResults';

interface VocabularyWord {
  word: string;
  meaning: string;
  pronunciation: string;
  isCorrect: boolean;
}

interface MCQStep {
  stepNumber: number;
  options: {
    value: string;
    text: string;
    pronunciation: string;
    meaning: string;
    isCorrect: boolean;
  }[];
}

interface Answer {
  selected: string;
  correct: string;
  isCorrect: boolean;
  skipped: boolean;
}

interface VocabularyResult {
  subjectSelected: string[];
  descriptiveSelected: string[];
  subjectCorrect: number;
  descriptiveCorrect: number;
  totalSubject: number;
  totalDescriptive: number;
}

interface MCQAnswer {
  questionIndex: number;
  step: number;
  selected: string;
  isCorrect: boolean;
}

const QUESTIONS_PER_TEST = 6;

const TestPart1: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Lấy testId, category, level từ state
  const testIdRaw = location.state?.testId || 'people-test1';
  let category = location.state?.category || 'people';
  let level = location.state?.level || 'level1';
  let testNumber = 1;

  if (typeof testIdRaw === 'string' && testIdRaw.includes('-test')) {
    const parts = testIdRaw.split('-');
    category = parts[0];
    testNumber = parseInt(parts[1].replace('test', ''), 10);
  } else {
    testNumber = typeof testIdRaw === 'number' ? testIdRaw : 1;
  }
  
  const [part1Questions, setPart1Questions] = useState<Part1Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load questions from Firebase
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        let questions: Part1Question[] = [];
        
        if (category === 'all') {
          questions = await part1Service.getAllQuestions();
        } else {
          questions = await part1Service.getQuestionsByType(category);
        }
        
        setPart1Questions(questions);
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
  const filteredQuestions = part1Questions;
  const sortedQuestions = filteredQuestions.sort((a, b) => a.questionNumber - b.questionNumber);
  const testQuestions = sortedQuestions.slice((testNumber - 1) * QUESTIONS_PER_TEST, testNumber * QUESTIONS_PER_TEST);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(Answer | null)[]>(Array(testQuestions.length).fill(null));
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [playCount, setPlayCount] = useState(0);
  const [maxPlays] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [vocabularyCompleted, setVocabularyCompleted] = useState(false);
  const [vocabularyResults, setVocabularyResults] = useState<VocabularyResult[]>([]);
  const [currentVocabularySelection, setCurrentVocabularySelection] = useState<{
    subjectSelected: string[];
    descriptiveSelected: string[];
  }>({ subjectSelected: [], descriptiveSelected: [] });
  
  const [allVocabularySelections, setAllVocabularySelections] = useState<{
    [questionIndex: number]: {
      subjectSelected: string[];
      descriptiveSelected: string[];
    };
  }>({});
  const [showVocabularyPanel, setShowVocabularyPanel] = useState(false);
  const [forceStopAudio, setForceStopAudio] = useState(false);
  const [vocabularyResetKey, setVocabularyResetKey] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [testResults, setTestResults] = useState<{
    score: number;
    correct: number;
    total: number;
    vocabScore: number;
    vocabCorrect: number;
    vocabTotal: number;
  } | null>(null);

  // New state for MCQ flow
  const [currentPhase, setCurrentPhase] = useState<'mcq' | 'audio'>('mcq');
  const [currentMCQStep, setCurrentMCQStep] = useState(1);
  const [mcqAnswers, setMcqAnswers] = useState<MCQAnswer[]>([]);
  const [mcqCompleted, setMcqCompleted] = useState(false);
  const [timer, setTimer] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showChoiceTexts, setShowChoiceTexts] = useState(false);
  const [translatedChoices, setTranslatedChoices] = useState<{[key: string]: boolean}>({});
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffledMCQOptions, setShuffledMCQOptions] = useState<{[step: number]: any[]}>({});

  // Function to shuffle array
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };



  // Tạo âm thanh ticking cho timer
  const playTickingSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Không thể phát âm thanh ticking:', error);
    }
  };

  // Tắt audio khi component unmount
  useEffect(() => {
    return () => {
      setForceStopAudio(true);
    };
  }, []);

  // Audio event listeners - simplified for default audio controls
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (selectedAnswer && !isAnswered) {
      checkAnswer();
    }
  }, [selectedAnswer]);

  useEffect(() => {
    setShouldAutoPlay(true);
    setPlayCount(1);
    setShowTranscript(false);
    setVocabularyCompleted(false);
    setCurrentPhase('mcq');
    setCurrentMCQStep(1);
    // Remove setMcqAnswers([]) - we want to accumulate answers from all questions
    setMcqCompleted(false);
    setTimer(10);
    setTimerActive(false);
    
    // Auto start timer for first question only if test has started
    if (currentQuestionIndex === 0 && testStarted) {
      setTimeout(() => {
        setTimerActive(true);
      }, 1000);
    }
    
    setShowTranslation(false);
    setShowChoiceTexts(false);
    setTranslatedChoices({});
    setPlaybackSpeed(1);
    setIsPlaying(false);
    
    // Khôi phục selection đã lưu cho câu hỏi hiện tại
    const savedSelection = allVocabularySelections[currentQuestionIndex];
    setCurrentVocabularySelection(savedSelection || { subjectSelected: [], descriptiveSelected: [] });
    
    setForceStopAudio(false); // Reset force stop when question changes
  }, [currentQuestionIndex, allVocabularySelections]);

  // Timer effect for MCQ phase
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timer > 0 && testStarted) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            // Timer hết, không phát âm thanh nữa, chuyển sang audio phase
            setTimeout(() => {
              switchToAudioPhase();
            }, 100);
          } else {
            // Phát âm thanh ticking mỗi giây (chỉ khi còn thời gian)
            playTickingSound();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer, testStarted]);

  // Auto start timer when test starts
  useEffect(() => {
    if (testStarted && currentPhase === 'mcq' && !mcqCompleted) {
      setTimerActive(true);
    }
  }, [testStarted, currentPhase, mcqCompleted]);

  const switchToAudioPhase = () => {
    // Dừng timer và âm thanh ticking
    setTimerActive(false);
    setTimer(0);
    
    setCurrentPhase('audio');
    setMcqCompleted(true);
    // Auto play audio after a short delay
    setTimeout(() => {
      if (audioRef.current && testQuestions[currentQuestionIndex]?.audio) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.log('Auto-play failed:', error);
        });
      }
    }, 1000);
  };

  const handleMCQAnswer = (step: number, selectedValue: string, isCorrect: boolean) => {
    const newAnswer: MCQAnswer = { 
      questionIndex: currentQuestionIndex, 
      step, 
      selected: selectedValue, 
      isCorrect 
    };
    setMcqAnswers(prev => {
      const updated = [...prev, newAnswer];
      return updated;
    });
    
    if (isCorrect) {
      // Correct answer - advance to next step
      if (step < 3) {
        setTimeout(() => {
          setCurrentMCQStep(step + 1);
        }, 1000);
      } else {
        // All steps completed correctly
        setTimeout(() => {
          switchToAudioPhase();
        }, 1000);
      }
    } else {
      // Wrong answer - go to audio phase immediately
      setTimeout(() => {
        switchToAudioPhase();
      }, 500);
    }
  };

  const checkAnswer = () => {
    const question = testQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === question.audioQuestion.correctAnswer;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      selected: selectedAnswer!,
      correct: question.audioQuestion.correctAnswer,
      isCorrect,
      skipped: false,
    };
    setAnswers(newAnswers);
    setIsAnswered(true);
    setShowChoiceTexts(true); // Show all choice texts when answered
    if (isCorrect) {
      showConfetti();
    }
  };

  // Auto check answer when user selects a choice
  useEffect(() => {
    if (selectedAnswer && !isAnswered) {
      checkAnswer();
    }
  }, [selectedAnswer]);

  const toggleChoiceTranslation = (choice: string) => {
    setTranslatedChoices(prev => ({
      ...prev,
      [choice]: !prev[choice]
    }));
  };

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const nextQuestion = () => {
    // Force stop audio
    setForceStopAudio(true);
    setTimeout(() => setForceStopAudio(false), 100);
    
    setCurrentQuestionIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setPlayCount(0);
    setVocabularyCompleted(false);
    setIsPlaying(false);
    
    // Reset MCQ Steps state
    setMcqAnswers([]);
    setCurrentPhase('mcq');
    setMcqCompleted(false);
    
    // Reset vocabulary results for new question
    setVocabularyResults([]);
    
    // Reset choice text display
    setShowChoiceTexts(false);
    setTranslatedChoices({});
    
    // Reset timer
    setTimer(10);
    setTimerActive(false);
    
    // Start timer for new question after a short delay only if test has started
    if (testStarted) {
      setTimeout(() => {
        setTimerActive(true);
      }, 500);
    }
    
    if (currentQuestionIndex + 1 >= testQuestions.length) {
      finishTest();
    }
  };

  const finishTest = () => {
    
    // Tắt timer và âm thanh ticking
    setTimerActive(false);
    setTimer(0);
    
    const correct = answers.filter((a) => a && a.isCorrect).length;
    const total = testQuestions.length;
    const score = Math.round((correct / total) * 100);
    
    // Calculate MCQ score
    let totalMCQCorrect = 0;
    let totalMCQQuestions = 0;
    
    mcqAnswers.forEach(answer => {
      totalMCQQuestions++;
      if (answer.isCorrect) {
        totalMCQCorrect++;
      }
    });
    
    const mcqScore = totalMCQQuestions > 0 ? Math.round((totalMCQCorrect / totalMCQQuestions) * 100) : 0;
    
    setTestResults({
      score,
      correct,
      total,
      vocabScore: mcqScore,
      vocabCorrect: totalMCQCorrect,
      vocabTotal: totalMCQQuestions
    });
    
    // Delay nhỏ để đảm bảo state được cập nhật
    setTimeout(() => {
      setShowScoreModal(true);
    }, 100);
  };

  const showConfetti = () => {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.backgroundColor = ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 5)];
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
      }, i * 100);
    }
  };

  const correctCount = answers.filter((a) => a && a.isCorrect).length;
  const incorrectCount = answers.filter((a) => a && !a.isCorrect && !a.skipped).length;
  const skippedCount = answers.filter((a) => a && a.skipped).length;
  const totalAnswered = answers.filter((a) => a && (a.selected || a.skipped)).length;

  const currentQuestion = testQuestions[currentQuestionIndex];
  const mcqSteps = currentQuestion?.mcqSteps || [];

  // Initialize shuffled options when question changes
  useEffect(() => {
    if (currentQuestion?.mcqSteps) {
      const shuffled: {[step: number]: any[]} = {};
      currentQuestion.mcqSteps.forEach((step, index) => {
        // Shuffle options for each step independently
        shuffled[index + 1] = shuffleArray([...step.options]);
      });
      setShuffledMCQOptions(shuffled);
    }
  }, [currentQuestionIndex, currentQuestion]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
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
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <header className="bg-white shadow-sm border-b border-gray-200">
         <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-800">TOEIC Part 1</h1>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Listening</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                onClick={() => navigate('/part1')}
              >
                Back
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                onClick={() => {
                  // Force stop audio
                  setForceStopAudio(true);
                  finishTest();
                }}
              >
                Finish Test
              </button>
            </div>
          </div>
        </div>
      </header>

             <main className="max-w-4xl mx-auto mb-6 px-4 py-6">
        {currentQuestionIndex < testQuestions.length && currentQuestion && (
          <>
            {/* Phase 1: MCQ Steps */}
            {currentPhase === 'mcq' && !mcqCompleted && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-start gap-6">
                  {/* MCQ Steps Section - 1/5 width */}
                  <div className="w-1/5">
                    <div className="bg-gray-50 rounded-xl p-3 mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-gray-800">Bước {currentMCQStep}: {getMCQStepTitle(currentMCQStep)}</h2>
                      </div>
                      
                      {mcqSteps[currentMCQStep - 1] && (
                        <div className="space-y-2">
                          {shuffledMCQOptions[currentMCQStep]?.map((option: any, index: number) => (
                            <div
                              key={index}
                              className={`bg-white border-2 border-gray-200 rounded-[50px] p-1 cursor-pointer transition-all duration-200 hover:border-blue-400 hover:shadow-sm ${
                                mcqAnswers.find(a => a.step === currentMCQStep && a.selected === option.value)
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200'
                              }`}
                              onClick={() => handleMCQAnswer(currentMCQStep, option.value, option.isCorrect)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 text-center">
                                  <div className="font-medium text-gray-800 text-xs">{option.text}</div>
                                  <div className="text-xs text-gray-500 italic">{option.pronunciation}</div>
                                </div>
                                <button
                                  className="text-gray-400 text-center hover:text-gray-600 text-xs ml-2 p-1 rounded transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Show tooltip with meaning
                                    const tooltip = document.createElement('div');
                                    tooltip.className = 'absolute bg-gray-800 text-white text-xs rounded px-2 py-1 z-50';
                                    tooltip.textContent = option.meaning;
                                    tooltip.style.left = e.currentTarget.offsetLeft + 'px';
                                    tooltip.style.top = (e.currentTarget.offsetTop - 30) + 'px';
                                    document.body.appendChild(tooltip);
                                    setTimeout(() => tooltip.remove(), 3000);
                                  }}
                                  title="Xem nghĩa"
                                >
                                  📖
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="text-center">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Bước {currentMCQStep}/3</span>
                        <span>{Math.round((currentMCQStep / 3) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mb-1">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${(currentMCQStep / 3) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">Progress</div>
                    </div>
                  </div>

                  {/* Image Section - 4/5 width */}
                  <div className="w-4/5">
                    <div className="relative">
                      <img
                        src={currentQuestion.image}
                        alt={currentQuestion.imageDescription || 'Question image'}
                        className="w-full rounded-xl object-contain max-h-96 shadow-lg"
                      />
                      {timerActive && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-lg">
                          {timer}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Phase 2: Audio Question */}
            {currentPhase === 'audio' && (
              <>
                {/* Image and Audio Section */}
                <div className="text-center mb-6">
                  <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
                    {/* Default Audio Player */}
                    {currentQuestion?.audio && (
                      <div className="mb-4">
                        <audio
                          ref={audioRef}
                          controls
                          className="w-full"
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                          onEnded={() => setIsPlaying(false)}
                          onLoadedMetadata={() => {
                            if (audioRef.current) {
                              audioRef.current.playbackRate = playbackSpeed;
                            }
                          }}
                        >
                          <source src={currentQuestion.audio} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                    
                    {/* Image */}
                    <div className="flex justify-center">
                      <img
                        src={currentQuestion.image}
                        alt={currentQuestion.imageDescription || 'Question image'}
                        className="max-h-96 w-full rounded-xl object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Question Section */}
                <div className="bg-gray-100 rounded-2xl p-6 max-w-2xl mx-auto">
                  <h3 className="text-lg font-semibold text-gray-800 mb-5 text-center">Chọn câu trả lời đúng nhất</h3>
                   
                    <div className="grid gap-4">
                      {(['A', 'B', 'C', 'D'] as const).map((choice) => {
                        const choiceData = currentQuestion.audioQuestion.choices?.[choice];
                        if (!choiceData) return null;
                        
                        return (
                        <div
                          key={choice}
                          className={`bg-white border-2 border-gray-200 rounded-[50px] p-1 transition-all duration-300 ${
                            isAnswered
                              ? choice === currentQuestion.audioQuestion.correctAnswer
                                ? 'border-green-500 bg-green-50'
                                : choice === selectedAnswer
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200'
                              : selectedAnswer === choice
                              ? 'border-blue-500 bg-blue-50 cursor-pointer hover:border-blue-600 hover:shadow-lg hover:-translate-y-0.5'
                              : 'border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-lg hover:-translate-y-0.5'
                          }`}
                          onClick={() => !isAnswered && setSelectedAnswer(choice)}
                        >
                          <div className="flex items-center">
                            <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                              {choice}
                            </div>
                            <div className="flex-1">
                              {showChoiceTexts ? (
                                <>
                                  {translatedChoices[choice] ? (
                                    <div className="text-base text-gray-700">{choiceData.vietnamese}</div>
                                  ) : (
                                    <div className="text-lg text-gray-800 mb-1">{choiceData.english}</div>
                                  )}
                                </>
                              ) : (
                                <div className="text-lg text-gray-500 italic">Click to select</div>
                              )}
                            </div>
                            {showChoiceTexts && (
                              <button
                                className="text-gray-400 hover:text-blue-500 text-base cursor-pointer p-2 rounded-full transition-all duration-200 ml-3 flex-shrink-0 hover:bg-blue-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleChoiceTranslation(choice);
                                }}
                                title={translatedChoices[choice] ? "Hiện tiếng Anh" : "Hiện tiếng Việt"}
                              >
                                📖
                              </button>
                            )}
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  {/* Next/Finish Button */}
                  {isAnswered && (
                    <div className="mt-3 text-right">
                      {currentQuestionIndex < testQuestions.length - 1 ? (
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                          onClick={nextQuestion}
                        >
                          Câu tiếp theo
                        </button>
                      ) : (
                        <button
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                          onClick={finishTest}
                        >
                          Kết thúc bài kiểm tra
                        </button>
                      )}
                    </div>
                  )}

                  {/* MCQ Results Summary */}
                  {mcqAnswers.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-3">Kết quả MCQ:</h4>
                      <div className="flex flex-wrap gap-2">
                        {mcqAnswers.map((answer, index) => (
                          <div
                            key={index}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              answer.isCorrect
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                          >
                            Bước {answer.step}: {answer.selected} {answer.isCorrect ? '✅' : '❌'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Result Display */}
                  {isAnswered && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        {selectedAnswer === currentQuestion.audioQuestion.correctAnswer ? '✅ Đúng!' : '❌ Sai!'}
                      </h4>
                      <p className="text-blue-600 text-sm">{currentQuestion.audioQuestion.traps}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </main>

      <StatsBar
        correct={correctCount}
        incorrect={incorrectCount}
        skipped={skippedCount}
        totalAnswered={totalAnswered}
      />

      {!hasInteracted && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <button
            className="flex items-center gap-2 px-6 py-3 rounded-full text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
            onClick={() => {
              setHasInteracted(true);
              setTestStarted(true);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-4.586-2.65A1 1 0 009 9.36v5.28a1 1 0 001.166.982l4.586-2.65a1 1 0 000-1.764z" />
            </svg>
            Start Test
          </button>
        </div>
      )}

      {showScoreModal && testResults && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-1">Finished!</h2>
              <p className="text-blue-100">You have completed the test</p>
            </div>
            
            {/* Score content */}
            <div className="p-6">
              {/* Main score */}
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-800 mb-2">{testResults.score}%</div>
                <div className="text-lg text-gray-600">Main score</div>
                <div className="text-sm text-gray-500 mt-1">
                  {testResults.correct}/{testResults.total} correct
                </div>
              </div>
              
              {/* MCQ score */}
              {testResults.vocabTotal > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{testResults.vocabScore}%</div>
                    <div className="text-sm text-gray-600">MCQ score</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {testResults.vocabCorrect}/{testResults.vocabTotal} correct
                    </div>
                  </div>
                </div>
              )}
              
              {/* Performance indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Performance</span>
                  <span className="font-medium">
                    {testResults.score >= 80 ? 'Xuất sắc' : 
                     testResults.score >= 60 ? 'Tốt' : 
                     testResults.score >= 40 ? 'Trung bình' : 'Cần cải thiện'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      testResults.score >= 80 ? 'bg-green-500' : 
                      testResults.score >= 60 ? 'bg-blue-500' : 
                      testResults.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${testResults.score}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-col space-y-3">
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200"
                  onClick={() => {
                    setShowScoreModal(false);
                    setShowDetailedResults(true);
                  }}
                >
                  View detailed results
                </button>
                <button
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors duration-200"
                  onClick={() => {
                    setShowScoreModal(false);
                    navigate('/part1');
                  }}
                >
                  Back to Part 1
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Results */}
      {showDetailedResults && testResults && (
        <TestResults
          questions={testQuestions}
          answers={answers}
          mcqAnswers={mcqAnswers}
          testResults={testResults}
          onClose={() => {
            setShowDetailedResults(false);
            navigate('/part1');
          }}
        />
      )}
    </div>
  );
};

// Helper function to get MCQ step titles
const getMCQStepTitle = (step: number): string => {
  switch (step) {
    case 1:
      return 'Chủ thể chính trong ảnh là gì?';
    case 2:
      return 'Chủ thể chính đang làm gì?';
    case 3:
      return 'Chủ thể chính đang ở đâu?';
    default:
      return '';
  }
};

export default TestPart1;