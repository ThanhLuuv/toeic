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
  // Ref cho từng nút AI của mỗi câu
  const aiButtonRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const toggleQuestionExpansion = (questionIndex: number) => {
    setExpandedQuestions(prev => 
      prev.includes(questionIndex) 
        ? prev.filter(q => q !== questionIndex)
        : [...prev, questionIndex]
    );
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
                        setTimeout(() => {
                          aiButtonRefs.current[firstWrongIdx]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 400);
                      }
                    }}
                  >
                    Phân tích cùng AI
                  </button>
                </div>
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
                        <div className="mt-4">
                          <button
                            ref={el => { aiButtonRefs.current[index] = el; }}
                            onClick={async () => {
                              setUserChoice(u => ({ ...u, [index]: '' }));
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
                            style={{
                              padding: '8px 16px',
                              background: loadingAI[index] ? '#aaa' : '#2563eb',
                              color: 'white',
                              borderRadius: 4,
                              border: 'none',
                              cursor: loadingAI[index] ? 'not-allowed' : 'pointer',
                              opacity: loadingAI[index] ? 0.6 : 1,
                              position: 'relative'
                            }}
                          >
                            {loadingAI[index] ? (
                              <>
                                <span style={{
                                  display: 'inline-block',
                                  width: 16, height: 16,
                                  border: '2px solid #fff', borderTop: '2px solid #2563eb',
                                  borderRadius: '50%', marginRight: 8,
                                  animation: 'spin 1s linear infinite', verticalAlign: 'middle'
                                }} />
                                Đang tạo...
                                <style>{`@keyframes spin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}`}</style>
                              </>
                            ) : 'Phân tích & Tạo đề tương tự bằng AI'}
                          </button>
                          {/* {aiResults[index] && (
                            <pre style={{ background: '#f3f4f6', marginTop: 12, padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap' }}>{aiResults[index]}</pre>
                          )} */}
                        </div>
                      )}
                      {practiceData[index] && (
                        <div style={{marginTop: 24, background: '#f9fafb', borderRadius: 8, padding: 16}}>
                          <h3 style={{color: '#2563eb'}}>Phân tích lỗi</h3>
                          <div><b>Lỗi chính:</b> {practiceData[index].analysis.mainError}</div>
                          <div><b>Nguyên nhân:</b>
                            <ul>
                              {practiceData[index].analysis.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                          <div><b>Giải pháp:</b>
                            <ul>
                              {practiceData[index].analysis.solutions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <h3 style={{color: '#2563eb', marginTop: 20}}>Luyện tập tương tự</h3>
                          {(!practiceImage[index] || !practiceAudio[index]) && (
                            <div style={{color: '#888', margin: '12px 0'}}>Đang tải ảnh và audio...</div>
                          )}
                          {practiceImage[index] && <img src={practiceImage[index]} alt="practice" style={{maxWidth: 300, margin: '12px 0', borderRadius: 8}} />}
                          {practiceAudio[index] && <audio controls src={practiceAudio[index]} style={{marginBottom: 12}} />}
                          <div style={{margin: '12px 0'}}>
                            <b>Chọn đáp án:</b><br/>
                            {['A','B','C'].map(opt => {
                              let btnBg = '#eee';
                              let btnColor = '#222';
                              if (userChoice[index] === opt) {
                                if (userChoice[index] === practiceData[index].practiceQuestion.correctAnswer) {
                                  btnBg = '#22c55e'; // xanh lá
                                  btnColor = 'white';
                                } else {
                                  btnBg = '#ef4444'; // đỏ
                                  btnColor = 'white';
                                }
                              }
                              return (
                                <button
                                  key={opt}
                                  onClick={() => setUserChoice(u => ({...u, [index]: opt}))}
                                  style={{
                                    margin: 4,
                                    background: btnBg,
                                    color: btnColor,
                                    padding: '6px 16px',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: (!practiceImage[index] || !practiceAudio[index]) ? 'not-allowed' : 'pointer',
                                    opacity: (!practiceImage[index] || !practiceAudio[index]) ? 0.5 : 1
                                  }}
                                  disabled={!practiceImage[index] || !practiceAudio[index]}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {userChoice[index] !== '' && (
                            <div style={{marginTop: 8}}>
                              <div style={{marginTop: 10, background: '#f3f4f6', borderRadius: 6, padding: 10}}>
                                <div><b>Transcript:</b></div>
                                <div>A: {practiceData[index].practiceQuestion.choices.A}</div>
                                <div>B: {practiceData[index].practiceQuestion.choices.B}</div>
                                <div>C: {practiceData[index].practiceQuestion.choices.C}</div>
                              </div>
                              <div>
                                {userChoice[index] === practiceData[index].practiceQuestion.correctAnswer
                                  ? <span style={{color: 'green'}}>Chính xác!</span>
                                  : <span style={{color: 'red'}}>Sai. Đáp án đúng: {practiceData[index].practiceQuestion.correctAnswer}</span>
                                }
                              </div>
                              <div><b>Giải thích:</b> {practiceData[index].practiceQuestion.explanation}</div>
                              <div><b>Bẫy:</b> {practiceData[index].practiceQuestion.traps}</div>
                            </div>
                          )}
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