import React, { useState, useRef } from 'react';
import { generateToeicPracticeQuestion, generateImageBase64, generateAudioBase64 } from './TestPart1/aiUtils';

// Hàm gọi OpenAI API đơn giản cho hỏi đáp TOEIC
async function askToeicAI(question: string, chatHistory: {role: 'user'|'bot', text: string}[] = []): Promise<string> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  
  // Chuyển đổi lịch sử chat sang format OpenAI
  const historyMessages = chatHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.text
  }));
  
  const messages = [
    {
      role: 'system',
      content: 'Bạn là trợ lý TOEIC, chuyên giải đáp các thắc mắc về kỳ thi TOEIC, mẹo làm bài, giải thích các phần thi, và hướng dẫn ôn luyện. Bạn có thể nhớ thông tin từ các câu hỏi trước đó trong cuộc trò chuyện.'
    },
    ...historyMessages,
    {
      role: 'user',
      content: question
    }
  ];
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 800
    })
  });
  if (!response.ok) throw new Error('OpenAI API error');
  const data = await response.json();
  return data.choices[0].message.content;
}

// Hàm chuyển markdown đơn giản sang HTML (bold, tiêu đề, danh sách)
function simpleMarkdownToHtml(text: string): string {
  // Chuyển heading
  let html = text
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>');
  // Bold, italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
             .replace(/\*(.*?)\*/g, '<i>$1</i>');
  // Danh sách
  // Gom các dòng bắt đầu bằng - hoặc * thành <ul><li>...</li></ul>
  html = html.replace(/((?:^\s*[-*] .*(?:\n|$))+)/gm, match => {
    const items = match.trim().split(/\n/).map(line => line.replace(/^\s*[-*] (.*)/, '<li>$1</li>')).join('');
    return `<ul>${items}</ul>`;
  });
  // Xuống dòng đơn giản (chỉ khi không phải trong <li> hoặc heading)
  html = html.replace(/([^>])\n([^<])/g, '$1<br/>$2');
  return html;
}

// Nhận diện yêu cầu tạo bài tập TOEIC (câu hỏi luyện tập)
function isPracticeRequest(text: string) {
  return /\b(tạo|luyện|ra đề|bài tập|test|practice|generate|làm bài|đề luyện|bài luyện|câu hỏi luyện|give me a question|cho.*câu hỏi|câu hỏi part|bài part|bài test|bài kiểm tra)\b/i.test(text);
}

// Thêm type cho message
type ChatMessage = { role: 'user'|'bot', text: string } | { role: 'practice', data: any, answer?: string } | { role: 'confirm-practice', original: string } | { role: 'practice-loading' };

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [practiceSessions, setPracticeSessions] = useState<any[]>([]); // Lưu các bài luyện tập đã tạo
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceImageLoading, setPracticeImageLoading] = useState(false);
  const [practiceAudioLoading, setPracticeAudioLoading] = useState(false);

  // Load lịch sử chat từ localStorage khi component mount
  React.useEffect(() => {
    const savedMessages = localStorage.getItem('toeic-chatbot-history');
    console.log('Loading chat history:', savedMessages);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        console.log('Parsed messages:', parsed);
        setMessages(parsed);
      } catch (e) {
        console.error('Lỗi load lịch sử chat:', e);
      }
    }
  }, []);

  // Lưu lịch sử chat vào localStorage (giới hạn 5 câu hỏi gần nhất)
  const saveChatHistory = (newMessages: {role: 'user'|'bot', text: string}[]) => {
    // Chỉ lưu 5 câu hỏi gần nhất (10 messages: 5 user + 5 bot)
    const limitedMessages = newMessages.slice(-10);
    console.log('Saving chat history:', limitedMessages);
    localStorage.setItem('toeic-chatbot-history', JSON.stringify(limitedMessages));
  };

  // Xóa lịch sử chat
  const clearChatHistory = () => {
    localStorage.removeItem('toeic-chatbot-history');
    setMessages([]);
    console.log('Chat history cleared');
  };

  // Quay lại chat bình thường sau khi làm bài tập
  const backToChat = () => {
    // setCurrentPractice(null); // Không cần nữa
    // setPracticeAnswer(''); // Không cần nữa
    // setPracticeResult(null); // Không cần nữa
    // setPracticeImage(''); // Không cần nữa
    // setPracticeAudio(''); // Không cần nữa
  };

  // Lưu kết quả luyện tập vào localStorage
  const savePracticeHistory = (sessions: any[]) => {
    localStorage.setItem('toeic-practice-history', JSON.stringify(sessions));
  };
  // Load lịch sử luyện tập khi mở chatbot
  React.useEffect(() => {
    const saved = localStorage.getItem('toeic-practice-history');
    if (saved) {
      try {
        setPracticeSessions(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Xử lý gửi tin nhắn
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setTimeout(() => inputRef.current?.focus(), 100);
    // Nếu là yêu cầu tạo bài tập TOEIC
    if (isPracticeRequest(input)) {
      // Thay vì tạo luôn, thêm message xác nhận
      setMessages(msgs => [...msgs, { role: 'confirm-practice', original: input }]);
      setLoading(false);
      return;
    }
    try {
      const recentHistory = newMessages.slice(-6).filter(m => m.role === 'user' || m.role === 'bot') as {role: 'user'|'bot', text: string}[];
      const reply = await askToeicAI(input, recentHistory);
      const updatedMessages = [...newMessages, { role: 'bot' as 'bot', text: reply }];
      setMessages(updatedMessages);
      saveChatHistory(updatedMessages.filter(m => m.role === 'user' || m.role === 'bot') as {role: 'user'|'bot', text: string}[]);
    } catch (e) {
      const errorMessages = [...newMessages, { role: 'bot' as 'bot', text: 'Xin lỗi, có lỗi khi kết nối AI.' }];
      setMessages(errorMessages);
      saveChatHistory(errorMessages.filter(m => m.role === 'user' || m.role === 'bot') as {role: 'user'|'bot', text: string}[]);
    }
    setLoading(false);
  };

  // Xử lý xác nhận tạo bài tập
  const handleConfirmPractice = async (msgIdx: number, confirmed: boolean) => {
    const msg = messages[msgIdx];
    if (msg.role !== 'confirm-practice') return;
    if (!confirmed) {
      // Hủy: chỉ xóa message xác nhận
      setMessages(msgs => msgs.filter((_, i) => i !== msgIdx));
      return;
    }
    // Đúng: thay message xác nhận bằng message loading
    setMessages(msgs => msgs.map((m, i) => i === msgIdx ? { role: 'practice-loading' } : m));
    setPracticeLoading(true);
    try {
      const result = await generateToeicPracticeQuestion(msg.original);
      let imgBase64 = '';
      let audioBase64 = '';
      try { imgBase64 = await generateImageBase64(result.practiceQuestion.imageDescription); } catch {}
      try { audioBase64 = await generateAudioBase64(result.practiceQuestion); } catch {}
      const practiceMsg: ChatMessage = {
        role: 'practice',
        data: { ...result.practiceQuestion, image: imgBase64, audio: audioBase64 },
        answer: ''
      };
      setMessages(msgs => msgs.map((m, i) => i === msgIdx ? practiceMsg : m));
      setPracticeLoading(false);
      // Lưu vào lịch sử
      const newSessions = [...practiceSessions, { ...result.practiceQuestion, userAnswer: '', correct: null, time: Date.now() }];
      setPracticeSessions(newSessions);
      savePracticeHistory(newSessions);
    } catch (e) {
      setMessages(msgs => msgs.map((m, i) => i === msgIdx ? { role: 'bot' as 'bot', text: 'Xin lỗi, không tạo được bài luyện tập. Vui lòng thử lại.' } : m));
      setPracticeLoading(false);
    }
  };

  // Xử lý chọn đáp án luyện tập
  const handlePracticeAnswer = (msgIdx: number, answer: string) => {
    const msg = messages[msgIdx];
    if (!('data' in msg)) return;
    const correct = answer === msg.data.correctAnswer;
    // Cập nhật message answer
    const newMessages = messages.map((m, i) =>
      i === msgIdx ? { ...m, answer } : m
    );
    setMessages(newMessages);
    // Lưu vào lịch sử
    const newSessions = practiceSessions.map((s, idx) =>
      idx === practiceSessions.length - 1 ? { ...s, userAnswer: answer, correct, time: Date.now() } : s
    );
    setPracticeSessions(newSessions);
    savePracticeHistory(newSessions);
  };

  React.useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  return (
    <>
      {/* Nút nổi mở chat */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            zIndex: 1000,
            borderRadius: '50%',
            width: 56,
            height: 56,
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontSize: 28,
            cursor: 'pointer'
          }}
          aria-label="Mở chatbot TOEIC"
        >💬</button>
      )}
      {/* Khung chat */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: 24,
            width: 340,
            maxHeight: 480,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div style={{ background: '#1976d2', color: '#fff', padding: '12px 16px', fontWeight: 600, fontSize: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            TOEIC Chatbot
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                onClick={clearChatHistory}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', padding: '4px 8px' }}
                title="Xóa lịch sử"
              >
                🗑️
              </button>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>&times;</button>
            </div>
          </div>
          <div style={{ flex: 1, padding: 12, overflowY: 'auto', background: '#f7f7f7' }}>
            {/* Nếu đang tạo bài luyện tập */}
            {practiceLoading && (
              <div className="flex items-center justify-center py-4 text-blue-700 font-medium">Đang tạo bài luyện tập TOEIC...</div>
            )}
            {/* Chat history luôn hiển thị, render từng message */}
            {messages.length === 0 && (
              <div style={{ color: '#888', fontSize: 15, textAlign: 'center', marginTop: 32 }}>
                Hỏi tôi bất cứ điều gì về TOEIC!<br/>Ví dụ: "Part 1 là gì?", "Mẹo làm bài nghe?", "Tạo bài tập part 1"...
              </div>
            )}
            {messages.map((msg, idx) => {
              if (msg.role === 'practice') {
                const practice = msg.data;
                const answer = msg.answer || '';
                const showResult = answer !== '';
                return (
                  <div key={idx} className="mb-4 p-3 rounded-lg border border-blue-200 bg-blue-50">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-semibold text-blue-800">📝 TOEIC Practice</div>
                    </div>
                    {practice.image && <img src={practice.image} alt="practice" className="max-w-xs rounded-lg mb-3" style={{width: '-webkit-fill-available'}} />}
                    {practice.audio && <audio controls className="w-full mb-3" src={practice.audio} />}
                    <div className="space-y-2">
                      {['A','B','C'].map(opt => {
                        const isSelected = answer === opt;
                        const isCorrect = opt === practice.correctAnswer;
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
                        const disabled = showResult;
                        return (
                          <button
                            key={opt}
                            className={choiceClass}
                            onClick={() => handlePracticeAnswer(idx, opt)}
                            disabled={disabled}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-gray-600">{opt}.</span>
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
                    {/* Transcript chỉ hiển thị sau khi chọn đáp án */}
                    {showResult && (
                      <div className="mt-4 space-y-4">
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <h6 className="font-medium text-blue-800 mb-2">📝 Transcript:</h6>
                          <div className="text-gray-700 text-sm mb-2">{practice.transcript}</div>
                          <div className="space-y-1 text-sm">
                            {Object.entries(practice.choices).map(([key, value]) => {
                              const isCorrect = key === practice.correctAnswer;
                              const isSelected = answer === key;
                              return (
                                <div key={key} className={`${
                                  isCorrect ? 'text-green-700' : isSelected && !isCorrect ? 'text-red-700' : 'text-blue-700'
                                }`}>
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
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50">
                          <h6 className="font-medium text-gray-800 mb-2">💡 Giải thích:</h6>
                          <p className="text-gray-700 text-sm">{practice.explanation}</p>
                          <div className="mt-2">
                            <h6 className="font-medium text-gray-800 mb-1">🎯 Bẫy:</h6>
                            <p className="text-gray-700 text-sm">{practice.traps}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              if (msg.role === 'confirm-practice') {
                return (
                  <div key={idx} className="mb-4 p-3 rounded-lg border border-yellow-200 bg-yellow-50">
                    <div className="mb-2 text-yellow-800 font-semibold">Bạn có muốn tạo một bài luyện tập TOEIC với yêu cầu này không?</div>
                    <div className="text-xs text-gray-700 mb-2">"{msg.original}"</div>
                    <div className="flex gap-2">
                      <button onClick={() => handleConfirmPractice(idx, true)} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Tạo bài tập</button>
                      <button onClick={() => handleConfirmPractice(idx, false)} className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Hủy</button>
                    </div>
                  </div>
                );
              }
              if (msg.role === 'practice-loading') {
                return (
                  <div key={idx} className="mb-4 p-3 rounded-lg border border-blue-200 bg-blue-50 flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-blue-700 font-medium">Đang tạo bài luyện tập TOEIC...</span>
                  </div>
                );
              }
              // render user/bot như cũ
              if (msg.role === 'bot') {
                return (
                  <div key={idx} style={{
                    margin: '8px 0',
                    textAlign: 'left'
                  }}>
                    <span
                      style={{
                        display: 'inline-block',
                        background: '#e3eafc',
                        color: '#222',
                        borderRadius: 16,
                        padding: '8px 14px',
                        maxWidth: '80%',
                        fontSize: 15
                      }}
                      dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(msg.text) }}
                    />
                  </div>
                );
              }
              // user
              return (
                <div key={idx} style={{
                  margin: '8px 0',
                  textAlign: 'right'
                }}>
                  <span style={{
                    display: 'inline-block',
                    background: '#1976d2',
                    color: '#fff',
                    borderRadius: 16,
                    padding: '8px 14px',
                    maxWidth: '80%',
                    fontSize: 15
                  }}>{msg.text}</span>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid #eee', padding: 8, background: '#fafbfc' }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Nhập câu hỏi về TOEIC..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, padding: 8, borderRadius: 8, background: '#f2f4f8' }}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{ marginLeft: 8, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '0 18px', fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', height: 38 }}
            >Gửi</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot; 