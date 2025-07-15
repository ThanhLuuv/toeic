import React, { useState, useEffect } from 'react';
import { Question } from '../../data/questions_part1';
import AudioPlayer from './AudioPlayer';

interface QuestionCardProps {
  question: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  setSelectedAnswer: (answer: string | null) => void;
  nextQuestion: () => void;
  playCount: number;
  maxPlays: number;
  setPlayCount: (count: number) => void;
  showTranscript: boolean;
  setShowTranscript: React.Dispatch<React.SetStateAction<boolean>>;
  hideImage?: boolean;
  onShowVocabularyPanel?: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedAnswer,
  isAnswered,
  setSelectedAnswer,
  nextQuestion,
  currentQuestionIndex,
  totalQuestions,
  showTranscript,
  setShowTranscript,
  hideImage = false,
  onShowVocabularyPanel
}) => {
  const handleOptionClick = (option: string) => {
    if (!isAnswered) {
      setSelectedAnswer(option);
      setShowTranscript(true);
    }
  };

  const handleTranslateOption = (key: keyof typeof question.choices, optionText: HTMLSpanElement, button: HTMLButtonElement) => {
    const originalText = question.choices[key];
    const translatedText = (question as any).choicesVi ? (question as any).choicesVi[key] : originalText;
    if (optionText.textContent === originalText) {
      optionText.textContent = translatedText;
      button.textContent = 'Gốc';
    } else {
      optionText.textContent = originalText;
      button.textContent = 'Dịch';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h2 className="text-lg font-semibold mb-4">Câu hỏi {currentQuestionIndex + 1}.</h2>
      <div className="flex justify-center mb-6">
        {/* Nút bám dính cạnh phải ngoài ảnh (desktop only, floating) */}
        {onShowVocabularyPanel && (
            <div className="hidden lg:flex items-center absolute z-20" style={{ right: '-30px', top: '380px', transform: 'translateY(-50%)' }}>
              <button
                onClick={onShowVocabularyPanel}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 shadow rounded-full hover:bg-blue-100 transition-colors"
                title="Mở khái quát từ vựng"
              >
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 5l5 5-5 5" />
                </svg>
              </button>
              <span
                onClick={onShowVocabularyPanel}
                className="ml-2 pr-2 font-medium cursor-pointer select-none animate-wiggle rounded-r-full text-gray-800"
                style={{paddingTop: '6px', paddingBottom: '6px'}}>
                Khái quát từ vựng
              </span>
            </div>
          )}
        <div className="image-container relative">
          <img
            src={question.image}
            alt="TOEIC Part 1 Image"
            className="w-full max-w-md rounded-md object-cover"
          />
          
        </div>
      </div>
      <div className="space-y-4" id="optionsContainer">
        {(['A', 'B', 'C'] as Array<keyof typeof question.choices>).map((key, i) => (
          <label
            key={key}
            className={`flex option-btn items-center space-x-2 cursor-pointer relative py-2 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 ${
              isAnswered && selectedAnswer === key
                ? selectedAnswer === question.correctAnswer
                  ? 'correct'
                  : 'incorrect'
                : ''
            } ${isAnswered && question.correctAnswer === key ? 'correct' : ''}`}
            onClick={() => handleOptionClick(key)}
          >
            <input
              type="radio"
              name="question"
              className="form-radio text-blue-500 hidden"
              disabled={isAnswered}
            />
            <span className="text-gray-800 font-semibold">({key})</span>
            <span className="icon absolute right-2 top-1/2 transform -translate-y-1/2 hidden"></span>
          </label>
        ))}
      </div>
      
      {isAnswered && (
        <div className="mt-6 flex justify-end">
          <button
            className={`flex items-center space-x-2 ${
              currentQuestionIndex + 1 >= totalQuestions 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white px-5 py-2.5 rounded-full font-medium transition-colors shadow-md`}
            onClick={nextQuestion}
          >
            {currentQuestionIndex + 1 >= totalQuestions ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Finish</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span>Next Question</span>
              </>
            )}
          </button>
        </div>
      )}
      
      {isAnswered && (
        <div className="mt-6 space-y-4">         
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">Explanation:</h4>
            <div className="text-sm text-green-900">
              {question.explanation}
            </div>
            <h4 className="font-semibold text-green-800 mb-2">Traps:</h4>
            <div className="text-sm text-green-900">
              {question.traps}
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Answer Options:</h4>
            <ul className="list-none space-y-2">
              {(['A', 'B', 'C'] as Array<keyof typeof question.choices>).map((key, i) => (
                <li key={key} className="transcript-line flex items-center justify-between" data-option-index={i}>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-blue-600">({key})</span>
                    <span className="option-text">{question.choices[key]}</span>
                  </div>
                  {(question as any).choicesVi && (
                    <button
                      className="translate-option-btn bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs hover:bg-blue-200"
                      onClick={(e) =>
                        handleTranslateOption(
                          key,
                          e.currentTarget.previousElementSibling?.querySelector('.option-text') as HTMLSpanElement,
                          e.currentTarget as HTMLButtonElement
                        )
                      }
                    >
                      Dịch
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}      
      {!isAnswered && showTranscript && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="grid grid-cols-1 gap-4 font-mono text-sm">
            <div>
              <h4 className="font-semibold mt-4 mb-1">Answer Options:</h4>
              <ul className="list-none space-y-1">
                {(['A', 'B', 'C'] as Array<keyof typeof question.choices>).map((key, i) => (
                  <li key={key} className="transcript-line" data-option-index={i}>
                    <span className="font-semibold text-blue-600">({key})</span>
                    <span className="option-text">{question.choices[key]}</span>
                    <button
                      className="translate-option-btn bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs hover:bg-blue-200"
                      onClick={(e) =>
                        handleTranslateOption(
                          key,
                          e.currentTarget.previousElementSibling as HTMLSpanElement,
                          e.currentTarget as HTMLButtonElement
                        )
                      }
                    >
                      Dịch
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;