import React, { useState } from 'react';

interface VocabularyWord {
  word: string;
  meaning: string;
  isCorrect: boolean;
}

interface VocabularySelectorProps {
  subjectVocabulary: VocabularyWord[];
  descriptiveVocabulary: VocabularyWord[];
  onVocabularyComplete: (subjectSelected: string[], descriptiveSelected: string[]) => void;
  isCompleted: boolean;
  isAnswered: boolean;
  imageUrl?: string;
  imageDescription?: string;
}

const VocabularySelector: React.FC<VocabularySelectorProps> = ({
  subjectVocabulary,
  descriptiveVocabulary,
  onVocabularyComplete,
  isCompleted,
  isAnswered,
  imageUrl,
  imageDescription
}) => {
  const [selectedSubjectWords, setSelectedSubjectWords] = useState<string[]>([]);
  const [selectedDescriptiveWords, setSelectedDescriptiveWords] = useState<string[]>([]);
  const [showMeanings, setShowMeanings] = useState<{ [key: string]: boolean }>({});

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
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {vocabulary.map(({ word, meaning, isCorrect }) => {
          const isSelected = selectedWords.includes(word);
          const isCorrectSelection = isSelected === isCorrect;
          
          return (
            <div
              key={word}
              className={`relative group cursor-pointer transition-all duration-200 ${
                isCompleted 
                  ? 'cursor-default' 
                  : 'hover:shadow-md'
              }`}
            >
              <div
                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                  isCompleted
                    ? isCorrectSelection
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : isSelected
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : isCorrect
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                    : isSelected
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                }`}
                onClick={() => toggleWord(word, type)}
              >
                <div className="flex items-center gap-2">
                  <span>{word}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="text-xs p-1 hover:bg-gray-200 rounded"
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
                      className="text-xs p-1 hover:bg-gray-200 rounded"
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
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg whitespace-nowrap z-10">
                  {meaning}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Chọn từ vựng trong ảnh
        </h2>
        <p className="text-gray-600 text-sm">
          Chọn các từ vựng bạn thấy trong ảnh trước khi nghe audio
        </p>
      </div>

      {/* Layout 2 cột */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cột trái - Ảnh */}
        <div>
          {imageUrl && (
            <div className="relative max-w-md mx-auto">
              <img
                src={imageUrl}
                alt="TOEIC Part 1 Question"
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          )}
        </div>

        {/* Cột phải - Chọn từ vựng */}
        <div>
          {renderVocabularySection(
            subjectVocabulary, 
            selectedSubjectWords, 
            'subject',
            'Từ vựng chủ thể (người, vật)'
          )}

          {renderVocabularySection(
            descriptiveVocabulary, 
            selectedDescriptiveWords, 
            'descriptive',
            'Từ vựng mô tả (hành động, trạng thái)'
          )}

          {!isCompleted && (
            <div className="text-center mt-6">
              <button
                onClick={handleComplete}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Hoàn thành chọn từ vựng
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Kết quả từ vựng */}
      {isCompleted && isAnswered && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Kết quả từ vựng:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-gray-700 mb-1">Chủ thể:</h5>
              <div className="text-sm text-gray-600">
                Đúng: {subjectVocabulary.filter((_, index) => 
                  selectedSubjectWords.includes(subjectVocabulary[index].word) === subjectVocabulary[index].isCorrect
                ).length}/{subjectVocabulary.length}
              </div>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 mb-1">Mô tả:</h5>
              <div className="text-sm text-gray-600">
                Đúng: {descriptiveVocabulary.filter((_, index) => 
                  selectedDescriptiveWords.includes(descriptiveVocabulary[index].word) === descriptiveVocabulary[index].isCorrect
                ).length}/{descriptiveVocabulary.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabularySelector; 