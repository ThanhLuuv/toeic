import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import part2Data from '../data/part2.json';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useAudioManager,
  HelpPanel,
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
  sentence_audio?: string;
}

const Part2DictationPractice: React.FC = () => {
  const { setIndex } = useParams<{ setIndex?: string }>();
  const setIdx = Number(setIndex) || 0;
  
  // Get the specific set of sentences based on setIndex
  const SENTENCES_PER_SET = 10;
  const startIndex = setIdx * SENTENCES_PER_SET;
  const endIndex = startIndex + SENTENCES_PER_SET;
  const sentences: Sentence[] = useMemo(() => 
    part2Data.slice(startIndex, endIndex), 
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
  const [showHelp, setShowHelp] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedSets, setCompletedSets] = useState<Set<number>>(new Set());

  // Use common audio manager
  const { playSuccessSound, playErrorSound, handlePlayAudio: originalHandlePlayAudio, stopCurrentAudio } = useAudioManager(soundEnabled);

  // Load completed sets from localStorage when component mounts
  React.useEffect(() => {
    const savedCompletedSets = localStorage.getItem('part2-completed-sets');
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

  // Initialize user inputs and results when current sentence changes
  useEffect(() => {
    if (sentences[currentIndex]) {
      const missingWords = sentences[currentIndex].words; // All words are missing
      setUserInputs(Array(missingWords.length).fill(''));
      setResult(Array(missingWords.length).fill(null));
      setUserRevealedAnswers(Array(missingWords.length).fill(false));
      setShowAnswer(false);
    }
  }, [currentIndex, setIdx]);

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
      if (sentences[currentIndex].sentence_audio) {
        handlePlayAudio(sentences[currentIndex].sentence_audio!, sentences[currentIndex].sentence);
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
  const allChecked = result.length > 0 && result.every(r => r !== null);
  const allCorrect = result.length > 0 && result.every(r => r === true);
  const showNextButton = allChecked && allCorrect && currentIndex < sentences.length - 1;
  const isSetCompleted = allCorrect && currentIndex === sentences.length - 1;

  // Save completed set to localStorage when set is completed
  useEffect(() => {
    if (isSetCompleted && !completedSets.has(setIdx)) {
      const newCompletedSets = new Set(completedSets);
      newCompletedSets.add(setIdx);
      setCompletedSets(newCompletedSets);
      localStorage.setItem('part2-completed-sets', JSON.stringify(Array.from(newCompletedSets)));
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

  // Help panel shortcuts
  const shortcuts = [
    { key: 'Enter', description: 'Check answer' },
    { key: 'Enter', description: 'Next sentence (after Check)' },
    { key: 'Shift', description: 'Replay audio' },
    { key: 'Ctrl', description: 'Show/hide answer' },
    { key: 'Tab', description: 'Next input field' }
  ];

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
      show: !allChecked
    },
    {
      text: 'Next',
      onClick: handleNext,
      variant: 'primary' as const,
      show: showNextButton
    },
    {
      text: 'Skip',
      onClick: handleNext,
      variant: 'warning' as const,
      show: currentIndex !== sentences.length - 1
    }
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
      
      <HelpPanel 
        showHelp={showHelp}
        onToggleHelp={() => setShowHelp(!showHelp)}
        shortcuts={shortcuts}
        position="top"
      />

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
          Topic: <b>TOEIC Part 2 - Question-Response (Set {setIdx + 1})</b>
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
          {currentSentence.sentence_audio && (
            <AudioButton 
              onClick={() => handlePlayAudio(currentSentence.sentence_audio!, currentSentence.sentence)}
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
              const elements = [];
              
              for (let i = 0; i < sentenceWords.length; i++) {
                const word = sentenceWords[i];
                // Loại bỏ dấu câu và hậu tố sở hữu 's hoặc ’s
                const cleanWord = word.replace(/[.,!?;:]/g, '').replace(/(’s|'s)$/i, '');
                
                // Check if this word is part of a missing word (including phrasal verbs)
                let isMissingWord = false;
                let missingWordObj = null;
                let wordCount = 1;
                
                for (const missingWord of missingWords) {
                  const missingWordParts = missingWord.word.split(' ');
                  
                  // Check if this word starts a phrasal verb or multi-word phrase
                  if (missingWordParts.length > 1) {
                    // Check if current word matches first part of phrasal verb
                    if (missingWordParts[0].toLowerCase() === cleanWord.toLowerCase()) {
                      // Check if next words match the rest of the phrasal verb
                      let matches = true;
                      for (let j = 1; j < missingWordParts.length; j++) {
                        if (i + j >= sentenceWords.length) {
                          matches = false;
                          break;
                        }
                        const nextWord = sentenceWords[i + j].replace(/[.,!?;:]/g, '');
                        if (missingWordParts[j].toLowerCase() !== nextWord.toLowerCase()) {
                          matches = false;
                          break;
                        }
                      }
                      
                      if (matches) {
                        isMissingWord = true;
                        missingWordObj = missingWord;
                        wordCount = missingWordParts.length;
                        break;
                      }
                    }
                  } else {
                    // Single word check
                    if (missingWord.word.toLowerCase() === cleanWord.toLowerCase()) {
                      isMissingWord = true;
                      missingWordObj = missingWord;
                      break;
                    }
                  }
                }
                
                if (isMissingWord && missingWordObj) {
                  const inputIndex = missingIndex;
                  const isChecked = result[inputIndex] !== null;
                  const isCorrect = result[inputIndex] === true;
                  missingIndex++;
                  
                  // Create input for the missing word/phrase
                  const inputElement = (
                    <span key={i}>
                      <input
                        ref={el => {
                          inputRefs.current[inputIndex] = el;
                        }}
                        type="text"
                        value={userInputs[inputIndex] || ''}
                        onChange={e => handleInputChange(e.target.value, inputIndex)}
                        onKeyDown={async e => {
                          if (e.key === 'Enter') {
                            if (!allChecked) {
                              await handleCheck();
                              justCheckedRef.current = true;
                            } else if (showNextButton && !justCheckedRef.current) {
                              handleNext();
                            }
                            setTimeout(() => { justCheckedRef.current = false; }, 0);
                          }
                          if (e.key === 'Shift' && e.shiftKey && !e.repeat) {
                            e.preventDefault();
                            handlePlayAudio(currentSentence.sentence_audio, currentSentence.sentence);
                          }
                          if (e.key === 'Control' && e.ctrlKey && !e.repeat) {
                            e.preventDefault();
                            setShowAnswer(prev => !prev);
                          }
                        }}
                        readOnly={isCorrect}
                        style={{
                          width: wordCount > 1 ? '120px' : '80px',
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
                        placeholder={wordCount > 1 ? '...' : '...'}
                      />
                      {isChecked && (
                        isCorrect ? 
                          <span style={{ color: '#4caf50', fontSize: 16, marginLeft: 2 }}>✔️</span> : 
                          <span style={{ color: '#f44336', fontSize: 16, marginLeft: 2 }}>❌</span>
                      )}
                    </span>
                  );
                  
                  elements.push(inputElement);
                  
                  // Skip the next words if it's a multi-word phrase
                  if (wordCount > 1) {
                    i += wordCount - 1;
                  }
                } else {
                  elements.push(<span key={i} style={{ margin: '0 2px' }}>{word}</span>);
                }
              }
              
              return elements;
            })()}
          </div>
          
          {/* Vietnamese Translation */}
          {allCorrect && (
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
              onClick={() => navigate('/')}
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
                         {setIdx < Math.ceil(part2Data.length / 10) - 1 && (
               <button
                 onClick={() => navigate(`/part2/${setIdx + 1}`)}
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
          }
        `}</style>
      </div>
    </div>
  );
};

export default Part2DictationPractice; 