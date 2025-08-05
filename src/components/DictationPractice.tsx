import React, { useState, useEffect, useRef } from 'react';
import { vocabularyService, Vocabulary } from '../services/vocabularyService';
import { useParams, useNavigate } from 'react-router-dom';
import { generateExampleSentence } from './TestPart1/aiUtils';
import {
  useAudioManager,
  ProgressBar,
  SoundToggle,
  BackButton,
  AudioButton,
  ActionButtons,
  AnswerDisplay
} from './common';

interface VocabItem {
  word: string;
  type: string;
  phonetic: string;
  meaning: string;
  audio?: string;
  topic?: string;
}

const NUM_WORDS = 20;

const DictationPractice: React.FC = () => {
  const { setIndex } = useParams<{ setIndex?: string }>();
  const setIdx = Number(setIndex) || 0;
  const [vocabList, setVocabList] = useState<VocabItem[]>([]);
  const [allVocabulary, setAllVocabulary] = useState<VocabItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState<string[]>(Array(NUM_WORDS).fill(''));
  const [result, setResult] = useState<(boolean | null)[]>(Array(NUM_WORDS).fill(null));
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [userRevealedAnswers, setUserRevealedAnswers] = useState<boolean[]>(Array(NUM_WORDS).fill(false));
  const [showModal, setShowModal] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const justCheckedRef = useRef(false);
  const [showHelp, setShowHelp] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedSets, setCompletedSets] = useState<Set<number>>(new Set());
  const [isSetLoaded, setIsSetLoaded] = useState(false);
  const [exampleSentence, setExampleSentence] = useState<any>(null);
  const [isGeneratingExample, setIsGeneratingExample] = useState(false);

  // Use common audio manager
  const { playSuccessSound, playErrorSound, handlePlayAudio } = useAudioManager(soundEnabled);

  // Load vocabulary data from Firebase
  useEffect(() => {
    const loadVocabulary = async () => {
      try {
        setIsLoading(true);
        setIsSetLoaded(false);
        setError(null);
        
        // Get all topics and vocabulary grouped by topic
        const topics = await vocabularyService.getAllTopics();
        const allVocabulary = await vocabularyService.getAllVocabulary(1000);
        
        // Convert to VocabItem format
        const vocabItems: VocabItem[] = allVocabulary.map((vocab: Vocabulary) => ({
          word: vocab.word,
          type: vocab.type,
          phonetic: vocab.phonetic,
          meaning: vocab.meaning,
          audio: vocab.audio,
          topic: vocab.topic
        }));
        
        setAllVocabulary(vocabItems);
        
        // Group vocabulary by topic and create sets
        const vocabSetsByTopic: VocabItem[][] = [];
        
        for (const topic of topics) {
          const topicVocabulary = vocabItems.filter(vocab => vocab.topic === topic);
          
          // Remove duplicates (case-insensitive)
          const uniqueVocabulary = topicVocabulary.filter((vocab, index, self) => 
            index === self.findIndex(v => v.word.toLowerCase() === vocab.word.toLowerCase())
          );
          
          // Create sets of NUM_WORDS words per topic
          for (let i = 0; i < uniqueVocabulary.length; i += NUM_WORDS) {
            const set = uniqueVocabulary.slice(i, i + NUM_WORDS);
            if (set.length > 0) {
              vocabSetsByTopic.push(set);
            }
          }
        }
        
        // Add vocabulary without topic to "Other" category
        const vocabWithoutTopic = vocabItems.filter(vocab => !vocab.topic);
        const uniqueVocabWithoutTopic = vocabWithoutTopic.filter((vocab, index, self) => 
          index === self.findIndex(v => v.word.toLowerCase() === vocab.word.toLowerCase())
        );
        
        for (let i = 0; i < uniqueVocabWithoutTopic.length; i += NUM_WORDS) {
          const set = uniqueVocabWithoutTopic.slice(i, i + NUM_WORDS);
          if (set.length > 0) {
            vocabSetsByTopic.push(set);
          }
        }
        
        console.log(`Total vocabulary sets: ${vocabSetsByTopic.length}, requested set index: ${setIdx}`);
        
        // Get the vocabulary set for the requested index
        if (setIdx >= 0 && setIdx < vocabSetsByTopic.length) {
          const currentSetVocab = vocabSetsByTopic[setIdx];
          console.log(`Loading set ${setIdx}: ${currentSetVocab.length} words, topic: ${currentSetVocab[0]?.topic || 'Other'}`);
          setVocabList(currentSetVocab);
          
          // Reset user inputs and results for the new set
          setUserInputs(Array(currentSetVocab.length).fill(''));
          setResult(Array(currentSetVocab.length).fill(null));
          setCurrentIndex(0);
          setShowAnswer(false);
          setUserRevealedAnswers(Array(currentSetVocab.length).fill(false));
          setShowModal(false);
          
          // Mark set as loaded
          setIsSetLoaded(true);
        } else {
          console.error(`Set index ${setIdx} is out of range. Available sets: ${vocabSetsByTopic.length}`);
          setError(`Set ${setIdx + 1} not found. Please try a different set.`);
          setVocabList([]);
          setIsSetLoaded(false);
        }
        
      } catch (err) {
        console.error('Error loading vocabulary:', err);
        setError('Failed to load vocabulary data. Please try again.');
        setVocabList([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadVocabulary();
  }, [setIdx]);

  const handleInputChange = (value: string) => {
    const newInputs = [...userInputs];
    newInputs[currentIndex] = value;
    setUserInputs(newInputs);
    // Reset result for this word so user can retry immediately
    const newResult = [...result];
    newResult[currentIndex] = null;
    setResult(newResult);
  };

  const handleCheck = async () => {
    const normalize = (str: string) =>
      (str || '')
        .trim()
        .normalize('NFC')
        .replace(/\W/g, '')
        .toLowerCase();
    const newResult = [...result];
    const currentItem = vocabList[currentIndex];
    const isCorrectNow = normalize(currentItem.word) === normalize(userInputs[currentIndex]);
    newResult[currentIndex] = isCorrectNow;
    setResult(newResult);
    
    console.log('Check result:', isCorrectNow, 'Sound enabled:', soundEnabled);
    
    if (isCorrectNow) {
      console.log('Playing success sound...');
      await playSuccessSound();
      setShowAnswer(true);
      setShowModal(true);
    } else {
      console.log('Playing error sound...');
      await playErrorSound();
    }
  };

  const handleNext = () => {
    // If this is the last word in the current set
    if (currentIndex === vocabList.length - 1) {
      // Navigate to next set if available
      if (setIdx < Math.ceil(allVocabulary.length / NUM_WORDS) - 1) {
        navigate(`/dictation/${setIdx + 1}`);
      } else {
        // If no more sets, go back to list
        navigate('/dictation-list');
      }
    } else {
      // Move to next word in current set
      setCurrentIndex(currentIndex + 1);
    }
    setShowModal(false);
  };

  const handleReset = () => {
    setUserInputs(Array(vocabList.length).fill(''));
    setResult(Array(vocabList.length).fill(null));
    setShowAnswer(false);
    setCurrentIndex(0);
    setShowModal(false);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleGenerateExample = async () => {
    if (!item) return;
    
    try {
      setIsGeneratingExample(true);
      setExampleSentence(null);
      
      const example = await generateExampleSentence(
        item.word, 
        item.meaning, 
        item.type
      );
      
      setExampleSentence(example);
    } catch (error) {
      console.error('Error generating example sentence:', error);
      // Có thể hiển thị thông báo lỗi cho người dùng
    } finally {
      setIsGeneratingExample(false);
    }
  };

  useEffect(() => {
    if (vocabList.length > 0 && !isLoading && isSetLoaded && currentIndex > 0) {
      const item = vocabList[currentIndex];
      handlePlayAudio(item.audio, item.word);
    }
    setShowAnswer(false);
    setShowModal(false);
    setExampleSentence(null); // Reset example sentence when moving to next word
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, isLoading, isSetLoaded]);

  // Load completed sets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vocab-completed-sets');
    if (saved) {
      setCompletedSets(new Set(JSON.parse(saved)));
    }
  }, []);

  // Reset isSetLoaded when setIndex changes
  useEffect(() => {
    setIsSetLoaded(false);
  }, [setIndex]);

  // Handle audio when vocabList changes (new set loaded)
  useEffect(() => {
    if (vocabList.length > 0 && !isLoading && isSetLoaded && currentIndex === 0) {
      const item = vocabList[currentIndex];
      handlePlayAudio(item.audio, item.word);
    }
  }, [vocabList, isLoading, isSetLoaded, currentIndex]);

  const item = vocabList[currentIndex];
  const isChecked = result[currentIndex] !== null;
  const isCorrect = result[currentIndex] === true;
  const progress = Math.round(((currentIndex + 1) / vocabList.length) * 100);
  const showNextButton = isChecked && isCorrect;
  const isSetCompleted = isCorrect && currentIndex === vocabList.length - 1;

  // Save completed set to localStorage
  useEffect(() => {
    if (isSetCompleted && !completedSets.has(setIdx)) {
      const newCompletedSets = new Set(completedSets);
      newCompletedSets.add(setIdx);
      setCompletedSets(newCompletedSets);
      localStorage.setItem('vocab-completed-sets', JSON.stringify(Array.from(newCompletedSets)));
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

  if (isLoading) return <div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: 40, color: 'red' }}>{error}</div>;
  if (vocabList.length === 0) return <div style={{ textAlign: 'center', marginTop: 40 }}>No data available!</div>;

  function getSetTopic() {
    // Get topic from the first word in the current vocabulary list
    if (vocabList.length > 0 && vocabList[0]) {
      return vocabList[0].topic || 'Other';
    }
    return 'Other';
  }
  const topic = getSetTopic();

  // Help panel shortcuts
  const shortcuts = [
    { key: 'Enter', description: 'Check answer' },
    { key: 'Enter', description: 'Next word (after Check)' },
    { key: 'Shift', description: 'Replay audio' },
    { key: 'Ctrl', description: 'Show/hide answer' }
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
      disabled: !userInputs[currentIndex],
      show: !isChecked
    },
    {
      text: currentIndex === vocabList.length - 1 
        ? (setIdx < Math.ceil(allVocabulary.length / NUM_WORDS) - 1 ? 'Next Set' : 'Finish')
        : 'Next',
      onClick: handleNext,
      variant: 'primary' as const,
      show: showNextButton
    },
    {
      text: '⏭',
      onClick: handleNext,
      variant: 'warning' as const,
      show: currentIndex !== vocabList.length - 1
    }
  ];

  // Answer display configuration
  const answerItems = showAnswer ? [{
    word: item.word,
    phonetic: item.phonetic,
    type: item.type,
    meaning: item.meaning
  }] : [];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f7f9fb',
      position: 'relative',
    }}>
      <BackButton onClick={() => navigate('/dictation-list')} />

      {/* Success Modal */}
      {showModal && isCorrect && showNextButton && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            animation: 'modalSlideIn 0.3s ease-out',
          }}>
            <h2 style={{
              color: '#14B24C',
              margin: '0 0 16px 0',
              fontSize: '24px',
              fontWeight: 'bold',
            }}>
              Correct!
            </h2>
            <div style={{
              background: '#f0fdf4',
              border: '2px solid #14B24C',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
            }}>
              <div style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: 'red',
                marginBottom: '8px',
              }}>
                {item.meaning}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#059669',
                marginBottom: '12px',
                fontStyle: 'italic',
              }}>
                {item.phonetic}
              </div>
              <div style={{
                fontSize: '16px',
                color: '#374151',
                lineHeight: '1.5',
              }}>
                {item.word}
              </div>
            </div>
            {/* Nút tạo câu mẫu */}
            <button
              onClick={handleGenerateExample}
              disabled={isGeneratingExample}
              style={{
                background: isGeneratingExample ? '#9ca3af' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '6px 12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isGeneratingExample ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto 16px auto'
              }}
              onMouseEnter={(e) => {
                if (!isGeneratingExample) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isGeneratingExample) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                }
              }}
            >
              {isGeneratingExample ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Creating
                </>
              ) : (
                <>
                  Create example
                </>
              )}
            </button>

            {/* Hiển thị câu mẫu trong modal */}
            {exampleSentence && exampleSentence.exampleSentence && (
              <div style={{
                marginBottom: '20px',
                padding: '16px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '2px solid #8b5cf6',
                boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)'
              }}>
                <div style={{
                  fontSize: '16px',
                  color: '#1f2937',
                  marginBottom: '8px',
                  lineHeight: '1.5',
                  fontWeight: '500'
                }}>
                  {exampleSentence.exampleSentence.english}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  fontStyle: 'italic',
                  lineHeight: '1.4',
                  marginBottom: '8px'
                }}>
                  {exampleSentence.exampleSentence.vietnamese}
                </div>
                {exampleSentence.exampleSentence.context && (
                  <div style={{
                    fontSize: '12px',
                    color: '#059669',
                    padding: '8px 12px',
                    background: '#f0fdf4',
                    borderRadius: '6px',
                    border: '1px solid #d1fae5'
                  }}>
                    💡 {exampleSentence.exampleSentence.context}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleNext}
              style={{
                background: '#14B24C',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(20, 178, 76, 0.3)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(20, 178, 76, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(20, 178, 76, 0.3)';
              }}
            >
              {currentIndex === vocabList.length - 1 
                ? (setIdx < Math.ceil(allVocabulary.length / NUM_WORDS) - 1 ? 'Next Set →' : 'Finish →')
                : 'Next Word →'
              }
            </button>
          </div>
        </div>
      )}

      {/* Main Practice Card */}
      <div style={{
        maxWidth: 400,
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
          Topic: <b>{topic}</b>
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
            Word {currentIndex + 1} / {vocabList.length}
          </span>
        </div>

        {/* Main Input Section */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '16px', 
          marginBottom: '28px' 
        }}>
          <AudioButton 
            onClick={() => handlePlayAudio(item.audio, item.word)}
            title="Play word"
          />

          <input
            ref={inputRef}
            type="text"
            value={userInputs[currentIndex] || ''}
            onChange={e => handleInputChange(e.target.value)}
            onKeyDown={async e => {
              if (e.key === 'Enter') {
                if (!isChecked) {
                  await handleCheck();
                  justCheckedRef.current = true;
                } else if (showNextButton && !justCheckedRef.current) {
                  handleNext();
                }
                setTimeout(() => { justCheckedRef.current = false; }, 0);
              }
              if (e.key === 'Shift' && e.shiftKey && !e.repeat) {
                e.preventDefault();
                handlePlayAudio(item.audio, item.word);
              }
              if (e.key === 'Control' && e.ctrlKey && !e.repeat) {
                e.preventDefault();
                setShowAnswer(prev => !prev);
              }
            }}
            readOnly={isCorrect}
            style={{
              width: '200px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: isChecked 
                ? (isCorrect ? '2px solid #059669' : '2px solid #dc2626') 
                : '2px solid #cbd5e1',
              textAlign: 'center',
              background: isChecked 
                ? (isCorrect ? '#f0fdf4' : '#fef2f2') 
                : '#ffffff',
              color: isChecked 
                ? (isCorrect ? '#059669' : '#dc2626') 
                : '#1e293b',
              fontWeight: isChecked && isCorrect ? '600' : '500',
              fontSize: '18px',
              outline: 'none',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
            autoComplete="off"
            placeholder="Type the word..."
          />
          
          {isChecked && (
            isCorrect ? <span style={{ color: '#14B24C', fontSize: 22, marginLeft: 4 }}>✔️</span> : <span style={{ color: '#f44336', fontSize: 22, marginLeft: 4 }}>❌</span>
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
            newRevealed[currentIndex] = true;
            setUserRevealedAnswers(newRevealed);
          }}
          answers={answerItems}
          title="Word:"
        />

        {currentIndex === vocabList.length - 1 && isCorrect && !showModal && (
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
                background: '#14B24C', color: 'white', border: 'none', borderRadius: 8, padding: '10px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #e0e0e0', marginTop: 8, marginRight: 12
              }}
            >
              ← Back to List
            </button>
            {setIdx < Math.ceil(allVocabulary.length / NUM_WORDS) - 1 && (
              <button
                onClick={() => navigate(`/dictation/${setIdx + 1}`)}
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
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          
          @media (max-width: 600px) {
            div[style*='max-width: 400px'] {
              max-width: 98vw !important;
              padding: 10px !important;
            }
            input[type='text'] {
              width: 90vw !important;
              min-width: 0 !important;
              font-size: 16px !important;
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
            div[style*='max-width: 400px'][style*='padding: 32px'] {
              padding: 20px !important;
              margin: 10px !important;
            }
            div[style*='max-width: 400px'][style*='padding: 32px'] h2 {
              font-size: 20px !important;
            }
            div[style*='max-width: 400px'][style*='padding: 32px'] div[style*='font-size: 28px'] {
              font-size: 24px !important;
            }
            div[style*='max-width: 400px'][style*='padding: 32px'] div[style*='font-size: 16px'] {
              font-size: 14px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default DictationPractice;