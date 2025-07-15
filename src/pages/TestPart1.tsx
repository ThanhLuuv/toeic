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
import TestResults from '../components/TestPart1/TestResults';

interface VocabularyWord {
  word: string;
  meaning: string;
  isCorrect: boolean;
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

  // Scroll to explanation when answer is shown
  // useEffect(() => {
  //   if (isAnswered) {
  //     setTimeout(() => {
  //       const explanationSection = document.querySelector('.bg-green-50.border.border-green-200.rounded-lg');
  //       if (explanationSection) {
  //         explanationSection.scrollIntoView({ 
  //           behavior: 'smooth', 
  //           block: 'center',
  //           inline: 'nearest'
  //         });
  //       }
  //     }, 300); // Giảm delay còn 300ms cho mượt
  //   }
  // }, [isAnswered]);

  useEffect(() => {
    setShouldAutoPlay(true);
    setPlayCount(1);
    setShowTranscript(false);
    setVocabularyCompleted(false);
    
    // Khôi phục selection đã lưu cho câu hỏi hiện tại
    const savedSelection = allVocabularySelections[currentQuestionIndex];
    setCurrentVocabularySelection(savedSelection || { subjectSelected: [], descriptiveSelected: [] });
    
    setForceStopAudio(false); // Reset force stop when question changes
  }, [currentQuestionIndex, allVocabularySelections]);



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
    // ĐÃ LOẠI BỎ scroll đến card câu hỏi ở đây
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

  const handleVocabularySelection = (subjectSelected: string[], descriptiveSelected: string[]) => {
    setCurrentVocabularySelection({ subjectSelected, descriptiveSelected });
    
    // Lưu selection cho câu hỏi hiện tại
    setAllVocabularySelections(prev => ({
      ...prev,
      [currentQuestionIndex]: { subjectSelected, descriptiveSelected }
    }));
  };

  const nextQuestion = () => {
    // Lưu selection hiện tại trước khi chuyển câu hỏi
    if (currentVocabularySelection.subjectSelected.length > 0 || currentVocabularySelection.descriptiveSelected.length > 0) {
      setAllVocabularySelections(prev => ({
        ...prev,
        [currentQuestionIndex]: { 
          subjectSelected: currentVocabularySelection.subjectSelected, 
          descriptiveSelected: currentVocabularySelection.descriptiveSelected 
        }
      }));
    }
    
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
    
    // Calculate vocabulary score chỉ từ allVocabularySelections
    let totalVocabCorrect = 0;
    let totalVocabQuestions = 0;
    
    // Tính từ allVocabularySelections (tất cả selection của người dùng)
    Object.keys(allVocabularySelections).forEach(questionIndexStr => {
      const questionIndex = parseInt(questionIndexStr);
      const selection = allVocabularySelections[questionIndex];
      const question = testQuestions[questionIndex];
      
      const subjectVocabulary = question.subjectVocabulary || [];
      const descriptiveVocabulary = question.descriptiveVocabulary || [];
      
      // Tính số từ đúng cho subject vocabulary
      const subjectCorrect = subjectVocabulary.filter((word: VocabularyWord) => 
        selection.subjectSelected.includes(word.word) && word.isCorrect
      ).length;
      
      // Tính số từ đúng cho descriptive vocabulary
      const descriptiveCorrect = descriptiveVocabulary.filter((word: VocabularyWord) => 
        selection.descriptiveSelected.includes(word.word) && word.isCorrect
      ).length;
      
      totalVocabCorrect += subjectCorrect + descriptiveCorrect;
      totalVocabQuestions += subjectVocabulary.length + descriptiveVocabulary.length;
    });
    
    // Tính từ currentVocabularySelection (câu hiện tại)
    if (currentVocabularySelection.subjectSelected.length > 0 || currentVocabularySelection.descriptiveSelected.length > 0) {
      const currentQuestion = testQuestions[currentQuestionIndex];
      const subjectVocabulary = currentQuestion.subjectVocabulary || [];
      const descriptiveVocabulary = currentQuestion.descriptiveVocabulary || [];
      
      // Tính số từ đúng cho subject vocabulary
      const subjectCorrect = subjectVocabulary.filter((word: VocabularyWord) => 
        currentVocabularySelection.subjectSelected.includes(word.word) && word.isCorrect
      ).length;
      
      // Tính số từ đúng cho descriptive vocabulary
      const descriptiveCorrect = descriptiveVocabulary.filter((word: VocabularyWord) => 
        currentVocabularySelection.descriptiveSelected.includes(word.word) && word.isCorrect
      ).length;
      
      totalVocabCorrect += subjectCorrect + descriptiveCorrect;
      totalVocabQuestions += subjectVocabulary.length + descriptiveVocabulary.length;
      
      // Lưu selection hiện tại vào allVocabularySelections để TestResults có thể sử dụng
      setAllVocabularySelections(prev => ({
        ...prev,
        [currentQuestionIndex]: { 
          subjectSelected: currentVocabularySelection.subjectSelected, 
          descriptiveSelected: currentVocabularySelection.descriptiveSelected 
        }
      }));
    }
    
    const vocabScore = totalVocabQuestions > 0 ? Math.round((totalVocabCorrect / totalVocabQuestions) * 100) : 0;
    
    setTestResults({
      score,
      correct,
      total,
      vocabScore,
      vocabCorrect: totalVocabCorrect,
      vocabTotal: totalVocabQuestions
    });
    
    // Delay nhỏ để đảm bảo allVocabularySelections được cập nhật
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
            {/* Question Number Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 text-center">
                Câu {currentQuestionIndex + 1} / {testQuestions.length}
              </h2>
            </div>
            
            <div className="relative">
              {/* Nếu chưa hoàn thành từ vựng, chỉ hiện ảnh (nếu có) và VocabularyPanel ngay dưới ảnh */}
              {testQuestions[currentQuestionIndex]?.subjectVocabulary && !vocabularyCompleted && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                  {/* Ảnh nếu có */}
                  {testQuestions[currentQuestionIndex]?.image && (
                    <div className="flex justify-center mb-4">
                      <img
                        src={testQuestions[currentQuestionIndex].image}
                        alt={testQuestions[currentQuestionIndex].imageDescription || 'Question image'}
                        className="max-h-96 w-full rounded-xl object-contain"
                      />
                    </div>
                  )}
                  {/* VocabularyPanel nằm ngay dưới ảnh */}
                  <VocabularyPanel
                    subjectVocabulary={testQuestions[currentQuestionIndex].subjectVocabulary}
                    descriptiveVocabulary={testQuestions[currentQuestionIndex].descriptiveVocabulary || []}
                    onVocabularyComplete={handleVocabularyComplete}
                    onVocabularySelection={handleVocabularySelection}
                    isCompleted={vocabularyCompleted}
                    isAnswered={isAnswered}
                    imageUrl={testQuestions[currentQuestionIndex].image}
                    imageDescription={testQuestions[currentQuestionIndex].imageDescription}
                    resetKey={vocabularyResetKey}
                  />
                </div>
              )}
              {/* Khi đã hoàn thành từ vựng, mới hiện QuestionCard và AudioPlayer */}
              {vocabularyCompleted && (
                <>
                  {testQuestions[currentQuestionIndex]?.audio && (
                    <AudioPlayer
                      audioSrc={testQuestions[currentQuestionIndex].audio}
                      audioRef={audioRef as React.RefObject<HTMLAudioElement>}
                      forceStop={forceStopAudio}
                    />
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
                    onShowVocabularyPanel={undefined}
                  />
                  {/* Hiển thị bảng kết quả từ vựng sau khi đã trả lời xong */}
                  {isAnswered && (
                    <div className="mt-6">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Kết quả chọn từ vựng</h4>
                        {/* Chủ ngữ */}
                        <div className="mb-2">
                          <span className="font-semibold text-gray-700">Chủ ngữ:</span>
                          <ul className="list-none flex flex-wrap gap-2 mt-1">
                            {testQuestions[currentQuestionIndex].subjectVocabulary?.map((word: VocabularyWord, idx: number) => {
                              const selected = (allVocabularySelections[currentQuestionIndex]?.subjectSelected || []).includes(word.word);
                              const correct = word.isCorrect;
                              
                              // Determine styling based on selection and correctness
                              let styling = '';
                              let icon = '';
                              
                              if (selected && correct) {
                                // User selected correctly
                                styling = 'bg-green-100 border-green-400 text-green-800';
                                icon = '✔️';
                              } else if (selected && !correct) {
                                // User selected incorrectly
                                styling = 'bg-red-100 border-red-400 text-red-800';
                                icon = '❌';
                              } else if (!selected && correct) {
                                // User missed (should have selected but didn't)
                                styling = 'bg-yellow-100 border-yellow-400 text-yellow-800';
                                icon = '⚠️';
                              } else {
                                // User correctly didn't select
                                styling = 'bg-gray-100 border-gray-300 text-gray-500';
                                icon = '';
                              }
                              
                              return (
                                <li key={word.word} className={`px-3 py-1 rounded-lg text-sm font-medium border ${styling}`}>
                                  {word.word} {icon}
                                  <span className="ml-1 text-xs text-gray-400">({word.meaning})</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        {/* Bổ nghĩa */}
                        <div>
                          <span className="font-semibold text-gray-700">Bổ nghĩa:</span>
                          <ul className="list-none flex flex-wrap gap-2 mt-1">
                            {testQuestions[currentQuestionIndex].descriptiveVocabulary?.map((word: VocabularyWord, idx: number) => {
                              const selected = (allVocabularySelections[currentQuestionIndex]?.descriptiveSelected || []).includes(word.word);
                              const correct = word.isCorrect;
                              
                              // Determine styling based on selection and correctness
                              let styling = '';
                              let icon = '';
                              
                              if (selected && correct) {
                                // User selected correctly
                                styling = 'bg-green-100 border-green-400 text-green-800';
                                icon = '✔️';
                              } else if (selected && !correct) {
                                // User selected incorrectly
                                styling = 'bg-red-100 border-red-400 text-red-800';
                                icon = '❌';
                              } else if (!selected && correct) {
                                // User missed (should have selected but didn't)
                                styling = 'bg-yellow-100 border-yellow-400 text-yellow-800';
                                icon = '⚠️';
                              } else {
                                // User correctly didn't select
                                styling = 'bg-gray-100 border-gray-300 text-gray-500';
                                icon = '';
                              }
                              
                              return (
                                <li key={word.word} className={`px-3 py-1 rounded-lg text-sm font-medium border ${styling}`}>
                                  {word.word} {icon}
                                  <span className="ml-1 text-xs text-gray-400">({word.meaning})</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
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
                  // Lưu selection hiện tại trước khi thoát
                  if (currentVocabularySelection.subjectSelected.length > 0 || currentVocabularySelection.descriptiveSelected.length > 0) {
                    setAllVocabularySelections(prev => ({
                      ...prev,
                      [currentQuestionIndex]: { 
                        subjectSelected: currentVocabularySelection.subjectSelected, 
                        descriptiveSelected: currentVocabularySelection.descriptiveSelected 
                      }
                    }));
                  }
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
  className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-medium text-indigo-600 border border-indigo-300 bg-white hover:bg-indigo-50 transition-all duration-200"
  onClick={() => {
    setHasInteracted(true);
    setShouldAutoPlay(true);
    setVocabularyResetKey(prev => prev + 1);
    if (audioRef.current && testQuestions[currentQuestionIndex]?.audio) {
      audioRef.current.load();
    }
  }}
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-4.586-2.65A1 1 0 009 9.36v5.28a1 1 0 001.166.982l4.586-2.65a1 1 0 000-1.764z" />
  </svg>
  Bắt đầu làm bài
</button>

        </div>
      )}
      {showScoreModal && testResults && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold mb-1">Hoàn thành!</h2>
              <p className="text-blue-100">Bạn đã hoàn thành bài kiểm tra</p>
            </div>
            
            {/* Score content */}
            <div className="p-6">
              {/* Main score */}
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gray-800 mb-2">{testResults.score}%</div>
                <div className="text-lg text-gray-600">Điểm số chính</div>
                <div className="text-sm text-gray-500 mt-1">
                  {testResults.correct}/{testResults.total} câu đúng
                </div>
              </div>
              
              {/* Vocabulary score */}
              {testResults.vocabTotal > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{testResults.vocabScore}%</div>
                    <div className="text-sm text-gray-600">Điểm từ vựng</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {testResults.vocabCorrect}/{testResults.vocabTotal} từ đúng
                    </div>
                  </div>
                </div>
              )}
              
              {/* Performance indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Hiệu suất</span>
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
                  Xem kết quả chi tiết
                </button>
                <button
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors duration-200"
                  onClick={() => {
                    setShowScoreModal(false);
                    navigate('/part1');
                  }}
                >
                  Quay lại trang Part 1
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
          vocabularyResults={vocabularyResults}
          currentVocabularySelection={currentVocabularySelection}
          allVocabularySelections={allVocabularySelections}
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

export default TestPart1;