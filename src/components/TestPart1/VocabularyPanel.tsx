import React, { useState, useEffect } from 'react';

interface VocabularyWord {
  word: string;
  meaning: string;
  isCorrect: boolean;
}

interface VocabularyPanelProps {
  subjectVocabulary: VocabularyWord[];
  descriptiveVocabulary: VocabularyWord[];
  onVocabularyComplete: (subjectSelected: string[], descriptiveSelected: string[]) => void;
  isCompleted: boolean;
  isAnswered: boolean;
  imageUrl?: string;
  imageDescription?: string;
  onClose?: () => void;
  resetKey?: number; // Key để force reset component
}

const VocabularyPanel: React.FC<VocabularyPanelProps> = ({
  subjectVocabulary,
  descriptiveVocabulary,
  onVocabularyComplete,
  isCompleted,
  isAnswered,
  imageUrl,
  imageDescription,
  onClose,
  resetKey
}) => {
  const [selectedSubjectWords, setSelectedSubjectWords] = useState<string[]>([]);
  const [selectedDescriptiveWords, setSelectedDescriptiveWords] = useState<string[]>([]);
  const [showMeanings, setShowMeanings] = useState<{ [key: string]: boolean }>({});

  // Reset state khi resetKey thay đổi
  useEffect(() => {
    setSelectedSubjectWords([]);
    setSelectedDescriptiveWords([]);
    setShowMeanings({});
  }, [resetKey]);

  const toggleWord = (word: string, type: 'subject' | 'descriptive') => {
    if (isCompleted) return;
    
    if (type === 'subject') {
      setSelectedSubjectWords(prev => 
        prev.includes(word) 
          ? prev.filter(w => w !== word)
          : [...prev, word]
      );
    } else {
      setSelectedDescriptiveWords(prev => 
        prev.includes(word) 
          ? prev.filter(w => w !== word)
          : [...prev, word]
      );
    }
  };

  const toggleMeaning = (word: string) => {
    setShowMeanings(prev => ({
      ...prev,
      [word]: !prev[word]
    }));
  };

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleComplete = () => {
    onVocabularyComplete(selectedSubjectWords, selectedDescriptiveWords);
  };

  const renderVocabularySection = (
    vocabulary: VocabularyWord[], 
    selectedWords: string[], 
    type: 'subject' | 'descriptive',
    title: string
  ) => (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-1">
        {vocabulary.map(({ word, meaning, isCorrect }) => {
          const isSelected = selectedWords.includes(word);
          const isCorrectSelection = isSelected === isCorrect;
          
          return (
            <div
              key={word}
              className={`relative group cursor-pointer transition-all duration-200 ${
                isCompleted 
                  ? 'cursor-default' 
                  : 'hover:shadow-sm'
              }`}
            >
              <div
                className={`px-2 py-1 rounded border text-xs font-medium transition-all duration-200 ${
                  isAnswered
                    ? isSelected && isCorrect
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : isSelected && !isCorrect
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : !isSelected && isCorrect
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                    : isSelected
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                }`}
                onClick={() => toggleWord(word, type)}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{word}</span>
                  <div className="flex gap-1 ml-1">
                    <button
                      type="button"
                      className="text-xs p-0.5 hover:bg-gray-200 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(word);
                      }}
                      title="Phát âm"
                    >
                      🔊
                    </button>
                    <button
                      type="button"
                      className="text-xs p-0.5 hover:bg-gray-200 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMeaning(word);
                      }}
                      title="Xem nghĩa"
                    >
                      📖
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Meaning tooltip */}
              {showMeanings[word] && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-10">
                  {meaning}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="p-4">
        {/* Ảnh ở đầu panel, chỉ hiển thị trên mobile */}
        {imageUrl && (
          <div className="mb-4 flex justify-center block lg:hidden">
            <img
              src={imageUrl}
              alt="TOEIC"
              className="w-full max-w-xs rounded-lg shadow"
            />
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              Chọn từ vựng
            </h2>
            <p className="text-xs text-gray-600">
              Chọn từ vựng trong ảnh
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
              title="Đóng"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Từ vựng */}
        {renderVocabularySection(
          subjectVocabulary, 
          selectedSubjectWords, 
          'subject',
          'Từ vựng chủ thể'
        )}

        {renderVocabularySection(
          descriptiveVocabulary, 
          selectedDescriptiveWords, 
          'descriptive',
          'Từ vựng mô tả'
        )}

        {!isCompleted && (
          <div className="text-center mt-4">
            <button
              onClick={handleComplete}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors w-full"
            >
              Hoàn thành
            </button>
          </div>
        )}

        {/* Kết quả từ vựng */}
        {isAnswered && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2 text-sm">Kết quả:</h4>
            <div className="space-y-2 text-xs">
              {/* Chủ thể */}
              <div>
                <div className="font-medium text-gray-700">Chủ thể:</div>
                <div className="text-gray-600">
                  Chọn đúng: {subjectVocabulary.filter((_, index) => 
                    selectedSubjectWords.includes(subjectVocabulary[index].word) && subjectVocabulary[index].isCorrect
                  ).length}/{selectedSubjectWords.length} từ đã chọn
                </div>
                <div className="text-gray-600">
                  Thiếu: {subjectVocabulary.filter((_, index) => 
                    !selectedSubjectWords.includes(subjectVocabulary[index].word) && subjectVocabulary[index].isCorrect
                  ).length} từ đúng chưa chọn
                </div>
              </div>
              
              {/* Mô tả */}
              <div>
                <div className="font-medium text-gray-700">Mô tả:</div>
                <div className="text-gray-600">
                  Chọn đúng: {descriptiveVocabulary.filter((_, index) => 
                    selectedDescriptiveWords.includes(descriptiveVocabulary[index].word) && descriptiveVocabulary[index].isCorrect
                  ).length}/{selectedDescriptiveWords.length} từ đã chọn
                </div>
                <div className="text-gray-600">
                  Thiếu: {descriptiveVocabulary.filter((_, index) => 
                    !selectedDescriptiveWords.includes(descriptiveVocabulary[index].word) && descriptiveVocabulary[index].isCorrect
                  ).length} từ đúng chưa chọn
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabularyPanel; 