import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeWithAI, generateImageBase64, generateAudioBase64 } from './aiUtils';
import { practiceService, PracticeData } from '../../services/practiceService';

interface Answer {
  selected: string;
  correct: string;
  isCorrect: boolean;
  skipped: boolean;
}

interface Question {
  questionNumber: number;
  level: string;
  type: string;
  imageDescription: string;
  image: string;
  audio: string;
  mcqSteps: {
    stepNumber: number;
    options: {
      value: string;
      text: string;
      pronunciation: string;
      meaning: string;
      isCorrect: boolean;
    }[];
  }[];
  audioQuestion: {
    choices: { [key: string]: { english: string; vietnamese: string } };
    correctAnswer: string;
    traps: string;
  };
}

interface MCQAnswer {
  questionIndex: number;
  step: number;
  selected: string;
  isCorrect: boolean;
}

interface TestResultsProps {
  questions: Question[];
  answers: (Answer | null)[];
  mcqAnswers: MCQAnswer[];
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
  mcqAnswers,
  testResults,
  onClose
}) => {
  // Debug logging
  console.log('TestResults received mcqAnswers:', mcqAnswers);
  console.log('TestResults received questions:', questions);
  const navigate = useNavigate();
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [aiResults, setAiResults] = useState<{ [idx: number]: string }>({});
  const [practiceData, setPracticeData] = useState<{ [idx: number]: any }>({});
  const [practiceImage, setPracticeImage] = useState<{ [idx: number]: string }>({});
  const [practiceAudio, setPracticeAudio] = useState<{ [idx: number]: string }>({});
  const [userChoice, setUserChoice] = useState<{ [idx: number]: string }>({});
  const [loadingAI, setLoadingAI] = useState<{ [idx: number]: boolean }>({});
  const [showTranscriptVi, setShowTranscriptVi] = useState<{ [qIdx: number]: { [choice: string]: boolean } }>({});
  const [showMCQTranslation, setShowMCQTranslation] = useState<{ [qIdx: number]: { [stepIndex: number]: { [optionIndex: number]: boolean } } }>({});
  const [savingToFirebase, setSavingToFirebase] = useState<{ [idx: number]: boolean }>({});
  const [savedToFirebase, setSavedToFirebase] = useState<{ [idx: number]: boolean }>({});
  const aiButtonRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  // Reset savedToFirebase khi có practice data mới
  React.useEffect(() => {
    Object.keys(practiceData).forEach(index => {
      const idx = parseInt(index);
      setSavedToFirebase(prev => ({ ...prev, [idx]: false }));
    });
  }, [practiceData]);

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

  const toggleMCQTranslation = (qIdx: number, stepIndex: number, optionIndex: number) => {
    setShowMCQTranslation(prev => ({
      ...prev,
      [qIdx]: {
        ...prev[qIdx],
        [stepIndex]: {
          ...prev[qIdx]?.[stepIndex],
          [optionIndex]: !(prev[qIdx]?.[stepIndex]?.[optionIndex] || false)
        }
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-4">
            <div className="bg-gray-800 text-white p-8 text-center">
              <h1 className="text-3xl font-bold mb-2">Detailed results</h1>
              <p className="text-blue-100">Overall test statistics</p>
            </div>
            
            <div className="p-8">
              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{testResults.score}%</div>
                  <div className="text-lg font-semibold text-blue-800 mb-1">Main score</div>
                  <div className="text-sm text-blue-600">
                    {testResults.correct}/{testResults.total} correct
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">{testResults.score}%</div>
                  <div className="text-lg font-semibold text-green-800 mb-1">Overall score</div>
                  <div className="text-sm text-green-600">
                    {testResults.correct}/{testResults.total} correct
                  </div>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Overall performance</span>
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
                      className="bg-green-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform"
                      onClick={() => {
                        // Tìm index câu sai đầu tiên
                        const firstWrongIdx = answers.findIndex(a => a && !a.isCorrect);
                        if (firstWrongIdx !== -1) {
                          // Expand câu đó nếu chưa expand
                          setExpandedQuestions(prev => prev.includes(firstWrongIdx) ? prev : [...prev, firstWrongIdx]);
                        }
                      }}
                    >
                      Analyze with AI
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
              const isExpanded = expandedQuestions.includes(index);
              const isWrong = answer && !answer.isCorrect;
              
              // Tạo logText cho câu sai
              let logText = '';
              if (isWrong) {
                 // Lấy thông tin MCQ answers cho câu này
                 const questionMCQAnswers = mcqAnswers.filter(a => a.questionIndex === index);
                 console.log(`MCQ Answers for question ${index}:`, questionMCQAnswers); // Debug log
                 const mcqInfo = questionMCQAnswers.map(a => 
                   `Step ${a.step}: ${a.selected} (${a.isCorrect ? 'Đúng' : 'Sai'})`
                 ).join(', ');
                 
                logText = `Câu ${index + 1} SAI:\n` +
                   `  Đáp án đúng: ${question.audioQuestion.correctAnswer} - ${question.audioQuestion.choices?.[question.audioQuestion.correctAnswer]?.english || 'N/A'} | ${question.audioQuestion.choices?.[question.audioQuestion.correctAnswer]?.vietnamese || 'N/A'}\n` +
                   `  Đáp án đã chọn: ${answer.selected} - ${question.audioQuestion.choices?.[answer.selected]?.english || 'N/A'} | ${question.audioQuestion.choices?.[answer.selected]?.vietnamese || 'N/A'}\n` +
                   `  MCQ Steps: ${mcqInfo}\n` +
                   `  Bẫy: ${question.audioQuestion.traps}\n` +
                   `  Mô tả ảnh: ${question.imageDescription}`;
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
                            Question {index + 1}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {answer?.isCorrect ? 'Correct' : 'Wrong'} • 
                            Answer: {answer?.selected} • 
                            Correct: {question.audioQuestion.correctAnswer}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                          <div className="text-xs text-gray-500">
                          MCQ Steps: {question.mcqSteps?.length || 0} • 
                          Completed: {mcqAnswers.filter(a => a.questionIndex === index).length}/{question.mcqSteps?.length || 0}
                          </div>
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
                        <h4 className="font-semibold text-gray-800 mb-3">Choices:</h4>
                        <div className="space-y-3">
                           {(['A', 'B', 'C', 'D'] as const).map((key) => {
                             const showChoiceTranslation = showTranscriptVi[index]?.[key] || false;
                             const isSelected = answer?.selected === key;
                             const isCorrect = answer?.correct === key;
                             
                             let choiceClass = "border-2 rounded-[50px] p-1 transition-all duration-300 ";
                             if (isSelected && isCorrect) {
                               choiceClass += "border-green-500 bg-green-50";
                             } else if (isSelected && !isCorrect) {
                               choiceClass += "border-red-500 bg-red-50";
                             } else if (isCorrect && !isSelected) {
                               choiceClass += "border-green-500 bg-green-50";
                             } else {
                               choiceClass += "border-gray-200 bg-white";
                             }
                             
                             return (
                               <div key={key} className={choiceClass}>
                                 <div className="flex items-center">
                                   <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                                     {key}
                                   </div>
                                   <div className="flex-1">
                                     <div className="text-lg text-gray-800">
                                       {showChoiceTranslation 
                                         ? question.audioQuestion.choices?.[key]?.vietnamese || 'N/A'
                                         : question.audioQuestion.choices?.[key]?.english || 'N/A'
                                       }
                                     </div>
                                   </div>
                                   <button
                                     onClick={() => toggleTranscriptVi(index, key)}
                                     className="text-gray-400 hover:text-blue-500 text-base cursor-pointer p-2 rounded-full transition-all duration-200 ml-3 flex-shrink-0 hover:bg-blue-50"
                                     title={showChoiceTranslation ? "Hiện tiếng Anh" : "Hiện tiếng Việt"}
                                   >
                                     📖
                                   </button>
                                 </div>
                               </div>
                             );
                           })}
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-green-500 mb-2">Explanation:</h4>
                        <p className="text-gray-900">{question.audioQuestion.traps}</p>
                      </div>

                      {/* MCQ Steps Results */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800">MCQ Steps:</h4>
                        
                        <div className="grid grid-cols-3 gap-4">
                          {question.mcqSteps?.map((step, stepIndex) => {
                            const userAnswer = mcqAnswers.find(a => a.questionIndex === index && a.step === step.stepNumber);
                            return (
                              <div key={stepIndex} className="bg-blue-50 rounded-lg p-4">
                                <h5 className="font-semibold text-blue-800 mb-3 text-center">Step {step.stepNumber}</h5>
                                                                 <div className="space-y-2">
                                   {step.options.map((option, optionIndex) => {
                                     const isUserSelected = userAnswer?.selected === option.value;
                                     const isCorrect = option.isCorrect;
                                     const isUserCorrect = userAnswer?.isCorrect;
                                     const showTranslation = showMCQTranslation[index]?.[stepIndex]?.[optionIndex] || false;
                                     
                                     let optionClass = "p-2 rounded-lg border text-sm ";
                                     if (isUserSelected) {
                                       if (isCorrect) {
                                         optionClass += "bg-green-100 border-green-300 text-green-800";
                                       } else {
                                         optionClass += "bg-red-100 border-red-300 text-red-800";
                                       }
                                     } else if (isCorrect) {
                                       optionClass += "bg-green-100 border-green-300 text-green-800";
                                     } else {
                                       optionClass += "bg-gray-100 border-gray-300 text-gray-600";
                                     }
                                     
                                     return (
                                       <div key={optionIndex} className={optionClass}>
                                         <div className="flex items-center justify-between">
                                           <div className="flex items-center space-x-2">
                                             <span className="font-medium text-xs">{option.text}</span>
                                             <button
                                               onClick={() => toggleMCQTranslation(index, stepIndex, optionIndex)}
                                               className="text-gray-400 hover:text-gray-600 text-xs p-1 rounded transition-colors"
                                               title="Xem nghĩa"
                                             >
                                               📖
                                             </button>
                                  </div>
                                           <div className="flex items-center space-x-1">
                                             {isCorrect && <span className="text-green-600 text-xs">✓</span>}
                                             {isUserSelected && !isCorrect && <span className="text-red-600 text-xs">✗</span>}
                                             {isUserSelected && isCorrect && <span className="text-green-600 text-xs">✓</span>}
                                  </div>
                                </div>
                                         {showTranslation && (
                                           <div className="text-xs text-gray-500 mt-1">
                                             {option.pronunciation} • {option.meaning}
                                </div>
                              )}
                            </div>
                                     );
                                   })}
                          </div>
                                {userAnswer && (
                                  <div className="mt-3 p-2 bg-gray-100 rounded-lg">
                                    <div className="text-xs text-gray-700 text-center">
                                      <strong>Đã chọn:</strong> {userAnswer.selected}
                                      {userAnswer.isCorrect ? ' ✓' : ' ✗'}
                                  </div>
                                </div>
                              )}
                                {!userAnswer && (
                                  <div className="mt-3 p-2 bg-yellow-100 rounded-lg">
                                    <div className="text-xs text-yellow-700 text-center">
                                      <strong>Chưa chọn</strong>
                                </div>
                                  </div>
                                )}
                            </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Nút AI cho câu sai */}
                      {isWrong && (
                        <div className="border-t border-gray-200 pt-4 flex justify-center">
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
                                // result đã là object rồi, không cần parse lại
                                setPracticeData(d => ({ ...d, [index]: result }));
                                // Gọi generateImages và generateAudio ở đây, lưu base64 vào state
                                const imgBase64 = await generateImageBase64(result.practiceQuestion.imageDescription);
                                setPracticeImage(img => ({ ...img, [index]: imgBase64 }));
                                const audioBase64 = await generateAudioBase64(result.practiceQuestion);
                                setPracticeAudio(aud => ({ ...aud, [index]: audioBase64 }));
                              } catch (err: any) {
                                setAiResults(r => ({ ...r, [index]: 'Lỗi gọi AI: ' + err.message }));
                              } finally {
                                setLoadingAI(l => ({ ...l, [index]: false }));
                              }
                            }}
                            disabled={loadingAI[index]}
                            className="w-fit bg-green-500 text-white py-3 px-6 rounded-full font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
                              ' Analyze with AI'
                            )}
                          </button>
                        </div>
                      )}

                      {/* Kết quả AI */}
                      {practiceData[index] && (
                        <div className="border-t border-gray-200 pt-4 space-y-4">
                          <h4 className="font-semibold text-gray-700">📊 Analyze error:</h4>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h5 className="font-medium text-red-600 mb-2">❌ Main error:</h5>
                            <p className="text-gray-800">{practiceData[index].analysis.mainError}</p>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h5 className="font-medium text-orange-600 mb-2">🔍 Reasons:</h5>
                            <ul className="list-disc list-inside text-gray-800 space-y-1">
                              {practiceData[index].analysis.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h5 className="font-medium text-green-600 mb-2">💡 Solutions:</h5>
                            <ul className="list-disc list-inside text-gray-800 space-y-1">
                              {practiceData[index].analysis.solutions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                            </ul>
                          </div>
                          <h4 className="font-semibold text-gray-700">🎯 Similar practice:</h4>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            {practiceImage[index] && <img src={practiceImage[index]} alt="practice" className="max-w-xs rounded-lg mb-3" />}
                            {practiceAudio[index] && <audio controls className="w-full mb-3" src={practiceAudio[index]} preload="auto" />}
                            {/* Loading indicator khi chưa có ảnh hoặc audio */}
                            {(!practiceImage[index] || !practiceAudio[index]) && (
                              <div className="flex items-center justify-center py-4">
                                <svg className="animate-spin h-6 w-6 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-blue-700 font-medium">Loading practice image and audio...</span>
                              </div>
                            )}
                              <div className="grid gap-4">
                               {['A','B','C','D'].map(opt => {
                                 const isSelected = userChoice[index] === opt;
                                 const isCorrect = opt === practiceData[index].practiceQuestion.audioQuestion.correctAnswer;
                                 const showResult = userChoice[index] !== undefined && userChoice[index] !== '';
                                 let choiceClass = "bg-white border-2 border-gray-200 rounded-[50px] p-1 transition-all duration-300 ";
                                 if (isSelected) {
                                   if (isCorrect) {
                                     choiceClass += "border-green-500 bg-green-50";
                                   } else {
                                     choiceClass += "border-red-500 bg-red-50";
                                   }
                                 } else if (showResult && isCorrect) {
                                   choiceClass += "border-green-500 bg-green-50";
                                 } else {
                                   choiceClass += "border-gray-200 cursor-pointer hover:border-blue-500 hover:shadow-lg hover:-translate-y-0.5";
                                 }
                                 // Disable nếu chưa load xong ảnh hoặc audio
                                 const disabled = !practiceImage[index] || !practiceAudio[index] || showResult;
                                 return (
                                   <div
                                     key={opt}
                                     className={choiceClass}
                                     onClick={() => !disabled && setUserChoice(u => ({...u, [index]: opt}))}
                                   >
                                     <div className="flex items-center">
                                       <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                                         {opt}
                                       </div>
                                       <div className="flex-1">
                                         {showResult ? (
                                           <div className="text-lg text-gray-800">
                                             {showTranscriptVi[index]?.[opt] 
                                               ? practiceData[index].practiceQuestion.audioQuestion.choices[opt]?.vietnamese || 'N/A'
                                               : practiceData[index].practiceQuestion.audioQuestion.choices[opt]?.english || 'N/A'
                                             }
                                           </div>
                                         ) : (
                                           <div className="text-lg text-gray-500 italic">Click to select</div>
                                         )}
                                       </div>
                                       {showResult && (
                                         <button
                                           className="text-gray-400 hover:text-blue-500 text-base cursor-pointer p-2 rounded-full transition-all duration-200 ml-3 flex-shrink-0 hover:bg-blue-50"
                                           onClick={(e) => {
                                             e.stopPropagation();
                                             toggleTranscriptVi(index, opt);
                                           }}
                                           title={showTranscriptVi[index]?.[opt] ? "Hiện tiếng Anh" : "Hiện tiếng Việt"}
                                         >
                                           📖
                                         </button>
                                       )}
                                     </div>
                                   </div>
                                 );
                               })}
                             </div>
                            <div className="mt-4 space-y-4">
                              {userChoice[index] !== '' && (
                                <div className="p-3 rounded-lg bg-gray-50">
                                  <h6 className="font-medium text-green-500 mb-2">Explanation:</h6>
                                  <p className="text-gray-700 text-sm">{practiceData[index].practiceQuestion.audioQuestion.traps}</p>
                                </div>
                              )}
                              
                              {/* Nút thêm vào kho - luôn hiển thị khi có practice data */}
                              <div className="flex justify-center">
                                  <button
                                    onClick={async () => {
                                                              if (savedToFirebase[index]) {
                          return;
                        }
                                      
                                      setSavingToFirebase(s => ({ ...s, [index]: true }));
                                        try {
                                         const practiceDataToSave: PracticeData = {
                                           originalQuestionIndex: index,
                                           originalQuestion: questions[index],
                                           analysis: practiceData[index].analysis,
                                           practiceQuestion: {
                                             questionNumber: 1, // Có thể tạo ID tự động sau
                                             level: "Intermediate",
                                             type: "people",
                                             imageDescription: practiceData[index].practiceQuestion.imageDescription,
                                             image: practiceImage[index] || '', // Lấy từ practiceImage
                                             audio: practiceAudio[index] || '', // Lấy từ practiceAudio
                                             mcqSteps: practiceData[index].practiceQuestion.mcqSteps || [],
                                             audioQuestion: practiceData[index].practiceQuestion.audioQuestion
                                           },
                                           createdAt: new Date()
                                         };
                                        
                                                                  await practiceService.savePracticeToFirebase(practiceDataToSave);
                          setSavedToFirebase(s => ({ ...s, [index]: true }));
                                                              } catch (error) {
                          console.error('Lỗi khi lưu vào Firebase:', error);
                        } finally {
                                        setSavingToFirebase(s => ({ ...s, [index]: false }));
                                      }
                                    }}
                                    disabled={savingToFirebase[index] || savedToFirebase[index]}
                                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                                      savedToFirebase[index]
                                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                        : savingToFirebase[index]
                                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105'
                                    }`}
                                  >
                                    {savingToFirebase[index] ? (
                                      <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang lưu...
                                      </div>
                                    ) : savedToFirebase[index] ? (
                                      <div className="flex items-center">
                                        <span>Đã lưu vào kho</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center">
                                        <span>Thêm vào kho</span>
                                      </div>
                                    )}
                                  </button>
                                </div>
                              </div>
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
              Back to Part 1
            </button>
            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults; 