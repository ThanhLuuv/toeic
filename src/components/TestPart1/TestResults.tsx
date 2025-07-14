import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeWithAI, generateImageBase64, generateAudioBase64 } from './aiUtils';

interface Answer {
  selected: string;
  correct: string;
  isCorrect: boolean;
  skipped: boolean;
}

interface VocabularyWord {
  word: string;
  meaning: string;
  pronunciation?: string;
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

interface Question {
  questionNumber: number;
  level: string;
  imageDescription: string;
  subjectVocabulary: VocabularyWord[];
  descriptiveVocabulary: VocabularyWord[];
  choices: { [key: string]: string };
  choicesVi: { [key: string]: string };
  correctAnswer: string;
  explanation: string;
  traps: string;
  image: string;
  audio: string;
}

interface TestResultsProps {
  questions: Question[];
  answers: (Answer | null)[];
  vocabularyResults: VocabularyResult[];
  currentVocabularySelection?: {
    subjectSelected: string[];
    descriptiveSelected: string[];
  };
  allVocabularySelections?: {
    [questionIndex: number]: {
      subjectSelected: string[];
      descriptiveSelected: string[];
    };
  };
  testResults: {
    score: number;
    correct: number;
    total: number;
    vocabScore: number;
    vocabCorrect: number;
    vocabTotal: number;
  };
  onClose: () => void;
}

const TestResults: React.FC<TestResultsProps> = ({
  questions,
  answers,
  vocabularyResults,
  currentVocabularySelection,
  allVocabularySelections,
  testResults,
  onClose
}) => {
  // Log chỉ các câu sai
  questions.forEach((question, idx) => {
    const answer = answers[idx];
    if (answer && !answer.isCorrect) {
      // Lấy selection từ allVocabularySelections hoặc currentVocabularySelection (nếu là câu cuối)
      let subjectSelected = allVocabularySelections?.[idx]?.subjectSelected || [];
      let descriptiveSelected = allVocabularySelections?.[idx]?.descriptiveSelected || [];
      if (
        idx === questions.length - 1 &&
        currentVocabularySelection &&
        (currentVocabularySelection.subjectSelected.length > 0 || currentVocabularySelection.descriptiveSelected.length > 0)
      ) {
        subjectSelected = currentVocabularySelection.subjectSelected;
        descriptiveSelected = currentVocabularySelection.descriptiveSelected;
      }
      // Từ vựng đúng
      const subjectVocabulary = question.subjectVocabulary || [];
      const descriptiveVocabulary = question.descriptiveVocabulary || [];
      // Từ vựng sai/thiếu
      const subjectMissing = subjectVocabulary.filter(w => !subjectSelected.includes(w.word) && w.isCorrect).map(w => w.word);
      const subjectWrong = subjectVocabulary.filter(w => subjectSelected.includes(w.word) && !w.isCorrect).map(w => w.word);
      const descriptiveMissing = descriptiveVocabulary.filter(w => !descriptiveSelected.includes(w.word) && w.isCorrect).map(w => w.word);
      const descriptiveWrong = descriptiveVocabulary.filter(w => descriptiveSelected.includes(w.word) && !w.isCorrect).map(w => w.word);
      // Log tất cả thành 1 đoạn văn
      const logText = `Câu ${idx + 1} SAI:\n` +
        `  Đáp án đúng: ${question.correctAnswer} - ${question.choices?.[question.correctAnswer] || ''} | ${question.choicesVi?.[question.correctAnswer] || ''}\n` +
        `  Đáp án đã chọn: ${answer.selected} - ${question.choices?.[answer.selected] || ''} | ${question.choicesVi?.[answer.selected] || ''}\n` +
        `  Khái quát từ vựng trước khi chọn` +
        `  Subject đã chọn: ${subjectSelected.join(', ')}\n` +
        `  Subject thiếu: ${subjectMissing.join(', ')}\n` +
        `  Subject sai: ${subjectWrong.join(', ')}\n` +
        `  Descriptive đã chọn: ${descriptiveSelected.join(', ')}\n` +
        `  Descriptive thiếu: ${descriptiveMissing.join(', ')}\n` +
        `  Descriptive sai: ${descriptiveWrong.join(', ')}\n` +
        `  Bẫy: ${question.traps}`;
    }
  });
  const navigate = useNavigate();
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [aiResults, setAiResults] = useState<{ [idx: number]: string }>({});
  const [practiceData, setPracticeData] = useState<{ [idx: number]: any }>({});
  const [practiceImage, setPracticeImage] = useState<{ [idx: number]: string }>({});
  const [practiceAudio, setPracticeAudio] = useState<{ [idx: number]: string }>({});
  const [userChoice, setUserChoice] = useState<{ [idx: number]: string }>({});
  const [loadingAI, setLoadingAI] = useState<{ [idx: number]: boolean }>({});
  const [showTranscript, setShowTranscript] = useState<{ [idx: number]: boolean }>({});
  const [showTranscriptVi, setShowTranscriptVi] = useState<{ [qIdx: number]: { [choice: string]: boolean } }>({});
  // Ref cho từng nút AI của mỗi câu
  const aiButtonRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const toggleQuestionExpansion = (questionIndex: number) => {
    setExpandedQuestions(prev => 
      prev.includes(questionIndex) 
        ? prev.filter(q => q !== questionIndex)
        : [...prev, questionIndex]
    );
  };

  const toggleTranscriptVi = (qIdx: number, choice: string) => {
    setShowTranscriptVi(prev => ({
      ...prev,
      [qIdx]: {
        ...prev[qIdx],
        [choice]: !(prev[qIdx]?.[choice] || false)
      }
    }));
  };

  const getVocabularyStats = (questionIndex: number) => {
    const allSelections = allVocabularySelections || {};
    const currentSelection = currentVocabularySelection;
    
    // Lấy selection từ allVocabularySelections hoặc currentVocabularySelection cho câu cuối
    let subjectSelected = allSelections[questionIndex]?.subjectSelected || [];
    let descriptiveSelected = allSelections[questionIndex]?.descriptiveSelected || [];
    
    // Nếu là câu cuối cùng và có selection hiện tại, sử dụng currentVocabularySelection
    if (questionIndex === questions.length - 1 && currentSelection && 
        (currentSelection.subjectSelected.length > 0 || currentSelection.descriptiveSelected.length > 0)) {
      subjectSelected = currentSelection.subjectSelected;
      descriptiveSelected = currentSelection.descriptiveSelected;
    }

    const subjectVocabulary = questions[questionIndex].subjectVocabulary || [];
    const descriptiveVocabulary = questions[questionIndex].descriptiveVocabulary || [];

    // Tìm từ vựng dựa trên từng từ cụ thể
    const subjectCorrect = subjectVocabulary.filter(word => 
      subjectSelected.includes(word.word) && word.isCorrect
    );
    const subjectIncorrect = subjectVocabulary.filter(word => 
      subjectSelected.includes(word.word) && !word.isCorrect
    );
    const subjectMissing = subjectVocabulary.filter(word => 
      !subjectSelected.includes(word.word) && word.isCorrect
    );

    const descriptiveCorrect = descriptiveVocabulary.filter(word => 
      descriptiveSelected.includes(word.word) && word.isCorrect
    );
    const descriptiveIncorrect = descriptiveVocabulary.filter(word => 
      descriptiveSelected.includes(word.word) && !word.isCorrect
    );
    const descriptiveMissing = descriptiveVocabulary.filter(word => 
      !descriptiveSelected.includes(word.word) && word.isCorrect
    );

    return {
      subject: { correct: subjectCorrect, incorrect: subjectIncorrect, missing: subjectMissing },
      descriptive: { correct: descriptiveCorrect, incorrect: descriptiveIncorrect, missing: descriptiveMissing }
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h1 className="text-3xl font-bold mb-2">Kết quả chi tiết</h1>
              <p className="text-blue-100">Thống kê toàn bộ bài kiểm tra</p>
            </div>
            
            <div className="p-8">
              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{testResults.score}%</div>
                  <div className="text-lg font-semibold text-blue-800 mb-1">Điểm chính</div>
                  <div className="text-sm text-blue-600">
                    {testResults.correct}/{testResults.total} câu đúng
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">{testResults.vocabScore}%</div>
                  <div className="text-lg font-semibold text-green-800 mb-1">Điểm từ vựng</div>
                  <div className="text-sm text-green-600">
                    {testResults.vocabCorrect}/{testResults.vocabTotal} từ đúng
                  </div>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Hiệu suất tổng thể</span>
                  <span className="font-medium">
                    {testResults.score >= 80 ? 'Xuất sắc' : 
                     testResults.score >= 60 ? 'Tốt' : 
                     testResults.score >= 40 ? 'Trung bình' : 'Cần cải thiện'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      testResults.score >= 80 ? 'bg-green-500' : 
                      testResults.score >= 60 ? 'bg-blue-500' : 
                      testResults.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${testResults.score}%` }}
                  ></div>
                </div>
                {/* Nút phân tích cùng AI */}
                {answers.some(a => a && !a.isCorrect) && (
                  <div className="flex justify-center mt-4">
                    <button
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:scale-105 transition-transform"
                      onClick={() => {
                        // Tìm index câu sai đầu tiên
                        const firstWrongIdx = answers.findIndex(a => a && !a.isCorrect);
                        if (firstWrongIdx !== -1) {
                          // Expand câu đó nếu chưa expand
                          setExpandedQuestions(prev => prev.includes(firstWrongIdx) ? prev : [...prev, firstWrongIdx]);
                          // Delay nhỏ để đảm bảo expand xong mới scroll
                          // setTimeout(() => {
                          //   aiButtonRefs.current[firstWrongIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          // }, 400);
                        }
                      }}
                    >
                      Phân tích cùng AI
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Questions Review */}
          <div className="space-y-4">
            {questions.map((question, index) => {
              const answer = answers[index];
              const vocabStats = getVocabularyStats(index);
              const isExpanded = expandedQuestions.includes(index);
              const isWrong = answer && !answer.isCorrect;
              
              // Tạo logText cho câu sai
              let logText = '';
              if (isWrong) {
                let subjectSelected = allVocabularySelections?.[index]?.subjectSelected || [];
                let descriptiveSelected = allVocabularySelections?.[index]?.descriptiveSelected || [];
                if (
                  index === questions.length - 1 &&
                  currentVocabularySelection &&
                  (currentVocabularySelection.subjectSelected.length > 0 || currentVocabularySelection.descriptiveSelected.length > 0)
                ) {
                  subjectSelected = currentVocabularySelection.subjectSelected;
                  descriptiveSelected = currentVocabularySelection.descriptiveSelected;
                }
                const subjectVocabulary = question.subjectVocabulary || [];
                const descriptiveVocabulary = question.descriptiveVocabulary || [];
                const subjectMissing = subjectVocabulary.filter(w => !subjectSelected.includes(w.word) && w.isCorrect).map(w => w.word);
                const subjectWrong = subjectVocabulary.filter(w => subjectSelected.includes(w.word) && !w.isCorrect).map(w => w.word);
                const descriptiveMissing = descriptiveVocabulary.filter(w => !descriptiveSelected.includes(w.word) && w.isCorrect).map(w => w.word);
                const descriptiveWrong = descriptiveVocabulary.filter(w => descriptiveSelected.includes(w.word) && !w.isCorrect).map(w => w.word);
                logText = `Câu ${index + 1} SAI:\n` +
                  `  Đáp án đúng: ${question.correctAnswer} - ${question.choices?.[question.correctAnswer] || ''} | ${question.choicesVi?.[question.correctAnswer] || ''}\n` +
                  `  Đáp án đã chọn: ${answer.selected} - ${question.choices?.[answer.selected] || ''} | ${question.choicesVi?.[answer.selected] || ''}\n` +
                  `  Khái quát từ vựng trước khi chọn` +
                  `  Subject đã chọn: ${subjectSelected.join(', ')}\n` +
                  `  Subject thiếu: ${subjectMissing.join(', ')}\n` +
                  `  Subject sai: ${subjectWrong.join(', ')}\n` +
                  `  Descriptive đã chọn: ${descriptiveSelected.join(', ')}\n` +
                  `  Descriptive thiếu: ${descriptiveMissing.join(', ')}\n` +
                  `  Descriptive sai: ${descriptiveWrong.join(', ')}\n` +
                  `  Bẫy: ${question.traps}`;
              }

              return (
                <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Question Header */}
                  <div 
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleQuestionExpansion(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          answer?.isCorrect ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            Câu {index + 1}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {answer?.isCorrect ? 'Đúng' : 'Sai'} • 
                            Đáp án: {answer?.selected} • 
                            Đúng: {question.correctAnswer}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {vocabStats && (
                          <div className="text-xs text-gray-500">
                            Từ vựng: {vocabStats.subject.correct.length + vocabStats.descriptive.correct.length}/
                            {vocabStats.subject.correct.length + vocabStats.subject.incorrect.length + vocabStats.subject.missing.length + 
                             vocabStats.descriptive.correct.length + vocabStats.descriptive.incorrect.length + vocabStats.descriptive.missing.length}

                          </div>
                        )}
                        <svg 
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-6 space-y-6">
                      {/* Image */}
                      <div className="flex justify-center">
                        <img 
                          src={question.image} 
                          alt={`Question ${index + 1}`}
                          className="max-w-md rounded-lg shadow"
                        />
                      </div>

                      {/* Choices */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">Các lựa chọn:</h4>
                        <div className="space-y-2">
                          {(['A', 'B', 'C'] as const).map((key) => (
                            <div 
                              key={key}
                              className={`p-3 rounded-lg border-2 ${
                                answer?.selected === key && answer?.correct === key
                                  ? 'bg-green-100 border-green-300'
                                  : answer?.selected === key && answer?.correct !== key
                                  ? 'bg-red-100 border-red-300'
                                  : answer?.correct === key
                                  ? 'bg-green-100 border-green-300'
                                  : 'bg-white border-gray-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-semibold text-gray-800">({key})</span>
                                  <span className="ml-2 text-gray-700">{question.choices[key]}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {answer?.selected === key && answer?.correct === key && (
                                    <span className="text-green-600">✓</span>
                                  )}
                                  {answer?.selected === key && answer?.correct !== key && (
                                    <span className="text-red-600">✗</span>
                                  )}
                                  {answer?.correct === key && answer?.selected !== key && (
                                    <span className="text-green-600">✓</span>
                                  )}
                                </div>
                              </div>
                              {question.choicesVi && (
                                <div className="mt-1 text-sm text-gray-600">
                                  {question.choicesVi[key]}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">Giải thích:</h4>
                        <p className="text-green-900">{question.explanation}</p>
                        <h4 className="font-semibold text-green-800 mb-2 mt-4">Bẫy:</h4>
                        <p className="text-green-900">{question.traps}</p>
                      </div>

                      {/* Vocabulary Results */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800">Từ vựng:</h4>
                        
                        {/* Subject Vocabulary */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-800 mb-3">Từ vựng chủ thể:</h5>
                          
                          {/* Kết quả từ vựng đã chọn */}
                          {vocabStats && (
                            <>
                              {vocabStats.subject.correct.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-sm font-medium text-green-700 mb-2">✓ Chọn đúng:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {vocabStats.subject.correct.map((word, idx) => (
                                      <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                        {word.word} {word.pronunciation && `(${word.pronunciation})`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {vocabStats.subject.incorrect.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-sm font-medium text-red-700 mb-2">✗ Chọn sai:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {vocabStats.subject.incorrect.map((word, idx) => (
                                      <span key={idx} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                                        {word.word} {word.pronunciation && `(${word.pronunciation})`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {vocabStats.subject.missing.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-sm font-medium text-yellow-700 mb-2">⚠ Thiếu:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {vocabStats.subject.missing.map((word, idx) => (
                                      <span key={idx} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                                        {word.word} {word.pronunciation && `(${word.pronunciation})`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* Hiển thị tất cả từ vựng có sẵn */}
                          <div className="mt-4 pt-3 border-t border-blue-200">
                            <div className="text-sm font-medium text-blue-700 mb-2">Tất cả từ vựng có sẵn:</div>
                            <div className="flex flex-wrap gap-2">
                              {(question.subjectVocabulary || []).map((word, idx) => (
                                <span key={idx} className={`px-2 py-1 rounded text-sm ${
                                  word.isCorrect 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {word.word} {word.pronunciation && `(${word.pronunciation})`}
                                  {word.isCorrect && <span className="ml-1">✓</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Descriptive Vocabulary */}
                        <div className="bg-purple-50 rounded-lg p-4">
                          <h5 className="font-semibold text-purple-800 mb-3">Từ vựng mô tả:</h5>
                          
                          {/* Kết quả từ vựng đã chọn */}
                          {vocabStats && (
                            <>
                              {vocabStats.descriptive.correct.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-sm font-medium text-green-700 mb-2">✓ Chọn đúng:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {vocabStats.descriptive.correct.map((word, idx) => (
                                      <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                        {word.word} {word.pronunciation && `(${word.pronunciation})`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {vocabStats.descriptive.incorrect.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-sm font-medium text-red-700 mb-2">✗ Chọn sai:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {vocabStats.descriptive.incorrect.map((word, idx) => (
                                      <span key={idx} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                                        {word.word} {word.pronunciation && `(${word.pronunciation})`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {vocabStats.descriptive.missing.length > 0 && (
                                <div className="mb-3">
                                  <div className="text-sm font-medium text-yellow-700 mb-2">⚠ Thiếu:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {vocabStats.descriptive.missing.map((word, idx) => (
                                      <span key={idx} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                                        {word.word} {word.pronunciation && `(${word.pronunciation})`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* Hiển thị tất cả từ vựng có sẵn */}
                          <div className="mt-4 pt-3 border-t border-purple-200">
                            <div className="text-sm font-medium text-purple-700 mb-2">Tất cả từ vựng có sẵn:</div>
                            <div className="flex flex-wrap gap-2">
                              {(question.descriptiveVocabulary || []).map((word, idx) => (
                                <span key={idx} className={`px-2 py-1 rounded text-sm ${
                                  word.isCorrect 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {word.word} {word.pronunciation && `(${word.pronunciation})`}
                                  {word.isCorrect && <span className="ml-1">✓</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Nút AI cho câu sai */}
                      {isWrong && (
                        <div className="border-t border-gray-200 pt-4">
                          <button
                            ref={el => { aiButtonRefs.current[index] = el; }}
                            onClick={async () => {
                              // Reset lại đáp án và loading khi nhấn lại nút phân tích
                              setUserChoice(u => ({ ...u, [index]: '' }));
                              setPracticeData(d => ({ ...d, [index]: undefined }));
                              setPracticeImage(img => {
                                const newImg = { ...img };
                                delete newImg[index];
                                return newImg;
                              });
                              setPracticeAudio(aud => {
                                const newAud = { ...aud };
                                delete newAud[index];
                                return newAud;
                              });
                              setLoadingAI(l => ({ ...l, [index]: true }));
                              try {
                                setAiResults(r => ({ ...r, [index]: 'Đang phân tích...' }));
                                const result = await analyzeWithAI(logText);
                                setAiResults(r => ({ ...r, [index]: result }));
                                // Parse JSON
                                const obj = JSON.parse(result);
                                setPracticeData(d => ({ ...d, [index]: obj }));
                                // Gọi generateImages và generateAudio ở đây, lưu base64 vào state
                                const imgBase64 = await generateImageBase64(obj.practiceQuestion.imageDescription);
                                setPracticeImage(img => ({ ...img, [index]: imgBase64 }));
                                const audioBase64 = await generateAudioBase64(obj.practiceQuestion);
                                setPracticeAudio(aud => ({ ...aud, [index]: audioBase64 }));
                              } catch (err: any) {
                                setAiResults(r => ({ ...r, [index]: 'Lỗi gọi AI: ' + err.message }));
                              } finally {
                                setLoadingAI(l => ({ ...l, [index]: false }));
                              }
                            }}
                            disabled={loadingAI[index]}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingAI[index] ? (
                              <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang phân tích...
                              </div>
                            ) : (
                              '🤖 Phân tích cùng AI'
                            )}
                          </button>
                        </div>
                      )}
                      {/* Kết quả AI */}
                      {practiceData[index] && (
                        <div className="border-t border-gray-200 pt-4 space-y-4">
                          <h4 className="font-semibold text-gray-700">📊 Phân tích lỗi:</h4>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h5 className="font-medium text-red-800 mb-2">❌ Lỗi chính:</h5>
                            <p className="text-red-700">{practiceData[index].analysis.mainError}</p>
                          </div>
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h5 className="font-medium text-orange-800 mb-2">🔍 Nguyên nhân:</h5>
                            <ul className="list-disc list-inside text-orange-700 space-y-1">
                              {practiceData[index].analysis.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h5 className="font-medium text-green-800 mb-2">💡 Giải pháp:</h5>
                            <ul className="list-disc list-inside text-green-700 space-y-1">
                              {practiceData[index].analysis.solutions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <h4 className="font-semibold text-gray-700">🎯 Bài luyện tập tương tự:</h4>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            {practiceImage[index] && <img src={practiceImage[index]} alt="practice" className="max-w-xs rounded-lg mb-3" />}
                            {practiceAudio[index] && <audio controls className="w-full mb-3" src={practiceAudio[index]} />}
                            {/* Loading indicator khi chưa có ảnh hoặc audio */}
                            {(!practiceImage[index] || !practiceAudio[index]) && (
                              <div className="flex items-center justify-center py-4">
                                <svg className="animate-spin h-6 w-6 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-blue-700 font-medium">Đang tải ảnh và audio luyện tập...</span>
                              </div>
                            )}
                            <div className="space-y-2">
                              {['A','B','C'].map(opt => {
                                const isSelected = userChoice[index] === opt;
                                const isCorrect = opt === practiceData[index].practiceQuestion.correctAnswer;
                                const showResult = userChoice[index] !== undefined && userChoice[index] !== '';
                                let choiceClass = "w-full text-left p-3 rounded-lg border-2 transition-all ";
                                if (isSelected) {
                                  if (isCorrect) {
                                    choiceClass += "border-green-500 bg-green-50";
                                  } else {
                                    choiceClass += "border-red-500 bg-red-50";
                                  }
                                } else if (showResult && isCorrect) {
                                  choiceClass += "border-green-500 bg-green-50";
                                } else {
                                  choiceClass += "border-gray-200 hover:border-gray-300";
                                }
                                // Disable nếu chưa load xong ảnh hoặc audio
                                const disabled = !practiceImage[index] || !practiceAudio[index] || showResult;
                                return (
                                  <button
                                    key={opt}
                                    className={choiceClass}
                                    onClick={() => setUserChoice(u => ({...u, [index]: opt}))}
                                    disabled={disabled}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <span className="font-semibold text-gray-600">{opt}.</span>
                                      {/* Không hiển thị text đáp án */}
                                      {showResult && isCorrect && (
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                      {isSelected && !isCorrect && (
                                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                            {userChoice[index] !== '' && (
                              <div className="mt-4 space-y-4">
                                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                  <h6 className="font-medium text-blue-800 mb-2">📝 Transcript:</h6>
                                  <div className="text-gray-700 text-sm mb-2">{practiceData[index].practiceQuestion.question}</div>
                                  <div className="space-y-1 text-sm">
                                    {Object.entries(practiceData[index].practiceQuestion.choices).map(([key, value]) => {
                                      const isCorrect = key === practiceData[index].practiceQuestion.correctAnswer;
                                      const isSelected = userChoice[index] === key;
                                      return (
                                        <div key={key} className={`$${
                                          isCorrect ? 'text-green-700' : isSelected && !isCorrect ? 'text-red-700' : 'text-blue-700'
                                        }`}>
                                          <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-2">
                                              <span className="font-semibold min-w-[20px]">{key}.</span>
                                              <span className="practice-option-text">
                                                {showTranscriptVi[index]?.[key] && practiceData[index].practiceQuestion.choicesVi && practiceData[index].practiceQuestion.choicesVi[key]
                                                  ? practiceData[index].practiceQuestion.choicesVi[key]
                                                  : value as string}
                                              </span>
                                              {isCorrect && (
                                                <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                              )}
                                              {isSelected && !isCorrect && (
                                                <svg className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                              )}
                                            </div>
                                            {/* Nút dịch cho từng đáp án trong transcript */}
                                            <button
                                              onClick={() => toggleTranscriptVi(index, key)}
                                              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
                                            >
                                              {showTranscriptVi[index]?.[key] ? 'English' : 'Dịch'}
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                                <div className="p-3 rounded-lg bg-gray-50">
                                  <h6 className="font-medium text-gray-800 mb-2">💡 Giải thích:</h6>
                                  <p className="text-gray-700 text-sm">{practiceData[index].practiceQuestion.explanation}</p>
                                  <div className="mt-2">
                                    <h6 className="font-medium text-gray-800 mb-1">🎯 Bẫy:</h6>
                                    <p className="text-gray-700 text-sm">{practiceData[index].practiceQuestion.traps}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/part1')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Quay lại Part 1
            </button>
            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults; 