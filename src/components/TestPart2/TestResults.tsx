import React, { useState } from 'react';
import { analyzeWithAI, generateAudioBase64 } from './aiUtils';

interface Question {
  id: number;
  type: string;
  question: string;
  choices: {
    A: string;
    B: string;
    C: string;
  };
  choicesVi?: {
    A: string;
    B: string;
    C: string;
  };
  correctAnswer: string;
  answerType?: string;
  explanation: string;
  tips: string;
  audio: string;
}

interface TestResultsProps {
  questions: Question[];
  userAnswers: { [key: number]: string };
  score: number;
  onRetry: () => void;
  onBackToPart: () => void;
}

const TestResults: React.FC<TestResultsProps> = ({ 
  questions, 
  userAnswers, 
  score, 
  onRetry, 
  onBackToPart 
}) => {
  const correctAnswers = questions.filter(q => userAnswers[q.id] === q.correctAnswer).length;
  const incorrectAnswers = questions.filter(q => userAnswers[q.id] && userAnswers[q.id] !== q.correctAnswer).length;
  const skippedAnswers = questions.length - Object.keys(userAnswers).length;
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [aiResults, setAiResults] = useState<{ [idx: number]: any }>({});
  const [practiceData, setPracticeData] = useState<{ [idx: number]: any }>({});
  const [practiceAudio, setPracticeAudio] = useState<{ [idx: number]: string }>({});
  const [userChoice, setUserChoice] = useState<{ [idx: number]: string }>({});
  const [loadingAI, setLoadingAI] = useState<{ [idx: number]: boolean }>({});
  const [loadingPractice, setLoadingPractice] = useState<{ [idx: number]: boolean }>({});
  const [showTranscript, setShowTranscript] = useState<{ [idx: number]: boolean }>({});
  const [showTranslation, setShowTranslation] = useState<{ [idx: number]: { [choice: string]: boolean } }>({});
  const aiButtonRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const toggleQuestionExpansion = (questionIndex: number) => {
    setExpandedQuestions(prev => 
      prev.includes(questionIndex) 
        ? prev.filter(q => q !== questionIndex)
        : [...prev, questionIndex]
    );
  };

  const toggleTranslation = (questionIndex: number, choice: string) => {
    setShowTranslation(prev => ({
      ...prev,
      [questionIndex]: {
        ...prev[questionIndex],
        [choice]: !(prev[questionIndex]?.[choice] || false)
      }
    }));
  };

  const getQuestionStatus = (question: Question) => {
    const userAnswer = userAnswers[question.id];
    if (!userAnswer) return 'skipped';
    return userAnswer === question.correctAnswer ? 'correct' : 'incorrect';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct': return 'text-green-600 bg-green-50 border-green-200';
      case 'incorrect': return 'text-red-600 bg-red-50 border-red-200';
      case 'skipped': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'incorrect':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'skipped':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const resetPracticeState = (questionIndex: number) => {
    // Reset tất cả state liên quan đến practice question
    setUserChoice(prev => {
      const newState = { ...prev };
      delete newState[questionIndex];
      return newState;
    });
    setShowTranscript(prev => {
      const newState = { ...prev };
      delete newState[questionIndex];
      return newState;
    });
    setShowTranslation(prev => {
      const newState = { ...prev };
      delete newState[questionIndex];
      return newState;
    });
    // Clear previous results
    setAiResults(prev => {
      const newState = { ...prev };
      delete newState[questionIndex];
      return newState;
    });
    setPracticeData(prev => {
      const newState = { ...prev };
      delete newState[questionIndex];
      return newState;
    });
    setPracticeAudio(prev => {
      const newState = { ...prev };
      delete newState[questionIndex];
      return newState;
    });
  };

  const handleAIAnalysis = async (questionIndex: number) => {
    const question = questions[questionIndex];
    const userAnswer = userAnswers[question.id];
    
    if (!userAnswer || userAnswer === question.correctAnswer) {
      alert('Chỉ có thể phân tích câu sai!');
      return;
    }

    // Reset state trước khi tạo mới
    resetPracticeState(questionIndex);
    setLoadingAI(prev => ({ ...prev, [questionIndex]: true }));
    setLoadingPractice(prev => ({ ...prev, [questionIndex]: true }));

    try {
      const logText = `Câu ${questionIndex + 1} SAI:
  Đáp án đúng: ${question.correctAnswer} - ${question.choices[question.correctAnswer as keyof typeof question.choices]}
  Đáp án đã chọn: ${userAnswer} - ${question.choices[userAnswer as keyof typeof question.choices]}
  Loại câu hỏi: ${question.type}
  Loại đáp án: ${question.answerType || 'N/A'}
  Giải thích: ${question.explanation}
  Mẹo: ${question.tips}`;

      const aiResponse = await analyzeWithAI(logText);
      const parsedResponse = JSON.parse(aiResponse);
      
      setAiResults(prev => ({ ...prev, [questionIndex]: parsedResponse.analysis }));
      setPracticeData(prev => ({ ...prev, [questionIndex]: parsedResponse.practiceQuestion }));
      
      // Tạo audio cho câu luyện tập
      try {
        const audioBase64 = await generateAudioBase64(parsedResponse.practiceQuestion);
        setPracticeAudio(prev => ({ ...prev, [questionIndex]: audioBase64 }));
      } catch (audioError) {
        console.error('Audio generation failed:', audioError);
      }
      
    } catch (error) {
      console.error('AI analysis failed:', error);
      alert('Phân tích AI thất bại. Vui lòng thử lại!');
    } finally {
      setLoadingAI(prev => ({ ...prev, [questionIndex]: false }));
      setLoadingPractice(prev => ({ ...prev, [questionIndex]: false }));
    }
  };

  const handlePracticeAnswer = (questionIndex: number, choice: string) => {
    setUserChoice(prev => ({ ...prev, [questionIndex]: choice }));
  };

  const getPracticeResult = (questionIndex: number) => {
    const practice = practiceData[questionIndex];
    const userChoiceValue = userChoice[questionIndex];
    if (!practice || !userChoiceValue) return null;
    
    return {
      isCorrect: userChoiceValue === practice.correctAnswer,
      correctAnswer: practice.correctAnswer,
      userChoice: userChoiceValue
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
              <p className="text-blue-100">Thống kê toàn bộ bài kiểm tra Part 2</p>
            </div>
            
            <div className="p-8">
              {/* Overall Stats */}
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-blue-600 mb-2">{score}%</div>
                <div className="text-lg font-semibold text-gray-800 mb-1">Điểm tổng thể</div>
                <div className="text-sm text-gray-600">
                  {correctAnswers}/{questions.length} câu đúng
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                  <div className="text-sm text-green-700">Đúng</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
                  <div className="text-sm text-red-700">Sai</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{skippedAnswers}</div>
                  <div className="text-sm text-gray-700">Bỏ qua</div>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Hiệu suất tổng thể</span>
                  <span className="font-medium">
                    {score >= 80 ? 'Xuất sắc' : 
                     score >= 60 ? 'Tốt' : 
                     score >= 40 ? 'Trung bình' : 'Cần cải thiện'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      score >= 80 ? 'bg-green-500' : 
                      score >= 60 ? 'bg-blue-500' : 
                      score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                {/* Nút phân tích cùng AI */}
                <div className="flex justify-center mt-4">
                  <button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:scale-105 transition-transform"
                    onClick={() => {
                      // Tìm index câu sai đầu tiên
                      const firstWrongIdx = questions.findIndex((q, idx) => {
                        const userAnswer = userAnswers[q.id];
                        return userAnswer && userAnswer !== q.correctAnswer;
                      });
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

              {/* Action Buttons */}
              <div className="flex space-x-4 mb-8">
                <button
                  onClick={onRetry}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Làm lại bài test
                </button>
                <button
                  onClick={onBackToPart}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Về Part 2
                </button>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Chi tiết từng câu hỏi</h2>
            
            {questions.map((question, index) => {
              const status = getQuestionStatus(question);
              const userAnswer = userAnswers[question.id];
              const isExpanded = expandedQuestions.includes(index);

              return (
                <div key={question.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Question Header */}
                  <div 
                    className={`p-6 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${getStatusColor(status)}`}
                    onClick={() => toggleQuestionExpansion(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(status)}
                          <span className="font-semibold text-lg">Câu {index + 1}</span>
                        </div>
                        <div className="text-sm px-3 py-1 rounded-full bg-white">
                          {question.type}
                        </div>
                        {question.answerType && (
                          <div className="text-sm px-3 py-1 rounded-full bg-white">
                            {question.answerType}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {status === 'correct' ? 'Đúng' : status === 'incorrect' ? 'Sai' : 'Bỏ qua'}
                        </span>
                        <svg 
                          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-6 space-y-4">
                      {/* Question Type and Answer Type */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Loại câu hỏi:</h4>
                          <div className="text-sm text-gray-600">{question.type}</div>
                        </div>
                        {question.answerType && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Loại đáp án:</h4>
                            <div className="text-sm text-gray-600">{question.answerType}</div>
                          </div>
                        )}
                      </div>

                      {/* Audio Player */}
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Question: {question.question}</h4>
                      </div>

                      {/* Choices */}
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Các lựa chọn:</h4>
                        <div className="space-y-2">
                          {Object.entries(question.choices).map(([key, value]) => {
                            const isCorrect = key === question.correctAnswer;
                            const isSelected = key === userAnswer;
                            
                            let choiceClass = "p-3 rounded-lg border-2 ";
                            if (isCorrect) {
                              choiceClass += "border-green-500 bg-green-50";
                            } else if (isSelected && !isCorrect) {
                              choiceClass += "border-red-500 bg-red-50";
                            } else {
                              choiceClass += "border-gray-200 bg-gray-50";
                            }

                            return (
                              <div key={key} className={choiceClass}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-gray-600">{key}.</span>
                                    <span className="text-gray-800">{value}</span>
                                    {isCorrect && (
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
                                  {/* Nút dịch cho từng đáp án */}
                                  {question.choicesVi && question.choicesVi[key as keyof typeof question.choicesVi] && (
                                    <button
                                      onClick={() => toggleTranslation(index, key)}
                                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
                                    >
                                      {showTranslation[index]?.[key] ? 'Ẩn dịch' : 'Dịch'}
                                    </button>
                                  )}
                                </div>
                                {/* Dịch tiếng Việt */}
                                {showTranslation[index]?.[key] && question.choicesVi && question.choicesVi[key as keyof typeof question.choicesVi] && (
                                  <div className="mt-1 text-xs text-gray-600 italic">
                                    → {question.choicesVi[key as keyof typeof question.choicesVi]}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Explanation */}
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Giải thích:</h4>
                        <div className="p-3 rounded-lg bg-blue-50 text-blue-800">
                          {question.explanation}
                        </div>
                      </div>

                                             {/* Tips */}
                       <div>
                         <h4 className="font-semibold text-gray-700 mb-2">Mẹo làm bài:</h4>
                         <div className="p-3 rounded-lg bg-yellow-50 text-yellow-800">
                           {question.tips}
                         </div>
                       </div>

                       {/* AI Analysis Button - Only for incorrect answers */}
                       {userAnswer && userAnswer !== question.correctAnswer && (
                         <div className="border-t border-gray-200 pt-4">
                           <button
                             ref={(el) => { aiButtonRefs.current[index] = el; }}
                             onClick={() => handleAIAnalysis(index)}
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

                       {/* AI Analysis Results */}
                       {loadingAI[index] ? (
                         <div className="border-t border-gray-200 pt-4">
                           <div className="flex items-center justify-center py-8">
                             <div className="text-center">
                               <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                               </svg>
                               <p className="text-gray-600 font-medium">Đang phân tích lỗi...</p>
                             </div>
                           </div>
                         </div>
                       ) : aiResults[index] && (
                         <div className="border-t border-gray-200 pt-4 space-y-4">
                           <h4 className="font-semibold text-gray-700">📊 Phân tích lỗi:</h4>
                           
                           <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                             <h5 className="font-medium text-red-800 mb-2">❌ Lỗi chính:</h5>
                             <p className="text-red-700">{aiResults[index].mainError}</p>
                           </div>

                           <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                             <h5 className="font-medium text-orange-800 mb-2">🔍 Nguyên nhân:</h5>
                             <ul className="list-disc list-inside text-orange-700 space-y-1">
                               {aiResults[index].reasons.map((reason: string, idx: number) => (
                                 <li key={idx}>{reason}</li>
                               ))}
                             </ul>
                           </div>

                           <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                             <h5 className="font-medium text-green-800 mb-2">💡 Giải pháp:</h5>
                             <ul className="list-disc list-inside text-green-700 space-y-1">
                               {aiResults[index].solutions.map((solution: string, idx: number) => (
                                 <li key={idx}>{solution}</li>
                               ))}
                             </ul>
                           </div>
                         </div>
                       )}

                       {/* Practice Question */}
                       {loadingPractice[index] ? (
                         <div className="border-t border-gray-200 pt-4">
                           <div className="flex items-center justify-center py-8">
                             <div className="text-center">
                               <svg className="animate-spin h-8 w-8 text-purple-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                               </svg>
                               <p className="text-gray-600 font-medium">Đang tạo câu hỏi luyện tập...</p>
                             </div>
                           </div>
                         </div>
                       ) : practiceData[index] && (
                         <div className="border-t border-gray-200 pt-4 space-y-4">
                           <h4 className="font-semibold text-gray-700">🎯 Bài luyện tập tương tự:</h4>
                           
                           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                             <h5 className="font-medium text-blue-800 mb-2">Câu hỏi:</h5>
                             
                             {practiceAudio[index] && (
                               <audio controls className="w-full mb-3">
                                 <source src={practiceAudio[index]} type="audio/mp3" />
                                 Your browser does not support the audio element.
                               </audio>
                             )}

                             <div className="space-y-2">
                               {Object.entries(practiceData[index].choices).map(([key, value]) => {
                                 const isSelected = userChoice[index] === key;
                                 const result = getPracticeResult(index);
                                 const isCorrect = key === practiceData[index].correctAnswer;
                                 const showResult = result !== null;
                                 
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

                                 return (
                                   <button
                                     key={key}
                                     className={choiceClass}
                                     onClick={() => handlePracticeAnswer(index, key)}
                                     disabled={showResult}
                                   >
                                     <div className="flex items-center space-x-2">
                                       <span className="font-semibold text-gray-600">{key}.</span>
                                       {/* Chỉ hiển thị label A, B, C, không hiển thị text đáp án */}
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

                             {getPracticeResult(index) && (
                               <div className="mt-4 space-y-4">
                                 {/* Transcript của các đáp án */}
                                 <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                   <h6 className="font-medium text-blue-800 mb-2">📝 Transcript:</h6>
                                   <p className="text-gray-700 text-sm mb-2">{practiceData[index].question}</p>
                                   <div className="space-y-1 text-sm">
                                     {Object.entries(practiceData[index].choices).map(([key, value]) => {
                                       const isCorrect = key === practiceData[index].correctAnswer;
                                       const isSelected = userChoice[index] === key;
                                       
                                       return (
                                         <div key={key} className={`${
                                           isCorrect ? 'text-green-700' : isSelected && !isCorrect ? 'text-red-700' : 'text-blue-700'
                                         }`}>
                                           <div className="flex items-start justify-between">
                                             <div className="flex items-start space-x-2">
                                               <span className="font-semibold min-w-[20px]">{key}.</span>
                                               <span>{value as string}</span>
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
                                             {/* Nút dịch cho từng đáp án */}
                                             {question.choicesVi && question.choicesVi[key as keyof typeof question.choicesVi] && (
                                               <button
                                                 onClick={() => toggleTranslation(index, key)}
                                                 className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
                                               >
                                                 {showTranslation[index]?.[key] ? 'Ẩn dịch' : 'Dịch'}
                                               </button>
                                             )}
                                           </div>
                                           {/* Dịch tiếng Việt */}
                                           {showTranslation[index]?.[key] && question.choicesVi && question.choicesVi[key as keyof typeof question.choicesVi] && (
                                             <div className="ml-6 mt-1 text-xs text-gray-600 italic">
                                               → {question.choicesVi[key as keyof typeof question.choicesVi]}
                                             </div>
                                           )}
                                         </div>
                                       );
                                     })}
                                   </div>
                                 </div>

                                 {/* Giải thích và mẹo */}
                                 <div className="p-3 rounded-lg bg-gray-50">
                                   <h6 className="font-medium text-gray-800 mb-2">💡 Giải thích:</h6>
                                   <p className="text-gray-700 text-sm">{practiceData[index].explanation}</p>
                                   <div className="mt-2">
                                     <h6 className="font-medium text-gray-800 mb-1">🎯 Mẹo:</h6>
                                     <p className="text-gray-700 text-sm">{practiceData[index].tips}</p>
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
        </div>
      </div>
    </div>
  );
};

export default TestResults; 