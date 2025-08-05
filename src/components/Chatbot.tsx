import React, { useState, useRef } from 'react';
import { generateToeicPracticeQuestion, generateImageBase64, generateAudioBase64, analyzeImageAndCreatePractice } from './TestPart1/aiUtils';
import { generateToeicPracticeQuestionPart2, generateAudioBase64Part2 } from './TestPart2/aiUtils';
import { generateToeicPracticeQuestionPart3, generateAudioBase64Part3 } from './TestPart3/aiUtils';
import { generateToeicPracticeQuestionPart4, generateAudioBase64Part4 } from './TestPart4/aiUtils';
import { generateToeicPracticeQuestionPart5 } from './TestPart5/aiUtils';
import { generateToeicPracticeQuestionPart6 } from './TestPart6/aiUtils';
import { generateToeicPracticeQuestionPart7, generateAudioBase64Part7 } from './TestPart7/aiUtils';
import { imagePracticeService, ImagePractice } from '../services/imagePracticeService';
import { practiceService } from '../services/practiceService';

// Hàm gọi OpenAI API đơn giản cho hỏi đáp TOEIC
async function askToeicAI(question: string, chatHistory: {role: 'user'|'bot', text: string}[] = []): Promise<string> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  
  if (!apiKey) {
    throw new Error('API key không được cấu hình. Vui lòng thêm REACT_APP_API_KEY_OPENAI vào file .env');
  }
  
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
  // Tự động chuyển URL thành link (không lấy dấu ) hoặc dấu câu phía sau, giữ dấu chấm trong domain)
          html = html.replace(/(https?:\/\/[^\s<)\]\[\">,;:!\?]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#14B24C;text-decoration:underline;">$1</a>');
  // Xuống dòng đơn giản (chỉ khi không phải trong <li> hoặc heading)
  html = html.replace(/([^>])\n([^<])/g, '$1<br/>$2');
  return html;
}

// Nhận diện yêu cầu tạo bài tập TOEIC (câu hỏi luyện tập)
function isPracticeRequest(text: string) {
  // Nhận diện mẫu cũ hoặc cú pháp @part1, @part2, @part3, @part4, @part5, @part6, @part7
  return (
    /tạo cho tôi ((1|một) câu|câu hỏi).*(part ?[1234567]|ảnh|photograph|question ?response|hội ?thoại|short ?talks|incomplete ?sentences|text ?completion|reading ?comprehension)/i.test(text)
    || /^@part[1234567]\b/i.test(text.trim())
  );
}

// Nhận diện loại part từ yêu cầu
function detectPartType(text: string): 'part1' | 'part2' | 'part3' | 'part4' | 'part5' | 'part6' | 'part7' {
  const trimmed = text.trim();
  if (/^@part1\b/i.test(trimmed)) return 'part1';
  if (/^@part2\b/i.test(trimmed)) return 'part2';
  if (/^@part3\b/i.test(trimmed)) return 'part3';
  if (/^@part4\b/i.test(trimmed)) return 'part4';
  if (/^@part5\b/i.test(trimmed)) return 'part5';
  if (/^@part6\b/i.test(trimmed)) return 'part6';
  if (/^@part7\b/i.test(trimmed)) return 'part7';
  if (/\bpart\s*1\b|\bphotograph|\bảnh|\bimage/i.test(text)) {
    return 'part1';
  } else if (/\bpart\s*2\b|\bquestion\s*response|\bcâu\s*hỏi\s*đáp/i.test(text)) {
    return 'part2';
  } else if (/\bpart\s*3\b|\bconversation|\bhội\s*thoại/i.test(text)) {
    return 'part3';
  } else if (/\bpart\s*4\b|\bshort\s*talks|\bbài\s*nói\s*ngắn/i.test(text)) {
    return 'part4';
  } else if (/\bpart\s*5\b|\bincomplete\s*sentences|\bcâu\s*chưa\s*hoàn\s*chỉnh/i.test(text)) {
    return 'part5';
  } else if (/\bpart\s*6\b|\btext\s*completion|\bđiền\s*từ\s*vào\s*đoạn/i.test(text)) {
    return 'part6';
  } else if (/\bpart\s*7\b|\breading\s*comprehension|\bđọc\s*hiểu/i.test(text)) {
    return 'part7';
  }
  return 'part1'; // Mặc định là part 1
}



// Thêm type cho message
type ChatMessage =
  | { role: 'user'; text: string; image?: string }
  | { role: 'bot'; text: string }
  | { role: 'practice'; data: any; answer?: string }
  | { role: 'confirm-practice'; original: string }
  | { role: 'practice-loading' }
  | { role: 'typing' }
  | { role: 'image-practice'; data: any; answer?: string; saved?: boolean }
  | { role: 'image-analysis-loading' };

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [practiceSessions, setPracticeSessions] = useState<any[]>([]); // Lưu các bài luyện tập đã tạo
  const [practiceLoading, setPracticeLoading] = useState(false);
  // Thêm state cho toggle dịch từng đáp án
  const [showTranslation, setShowTranslation] = useState<{ [msgIdx: number]: { [opt: string]: boolean } }>({});
  const [part3Answers, setPart3Answers] = useState<{ [msgIdx: number]: { [qIdx: number]: string } }>({});
  const [part3ShowTranslation, setPart3ShowTranslation] = useState<{ [msgIdx: number]: { [qIdx: number]: { [opt: string]: boolean } } }>({});
  const [part6Answers, setPart6Answers] = useState<{ [msgIdx: number]: { [qIdx: number]: string } }>({});
  const [part6ShowTranslation, setPart6ShowTranslation] = useState<{ [msgIdx: number]: { [qIdx: number]: { [opt: string]: boolean } } }>({});
  const [part7Answers, setPart7Answers] = useState<{ [msgIdx: number]: { [qIdx: number]: string } }>({});
  const [part7ShowTranslation, setPart7ShowTranslation] = useState<{ [msgIdx: number]: { [qIdx: number]: { [opt: string]: boolean } } }>({});
  const [showGuide, setShowGuide] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

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
    
    // Kiểm tra nếu có ảnh được upload thì thực hiện phân tích ảnh
    if (selectedImage) {
      const userMsg: ChatMessage = { role: 'user', text: input, image: selectedImage };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput('');
      setLoading(true);
      
      // Thêm message loading
      setMessages(msgs => [...msgs, { role: 'image-analysis-loading' }]);
      
      try {
        console.log('=== STARTING IMAGE ANALYSIS ===');
        console.log('User request:', input);
        
        // Upload ảnh lên Cloudinary trước
        const timestamp = Date.now();
        const fileName = `chatbot_img_${timestamp}`;
        console.log('Uploading image to Cloudinary:', fileName);
        
        const cloudinaryUrl = await practiceService.uploadToCloudinary(selectedImage, fileName, 'image');
        console.log('Cloudinary upload successful, URL:', cloudinaryUrl);
        
        // Gọi AI để phân tích ảnh với Cloudinary URL
        console.log('Calling AI with Cloudinary URL...');
        const result = await analyzeImageAndCreatePractice(cloudinaryUrl, input);
        
        // Thay thế message loading bằng kết quả
        const practiceMsg: ChatMessage = {
          role: 'image-practice',
          data: { ...result.practiceQuestion, userQuestion: input },
          answer: '',
          saved: false
        };
        
        setMessages(msgs => msgs.map((m, i) => 
          i === msgs.length - 1 ? practiceMsg : m
        ));
        
        // Xóa ảnh đã upload
        setSelectedImage('');
        setImageFile(null);
        
      } catch (error) {
        console.error('=== ERROR IN IMAGE ANALYSIS ===');
        console.error('Error analyzing image:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        let errorMessage = error instanceof Error ? error.message : String(error);
        
        // Cung cấp thông báo lỗi cụ thể hơn
        if (errorMessage.includes('API key không được cấu hình')) {
          errorMessage = '❌ API key chưa được cấu hình. Vui lòng kiểm tra file .env và restart ứng dụng.';
        } else if (errorMessage.includes('Rate limit exceeded')) {
          errorMessage = '⚠️ Đã vượt quá giới hạn API. Vui lòng thử lại sau vài phút hoặc nâng cấp tài khoản OpenAI.';
        } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
          errorMessage = '❌ API key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại API key.';
        } else if (errorMessage.includes('403') || errorMessage.includes('credit')) {
          errorMessage = '❌ Tài khoản không có quyền truy cập hoặc đã hết credit. Vui lòng kiểm tra tài khoản OpenAI.';
        } else if (errorMessage.includes('OpenAI API error')) {
          errorMessage = '❌ Lỗi kết nối với OpenAI API. Vui lòng thử lại sau.';
        } else if (errorMessage.includes('Cloudinary')) {
          errorMessage = '❌ Lỗi upload ảnh lên Cloudinary. Vui lòng thử lại sau.';
        }
        
        setMessages(msgs => msgs.map((m, i) => 
          i === msgs.length - 1 ? { 
            role: 'bot', 
            text: errorMessage 
          } : m
        ));
      }
      
      setLoading(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
      return;
    }
    
    // Xử lý tin nhắn thường (không có ảnh)
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
              // Nếu là cú pháp @part1/@part2/@part3/@part4/@part5/@part6/@part7 thì tạo luôn, không xác nhận
              if (/^@part[1234567]\b/i.test(input.trim())) {
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
          } else if (partType === 'part4') {
            result = await generateToeicPracticeQuestionPart4(input);
            try { audioBase64 = await generateAudioBase64Part4(result.practiceQuestion); } catch {}
          } else if (partType === 'part5') {
            result = await generateToeicPracticeQuestionPart5(input);
          } else if (partType === 'part6') {
            result = await generateToeicPracticeQuestionPart6(input);
          } else if (partType === 'part7') {
            result = await generateToeicPracticeQuestionPart7(input);
            try { audioBase64 = await generateAudioBase64Part7(result.practiceQuestion); } catch {}
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
          console.error('Error generating practice question:', e);
          setMessages(msgs => msgs.map((m, i) => i === msgs.length - 1 ? { role: 'bot' as 'bot', text: `Xin lỗi, không tạo được bài luyện tập. Lỗi: ${e instanceof Error ? e.message : 'Unknown error'}. Vui lòng thử lại.` } : m));
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
        try { 
          audioBase64 = await generateAudioBase64Part2(result.practiceQuestion); 
        } catch (error) {
          console.error('Part 2 audio generation failed:', error);
        }
      } else if (partType === 'part3') {
        result = await generateToeicPracticeQuestionPart3(msg.original);
        try { audioBase64 = await generateAudioBase64Part3(result.practiceQuestion); } catch {}
      } else if (partType === 'part4') {
        result = await generateToeicPracticeQuestionPart4(msg.original);
        try { audioBase64 = await generateAudioBase64Part4(result.practiceQuestion); } catch {}
      } else if (partType === 'part5') {
        result = await generateToeicPracticeQuestionPart5(msg.original);
      } else if (partType === 'part6') {
        result = await generateToeicPracticeQuestionPart6(msg.original);
      } else if (partType === 'part7') {
        result = await generateToeicPracticeQuestionPart7(msg.original);
        try { audioBase64 = await generateAudioBase64Part7(result.practiceQuestion); } catch {}
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
      console.error('Error generating practice question:', e);
      setMessages(msgs => msgs.map((m, i) => i === msgIdx ? { role: 'bot' as 'bot', text: `Xin lỗi, không tạo được bài luyện tập. Lỗi: ${e instanceof Error ? e.message : 'Unknown error'}. Vui lòng thử lại.` } : m));
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
    } else if (partType === 'part6') {
      // Part 6 có nhiều câu hỏi, cần xác định câu hỏi nào đang được trả lời
      // Tạm thời chỉ xử lý câu hỏi đầu tiên
      correct = answer === msg.data.questions?.[0]?.correctAnswer;
    } else if (partType === 'part7') {
      // Part 7 có nhiều câu hỏi, cần xác định câu hỏi nào đang được trả lời
      // Tạm thời chỉ xử lý câu hỏi đầu tiên
      correct = answer === msg.data.questions?.[0]?.correctAnswer;
    } else {
      // Part 1, 2, 4, 5 có 1 câu hỏi duy nhất
      correct = answer === msg.data.audioQuestion?.correctAnswer || answer === msg.data.correctAnswer;
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

  // Xử lý chọn đáp án cho bài tập từ ảnh
  const handleImagePracticeAnswer = (msgIdx: number, answer: string) => {
    const msg = messages[msgIdx];
    if (msg.role !== 'image-practice') return;
    
    const correct = answer === msg.data.correctAnswer;
    
    // Cập nhật message answer
    const newMessages = messages.map((m, i) =>
      i === msgIdx ? { ...m, answer } : m
    );
    setMessages(newMessages);
  };

  // Xử lý lưu bài tập từ ảnh vào Firebase
  const handleSaveImagePractice = async (msgIdx: number) => {
    const msg = messages[msgIdx];
    if (msg.role !== 'image-practice') return;
    
    try {
      const practiceData: Omit<ImagePractice, 'id'> = {
        imageUrl: msg.data.imageUrl,
        question: msg.data.question,
        choices: msg.data.choices,
        choicesVi: msg.data.choicesVi,
        correctAnswer: msg.data.correctAnswer,
        explanation: msg.data.explanation,
        type: msg.data.type,
        userQuestion: msg.data.userQuestion
      };
      
      await imagePracticeService.addImagePractice(practiceData);
      
      // Cập nhật trạng thái đã lưu
      const newMessages = messages.map((m, i) =>
        i === msgIdx ? { ...m, saved: true } : m
      );
      setMessages(newMessages);
      
      // Thêm thông báo thành công
      setMessages(msgs => [...msgs, { 
        role: 'bot', 
        text: '✅ Bài tập đã được lưu thành công vào kho tài liệu của bạn!' 
      }]);
      
    } catch (error) {
      console.error('Error saving image practice:', error);
      setMessages(msgs => [...msgs, { 
        role: 'bot', 
        text: '❌ Có lỗi khi lưu bài tập. Vui lòng thử lại.' 
      }]);
    }
  };

  // Xử lý tải ảnh và phân tích
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      setMessages(msgs => [...msgs, { 
        role: 'bot', 
        text: '❌ Vui lòng chọn file ảnh hợp lệ (JPG, PNG, GIF).' 
      }]);
      return;
    }
    
    // Kiểm tra kích thước file (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessages(msgs => [...msgs, { 
        role: 'bot', 
        text: '❌ File ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB.' 
      }]);
      return;
    }
    
    try {
      // Chuyển file thành base64 để hiển thị preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        setImageFile(file);
        setSelectedImage(base64);
        
        // Thêm message thông báo ảnh đã được upload
        setMessages(msgs => [...msgs, { 
          role: 'bot', 
          text: '📸 Ảnh đã được tải lên! Bạn có thể nhập yêu cầu phân tích ảnh vào ô chat bên dưới và nhấn gửi.' 
        }]);
      };
      
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error reading file:', error);
      setMessages(msgs => [...msgs, { 
        role: 'bot', 
        text: '❌ Có lỗi khi đọc file ảnh.' 
      }]);
    }
  };

  React.useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  return (
    <>
      {/* CSS Animation cho typing indicator */}
      <style>{`
        ${typingAnimation}
        
        @media (max-width: 768px) {
          .chatbot-expanded {
            width: calc(100vw - 24px) !important;
            height: calc(100vh - 24px) !important;
            max-width: none !important;
            bottom: 12px !important;
            right: 12px !important;
          }
          
          .chatbot-input-expanded {
            padding: 12px !important;
            gap: 8px !important;
          }
          
          .chatbot-textarea-expanded {
            font-size: 16px !important;
            padding: 10px 12px !important;
            min-height: 44px !important;
          }
          
          .chatbot-button-expanded {
            padding: 0 16px !important;
            font-size: 16px !important;
            height: 44px !important;
            min-width: 44px !important;
          }
        }
      `}</style>
      
      {/* Nút nổi mở chat */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: 24, // bottom-6
            right: 24,  // right-6
            zIndex: 3000,
            background: 'none',
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
            src="/img/chatbot.png"
            alt="Chatbot Icon"
            style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
          />
        </button>
      )}
      {/* Khung chat */}
      {open && (
        <div
          className={isExpanded ? 'chatbot-expanded' : ''}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: isExpanded ? 'calc(100vw - 48px)' : 340,
            height: isExpanded ? 'calc(100vh - 48px)' : 480,
            maxWidth: isExpanded ? 800 : 340,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            zIndex: 3001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'all 0.3s ease-in-out'
          }}
        >
          {/* Hướng dẫn tạo bài luyện tập */}
          
          <div style={{ background: 'linear-gradient(135deg, #14B24C 0%, #16a34a 100%)', color: '#fff', padding: '6px 16px', fontWeight: 600, fontSize: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            TOEIC Chatbot
            <div style={{ display: 'flex', gap: 8 }}>
            {!showGuide && (
              <button 
                onClick={() => setShowGuide(true)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#f59e0b', 
                  cursor: 'pointer', 
                  padding: '6px 8px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
                onMouseOver={(e: any) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e: any) => e.target.style.backgroundColor = 'transparent'}
                title="Hiện hướng dẫn"
              >
                ?
              </button>
            )}
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
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
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
              title={isExpanded ? "Thu nhỏ" : "Mở to"}
            >
              {isExpanded ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                  <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
                  <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
                </svg>
              )}
            </button>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>&times;</button>
            </div>
          </div>
          {showGuide && (
            <div style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              margin: '8px',
              fontSize: '13px',
              lineHeight: '1.4',
              color: '#92400e',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              position: 'relative'
            }}>
              <div>
                <span style={{ fontWeight: '600', color: '#78350f' }}>💡 Hướng dẫn:</span> 
                <br/>• Tạo bài luyện tập: Gõ <span style={{ fontWeight: '700', color: '#dc2626', backgroundColor: '#fef2f2', padding: '2px 4px', borderRadius: '4px' }}>@part1</span>, <span style={{ fontWeight: '700', color: '#dc2626', backgroundColor: '#fef2f2', padding: '2px 4px', borderRadius: '4px' }}>@part2</span>, <span style={{ fontWeight: '700', color: '#dc2626', backgroundColor: '#fef2f2', padding: '2px 4px', borderRadius: '4px' }}>@part3</span>, <span style={{ fontWeight: '700', color: '#dc2626', backgroundColor: '#fef2f2', padding: '2px 4px', borderRadius: '4px' }}>@part4</span>, <span style={{ fontWeight: '700', color: '#dc2626', backgroundColor: '#fef2f2', padding: '2px 4px', borderRadius: '4px' }}>@part5</span>, <span style={{ fontWeight: '700', color: '#dc2626', backgroundColor: '#fef2f2', padding: '2px 4px', borderRadius: '4px' }}>@part6</span>, hoặc <span style={{ fontWeight: '700', color: '#dc2626', backgroundColor: '#fef2f2', padding: '2px 4px', borderRadius: '4px' }}>@part7</span> kèm yêu cầu
                <br/>• <span style={{ fontWeight: '700', color: '#8b5cf6', backgroundColor: '#f3f4f6', padding: '2px 4px', borderRadius: '4px' }}>📸 Tải ảnh</span> để AI phân tích và tạo bài tập TOEIC Part 5
                <br/>
                <span style={{ fontSize: '11px', color: '#92400e', fontStyle: 'italic' }}>Ví dụ: @part2 với level 2, @part1 về công việc văn phòng, @part5 về ngữ pháp, @part7 về đọc hiểu</span>
              </div>
              <button 
                onClick={() => setShowGuide(false)}
                style={{ 
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: 'none', 
                  border: 'none', 
                  color: '#92400e', 
                  cursor: 'pointer', 
                  padding: '2px 4px',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  width: '20px',
                  height: '20px'
                }}
                onMouseOver={(e: any) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                onMouseOut={(e: any) => e.target.style.backgroundColor = 'transparent'}
                title="Đóng hướng dẫn"
              >
                ×
              </button>
            </div>
          )}
          <div style={{ 
            flex: 1, 
            padding: isExpanded ? '20px' : '12px', 
            overflowY: 'auto', 
            background: '#f7f7f7',
            maxWidth: isExpanded ? '800px' : 'none',
            margin: isExpanded ? '0 auto' : '0'
          }}>
            {/* Nếu đang tạo bài luyện tập */}
            {practiceLoading && (
                              <div className="flex items-center justify-center py-4 text-green-700 font-medium">Đang tạo bài luyện tập TOEIC...</div>
            )}
            {/* Chat history luôn hiển thị, render từng message */}
            {messages.length === 0 && (
              <div style={{ 
                color: '#64748b', 
                fontSize: 13, 
                textAlign: 'center', 
                marginTop: 32,
                lineHeight: 1.6,
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 400,
                letterSpacing: '0.2px'
              }}>
                <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                  "Part 1 là gì?", "Mẹo làm bài nghe?", "Cấu trúc đề part 1"...
                </span>
              </div>
            )}
            {messages.map((msg, idx) => {
              if (msg.role === 'practice') {
                const practice = msg.data;
                const answer = msg.answer || '';
                const showResult = answer !== '';
                const partType = practice.partType || 'part1';

                // Part 2: render câu hỏi đáp
                if (partType === 'part2') {
                  return (
                    <div key={idx} style={{
                      marginBottom: '16px',
                      padding: isExpanded ? '20px' : '12px',
                      borderRadius: '12px',
                      border: '1px solid #34d399',
                      background: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          color: '#065f46',
                          fontSize: isExpanded ? '18px' : '16px'
                        }}>📝 TOEIC Practice PART 2</div>
                      </div>
                      
                      {/* Hiển thị audio nếu có */}
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
                            <div key={opt} className="space-y-1">
                              <div className="relative">
                                <button
                                  className={choiceClass}
                                  onClick={() => handlePracticeAnswer(idx, opt)}
                                  disabled={disabled}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-gray-600">{opt}.</span>
                                    {/* Hiển thị text đáp án - chỉ hiển thị khi đã chọn đáp án */}
                                    <div className="flex-1 text-left">
                                      <div className="text-gray-800">
                                        {showResult ? (
                                          showTranslation[idx]?.[opt] && practice.choicesVi && practice.choicesVi[opt] 
                                            ? practice.choicesVi[opt] 
                                            : practice.choices?.[opt] || ''
                                        ) : (
                                          <span className="text-gray-500 italic">Click to select</span>
                                        )}
                                      </div>
                                    </div>
                                    {showResult && isCorrect && (
                                      <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                    {isSelected && !isCorrect && (
                                      <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    )}
                                  </div>
                                </button>
                                {/* Translate button positioned absolutely on top of answer button */}
                                {showResult && practice.choices && practice.choices[opt] && practice.choicesVi && practice.choicesVi[opt] && (
                                  <button
                                    className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition-colors z-10"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleTranslation(idx, opt);
                                    }}
                                    type="button"
                                  >
                                    {showTranslation[idx]?.[opt] ? 'Ẩn dịch' : 'Dịch'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Sau khi chọn đáp án, render lại giải thích, mẹo, bẫy, loại câu hỏi */}
                      {showResult && (
                        <div className="mt-4 space-y-4">
                          {/* Hiển thị câu hỏi nếu có */}
                          {practice.question && (
                            <div className="p-3 rounded-lg border border-green-200 mb-3">
                              <h6 className="font-medium text-green-800 mb-2">❓ Câu hỏi:</h6>
                              <div className="font-semibold text-green-900">{practice.question}</div>
                            </div>
                          )}
                          {/* Giải thích cho Part 2 */}
                          <div className="p-3 rounded-lg border border-gray-200">
                            <h6 className="font-medium text-gray-800 mb-2">💡 Giải thích:</h6>
                            <p className="text-gray-700 text-sm text-left">{practice.explanation}</p>
                            {/* Bẫy */}
                            {practice.traps && (
                              <div className="mt-2">
                                <h6 className="font-medium text-gray-800 mb-1">🎯 Bẫy:</h6>
                                <p className="text-gray-700 text-sm text-left">{practice.traps}</p>
                              </div>
                            )}
                            {/* Tips */}
                            {practice.tips && (
                              <div className="mt-2">
                                <h6 className="font-medium text-gray-800 mb-1">💡 Mẹo làm bài:</h6>
                                <p className="text-gray-700 text-sm text-left">{practice.tips}</p>
                              </div>
                            )}
                            {/* Thông tin loại câu hỏi */}
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
                
                // Part 3: render hội thoại + 3 câu hỏi riêng biệt
                if (partType === 'part3' && practice.questions && Array.isArray(practice.questions)) {
                  return (
                    <div key={idx} style={{
                      marginBottom: '16px',
                      padding: isExpanded ? '20px' : '12px',
                      borderRadius: '12px',
                      border: '1px solid #bfdbfe',
                      background: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          color: '#166534',
                          fontSize: isExpanded ? '18px' : '16px'
                        }}>📝 TOEIC Practice PART 3</div>
                      </div>
                        {/* Hiển thị audio nếu có */}
                        {practice.audio && <audio controls className="w-full mb-3" src={practice.audio} />}
                        {/* Render từng câu hỏi */}
                        <div className="space-y-6">
                          {practice.questions.map((q: any, qIdx: number) => {
                            const qAnswer = part3Answers[idx]?.[qIdx] || '';
                            const qShowResult = qAnswer !== '';
                            return (
                              <div key={qIdx} className="p-3 rounded-lg border border-gray-200">
                                <div className="font-semibold text-green-900 mb-2">Câu {qIdx + 1}: {q.question}</div>
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
                                      <div key={opt} className="relative">
                                        <button
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
                                            {/* Hiển thị text đáp án */}
                                            <span className="text-gray-800">
                                              {part3ShowTranslation[idx]?.[qIdx]?.[opt] && q.choicesVi && q.choicesVi[opt]
                                                ? q.choicesVi[opt]
                                                : q.choices?.[opt] || ''
                                              }
                                            </span>
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
                                        {/* Translate button positioned absolutely on top of answer button */}
                                        {qShowResult && q.choicesVi && q.choicesVi[opt] && (
                                          <button
                                            className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition-colors z-10"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
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
                                            {part3ShowTranslation[idx]?.[qIdx]?.[opt] ? 'Ẩn dịch' : 'Dịch'}
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                {/* Sau khi chọn đáp án, giải thích, mẹo, bẫy, loại câu hỏi */}
                                {qShowResult && (
                                  <div className="mt-4 space-y-4">
                                    {/* Giải thích cho từng câu hỏi */}
                                    <div className="p-3 rounded-lg border border-gray-200">
                                      <h6 className="font-medium text-gray-800 mb-2">💡 Giải thích:</h6>
                                      <p className="text-gray-700 text-sm text-left">{q.explanation}</p>
                                      {/* Bẫy */}
                                      {q.traps && (
                                        <div className="mt-2">
                                          <h6 className="font-medium text-gray-800 mb-1">🎯 Bẫy:</h6>
                                          <p className="text-gray-700 text-sm text-left">{q.traps}</p>
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
                
                // Part 4: render bài nói ngắn + câu hỏi
                if (partType === 'part4') {
                  return (
                    <div key={idx} style={{
                      marginBottom: '16px',
                      padding: isExpanded ? '20px' : '12px',
                      borderRadius: '12px',
                      border: '1px solid #fbbf24',
                      background: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          color: '#92400e',
                          fontSize: isExpanded ? '18px' : '16px'
                        }}>📝 TOEIC Practice PART 4</div>
                      </div>
                      
                      {/* Hiển thị audio nếu có */}
                      {practice.audio && <audio controls className="w-full mb-3" src={practice.audio} />}
                      
                      {/* Hiển thị câu hỏi nếu có */}
                      {practice.question && (
                        <div className="p-3 rounded-lg border border-yellow-200 mb-3">
                          <h6 className="font-medium text-yellow-800 mb-2">❓ Câu hỏi:</h6>
                          <div className="font-semibold text-yellow-900">{practice.question}</div>
                        </div>
                      )}
                      
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
                            <div key={opt} className="space-y-1">
                              <div className="relative">
                                <button
                                  className={choiceClass}
                                  onClick={() => handlePracticeAnswer(idx, opt)}
                                  disabled={disabled}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-gray-600">{opt}.</span>
                                    {/* Hiển thị text đáp án */}
                                    <div className="flex-1 text-left">
                                      <div className="text-gray-800">
                                        {showTranslation[idx]?.[opt] && practice.choicesVi && practice.choicesVi[opt] 
                                          ? practice.choicesVi[opt] 
                                          : practice.choices?.[opt] || ''
                                        }
                                      </div>
                                    </div>
                                    {showResult && isCorrect && (
                                      <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                    {isSelected && !isCorrect && (
                                      <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    )}
                                  </div>
                                </button>
                                {/* Translate button positioned absolutely on top of answer button */}
                                {showResult && practice.choices && practice.choices[opt] && practice.choicesVi && practice.choicesVi[opt] && (
                                  <button
                                    className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition-colors z-10"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleTranslation(idx, opt);
                                    }}
                                    type="button"
                                  >
                                    {showTranslation[idx]?.[opt] ? 'Ẩn dịch' : 'Dịch'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Sau khi chọn đáp án, render lại giải thích, mẹo, bẫy, loại câu hỏi */}
                      {showResult && (
                        <div className="mt-4 space-y-4">
                          {/* Giải thích cho Part 4 */}
                          <div className="p-3 rounded-lg border border-gray-200">
                            <h6 className="font-medium text-gray-800 mb-2">💡 Giải thích:</h6>
                            <p className="text-gray-700 text-sm text-left">{practice.explanation}</p>
                            {/* Bẫy */}
                            {practice.traps && (
                              <div className="mt-2">
                                <h6 className="font-medium text-gray-800 mb-1">🎯 Bẫy:</h6>
                                <p className="text-gray-700 text-sm text-left">{practice.traps}</p>
                              </div>
                            )}
                            {/* Tips */}
                            {practice.tips && (
                              <div className="mt-2">
                                <h6 className="font-medium text-gray-800 mb-1">💡 Mẹo làm bài:</h6>
                                <p className="text-gray-700 text-sm text-left">{practice.tips}</p>
                              </div>
                            )}
                            {/* Hiển thị transcript nếu có */}
                            {practice.transcript && (
                              <div className="p-3 rounded-lg border border-yellow-200 mb-3">
                                <h6 className="font-medium text-yellow-800 mb-2">📝 Transcript:</h6>
                                <p className="text-gray-700 text-sm">{practice.transcript}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                
                // Part 5: render câu chưa hoàn chỉnh
                if (partType === 'part5') {
                  return (
                    <div key={idx} style={{
                      marginBottom: '16px',
                      padding: isExpanded ? '20px' : '12px',
                      borderRadius: '12px',
                      border: '1px solid #a78bfa',
                      background: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          color: '#5b21b6',
                          fontSize: isExpanded ? '18px' : '16px'
                        }}>📝 TOEIC Practice PART 5</div>
                      </div>
                      
                      {/* Hiển thị audio nếu có */}
                      {practice.audio && <audio controls className="w-full mb-3" src={practice.audio} />}
                      
                      {/* Hiển thị câu chưa hoàn chỉnh nếu có */}
                      {practice.sentence && (
                        <div className="p-3 rounded-lg border border-purple-200 mb-3">
                          <div className="font-semibold text-purple-900">{practice.sentence}</div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {['A','B','C','D'].map(opt => {
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
                            <div key={opt} className="space-y-1">
                              <div className="relative">
                                <button
                                  className={choiceClass}
                                  onClick={() => handlePracticeAnswer(idx, opt)}
                                  disabled={disabled}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-gray-600">{opt}.</span>
                                    {/* Hiển thị text đáp án */}
                                    <div className="flex-1 text-left">
                                      <div className="text-gray-800">
                                        {showTranslation[idx]?.[opt] && practice.choicesVi && practice.choicesVi[opt] 
                                          ? practice.choicesVi[opt] 
                                          : practice.choices?.[opt] || ''
                                        }
                                      </div>
                                    </div>
                                    {showResult && isCorrect && (
                                      <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                    {isSelected && !isCorrect && (
                                      <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    )}
                                  </div>
                                </button>
                                {/* Translate button positioned absolutely on top of answer button */}
                                {showResult && practice.choices && practice.choices[opt] && practice.choicesVi && practice.choicesVi[opt] && (
                                  <button
                                    className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition-colors z-10"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleTranslation(idx, opt);
                                    }}
                                    type="button"
                                  >
                                    {showTranslation[idx]?.[opt] ? 'Ẩn dịch' : 'Dịch'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Sau khi chọn đáp án, render lại giải thích, mẹo, bẫy, loại câu hỏi */}
                      {showResult && (
                        <div className="mt-4 space-y-4">
                          {/* Giải thích cho Part 5 */}
                          <div className="p-3 rounded-lg border border-gray-200">
                            <h6 className="font-medium text-gray-800 mb-2">💡 Giải thích:</h6>
                            <p className="text-gray-700 text-sm text-left">{practice.explanation}</p>
                            {/* Bẫy */}
                            {practice.traps && (
                              <div className="mt-2">
                                <h6 className="font-medium text-gray-800 mb-1">🎯 Bẫy:</h6>
                                <p className="text-gray-700 text-sm text-left">{practice.traps}</p>
                              </div>
                            )}
                            {/* Tips */}
                            {practice.tips && (
                              <div className="mt-2">
                                <h6 className="font-medium text-gray-800 mb-1">💡 Mẹo làm bài:</h6>
                                <p className="text-gray-700 text-sm text-left">{practice.tips}</p>
                              </div>
                            )}
                            {/* Thông tin loại câu hỏi */}
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
                
                // Part 6: render đoạn văn + nhiều câu hỏi
                if (partType === 'part6' && practice.questions && Array.isArray(practice.questions)) {
                  return (
                    <div key={idx} style={{
                      marginBottom: '16px',
                      padding: isExpanded ? '20px' : '12px',
                      borderRadius: '12px',
                      border: '1px solid #f87171',
                      background: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          color: '#991b1b',
                          fontSize: isExpanded ? '18px' : '16px'
                        }}>📝 TOEIC Practice PART 6</div>
                      </div>
                      
                      {/* Hiển thị audio nếu có */}
                      {practice.audio && <audio controls className="w-full mb-3" src={practice.audio} />}
                      
                      {/* Hiển thị đoạn văn nếu có */}
                      {practice.passage && (
                        <div className="p-3 rounded-lg border border-red-200 mb-3">
                          <h6 className="font-medium text-red-800 mb-2">📝 Đoạn văn:</h6>
                          <p className="text-gray-700 text-sm">{practice.passage}</p>
                        </div>
                      )}
                      
                      {/* Render từng câu hỏi */}
                      <div className="space-y-6">
                        {practice.questions.map((q: any, qIdx: number) => {
                          const qAnswer = part6Answers[idx]?.[qIdx] || '';
                          const qShowResult = qAnswer !== '';
                          return (
                            <div key={qIdx} className="p-3 rounded-lg border border-gray-200">
                              <div className="font-semibold text-red-900 mb-2">{q.question}</div>
                              <div className="space-y-2">
                                {['A','B','C','D'].map(opt => {
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
                                    <div key={opt} className="relative">
                                      <button
                                        className={choiceClass}
                                        onClick={() => {
                                          setPart6Answers(prev => ({
                                            ...prev,
                                            [idx]: { ...(prev[idx] || {}), [qIdx]: opt }
                                          }));
                                        }}
                                        disabled={disabled}
                                      >
                                        <div className="flex items-center space-x-2">
                                          <span className="font-semibold text-gray-600">{opt}.</span>
                                          {/* Hiển thị text đáp án */}
                                          <span className="text-gray-800">
                                            {part6ShowTranslation[idx]?.[qIdx]?.[opt] && q.choicesVi && q.choicesVi[opt]
                                              ? q.choicesVi[opt]
                                              : q.choices?.[opt] || ''
                                            }
                                          </span>
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
                                      {/* Translate button positioned absolutely on top of answer button */}
                                      {qShowResult && q.choicesVi && q.choicesVi[opt] && (
                                        <button
                                          className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition-colors z-10"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setPart6ShowTranslation(prev => ({
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
                                          {part6ShowTranslation[idx]?.[qIdx]?.[opt] ? 'Ẩn dịch' : 'Dịch'}
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              {/* Sau khi chọn đáp án, giải thích, mẹo, bẫy, loại câu hỏi */}
                              {qShowResult && (
                                <div className="mt-4 space-y-4">
                                  {/* Giải thích cho từng câu hỏi */}
                                  <div className="p-3 rounded-lg border border-gray-200">
                                    <h6 className="font-medium text-gray-800 mb-2">💡 Giải thích:</h6>
                                    <p className="text-gray-700 text-sm text-left">{q.explanation}</p>
                                    {/* Bẫy */}
                                    {q.traps && (
                                      <div className="mt-2">
                                        <h6 className="font-medium text-gray-800 mb-1">🎯 Bẫy:</h6>
                                        <p className="text-gray-700 text-sm text-left">{q.traps}</p>
                                      </div>
                                    )}
                                    {/* Tips */}
                                    {q.tips && (
                                      <div className="mt-2">
                                        <h6 className="font-medium text-gray-800 mb-1">💡 Mẹo làm bài:</h6>
                                        <p className="text-gray-700 text-sm">{q.tips}</p>
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
                
                // Part 7: render đoạn văn + nhiều câu hỏi (tương tự Part 6)
                if (partType === 'part7' && practice.questions && Array.isArray(practice.questions)) {
                  return (
                    <div key={idx} style={{
                      marginBottom: '16px',
                      padding: isExpanded ? '20px' : '12px',
                      borderRadius: '12px',
                      border: '1px solid #7c3aed',
                      background: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          color: '#5b21b6',
                          fontSize: isExpanded ? '18px' : '16px'
                        }}>📖 TOEIC Practice PART 7</div>
                      </div>
                      
                      {/* Hiển thị audio nếu có */}
                      {practice.audio && <audio controls className="w-full mb-3" src={practice.audio} />}
                      
                      {/* Hiển thị đoạn văn nếu có */}
                      {practice.passages && Array.isArray(practice.passages) && practice.passages.length > 0 && (
                        <div className="p-3 rounded-lg border border-purple-200 mb-3">
                          <h6 className="font-medium text-purple-800 mb-2">📖 Đoạn văn:</h6>
                          {practice.passages.map((passage: string, passageIdx: number) => (
                            <div key={passageIdx} className="mb-3">
                              {practice.passages.length > 1 && (
                                <div className="font-medium text-purple-700 mb-1">Đoạn {passageIdx + 1}:</div>
                              )}
                              <p className="text-gray-700 text-sm">{passage}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Render từng câu hỏi */}
                      <div className="space-y-6">
                        {practice.questions.map((q: any, qIdx: number) => {
                          const qAnswer = part7Answers[idx]?.[qIdx] || '';
                          const qShowResult = qAnswer !== '';
                          return (
                            <div key={qIdx} className="p-3 rounded-lg border border-gray-200">
                              <div className="font-semibold text-purple-900 mb-2">{q.question}</div>
                              <div className="space-y-2">
                                {['A','B','C','D'].map(opt => {
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
                                    <div key={opt} className="relative">
                                      <button
                                        className={choiceClass}
                                        onClick={() => {
                                          setPart7Answers(prev => ({
                                            ...prev,
                                            [idx]: { ...(prev[idx] || {}), [qIdx]: opt }
                                          }));
                                        }}
                                        disabled={disabled}
                                      >
                                        <div className="flex items-center space-x-2">
                                          <span className="font-semibold text-gray-600">{opt}.</span>
                                          {/* Hiển thị text đáp án */}
                                          <span className="text-gray-800">
                                            {part7ShowTranslation[idx]?.[qIdx]?.[opt] && q.choicesVi && q.choicesVi[opt]
                                              ? q.choicesVi[opt]
                                              : q.choices?.[opt] || ''
                                            }
                                          </span>
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
                                      {/* Translate button positioned absolutely on top of answer button */}
                                      {qShowResult && q.choicesVi && q.choicesVi[opt] && (
                                        <button
                                          className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition-colors z-10"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setPart7ShowTranslation(prev => ({
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
                                          {part7ShowTranslation[idx]?.[qIdx]?.[opt] ? 'Ẩn dịch' : 'Dịch'}
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              {/* Sau khi chọn đáp án, giải thích, mẹo, bẫy, loại câu hỏi */}
                              {qShowResult && (
                                <div className="mt-4 space-y-4">
                                  {/* Giải thích cho từng câu hỏi */}
                                  <div className="p-3 rounded-lg border border-gray-200">
                                    <h6 className="font-medium text-gray-800 mb-2">💡 Giải thích:</h6>
                                    <p className="text-gray-700 text-sm text-left">{q.explanation}</p>
                                    {/* Bẫy */}
                                    {q.traps && (
                                      <div className="mt-2">
                                        <h6 className="font-medium text-gray-800 mb-1">🎯 Bẫy:</h6>
                                        <p className="text-gray-700 text-sm text-left">{q.traps}</p>
                                      </div>
                                    )}
                                    {/* Tips */}
                                    {q.tips && (
                                      <div className="mt-2">
                                        <h6 className="font-medium text-gray-800 mb-1">💡 Mẹo làm bài:</h6>
                                        <p className="text-gray-700 text-sm">{q.tips}</p>
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
                  <div key={idx} style={{
                    marginBottom: '16px',
                    padding: isExpanded ? '20px' : '12px',
                    borderRadius: '12px',
                    border: '1px solid #bbf7d0',
                    background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#166534',
                        fontSize: isExpanded ? '18px' : '16px'
                      }}>
                        📝 TOEIC Practice {partType.toUpperCase()}
                      </div>
                    </div>
                    
                    {/* Hiển thị ảnh cho Part 1 */}
                    {partType === 'part1' && practice.image && (
                      <img src={practice.image} alt="practice" className="max-w-xs rounded-lg mb-3" style={{width: '-webkit-fill-available'}} />
                    )}
                    
                    {/* Hiển thị audio cho tất cả parts */}
                    {practice.audio && <audio controls className="w-full mb-3" src={practice.audio} />}
                    {/* Đáp án cho part1 kiểu nút tròn lớn, giống TestResults */}
                    {practice.audioQuestion && (
                      <div className="grid gap-4">
                        {['A','B','C','D'].map(opt => {
                                                  const isSelected = answer === opt;
                        const isCorrect = opt === practice.audioQuestion.correctAnswer;
                        const showResult = answer !== undefined && answer !== '';
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
                          const disabled = showResult;
                          return (
                            <div
                              key={opt}
                              className={choiceClass}
                              onClick={() => !disabled && handlePracticeAnswer(idx, opt)}
                            >
                              <div className="flex items-center">
                                <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                                  {opt}
                                </div>
                                <div className="flex-1">
                                  {showResult ? (
                                    <div className="text-lg text-gray-800">
                                      {showTranslation[idx]?.[opt] && practice.audioQuestion.choices[opt]?.vietnamese
                                        ? practice.audioQuestion.choices[opt].vietnamese
                                        : practice.audioQuestion.choices[opt]?.english || 'N/A'
                                      }
                                    </div>
                                  ) : (
                                    <div className="text-lg text-gray-500 italic">Click to select</div>
                                  )}
                                </div>
                                {showResult && practice.audioQuestion.choices[opt]?.english && practice.audioQuestion.choices[opt]?.vietnamese && (
                                  <button
                                    className="text-gray-400 hover:text-blue-500 text-base cursor-pointer p-2 rounded-full transition-all duration-200 ml-3 flex-shrink-0 hover:bg-blue-50"
                                    onClick={e => {
                                      e.stopPropagation();
                                      toggleTranslation(idx, opt);
                                    }}
                                    title={showTranslation[idx]?.[opt] ? "Hiện tiếng Anh" : "Hiện tiếng Việt"}
                                  >
                                    📖
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {/* Sau khi chọn đáp án, render lại giải thích, mẹo, bẫy, loại câu hỏi */}
                    {showResult && (
                      <div className="mt-4 space-y-4">
                        {/* Giải thích cho tất cả parts */}
                        <div className="p-3 rounded-lg bg-gray-50">
                          <h6 className="font-medium text-green-500 mb-2">Explanation:</h6>
                          <p className="text-gray-700 text-sm">{practice.audioQuestion.traps}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              if (msg.role === 'confirm-practice') {
                return (
                  <div key={idx} className="mb-4 p-3 rounded-lg border border-yellow-200">
                    <div className="mb-2 text-yellow-800 font-semibold">Bạn có muốn tạo một bài luyện tập TOEIC với yêu cầu này không?</div>
                    <div className="text-xs text-gray-700 mb-2">"{msg.original}"</div>
                    <div className="flex gap-2">
                      <button onClick={() => handleConfirmPractice(idx, true)} className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">Tạo bài tập</button>
                      <button onClick={() => handleConfirmPractice(idx, false)} className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Hủy</button>
                    </div>
                  </div>
                );
              }
              if (msg.role === 'practice-loading') {
                return (
                  <div key={idx} className="mb-4 p-3 rounded-lg border border-green-200 flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-green-700 font-medium">Đang tạo bài luyện tập TOEIC...</span>
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
              if (msg.role === 'image-analysis-loading') {
                return (
                  <div key={idx} style={{
                    margin: '8px 0',
                    textAlign: 'left'
                  }}>
                    <span
                      style={{
                        display: 'inline-block',
                        background: '#fef3c7',
                        color: '#92400e',
                        borderRadius: 16,
                        padding: '8px 14px',
                        maxWidth: '80%',
                        fontSize: 15
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>Đang phân tích ảnh và tạo bài tập...</span>
                        <div style={{ display: 'flex', gap: 2 }}>
                          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#92400e', animation: 'typing 1.4s infinite ease-in-out' }}></div>
                          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#92400e', animation: 'typing 1.4s infinite ease-in-out 0.2s' }}></div>
                          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#92400e', animation: 'typing 1.4s infinite ease-in-out 0.4s' }}></div>
                        </div>
                      </div>
                    </span>
                  </div>
                );
              }

              if (msg.role === 'image-practice') {
                const practice = (msg as any).data;
                const answer = (msg as any).answer || '';
                const showResult = answer !== '';
                const saved = (msg as any).saved || false;

                return (
                  <div key={idx} style={{
                    marginBottom: '16px',
                    padding: isExpanded ? '20px' : '12px',
                    borderRadius: '12px',
                    border: '1px solid #8b5cf6',
                    background: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#5b21b6',
                        fontSize: isExpanded ? '18px' : '16px'
                      }}>📸 TOEIC Practice từ ảnh</div>
                      {saved && (
                        <div style={{
                          background: '#10b981',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          ✅ Đã lưu
                        </div>
                      )}
                    </div>
                    
                    {/* Hiển thị ảnh */}
                    {practice.imageUrl && (
                      <div style={{ marginBottom: '12px' }}>
                        <img 
                          src={practice.imageUrl} 
                          alt="Practice" 
                          style={{
                            maxWidth: '100%',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb'
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Hiển thị câu hỏi */}
                    {practice.question && (
                      <div className="p-3 rounded-lg border border-purple-200 mb-3">
                        <div className="font-semibold text-purple-900">{practice.question}</div>
                      </div>
                    )}
                    
                    {/* Đáp án */}
                    <div className="space-y-2">
                      {['A','B','C','D'].map(opt => {
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
                          <div key={opt} className="space-y-1">
                            <div className="relative">
                              <button
                                className={choiceClass}
                                onClick={() => handleImagePracticeAnswer(idx, opt)}
                                disabled={disabled}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-600">{opt}.</span>
                                  <div className="flex-1 text-left">
                                    <div className="text-gray-800">
                                      {showTranslation[idx]?.[opt] && practice.choicesVi && practice.choicesVi[opt] 
                                        ? practice.choicesVi[opt] 
                                        : practice.choices?.[opt] || ''
                                      }
                                    </div>
                                  </div>
                                  {showResult && isCorrect && (
                                    <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                  {isSelected && !isCorrect && (
                                    <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  )}
                                </div>
                              </button>
                              {showResult && practice.choices && practice.choices[opt] && practice.choicesVi && practice.choicesVi[opt] && (
                                <button
                                  className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 transition-colors z-10"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleTranslation(idx, opt);
                                  }}
                                  type="button"
                                >
                                  {showTranslation[idx]?.[opt] ? 'Ẩn dịch' : 'Dịch'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Sau khi chọn đáp án */}
                    {showResult && (
                      <div className="mt-4 space-y-4">
                        <div className="p-3 rounded-lg border border-gray-200">
                          <h6 className="font-medium text-gray-800 mb-2">💡 Giải thích:</h6>
                          <p className="text-gray-700 text-sm text-left">{practice.explanation}</p>
                          {practice.type && (
                            <div className="mt-2">
                              <h6 className="font-medium text-gray-800 mb-1">📋 Loại câu hỏi:</h6>
                              <p className="text-gray-700 text-sm">{practice.type}</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Nút lưu bài tập */}
                        {!saved && (
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleSaveImagePractice(idx)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >Lưu vào kho tài liệu
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
              if (msg.role === 'user' && (msg as any).image) {
                return (
                  <div key={idx} style={{ 
                    margin: isExpanded ? '12px 0' : '8px 0', 
                    textAlign: 'right' 
                  }}>
                    <img src={(msg as any).image} alt="uploaded" style={{ 
                      maxWidth: isExpanded ? 200 : 120, 
                      maxHeight: isExpanded ? 200 : 120, 
                      borderRadius: 8, 
                      marginBottom: 4, 
                      border: '1px solid #eee' 
                    }} />
                    <span style={{ 
                      display: 'inline-block', 
                      background: '#14B24C', 
                      color: '#fff', 
                      borderRadius: 16, 
                      padding: isExpanded ? '12px 18px' : '8px 14px', 
                      maxWidth: '80%', 
                      fontSize: isExpanded ? '16px' : '15px',
                      boxShadow: '0 2px 4px rgba(20, 178, 76, 0.2)'
                    }}>{(msg as any).text}</span>
                  </div>
                );
              }
              // Render user không có image:
              if (msg.role === 'user' && !(msg as any).image) {
                return (
                  <div key={idx} style={{ 
                    margin: isExpanded ? '12px 0' : '8px 0', 
                    textAlign: 'right' 
                  }}>
                    <span style={{ 
                      display: 'inline-block', 
                      background: '#14B24C', 
                      color: '#fff', 
                      borderRadius: 16, 
                      padding: isExpanded ? '12px 18px' : '8px 14px', 
                      maxWidth: '80%', 
                      fontSize: isExpanded ? '16px' : '15px',
                      boxShadow: '0 2px 4px rgba(20, 178, 76, 0.2)'
                    }}>{(msg as any).text}</span>
                  </div>
                );
              }
              // render bot messages
              if (msg.role === 'bot') {
                return (
                  <div key={idx} style={{
                    margin: isExpanded ? '12px 0' : '8px 0',
                    textAlign: 'left'
                  }}>
                    <span
                      style={{
                        display: 'inline-block',
                        background: '#e3eafc',
                        color: '#222',
                        borderRadius: 16,
                        padding: isExpanded ? '12px 18px' : '8px 14px',
                        maxWidth: '80%',
                        fontSize: isExpanded ? '16px' : '15px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        lineHeight: '1.5'
                      }}
                      dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml((msg as any).text) }}
                    />
                  </div>
                );
              }
              // user fallback
              return (
                <div key={idx} style={{
                  margin: isExpanded ? '12px 0' : '8px 0',
                  textAlign: 'right'
                }}>
                  <span style={{
                    display: 'inline-block',
                    background: '#14B24C',
                    color: '#fff',
                    borderRadius: 16,
                    padding: isExpanded ? '12px 18px' : '8px 14px',
                    maxWidth: '80%',
                    fontSize: isExpanded ? '16px' : '15px',
                    boxShadow: '0 2px 4px rgba(20, 178, 76, 0.2)'
                  }}>{'text' in msg ? (msg as any).text : 'Unknown message type'}</span>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
          <div 
            className={isExpanded ? 'chatbot-input-expanded' : ''}
            style={{ 
              display: 'flex', 
              borderTop: '1px solid #e5e7eb', 
              padding: isExpanded ? '16px' : '8px', 
              background: '#f9fafb',
              gap: isExpanded ? '12px' : '8px'
            }}
          >
            {/* Nút tải ảnh */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(file);
                  e.target.value = ''; // Reset input
                }
              }}
              style={{ display: 'none' }}
              id="image-upload-input"
            />
            <label
              htmlFor="image-upload-input"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: isExpanded ? '0 16px' : '0 12px',
                fontSize: isExpanded ? '16px' : '14px',
                cursor: 'pointer',
                height: isExpanded ? '50px' : '38px',
                minWidth: isExpanded ? '50px' : '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(139, 92, 246, 0.2)';
              }}
              title="Tải ảnh để tạo bài tập TOEIC"
            >
              📸
            </label>
            
            {/* Hiển thị ảnh preview nếu có */}
            {selectedImage && (
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px',
                borderRadius: '8px',
                border: '2px solid #8b5cf6',
                background: '#f8f9ff'
              }}>
                <img 
                  src={selectedImage} 
                  alt="Preview" 
                  style={{
                    width: isExpanded ? '40px' : '32px',
                    height: isExpanded ? '40px' : '32px',
                    borderRadius: '4px',
                    objectFit: 'cover'
                  }}
                />
                <button
                  onClick={() => {
                    setSelectedImage('');
                    setImageFile(null);
                  }}
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: isExpanded ? '20px' : '16px',
                    height: isExpanded ? '20px' : '16px',
                    fontSize: isExpanded ? '12px' : '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1
                  }}
                  title="Xóa ảnh"
                >
                  ×
                </button>
              </div>
            )}
            
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!loading && input.trim()) handleSend();
                }
              }}
              placeholder={selectedImage ? "Nhập yêu cầu phân tích ảnh và nhấn gửi..." : "Nhập câu hỏi về TOEIC hoặc tải ảnh để tạo bài tập..."}
              className={isExpanded ? 'chatbot-textarea-expanded' : ''}
              style={{ 
                flex: 1, 
                border: '1px solid #e5e7eb', 
                outline: 'none', 
                fontSize: isExpanded ? '16px' : '15px', 
                padding: isExpanded ? '12px 16px' : '8px', 
                borderRadius: 8, 
                resize: 'none', 
                minHeight: isExpanded ? '50px' : '38px', 
                maxHeight: isExpanded ? '120px' : '90px',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s ease'
              }}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={loading || (!input.trim() && !selectedImage)}
              className={isExpanded ? 'chatbot-button-expanded' : ''}
              style={{
                background: 'linear-gradient(135deg, #14B24C 0%, #16a34a 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: isExpanded ? '0 20px' : '0 12px',
                fontSize: isExpanded ? '18px' : '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                height: isExpanded ? '50px' : '38px',
                minWidth: isExpanded ? '50px' : '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(20, 178, 76, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (!loading && input.trim()) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(20, 178, 76, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(20, 178, 76, 0.2)';
              }}
            >
              <svg
                width={isExpanded ? "20" : "18"}
                height={isExpanded ? "20" : "18"}
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