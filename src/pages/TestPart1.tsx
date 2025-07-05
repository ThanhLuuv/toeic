import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// @ts-ignore
import levelData from '../data/toeic_part1.json';
import AudioPlayer from '../components/TestPart1/AudioPlayer';
import QuestionCard from '../components/TestPart1/QuestionCard';
import FloatingTimer from '../components/TestPart1/FloatingTimer'; 
import StatsBar from '../components/TestPart1/StatsBar';
import NotesPanel from '../components/TestPart1/NotesPanel';

interface Answer {
  selected: string;
  correct: string;
  isCorrect: boolean;
  skipped: boolean;
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

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
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
  }, [currentQuestionIndex]);

  const checkAnswer = () => {
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

  const nextQuestion = () => {
    setCurrentQuestionIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setPlayCount(0);
    if (currentQuestionIndex + 1 >= testQuestions.length) {
      finishTest();
    }
  };

  const finishTest = () => {
    const correct = answers.filter((a) => a && a.isCorrect).length;
    const total = testQuestions.length;
    const score = Math.round((correct / total) * 100);
    alert(`Test completed!\nScore: ${score}%\nCorrect: ${correct}/${total}`);
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
      <FloatingTimer timeRemaining={timeRemaining} />
      <main className="max-w-3xl mx-auto mb-6 px-4 py-6">
        {currentQuestionIndex < testQuestions.length && (
          <>
            {testQuestions[currentQuestionIndex]?.audio && (
              <>
                <audio
                  ref={audioRef}
                  src={testQuestions[currentQuestionIndex].audio}
                  style={{ display: 'none' }}
                  onLoadedData={() => {
                    if (shouldAutoPlay && hasInteracted && audioRef.current) {
                      audioRef.current.currentTime = 0;
                      audioRef.current.play();
                      setShouldAutoPlay(false);
                    }
                  }}
                  onEnded={() => setPlayCount((c) => c + 1)}
                />
                <AudioPlayer
                  audioSrc={testQuestions[currentQuestionIndex].audio}
                  audioRef={audioRef as React.RefObject<HTMLAudioElement>}
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
            />
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