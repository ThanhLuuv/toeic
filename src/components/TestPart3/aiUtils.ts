// Hàm sinh 1 câu luyện tập TOEIC Part 3 theo yêu cầu người dùng
export async function generateToeicPracticeQuestionPart3(userRequest: string): Promise<any> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  const endpoint = "https://api.openai.com/v1/chat/completions";
  
  const messages = [
    {
      role: "system",
      content: `Bạn là giáo viên TOEIC, chuyên tạo bài luyện tập TOEIC Part 3 (Conversation) theo yêu cầu. Hãy sinh ra 1 đoạn hội thoại luyện tập TOEIC Part 3 phù hợp với yêu cầu sau của người dùng.

== HƯỚNG DẪN PHÂN TÍCH LEVEL ==
Tự động nhận diện mức độ khó từ yêu cầu người dùng:
- Level 1/Beginner: Từ khóa "dễ", "cơ bản", "đơn giản", "level 1", "beginner"
- Level 2/Intermediate: Từ khóa "trung bình", "vừa phải", "level 2", "intermediate" hoặc không có từ khóa level
- Level 3/Advanced: Từ khóa "khó", "nâng cao", "phức tạp", "level 3", "advanced"

== YÊU CẦU NGƯỜI DÙNG ==
${userRequest}

== ĐẦU RA PHẢI LÀ OBJECT JSON DUY NHẤT, KHÔNG GIẢI THÍCH, KHÔNG MARKDOWN ==

Schema:
{
  "practiceQuestion": {
    "questionNumber": 1,
    "level": "beginner|intermediate|advanced",
    "audioScript": "M: Hello, I'd like to make a reservation for dinner tonight.\nW: Sure, how many people will be dining?\nM: There will be four of us.\nW: What time would you prefer?",
    "questions": [
      {
        "question": "What is the man calling about?",
        "choices": { "A": "Making a dinner reservation", "B": "Ordering takeout", "C": "Complaining about service" },
        "choicesVi": { "A": "Đặt bàn ăn tối", "B": "Đặt đồ mang về", "C": "Phàn nàn về dịch vụ" },
        "correctAnswer": "A",
        "explanation": "Người đàn ông nói 'I'd like to make a reservation for dinner tonight'",
        "answerType": "purpose"
      }
    ]
  }
}

== QUY TẮC TẠO HỘI THOẠI ==
- Hội thoại phải tự nhiên, phù hợp với ngữ cảnh công việc/đời sống hàng ngày
- Mỗi đoạn hội thoại có 3 câu hỏi liên quan
- Câu hỏi phải đa dạng: chi tiết, ý chính, suy luận
- Đáp án phải có vẻ hợp lý nhưng chỉ 1 đáp án đúng
- Sử dụng từ vựng và ngữ pháp phù hợp với trình độ TOEIC

== QUY TẮC TẠO CÂU HỎI THEO LEVEL ==
- Beginner: Từ vựng cơ bản, cấu trúc đơn giản, bẫy dễ nhận biết
- Intermediate: Từ vựng phổ thông, cấu trúc vừa phải, bẫy thông minh  
- Advanced: Từ vựng nâng cao, cấu trúc phức tạp, bẫy tinh vi`
    }
  ];
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      temperature: 1.0,
      max_tokens: 1024,
      top_p: 1.0
    })
  });
  if (!response.ok) throw new Error("OpenAI API error: " + response.statusText);
  const data = await response.json();
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    throw new Error("Lỗi parse JSON từ AI: " + data.choices[0].message.content);
  }
}

// Hàm tạo audio base64 cho Part 3 từ Google TTS
export async function generateAudioBase64Part3(practiceQuestion: any): Promise<string> {
  const GOOGLE_TTS_KEY = process.env.REACT_APP_GOOGLE_TTS_KEY || 'AIzaSyAqO6_hgidkr_qandEMZUJlBcAhF3xOsUk';
  
  function fixPronunciation(text: string) {
    let fixedText = text;
    fixedText = fixedText.replace(/\ba man\b/gi, '<phoneme alphabet="ipa" ph="ə mæn">a man</phoneme>');
    fixedText = fixedText.replace(/\ba woman\b/gi, '<phoneme alphabet="ipa" ph="ə ˈwʊmən">a woman</phoneme>');
    fixedText = fixedText.replace(/\ba person\b/gi, '<phoneme alphabet="ipa" ph="ə ˈpɜrsən">a person</phoneme>');
    return fixedText;
  }
  
  const questionNumber = practiceQuestion.questionNumber || 1;
  const audioScript = practiceQuestion.audioScript || '';
  const questions = practiceQuestion.questions || [];
  
  // Mapping nhân vật -> voice
  const voiceMap: { [key: string]: string } = {
    "M": "en-US-Wavenet-D",  // Nam
    "M1": "en-US-Wavenet-D",
    "M2": "en-US-Wavenet-B", // Nam phụ khác giọng
    "W": "en-US-Wavenet-F",  // Nữ
    "W1": "en-US-Wavenet-F",
    "W2": "en-US-Wavenet-E"
  };

  // Tạo SSML script cho đoạn hội thoại
  let ssmlContent = `<speak><prosody rate="slow">Conversation ${questionNumber}.</prosody><break time="1s"/>`;

  const lines = audioScript.split("\n");
  for (const line of lines) {
    const match = line.match(/^([A-Z0-9]+):\s(.+)$/);
    if (!match) continue;

    const speaker = match[1];
    const text = match[2];
    const voice = voiceMap[speaker] || "en-US-Wavenet-D";

    ssmlContent += `
      <voice name="${voice}">
        <prosody rate="medium">${fixPronunciation(text)}</prosody>
      </voice>
      <break time="0.6s"/>
    `;
  }

  // Thêm phần đọc câu hỏi
  ssmlContent += `<break time="3s"/><voice name="en-US-Wavenet-D"><prosody rate="medium">Now you will hear three questions about the conversation.</prosody></voice><break time="2s"/>`;
  
  questions.forEach((question: any, qIndex: number) => {
    // Đọc số câu hỏi với giọng cố định
    ssmlContent += `<voice name="en-US-Wavenet-D"><prosody rate="medium">Question ${qIndex + 1}.</prosody></voice><break time="1s"/>`;
    
    // Đọc câu hỏi với giọng cố định
    ssmlContent += `<voice name="en-US-Wavenet-D"><prosody rate="medium">${fixPronunciation(question.question)}</prosody></voice>`;
    
    // Nghỉ 4 giây giữa các câu hỏi, câu cuối nghỉ 2s
    if (qIndex < questions.length - 1) {
      ssmlContent += `<break time="4s"/>`;
    } else {
      ssmlContent += `<break time="2s"/>`;
    }
  });

  ssmlContent += `</speak>`;

  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { ssml: ssmlContent },
      voice: { languageCode: 'en-US' },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.85,
        pitch: 0.0
      }
    })
  });
  const result = await response.json();
  if (result.audioContent) {
    return `data:audio/mp3;base64,${result.audioContent}`;
  }
  throw new Error('Audio generation failed');
} 