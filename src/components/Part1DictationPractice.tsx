import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import part1Data from '../data/part1.json';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useAudioManager,
  ProgressBar,
  SoundToggle,
  BackButton,
  AudioButton,
  ActionButtons,
  AnswerDisplay
} from './common';

interface Word {
  word: string;
  type: string;
  phonetic: string;
  meaning: string;
}

interface Sentence {
  sentence: string;
  sentence_translation: string;
  words: Word[];
  audio?: string;
}

const Part1DictationPractice: React.FC = () => {
  const { setIndex } = useParams<{ setIndex?: string }>();
  const setIdx = Number(setIndex) || 0;
  
  // Get the specific set of sentences based on setIndex
  const SENTENCES_PER_SET = 10;
  const startIndex = setIdx * SENTENCES_PER_SET;
  const endIndex = startIndex + SENTENCES_PER_SET;
  const sentences: Sentence[] = useMemo(() => 
    part1Data.slice(startIndex, endIndex), 
    [setIdx]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [result, setResult] = useState<(boolean | null)[]>([]);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [userRevealedAnswers, setUserRevealedAnswers] = useState<boolean[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const justCheckedRef = useRef(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedSets, setCompletedSets] = useState<Set<number>>(new Set());

  // Use common audio manager
  const { playSuccessSound, playErrorSound, handlePlayAudio: originalHandlePlayAudio, stopCurrentAudio } = useAudioManager(soundEnabled);

  // Load completed sets from localStorage when component mounts
  React.useEffect(() => {
    const savedCompletedSets = localStorage.getItem('part1-completed-sets');
    if (savedCompletedSets) {
      try {
        const parsed = JSON.parse(savedCompletedSets);
        setCompletedSets(new Set(parsed));
      } catch (e) {
        console.error('Lỗi load completed sets:', e);
      }
    }
  }, []);

  // Memoize handlePlayAudio to prevent unnecessary re-renders, đảm bảo dừng audio cũ trước khi phát mới
  const handlePlayAudio = useCallback((audioUrl?: string, text?: string) => {
    stopCurrentAudio();
    originalHandlePlayAudio(audioUrl, text);
  }, [originalHandlePlayAudio, stopCurrentAudio]);

  // When moving to a new set, reset all state first
  useEffect(() => {
    setCurrentIndex(0);
    setUserInputs([]);
    setResult([]);
    setShowAnswer(false);
    setUserRevealedAnswers([]);
  }, [setIndex]);

  // Initialize user inputs and results when current sentence changes
  useEffect(() => {
    if (sentences[currentIndex]) {
      const missingWords = sentences[currentIndex].words; // All words are missing
      setUserInputs(Array(missingWords.length).fill(''));
      setResult(Array(missingWords.length).fill(null));
      setUserRevealedAnswers(Array(missingWords.length).fill(false));
      setShowAnswer(false);
    }
  }, [currentIndex, sentences]);

  const handleInputChange = (value: string, inputIndex: number) => {
    const newInputs = [...userInputs];
    newInputs[inputIndex] = value;
    setUserInputs(newInputs);
    // Reset result for this word so user can retry immediately
    const newResult = [...result];
    newResult[inputIndex] = null;
    setResult(newResult);
  };

  const handleCheck = async () => {
    const normalize = (str: string) =>
      (str || '')
        .trim()
        .normalize('NFC')
        .replace(/[’‘`´]/g, "'") // chuyển mọi loại nháy về nháy thẳng
        .replace(/\W/g, '')
        .toLowerCase();

    const currentSentence = sentences[currentIndex];
    const missingWords = currentSentence.words; // All words are missing
    const newResult = [...result];
    let allCorrect = true;

    missingWords.forEach((word, index) => {
      const isCorrect = normalize(word.word) === normalize(userInputs[index]);
      newResult[index] = isCorrect;
      if (!isCorrect) allCorrect = false;
    });

    setResult(newResult);
    
    if (allCorrect) {
      await playSuccessSound();
      setShowAnswer(true);
    } else {
      await playErrorSound();
    }
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleReset = () => {
    const missingWords = sentences[currentIndex].words; // All words are missing
    setUserInputs(Array(missingWords.length).fill(''));
    setResult(Array(missingWords.length).fill(null));
    setShowAnswer(false);
    setUserRevealedAnswers(Array(missingWords.length).fill(false));
  };

  useEffect(() => {
    if (sentences[currentIndex]) {
      if (sentences[currentIndex].audio) {
        handlePlayAudio(sentences[currentIndex].audio!, sentences[currentIndex].sentence);
      }
    }
    setShowAnswer(false);
    // Focus on first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, setIdx]);

  const currentSentence = sentences[currentIndex];
  const missingWords = useMemo(() => 
    currentSentence?.words || [], 
    [currentSentence]
  );
  const progress = Math.round(((currentIndex + 1) / sentences.length) * 100);
  const showNextButton = result.length > 0 && result.every(r => r !== null) && result.every(r => r === true) && currentIndex < sentences.length - 1;
  const isSetCompleted = result.length > 0 && result.every(r => r === true) && currentIndex === sentences.length - 1;

  // Save completed set to localStorage when set is completed
  useEffect(() => {
    if (isSetCompleted && !completedSets.has(setIdx)) {
      const newCompletedSets = new Set(completedSets);
      newCompletedSets.add(setIdx);
      setCompletedSets(newCompletedSets);
      localStorage.setItem('part1-completed-sets', JSON.stringify(Array.from(newCompletedSets)));
    }
  }, [isSetCompleted, setIdx, completedSets]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (showNextButton && e.key === 'Enter' && !justCheckedRef.current) {
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showNextButton]);

  if (!currentSentence) return <div style={{ textAlign: 'center', marginTop: 40 }}>No data available!</div>;

  // Action buttons configuration
  const actionButtons = [
    {
      text: '←',
      onClick: handlePrev,
      variant: 'secondary' as const,
      disabled: currentIndex === 0,
      show: true
    },
    {
      text: 'Check',
      onClick: handleCheck,
      variant: 'success' as const,
      disabled: userInputs.some(input => !input.trim()),
      show: result.length > 0 && result.some(r => r === null) && userInputs.some(input => input.trim())
    },
    {
      text: 'Next',
      onClick: handleNext,
      variant: 'primary' as const,
      show: showNextButton
    },
    {
      text: '⏭',
      onClick: handleNext,
      variant: 'warning' as const,
      show: currentIndex !== sentences.length - 1
    },
    // {
    //   text: 'Reset',
    //   onClick: handleReset,
    //   variant: 'secondary' as const,
    //   show: true
    // }
  ];

  // Answer display configuration
  const answerItems = showAnswer ? missingWords.map(word => ({
    word: word.word,
    phonetic: word.phonetic,
    type: word.type,
    meaning: word.meaning
  })) : [];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f7f9fb',
      position: 'relative',
    }}>
      <BackButton onClick={() => navigate('/')} />
      


      {/* Main Practice Card */}
      <div style={{
        maxWidth: 600,
        width: '100%',
        margin: '0 auto',
        padding: 24,
        border: '1px solid #e0e0e0',
        borderRadius: 16,
        background: '#fff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        fontFamily: 'inherit',
        position: 'relative',
      }}>
        <SoundToggle 
          soundEnabled={soundEnabled}
          onToggle={() => setSoundEnabled(!soundEnabled)}
        />

        <ProgressBar progress={progress} />

        <div style={{ textAlign: 'center', color: '#888', fontSize: 15, marginBottom: 18 }}>
          Topic: <b>TOEIC Part 1 - Photo Description (Set {setIdx + 1})</b>
          {completedSets.has(setIdx) && (
            <span style={{ 
              marginLeft: 8, 
              background: '#14B24C', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: 12, 
              fontSize: 12,
              fontWeight: 'bold'
            }}>
              ✓ Finished
            </span>
          )}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 12, color: '#555', fontSize: 15 }}>
          <span style={{ background: '#f5f5f5', borderRadius: 8, padding: '2px 12px' }}>
            Sentence {currentIndex + 1} / {sentences.length}
          </span>
        </div>

        {/* Audio Button */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          {currentSentence.audio && (
            <AudioButton 
              onClick={() => handlePlayAudio(currentSentence.audio!, currentSentence.sentence)}
              title="Play sentence"
            />
          )}
        </div>

        {/* Sentence Display */}
        <div style={{ 
          background: '#f8fafc', 
          border: '2px solid #e2e8f0', 
          borderRadius: '12px', 
          padding: '20px', 
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '18px', lineHeight: '1.6', color: '#1e293b', marginBottom: '12px' }}>
            {(() => {
              const sentenceWords = currentSentence.sentence.split(' ');
              const missingWords = currentSentence.words;
              let missingIndex = 0;
              
              return sentenceWords.map((word, index) => {
                // Clean word from punctuation for comparison
                const cleanWord = word.replace(/[.,!?;:]/g, '');
                
                // Check if this word is a missing word
                const isMissingWord = missingWords.some(missingWord => 
                  missingWord.word.toLowerCase() === cleanWord.toLowerCase()
                );
                
                // Debug log
                console.log(`Word: "${word}" (clean: "${cleanWord}"), Missing words:`, missingWords.map(w => w.word), `Is missing: ${isMissingWord}`);
                
                if (isMissingWord) {
                  const inputIndex = missingIndex;
                  const isChecked = result[inputIndex] !== null;
                  const isCorrect = result[inputIndex] === true;
                  missingIndex++;
                  
                  return (
                    <span key={index}>
                      <input
                        ref={el => {
                          inputRefs.current[inputIndex] = el;
                        }}
                        type="text"
                        value={userInputs[inputIndex] || ''}
                        onChange={e => handleInputChange(e.target.value, inputIndex)}
                        onKeyDown={async e => {
                          if (e.key === 'Enter') {
                            if (result.some(r => r === null)) {
                              await handleCheck();
                              justCheckedRef.current = true;
                            } else if (showNextButton && !justCheckedRef.current) {
                              handleNext();
                            }
                            setTimeout(() => { justCheckedRef.current = false; }, 0);
                          }
                          if (e.key === 'Shift' && e.shiftKey && !e.repeat) {
                            e.preventDefault();
                            handlePlayAudio(currentSentence.audio, currentSentence.sentence);
                          }
                          if (e.key === 'Control' && e.ctrlKey && !e.repeat) {
                            e.preventDefault();
                            setShowAnswer(prev => !prev);
                          }
                        }}
                        readOnly={isCorrect}
                        style={{
                          width: '80px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: result[inputIndex] === false
                            ? '2px solid #dc2626'
                            : result[inputIndex] === true
                              ? '2px solid #059669'
                              : '2px solid #cbd5e1',
                          textAlign: 'center',
                          background: isChecked 
                            ? (isCorrect ? '#f0fdf4' : '#fef2f2') 
                            : '#ffffff',
                          color: result[inputIndex] === false
                            ? '#dc2626'
                            : result[inputIndex] === true
                              ? '#059669'
                              : '#1e293b',
                          fontWeight: isChecked && isCorrect ? '600' : '500',
                          fontSize: '16px',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          fontFamily: 'inherit',
                          margin: '0 4px'
                        }}
                        autoComplete="off"
                        placeholder="..."
                      />
                                             {isChecked && result[inputIndex] !== null && (
                         isCorrect ? 
                           <span style={{ color: '#14B24C', fontSize: 16, marginLeft: 2 }}>✔️</span> : 
                           <span style={{ color: '#f44336', fontSize: 16, marginLeft: 2 }}>❌</span>
                       )}
                    </span>
                  );
                } else {
                  return <span key={index} style={{ margin: '0 2px' }}>{word}</span>;
                }
              });
            })()}
          </div>
          
          {/* Vietnamese Translation */}
          {result.length > 0 && result.every(r => r === true) && (
            <div style={{ 
              fontSize: '14px', 
              color: '#64748b', 
              fontStyle: 'italic',
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid #e2e8f0'
            }}>
              {currentSentence.sentence_translation}
            </div>
          )}
        </div>

        <ActionButtons buttons={actionButtons} />

        {/* Keyboard Shortcuts Hints */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '16px',
          fontSize: '11px',
          color: '#888',
          fontFamily: 'monospace'
        }}>
          <span style={{
            background: '#f8f9fa',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #e9ecef'
          }}>
            <kbd style={{ background: '#fff', border: '1px solid #ccc', borderRadius: '3px', padding: '1px 4px', fontSize: '10px' }}>Enter</kbd> Check/Next
          </span>
          <span style={{
            background: '#f8f9fa',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #e9ecef'
          }}>
            <kbd style={{ background: '#fff', border: '1px solid #ccc', borderRadius: '3px', padding: '1px 4px', fontSize: '10px' }}>Shift</kbd> Audio
          </span>
          <span style={{
            background: '#f8f9fa',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #e9ecef'
          }}>
            <kbd style={{ background: '#fff', border: '1px solid #ccc', borderRadius: '3px', padding: '1px 4px', fontSize: '10px' }}>Ctrl</kbd> Show Answer
          </span>
        </div>

        <AnswerDisplay
          showAnswer={showAnswer}
          onToggleAnswer={() => {
            setShowAnswer(true);
            const newRevealed = [...userRevealedAnswers];
            newRevealed.fill(true);
            setUserRevealedAnswers(newRevealed);
          }}
          answers={answerItems}
          title="Missing words:"
        />

        {currentIndex === sentences.length - 1 && result.length > 0 && result.every(r => r === true) && (
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            {!completedSets.has(setIdx) && (
              <div style={{ 
                background: '#14B24C', 
                color: 'white', 
                padding: '12px 20px', 
                borderRadius: 8, 
                marginBottom: 16,
                fontWeight: 'bold',
                fontSize: 16
              }}>
                  🎉 Congratulations! You have finished Set {setIdx + 1}
              </div>
            )}
            <button
              onClick={() => navigate('/dictation-list/?tab=part1')}
              style={{
                background: '#14B24C', 
                color: 'white', 
                border: 'none', 
                borderRadius: 8, 
                padding: '10px 32px', 
                fontWeight: 700, 
                fontSize: 16, 
                cursor: 'pointer', 
                boxShadow: '0 2px 8px #e0e0e0', 
                marginTop: 8, marginRight: 12
              }}
            >
              ← Back to List
            </button>
            {setIdx < Math.ceil(part1Data.length / 10) - 1 && (
              <button
                onClick={() => navigate(`/part1/${setIdx + 1}`)}
                style={{
                  background: '#0284c7', color: 'white', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #e0e0e0', marginTop: 8
                }}
              >
                Next Set →
              </button>
            )}
          </div>
        )}

        {/* Responsive style */}
        <style>{`
          @media (max-width: 600px) {
            div[style*='max-width: 600px'] {
              max-width: 98vw !important;
              padding: 10px !important;
            }
            input[type='text'] {
              width: 60px !important;
              min-width: 0 !important;
              font-size: 14px !important;
            }
            div[style*='gap: 20px'] {
              gap: 8px !important;
              flex-wrap: wrap !important;
            }
            div[style*='gap: 20px'] span {
              font-size: 10px !important;
              padding: 1px 4px !important;
            }
            div[style*='gap: 20px'] kbd {
              font-size: 9px !important;
              padding: 1px 3px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Part1DictationPractice; 