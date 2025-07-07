import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// @ts-ignore
import levelData from '../data/toeic_part1.json';
import AudioPlayer from '../components/TestPart1/AudioPlayer';
import QuestionCard from '../components/TestPart1/QuestionCard';
import FloatingTimer from '../components/TestPart1/FloatingTimer'; 
import StatsBar from '../components/TestPart1/StatsBar';
import NotesPanel from '../components/TestPart1/NotesPanel';
import VocabularyPanel from '../components/TestPart1/VocabularyPanel';

interface Answer {
  selected: string;
  correct: string;
  isCorrect: boolean;
  skipped: boolean;
}

interface VocabularyWord {
  word: string;
  meaning: string;
  isCorrect: boolean;
}

interface VocabularyResult {
  subjectSelected: string[];
  descriptiveSelected: string[];
  subjectCorrect: number;
  descriptiveCorrect: number;
  totalSubject: number;
  totalDescriptive: number;
}

const QUESTIONS_PER_TEST = 6;

const TestPart1: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Lấy testId, category, level từ state
  const testIdRaw = location.state?.testId || 'people-level1-test1';
  let category = location.state?.category || 'people';
  let level = location.state?.level || 'level1';
  let testNumber = 1;

  if (typeof testIdRaw === 'string' && testIdRaw.includes('-test')) {
    const parts = testIdRaw.split('-');
    category = parts[0];
    level = parts[1];
    testNumber = parseInt(parts[2].replace('test', ''), 10);
  } else {
    testNumber = typeof testIdRaw === 'number' ? testIdRaw : 1;
  }
  level = level.trim();
  // Lấy đúng mảng câu hỏi theo chủ đề, level và testNumber
  const allQuestions = (levelData as any)[category]?.[level] || (levelData as any)[category]?.[level + ' '] || [];
  const testQuestions = allQuestions.slice((testNumber - 1) * QUESTIONS_PER_TEST, testNumber * QUESTIONS_PER_TEST);
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
  const [showVocabularyPanel, setShowVocabularyPanel] = useState(false);
  const [forceStopAudio, setForceStopAudio] = useState(false);
  const [vocabularyResetKey, setVocabularyResetKey] = useState(0);

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setTimeRemaining((prev) => {
  //       if (prev <= 0) {
  //         clearInterval(timer);
  //         finishTest();
  //         return 0;
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);

  //   return () => clearInterval(timer);
  // }, []);

  // Tắt audio khi component unmount
  useEffect(() => {
    return () => {
      setForceStopAudio(true);
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
    setForceStopAudio(false); // Reset force stop when question changes
  }, [currentQuestionIndex]);

  // Thêm useEffect để xử lý auto-play audio khi chuyển câu hỏi
  useEffect(() => {
    if (shouldAutoPlay && hasInteracted && vocabularyCompleted && audioRef.current && testQuestions[currentQuestionIndex]?.audio) {
      const audio = audioRef.current;
      
      // Đảm bảo audio đã được load
      if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
        audio.currentTime = 0;
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setShouldAutoPlay(false);
            })
            .catch((error) => {
              console.log('Auto-play failed:', error);
              // Trên Safari, có thể cần user interaction
              setShouldAutoPlay(false);
            });
        }
      } else {
        // Nếu audio chưa load xong, đợi đến khi load xong
        const handleCanPlay = () => {
          audio.currentTime = 0;
          const playPromise = audio.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setShouldAutoPlay(false);
              })
              .catch((error) => {
                console.log('Auto-play failed:', error);
                setShouldAutoPlay(false);
              });
          }
          audio.removeEventListener('canplay', handleCanPlay);
        };
        
        audio.addEventListener('canplay', handleCanPlay);
        
        return () => {
          audio.removeEventListener('canplay', handleCanPlay);
        };
      }
    }
  }, [currentQuestionIndex, shouldAutoPlay, hasInteracted, vocabularyCompleted, testQuestions]);

  const checkAnswer = () => {
    // Force stop audio when user answers
    setForceStopAudio(true);
    setTimeout(() => setForceStopAudio(false), 100);
    
    const question = testQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === question.correctAnswer;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      selected: selectedAnswer!,
      correct: question.correctAnswer,
      isCorrect,
      skipped: false,
    };
    setAnswers(newAnswers);
    setIsAnswered(true);
    if (isCorrect) {
      showConfetti();
    }
  };

  const handleVocabularyComplete = (subjectSelected: string[], descriptiveSelected: string[]) => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    const subjectVocabulary = currentQuestion.subjectVocabulary || [];
    const descriptiveVocabulary = currentQuestion.descriptiveVocabulary || [];
    
    const subjectCorrect = subjectVocabulary.filter((_: VocabularyWord, index: number) => 
      subjectSelected.includes(subjectVocabulary[index].word) === subjectVocabulary[index].isCorrect
    ).length;
    
    const descriptiveCorrect = descriptiveVocabulary.filter((_: VocabularyWord, index: number) => 
      descriptiveSelected.includes(descriptiveVocabulary[index].word) === descriptiveVocabulary[index].isCorrect
    ).length;
    
    const newVocabularyResult: VocabularyResult = {
      subjectSelected,
      descriptiveSelected,
      subjectCorrect,
      descriptiveCorrect,
      totalSubject: subjectVocabulary.length,
      totalDescriptive: descriptiveVocabulary.length
    };
    
    const newVocabularyResults = [...vocabularyResults];
    newVocabularyResults[currentQuestionIndex] = newVocabularyResult;
    setVocabularyResults(newVocabularyResults);
    setVocabularyCompleted(true);
  };

  const nextQuestion = () => {
    // Force stop audio
    setForceStopAudio(true);
    setTimeout(() => setForceStopAudio(false), 100);
    
    // Reset vocabulary panel
    setVocabularyResetKey(prev => prev + 1);
    
    setCurrentQuestionIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setPlayCount(0);
    setVocabularyCompleted(false);
    if (currentQuestionIndex + 1 >= testQuestions.length) {
      finishTest();
    }
  };

  const finishTest = () => {
    const correct = answers.filter((a) => a && a.isCorrect).length;
    const total = testQuestions.length;
    const score = Math.round((correct / total) * 100);
    
    // Calculate vocabulary score (bỏ qua phần tử undefined)
    const validResults = vocabularyResults.filter(Boolean);
    const totalVocabCorrect = validResults.reduce((sum, result) => 
      sum + result.subjectCorrect + result.descriptiveCorrect, 0
    );
    const totalVocabQuestions = validResults.reduce((sum, result) => 
      sum + result.totalSubject + result.totalDescriptive, 0
    );
    const vocabScore = totalVocabQuestions > 0 ? Math.round((totalVocabCorrect / totalVocabQuestions) * 100) : 0;
    
    alert(`Test completed!\nScore: ${score}%\nCorrect: ${correct}/${total}\nVocabulary Score: ${vocabScore}%\nVocabulary Correct: ${totalVocabCorrect}/${totalVocabQuestions}`);
    navigate('/');
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

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-800">TOEIC Part 1</h1>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Listening</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                onClick={() => setShowExitModal(true)}
              >
                Thoát
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* <FloatingTimer timeRemaining={timeRemaining} /> */}
      <main className="max-w-3xl mx-auto mb-6 px-4 py-6">
        {currentQuestionIndex < testQuestions.length && (
          <>            
            {/* Question Card with sticky Vocabulary Toggle Button */}
            <div className="relative">
              {/* Mobile: Nút lớn trên đầu */}
              {testQuestions[currentQuestionIndex]?.subjectVocabulary && !showVocabularyPanel && (
                <button
                  onClick={() => setShowVocabularyPanel(true)}
                  className="block lg:hidden w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mb-4 shadow"
                  style={{letterSpacing: '0.5px'}}
                >
                  Khái quát từ vựng
                </button>
              )}

              {/* Main content - Question Card (original size) */}
              <div className="max-w-3xl mx-auto relative">
                {testQuestions[currentQuestionIndex]?.audio && (
                  <>
                    <audio
                      ref={audioRef}
                      src={testQuestions[currentQuestionIndex].audio}
                      style={{ display: 'none' }}
                      onEnded={() => setPlayCount((c) => c + 1)}
                    />
                    <AudioPlayer
                      audioSrc={testQuestions[currentQuestionIndex].audio}
                      audioRef={audioRef as React.RefObject<HTMLAudioElement>}
                      forceStop={forceStopAudio}
                    />
                  </>
                )}
                <QuestionCard
                  question={testQuestions[currentQuestionIndex]}
                  currentQuestionIndex={currentQuestionIndex}
                  totalQuestions={testQuestions.length}
                  selectedAnswer={selectedAnswer}
                  isAnswered={isAnswered}
                  setSelectedAnswer={setSelectedAnswer}
                  nextQuestion={nextQuestion}
                  playCount={playCount}
                  maxPlays={maxPlays}
                  setPlayCount={setPlayCount}
                  showTranscript={showTranscript}
                  setShowTranscript={setShowTranscript}
                  hideImage={false}
                  onShowVocabularyPanel={typeof window !== 'undefined' && window.innerWidth >= 1024 && !showVocabularyPanel ? () => setShowVocabularyPanel(true) : undefined}
                />
                {/* Sticky Vocabulary Toggle Button - bám cạnh phải của card (desktop only)
                {testQuestions[currentQuestionIndex]?.subjectVocabulary && !showVocabularyPanel && (
                  <div className="hidden lg:flex items-center absolute" style={{ right: '-10%', top: '50%', transform: 'translateY(-50%)' }}>
                    <button
                      onClick={() => setShowVocabularyPanel(true)}
                      className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 shadow rounded-full hover:bg-blue-100 transition-colors"
                      title="Mở khái quát từ vựng"
                    >
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 5l5 5-5 5" />
                      </svg>
                    </button>
                    <span
                      onClick={() => setShowVocabularyPanel(true)}
                      className="ml-2 pr-2 font-medium cursor-pointer select-none animate-wiggle rounded-r-full text-gray-800"
                      style={{paddingTop: '6px', paddingBottom: '6px'}}>
                      Khái quát từ vựng
                    </span>
                  </div>
                )} */}
              </div>

              {/* Vocabulary Panel - Responsive */}
              {testQuestions[currentQuestionIndex]?.subjectVocabulary && showVocabularyPanel && (
                <>
                  {/* Desktop: panel bám dính cạnh phải màn hình */}
                  <div className="hidden lg:block fixed right-10 top-2 h-screen w-60 z-40">
                    <VocabularyPanel
                      subjectVocabulary={testQuestions[currentQuestionIndex].subjectVocabulary}
                      descriptiveVocabulary={testQuestions[currentQuestionIndex].descriptiveVocabulary || []}
                      onVocabularyComplete={handleVocabularyComplete}
                      isCompleted={vocabularyCompleted}
                      isAnswered={isAnswered}
                      imageUrl={testQuestions[currentQuestionIndex].image}
                      imageDescription={testQuestions[currentQuestionIndex].imageDescription}
                      onClose={() => setShowVocabularyPanel(false)}
                      resetKey={vocabularyResetKey}
                    />
                  </div>
                  {/* Mobile: bottom sheet */}
                  <div className="block lg:hidden fixed bottom-0 left-0 right-0 w-full z-40">
                    <div className="bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 max-h-[80vh] overflow-y-auto p-2">
                      <VocabularyPanel
                        subjectVocabulary={testQuestions[currentQuestionIndex].subjectVocabulary}
                        descriptiveVocabulary={testQuestions[currentQuestionIndex].descriptiveVocabulary || []}
                        onVocabularyComplete={handleVocabularyComplete}
                        isCompleted={vocabularyCompleted}
                        isAnswered={isAnswered}
                        imageUrl={testQuestions[currentQuestionIndex].image}
                        imageDescription={testQuestions[currentQuestionIndex].imageDescription}
                        onClose={() => setShowVocabularyPanel(false)}
                        resetKey={vocabularyResetKey}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>
      <StatsBar
        correct={correctCount}
        incorrect={incorrectCount}
        skipped={skippedCount}
        totalAnswered={totalAnswered}
      />
      <NotesPanel />
      {showExitModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Xác nhận thoát</h2>
            <p className="mb-6">Bạn có chắc chắn muốn thoát bài kiểm tra? Tiến độ sẽ không được lưu.</p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                onClick={() => setShowExitModal(false)}
              >
                Huỷ
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
                onClick={() => {
                  // Force stop audio when exiting
                  setForceStopAudio(true);
                  setShowExitModal(false);
                  navigate('/');
                }}
              >
                Thoát
              </button>
            </div>
          </div>
        </div>
      )}
      {!hasInteracted && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <button
            className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg"
            onClick={() => {
              setHasInteracted(true);
              setShouldAutoPlay(true);
              // Reset vocabulary panel khi bắt đầu
              setVocabularyResetKey(prev => prev + 1);
              // Đảm bảo audio được load và sẵn sàng phát
              if (audioRef.current && testQuestions[currentQuestionIndex]?.audio) {
                audioRef.current.load();
              }
            }}
          >
            Bắt đầu làm bài
          </button>
        </div>
      )}
    </div>
  );
};

export default TestPart1;