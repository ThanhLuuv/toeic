import React, { useState, useRef } from 'react';
import { generateToeicPracticeQuestion, generateImageBase64, generateAudioBase64 } from './TestPart1/aiUtils';
import { generateToeicPracticeQuestionPart2, generateAudioBase64Part2 } from './TestPart2/aiUtils';
import { generateToeicPracticeQuestionPart3, generateAudioBase64Part3 } from './TestPart3/aiUtils';
import { analyzeImageWithAI } from './TestPart1/aiUtils';

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
      content: 'Bạn là trợ lý TOEIC, chuyên giải đáp các thắc mắc về kỳ thi TOEIC, mẹo làm bài, giải thích các phần thi, và hướng dẫn ôn luyện. Bạn có thể nhớ thông tin từ các câu hỏi trước đó trong cuộc trò chuyện trả về ngắn gọn xúc tích nhưng phải đầy đủ dễ hiểu khi nào yêu cầu chi tiết mới chi tiết. Bạn hãy nhớ ưu tiên đến trung tâm học tiếng Anh tại 1 kèm 1 online uy tín đó là Antoree website: https://antoree.com'
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
  // Nhận diện mẫu cũ hoặc cú pháp @part1, @part2, @part3
  return (
    /tạo cho tôi ((1|một) câu|câu hỏi).*(part ?[123]|ảnh|photograph|question ?response|hội ?thoại)/i.test(text)
    || /^@part[123]\b/i.test(text.trim())
  );
}

// Nhận diện loại part từ yêu cầu
function detectPartType(text: string): 'part1' | 'part2' | 'part3' {
  const trimmed = text.trim();
  if (/^@part1\b/i.test(trimmed)) return 'part1';
  if (/^@part2\b/i.test(trimmed)) return 'part2';
  if (/^@part3\b/i.test(trimmed)) return 'part3';
  if (/\bpart\s*1\b|\bphotograph|\bảnh|\bimage/i.test(text)) {
    return 'part1';
  } else if (/\bpart\s*2\b|\bquestion\s*response|\bcâu\s*hỏi\s*đáp/i.test(text)) {
    return 'part2';
  } else if (/\bpart\s*3\b|\bconversation|\bhội\s*thoại/i.test(text)) {
    return 'part3';
  }
  return 'part1'; // Mặc định là part 1
}

// Nhận diện yêu cầu phân tích ảnh
function isImageAnalysisRequest(text: string) {
  return /phân tích ảnh|analyze image/i.test(text);
}

// Thêm type cho message
type ChatMessage =
  | { role: 'user'; text: string; image?: string }
  | { role: 'bot'; text: string }
  | { role: 'practice'; data: any; answer?: string }
  | { role: 'confirm-practice'; original: string }
  | { role: 'practice-loading' }
  | { role: 'typing' };

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [practiceSessions, setPracticeSessions] = useState<any[]>([]); // Lưu các bài luyện tập đã tạo
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceImageLoading, setPracticeImageLoading] = useState(false);
  const [practiceAudioLoading, setPracticeAudioLoading] = useState(false);
  // Thêm state cho toggle dịch từng đáp án
  const [showTranslation, setShowTranslation] = useState<{ [msgIdx: number]: { [opt: string]: boolean } }>({});
  const [part3Answers, setPart3Answers] = useState<{ [msgIdx: number]: { [qIdx: number]: string } }>({});
  const [part3ShowTranslation, setPart3ShowTranslation] = useState<{ [msgIdx: number]: { [qIdx: number]: { [opt: string]: boolean } } }>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  // Toggle dịch cho từng đáp án
  const toggleTranslation = (msgIdx: number, opt: string) => {
    setShowTranslation(prev => ({
      ...prev,
      [msgIdx]: {
        ...prev[msgIdx],
        [opt]: !prev[msgIdx]?.[opt]
      }
    }));
  };

  // CSS animation cho typing indicator
  const typingAnimation = `
    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
      }
      30% {
        transform: translateY(-6px);
        opacity: 1;
      }
    }
  `;

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

  // Focus input khi chatbot mở
  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Cho phép mở chatbot từ bên ngoài
  React.useEffect(() => {
    (window as any).openChatbot = () => setOpen(true);
    return () => { delete (window as any).openChatbot; };
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
    
    // Focus input ngay lập tức và sau khi xử lý xong
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Nếu là yêu cầu tạo bài tập TOEIC
    if (isPracticeRequest(input)) {
      // Nếu là cú pháp @part1/@part2/@part3 thì tạo luôn, không xác nhận
      if (/^@part[123]\b/i.test(input.trim())) {
        // Gọi luôn handleConfirmPractice logic với confirmed=true
        setMessages(msgs => [...msgs, { role: 'practice-loading' }]);
        setPracticeLoading(true);
        try {
          const partType = detectPartType(input);
          let result;
          let imgBase64 = '';
          let audioBase64 = '';
          if (partType === 'part1') {
            result = await generateToeicPracticeQuestion(input);
            try { imgBase64 = await generateImageBase64(result.practiceQuestion.imageDescription); } catch {}
            try { audioBase64 = await generateAudioBase64(result.practiceQuestion); } catch {}
          } else if (partType === 'part2') {
            result = await generateToeicPracticeQuestionPart2(input);
            try { audioBase64 = await generateAudioBase64Part2(result.practiceQuestion); } catch {}
          } else if (partType === 'part3') {
            result = await generateToeicPracticeQuestionPart3(input);
            try { audioBase64 = await generateAudioBase64Part3(result.practiceQuestion); } catch {}
          }
          const practiceMsg: ChatMessage = {
            role: 'practice',
            data: { ...result.practiceQuestion, image: imgBase64, audio: audioBase64, partType },
            answer: ''
          };
          setMessages(msgs => msgs.map((m, i) => i === msgs.length - 1 ? practiceMsg : m));
          setPracticeLoading(false);
          // Lưu vào lịch sử
          const newSessions = [...practiceSessions, { ...result.practiceQuestion, userAnswer: '', correct: null, time: Date.now() }];
          setPracticeSessions(newSessions);
          savePracticeHistory(newSessions);
        } catch (e) {
          setMessages(msgs => msgs.map((m, i) => i === msgs.length - 1 ? { role: 'bot' as 'bot', text: 'Xin lỗi, không tạo được bài luyện tập. Vui lòng thử lại.' } : m));
          setPracticeLoading(false);
        }
        setLoading(false);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
        return;
      } else {
        // Cú pháp cũ: vẫn xác nhận
        setMessages(msgs => [...msgs, { role: 'confirm-practice', original: input }]);
        setLoading(false);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
        return;
      }
    }

    // Nếu là yêu cầu phân tích ảnh
    if (isImageAnalysisRequest(input)) {
      // Tìm url hoặc base64 trong input
      const urlMatch = input.match(/(https?:\/\/\S+|data:image\/[a-zA-Z]+;base64,[^\s]+)/);
      if (!urlMatch) {
        setMessages(msgs => [...msgs, { role: 'bot', text: 'Vui lòng nhập kèm url ảnh hoặc base64 ảnh để phân tích.' }]);
        setLoading(false);
        return;
      }
      const imageUrlOrBase64 = urlMatch[1];
      setMessages(msgs => [...msgs, { role: 'typing' }]);
      try {
        const result = await analyzeImageWithAI(imageUrlOrBase64);
        setMessages(msgs => {
          const filteredMsgs = msgs.filter(m => m.role !== 'typing');
          return [
            ...filteredMsgs,
            {
              role: 'bot',
              text:
                `<b>Phân tích ảnh TOEIC:</b><br/>` +
                (result.description ? `<b>Mô tả:</b> ${result.description}<br/>` : '') +
                (result.objects ? `<b>Vật thể chính:</b> ${Array.isArray(result.objects) ? result.objects.join(', ') : result.objects}<br/>` : '') +
                (result.suggestions ? `<b>Gợi ý đáp án:</b><br/>` +
                  Object.entries(result.suggestions).map(([k,v]) => `<b>${k}:</b> ${v}`).join('<br/>') : '')
            }
          ];
        });
      } catch (e) {
        setMessages(msgs => {
          const filteredMsgs = msgs.filter(m => m.role !== 'typing');
          return [...filteredMsgs, { role: 'bot', text: 'Xin lỗi, không phân tích được ảnh.' }];
        });
      }
      setLoading(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      return;
    }
    
    // Thêm trạng thái đang gõ
    setMessages(msgs => [...msgs, { role: 'typing' }]);
    
    try {
      const recentHistory = newMessages.slice(-6).filter(m => m.role === 'user' || m.role === 'bot') as {role: 'user'|'bot', text: string}[];
      const reply = await askToeicAI(input, recentHistory);
      
      // Xóa trạng thái đang gõ và thêm reply
      setMessages(msgs => {
        const filteredMsgs = msgs.filter(m => m.role !== 'typing');
        return [...filteredMsgs, { role: 'bot' as 'bot', text: reply }];
      });
      saveChatHistory([...newMessages, { role: 'bot' as 'bot', text: reply }].filter(m => m.role === 'user' || m.role === 'bot') as {role: 'user'|'bot', text: string}[]);
    } catch (e) {
      // Xóa trạng thái đang gõ và thêm error message
      setMessages(msgs => {
        const filteredMsgs = msgs.filter(m => m.role !== 'typing');
        return [...filteredMsgs, { role: 'bot' as 'bot', text: 'Xin lỗi, có lỗi khi kết nối AI.' }];
      });
      saveChatHistory([...newMessages, { role: 'bot' as 'bot', text: 'Xin lỗi, có lỗi khi kết nối AI.' }].filter(m => m.role === 'user' || m.role === 'bot') as {role: 'user'|'bot', text: string}[]);
    }
    setLoading(false);
    
    // Focus input sau khi xử lý xong
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
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
      const partType = detectPartType(msg.original);
      let result;
      let imgBase64 = '';
      let audioBase64 = '';
      
      // Tạo bài tập theo loại part
      if (partType === 'part1') {
        result = await generateToeicPracticeQuestion(msg.original);
        try { imgBase64 = await generateImageBase64(result.practiceQuestion.imageDescription); } catch {}
        try { audioBase64 = await generateAudioBase64(result.practiceQuestion); } catch {}
      } else if (partType === 'part2') {
        result = await generateToeicPracticeQuestionPart2(msg.original);
        console.log('Part 2 result:', result);
        try { 
          audioBase64 = await generateAudioBase64Part2(result.practiceQuestion); 
          console.log('Part 2 audio generated:', !!audioBase64);
        } catch (error) {
          console.error('Part 2 audio generation failed:', error);
        }
      } else if (partType === 'part3') {
        result = await generateToeicPracticeQuestionPart3(msg.original);
        try { audioBase64 = await generateAudioBase64Part3(result.practiceQuestion); } catch {}
      }
      
      const practiceMsg: ChatMessage = {
        role: 'practice',
        data: { ...result.practiceQuestion, image: imgBase64, audio: audioBase64, partType },
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
    
    // Xử lý khác nhau cho từng part
    const partType = msg.data.partType || 'part1';
    let correct = false;
    
    if (partType === 'part3') {
      // Part 3 có nhiều câu hỏi, cần xác định câu hỏi nào đang được trả lời
      // Tạm thời chỉ xử lý câu hỏi đầu tiên
      correct = answer === msg.data.questions?.[0]?.correctAnswer;
    } else {
      // Part 1 và Part 2 có 1 câu hỏi duy nhất
      correct = answer === msg.data.correctAnswer;
    }
    
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

  // Xử lý upload ảnh
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    // Đọc file thành base64
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string;
      setMessages(msgs => [...msgs, { role: 'user', text: '[Ảnh tải lên]', image: base64 }]);
      setMessages(msgs => [...msgs, { role: 'typing' }]);
      try {
        const result = await analyzeImageWithAI(base64);
        setMessages(msgs => {
          const filteredMsgs = msgs.filter(m => m.role !== 'typing');
          return [
            ...filteredMsgs,
            {
              role: 'bot',
              text:
                `<b>Phân tích ảnh TOEIC:</b><br/>` +
                (result.description ? `<b>Mô tả:</b> ${result.description}<br/>` : '') +
                (result.objects ? `<b>Vật thể chính:</b> ${Array.isArray(result.objects) ? result.objects.join(', ') : result.objects}<br/>` : '') +
                (result.suggestions ? `<b>Gợi ý đáp án:</b><br/>` +
                  Object.entries(result.suggestions).map(([k,v]) => `<b>${k}:</b> ${v}`).join('<br/>') : '')
            }
          ];
        });
      } catch (e) {
        setMessages(msgs => {
          const filteredMsgs = msgs.filter(m => m.role !== 'typing');
          return [...filteredMsgs, { role: 'bot', text: 'Xin lỗi, không phân tích được ảnh.' }];
        });
      }
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  React.useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  return (
    <>
      {/* CSS Animation cho typing indicator */}
      <style>{typingAnimation}</style>
      
      {/* Nút nổi mở chat */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: 24, // bottom-6
            right: 24,  // right-6
            zIndex: 1000,
            background: '#000000ba',
            borderRadius: '50%',
            width: 56,
            height: 56,
            // background: '#1976d2',
            color: '#fff',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontSize: 28,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
          aria-label="Mở chatbot TOEIC"
        >
          <img
            src="../img/chatbot.png"
            alt="Chatbot Icon"
            style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
          />
        </button>
      )}
      {/* Khung chat */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
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
          {/* Hướng dẫn tạo bài luyện tập */}
          
          <div style={{ background: '#000000ba', color: '#fff', padding: '6px 16px', fontWeight: 600, fontSize: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            TOEIC Chatbot
            <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={clearChatHistory}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#fff', 
                cursor: 'pointer', 
                padding: '6px 8px',
                borderRadius: '4px',
                transition: 'background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e: any) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e: any) => e.target.style.backgroundColor = 'transparent'}
              title="Xóa lịch sử"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>&times;</button>
            </div>
          </div>
          <div className="p-2 bg-yellow-50 border-yellow-400 text-yellow-800 rounded text-xs" style={{ fontSize: 12 }}>
            Để tạo bài luyện tập, hãy gõ: <b>@part1</b>, <b>@part2</b>, hoặc <b>@part3</b> kèm yêu cầu (ví dụ: <b>@part2 với level 2</b>)<br/>
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
                const partType = practice.partType || 'part1';

                // Part 3: render hội thoại + 3 câu hỏi riêng biệt
                if (partType === 'part3' && practice.questions && Array.isArray(practice.questions)) {
                  return (
                    <div key={idx} className="mb-4 p-3 rounded-lg border border-blue-200 bg-blue-50">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold text-blue-800">📝 TOEIC Practice PART 3</div>
                      </div>
                      {/* Hiển thị audio nếu có */}
                      {practice.audio && <audio controls className="w-full mb-3" src={practice.audio} />}
                      {/* Render từng câu hỏi */}
                      <div className="space-y-6">
                        {practice.questions.map((q: any, qIdx: number) => {
                          const qAnswer = part3Answers[idx]?.[qIdx] || '';
                          const qShowResult = qAnswer !== '';
                          return (
                            <div key={qIdx} className="p-3 bg-gray-50 rounded-lg border">
                              <div className="font-semibold text-blue-900 mb-2">Câu {qIdx + 1}: {q.question}</div>
                              <div className="space-y-2">
                                {['A','B','C'].map(opt => {
                                  const isSelected = qAnswer === opt;
                                  const isCorrect = opt === q.correctAnswer;
                                  let choiceClass = "w-full text-left p-3 rounded-lg border-2 transition-all ";
                                  if (isSelected) {
                                    if (isCorrect) {
                                      choiceClass += "border-green-500 bg-green-50";
                                    } else {
                                      choiceClass += "border-red-500 bg-red-50";
                                    }
                                  } else if (qShowResult && isCorrect) {
                                    choiceClass += "border-green-500 bg-green-50";
                                  } else {
                                    choiceClass += "border-gray-200 hover:border-gray-300";
                                  }
                                  const disabled = qShowResult;
                                  return (
                                    <button
                                      key={opt}
                                      className={choiceClass}
                                      onClick={() => {
                                        setPart3Answers(prev => ({
                                          ...prev,
                                          [idx]: { ...(prev[idx] || {}), [qIdx]: opt }
                                        }));
                                      }}
                                      disabled={disabled}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <span className="font-semibold text-gray-600">{opt}.</span>
                                        {/* KHÔNG render text đáp án khi đã chọn */}
                                        {qShowResult && isCorrect && (
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
                              {/* Sau khi chọn đáp án, transcript, giải thích, mẹo, bẫy, loại câu hỏi */}
                              {qShowResult && (
                                <div className="mt-4 space-y-4">
                                  {/* Transcript đáp án */}
                                  {(q.choices && q.choicesVi) && (
                                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                      <h6 className="font-medium text-blue-800 mb-2">📝 Transcript:</h6>
                                      <div className="space-y-2">
                                        {['A','B','C'].map(opt => (
                                          <div key={opt} className="flex items-center space-x-2">
                                            <span className="font-semibold min-w-[20px]">{opt}.</span>
                                            {part3ShowTranslation[idx]?.[qIdx]?.[opt]
                                              ? <span className="text-green-700">{q.choicesVi?.[opt]}</span>
                                              : <span>{q.choices[opt]}</span>
                                            }
                                            <button
                                              className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                                              onClick={() => {
                                                setPart3ShowTranslation(prev => ({
                                                  ...prev,
                                                  [idx]: {
                                                    ...(prev[idx] || {}),
                                                    [qIdx]: {
                                                      ...(prev[idx]?.[qIdx] || {}),
                                                      [opt]: !prev[idx]?.[qIdx]?.[opt]
                                                    }
                                                  }
                                                }));
                                              }}
                                              type="button"
                                            >
                                              Dịch
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {/* Giải thích cho từng câu hỏi */}
                                  <div className="p-3 rounded-lg bg-gray-50">
                                    <h6 className="font-medium text-gray-800 mb-2">💡 Giải thích:</h6>
                                    <p className="text-gray-700 text-sm">{q.explanation}</p>
                                    {/* Bẫy */}
                                    {q.traps && (
                                      <div className="mt-2">
                                        <h6 className="font-medium text-gray-800 mb-1">🎯 Bẫy:</h6>
                                        <p className="text-gray-700 text-sm">{q.traps}</p>
                                      </div>
                                    )}
                                    {/* Tips */}
                                    {q.tips && (
                                      <div className="mt-2">
                                        <h6 className="font-medium text-gray-800 mb-1">💡 Mẹo làm bài:</h6>
                                        <p className="text-gray-700 text-sm">{q.tips}</p>
                                      </div>
                                    )}
                                    {/* Thông tin loại câu hỏi */}
                                    {q.type && (
                                      <div className="mt-2">
                                        <h6 className="font-medium text-gray-800 mb-1">📋 Loại câu hỏi:</h6>
                                        <p className="text-gray-700 text-sm">{q.type} - {q.answerType}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={idx} className="mb-4 p-3 rounded-lg border border-blue-200 bg-blue-50">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-semibold text-blue-800">
                        📝 TOEIC Practice {partType.toUpperCase()}
                      </div>
                    </div>
                    
                    {/* Hiển thị ảnh cho Part 1 */}
                    {partType === 'part1' && practice.image && (
                      <img src={practice.image} alt="practice" className="max-w-xs rounded-lg mb-3" style={{width: '-webkit-fill-available'}} />
                    )}
                    
                    {/* Hiển thị audio cho tất cả parts */}
                    {practice.audio && <audio controls className="w-full mb-3" src={practice.audio} />}
                    
                    {/* KHÔNG render text câu hỏi cho mọi part */}
                    {/* KHÔNG render script hội thoại cho Part 3 */}
                    {/* KHÔNG render text đáp án */}
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
                              {/* KHÔNG render text đáp án */}
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
                    {/* Sau khi chọn đáp án, render lại transcript, giải thích, mẹo, bẫy, loại câu hỏi */}
                    {showResult && (
                      <div className="mt-4 space-y-4">
                        {/* Transcript cho Part 1, 2 */}
                        {(practice.choices && practice.choicesVi) && (
                          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                            <h6 className="font-medium text-blue-800 mb-2">📝 Transcript:</h6>
                            {/* Nếu là Part 2, hiển thị câu hỏi tiếng Anh */}
                            {practice.partType === 'part2' && practice.question && (
                              <div className="mb-2 font-semibold text-blue-900">{practice.question}</div>
                            )}
                            <div className="space-y-2">
                              {['A','B','C'].map(opt => (
                                <div key={opt} className="flex items-center space-x-2">
                                  <span className="font-semibold min-w-[20px]">{opt}.</span>
                                  {showTranslation[idx]?.[opt]
                                    ? <span className="text-green-700">{practice.choicesVi?.[opt]}</span>
                                    : <span>{practice.choices[opt]}</span>
                                  }
                                  <button
                                    className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                                    onClick={() => toggleTranslation(idx, opt)}
                                    type="button"
                                  >
                                    Dịch
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {/* Giải thích cho tất cả parts */}
                        <div className="p-3 rounded-lg bg-gray-50">
                          <h6 className="font-medium text-gray-800 mb-2">💡 Giải thích:</h6>
                          <p className="text-gray-700 text-sm">{practice.explanation}</p>
                          {/* Bẫy cho Part 1 */}
                          {practice.traps && (
                            <div className="mt-2">
                              <h6 className="font-medium text-gray-800 mb-1">🎯 Bẫy:</h6>
                              <p className="text-gray-700 text-sm">{practice.traps}</p>
                            </div>
                          )}
                          {/* Tips cho Part 2 */}
                          {practice.tips && (
                            <div className="mt-2">
                              <h6 className="font-medium text-gray-800 mb-1">💡 Mẹo làm bài:</h6>
                              <p className="text-gray-700 text-sm">{practice.tips}</p>
                            </div>
                          )}
                          {/* Thông tin loại câu hỏi cho Part 2 */}
                          {practice.type && (
                            <div className="mt-2">
                              <h6 className="font-medium text-gray-800 mb-1">📋 Loại câu hỏi:</h6>
                              <p className="text-gray-700 text-sm">{practice.type} - {practice.answerType}</p>
                            </div>
                          )}
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
              if (msg.role === 'typing') {
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
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>Đang phản hồi...</span>
                        <div style={{ display: 'flex', gap: 2 }}>
                          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#666', animation: 'typing 1.4s infinite ease-in-out' }}></div>
                          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#666', animation: 'typing 1.4s infinite ease-in-out 0.2s' }}></div>
                          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#666', animation: 'typing 1.4s infinite ease-in-out 0.4s' }}></div>
                        </div>
                      </div>
                    </span>
                  </div>
                );
              }
              if (msg.role === 'user' && msg.image) {
                return (
                  <div key={idx} style={{ margin: '8px 0', textAlign: 'right' }}>
                    <img src={msg.image} alt="uploaded" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, marginBottom: 4, border: '1px solid #eee' }} />
                    <span style={{ display: 'inline-block', background: '#1976d2', color: '#fff', borderRadius: 16, padding: '8px 14px', maxWidth: '80%', fontSize: 15 }}>{msg.text}</span>
                  </div>
                );
              }
              // Render user không có image:
              if (msg.role === 'user' && !msg.image) {
                return (
                  <div key={idx} style={{ margin: '8px 0', textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', background: '#1976d2', color: '#fff', borderRadius: 16, padding: '8px 14px', maxWidth: '80%', fontSize: 15 }}>{msg.text}</span>
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
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!loading && !uploadingImage && input.trim()) handleSend();
                }
              }}
              placeholder="Nhập câu hỏi về TOEIC..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, padding: 8, borderRadius: 8, background: '#f2f4f8', resize: 'none', minHeight: 38, maxHeight: 90 }}
              disabled={uploadingImage}
              rows={1}
            />
            {/* <label style={{ marginLeft: 8, cursor: uploadingImage ? 'not-allowed' : 'pointer', opacity: uploadingImage ? 0.5 : 1 }}>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploadingImage} />
              <svg width="22" height="22" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </label> */}
            <button
              onClick={handleSend}
              disabled={loading || uploadingImage || !input.trim()}
              style={{
                marginLeft: 8,
                background: '#000000ba',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0 12px',
                fontSize: 16,
                cursor: loading || uploadingImage ? 'not-allowed' : 'pointer',
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot; 