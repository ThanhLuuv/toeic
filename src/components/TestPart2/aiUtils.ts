// Hàm tạo audio base64 từ Google TTS cho Part 2 (dùng cho TestResults)
export async function generateAudioBase64(practiceQuestion: any): Promise<string> {
  const GOOGLE_TTS_KEY = process.env.REACT_APP_GOOGLE_TTS_KEY || 'AIzaSyAqO6_hgidkr_qandEMZUJlBcAhF3xOsUk';
  
  function fixPronunciation(text: string) {
    let fixedText = text;
    // Thêm các từ phổ biến trong Part 2
    fixedText = fixedText.replace(/\bmeeting\b/gi, '<phoneme alphabet="ipa" ph="ˈmiːtɪŋ">meeting</phoneme>');
    fixedText = fixedText.replace(/\bconference\b/gi, '<phoneme alphabet="ipa" ph="ˈkɑːnfərəns">conference</phoneme>');
    fixedText = fixedText.replace(/\boffice\b/gi, '<phoneme alphabet="ipa" ph="ˈɔːfɪs">office</phoneme>');
    fixedText = fixedText.replace(/\bproject\b/gi, '<phoneme alphabet="ipa" ph="ˈprɑːdʒekt">project</phoneme>');
    fixedText = fixedText.replace(/\bclient\b/gi, '<phoneme alphabet="ipa" ph="ˈklaɪənt">client</phoneme>');
    fixedText = fixedText.replace(/\bmanager\b/gi, '<phoneme alphabet="ipa" ph="ˈmænɪdʒər">manager</phoneme>');
    fixedText = fixedText.replace(/\bdeadline\b/gi, '<phoneme alphabet="ipa" ph="ˈdedlaɪn">deadline</phoneme>');
    fixedText = fixedText.replace(/\bschedule\b/gi, '<phoneme alphabet="ipa" ph="ˈskedʒuːl">schedule</phoneme>');
    return fixedText;
  }

  // Giọng đọc chuẩn TOEIC - giống Part 1
  // Nam: giọng Mỹ trung tính, rõ ràng
  const maleVoice = 'en-US-Standard-B';  // Giọng nam Mỹ chuẩn
  // Nữ: giọng Mỹ trung tính, rõ ràng  
  const femaleVoice = 'en-US-Standard-C'; // Giọng nữ Mỹ chuẩn

  // Alternate voices cho đa dạng như TOEIC thật
  const alternateVoices = {
    male: ['en-US-Standard-B', 'en-US-Standard-D'],
    female: ['en-US-Standard-C', 'en-US-Standard-E']
  };

  // Chọn giọng đọc với một chút đa dạng
  const questionNumber = practiceQuestion.questionNumber || 1;
  const questionVoice = Math.random() > 0.5 ? 
    alternateVoices.female[questionNumber % 2] : alternateVoices.male[questionNumber % 2];
  const responseVoice = questionVoice === alternateVoices.female[questionNumber % 2] ? 
    alternateVoices.male[(questionNumber + 1) % 2] : alternateVoices.female[(questionNumber + 1) % 2];

  // Nội dung văn bản
  const questionText = practiceQuestion.question || '';
  const responseA = practiceQuestion.choices?.A || '';
  const responseB = practiceQuestion.choices?.B || '';
  const responseC = practiceQuestion.choices?.C || '';

  // SSML với thiết lập giống TOEIC thật
  const ssmlContent = `
    <speak>
      <voice name="${maleVoice}">
        <prosody rate="0.9" pitch="0st">
          Number ${questionNumber}.
          <break time="1.0s"/>
        </prosody>
      </voice>
      
      <voice name="${questionVoice}">
        <prosody rate="0.85" pitch="0st">
          ${fixPronunciation(questionText)}
        </prosody>
      </voice>

      <break time="1.5s"/>

      <voice name="${responseVoice}">
        <prosody rate="0.9" pitch="0st">
          <emphasis level="moderate">A.</emphasis>
          <break time="0.3s"/>
          ${fixPronunciation(responseA)}
        </prosody>
      </voice>

      <break time="1.0s"/>

      <voice name="${responseVoice}">
        <prosody rate="0.9" pitch="0st">
          <emphasis level="moderate">B.</emphasis>
          <break time="0.3s"/>
          ${fixPronunciation(responseB)}
        </prosody>
      </voice>

      <break time="1.0s"/>

      <voice name="${responseVoice}">
        <prosody rate="0.9" pitch="0st">
          <emphasis level="moderate">C.</emphasis>
          <break time="0.3s"/>
          ${fixPronunciation(responseC)}
        </prosody>
      </voice>
    </speak>
  `;

  // Gửi yêu cầu Google TTS với config giống TOEIC
  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { ssml: ssmlContent },
      voice: {
        languageCode: 'en-US'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9,  // Tốc độ chuẩn TOEIC
        pitch: 0.0,         // Pitch trung tính
        volumeGainDb: 0.0,  // Volume chuẩn
        effectsProfileId: ['headphone-class-device'] // Tối ưu cho headphone
      }
    })
  });

  const result = await response.json();
  if (result.audioContent) {
    return `data:audio/mp3;base64,${result.audioContent}`;
  }
  throw new Error('Audio generation failed');
}

// Hàm sinh 1 câu luyện tập TOEIC Part 2 theo yêu cầu người dùng (dùng cho Chatbot)
export async function generateToeicPracticeQuestionPart2(userRequest: string): Promise<any> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  const endpoint = "https://api.openai.com/v1/chat/completions";
  
  const messages = [
    {
      role: "system",
      content: `Bạn là giáo viên TOEIC, chuyên tạo bài luyện tập TOEIC Part 2 (Question & Response) theo yêu cầu. Hãy sinh ra 1 câu hỏi luyện tập TOEIC Part 2 phù hợp với yêu cầu sau của người dùng.

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
    "question": "...",
    "choices": { "A": "...", "B": "...", "C": "..." },
    "choicesVi": { "A": "...", "B": "...", "C": "..." },
    "correctAnswer": "A" | "B" | "C",
    "explanation": "...", // Giải thích bằng tiếng Việt
    "tips": "...", // Mẹo làm bài bằng tiếng Việt
    "type": "WH-question" | "Yes/No" | "Statement-Response" | "Choice",
    "answerType": "location" | "time" | "person" | "reason" | "yes_no" | "agreement" | "solution" | "choice"
  }
}

== LOẠI CÂU HỎI PART 2 ==
type                | Mô tả  
--------------------|--------------------------------------  
WH-question         | What, Where, When, Who, Why, How  
Yes/No              | Câu hỏi Yes/No  
Statement-Response  | Câu phát biểu + phản hồi  
Choice              | Câu hỏi lựa chọn  

== LOẠI ĐÁP ÁN ==
answerType          | Mô tả  
--------------------|--------------------------------------  
location            | Địa điểm, nơi chốn  
time                | Thời gian, thời điểm  
person              | Người, chủ thể  
reason              | Lý do, nguyên nhân  
yes_no              | Xác nhận/phủ định  
agreement           | Đồng ý/hỗ trợ  
solution            | Giải pháp/hành động  
choice              | Lựa chọn cụ thể  

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

// Hàm tạo audio base64 cho Part 2 từ Google TTS (dùng cho Chatbot)
export async function generateAudioBase64Part2(practiceQuestion: any): Promise<string> {
  console.log('Generating audio for Part 2:', practiceQuestion);
  const GOOGLE_TTS_KEY = process.env.REACT_APP_GOOGLE_TTS_KEY || 'AIzaSyAqO6_hgidkr_qandEMZUJlBcAhF3xOsUk';
  
  function fixPronunciation(text: string) {
    let fixedText = text;
    fixedText = fixedText.replace(/\ba man\b/gi, '<phoneme alphabet="ipa" ph="ə mæn">a man</phoneme>');
    fixedText = fixedText.replace(/\ba woman\b/gi, '<phoneme alphabet="ipa" ph="ə ˈwʊmən">a woman</phoneme>');
    fixedText = fixedText.replace(/\ba person\b/gi, '<phoneme alphabet="ipa" ph="ə ˈpɜrsən">a person</phoneme>');
    return fixedText;
  }
  
  const questionNumber = practiceQuestion.questionNumber || 1;
  const questionText = practiceQuestion.question || '';
  const answerA = practiceQuestion.choices.A || '';
  const answerB = practiceQuestion.choices.B || '';
  const answerC = practiceQuestion.choices.C || '';

  // Hàm tạo SSML cho từng đáp án, tách label và nội dung
  function renderChoiceSSML(label: string, text: string) {
    return `
      <voice name="en-US-Wavenet-D">
        <prosody rate="medium" pitch="medium">${label}.</prosody>
      </voice>
      <break time="0.3s"/>
      <voice name="en-US-Wavenet-D">
        <prosody rate="medium" pitch="medium">${fixPronunciation(text)}</prosody>
      </voice>
    `;
  }

  const ssmlContent = `
    <speak>
      <voice name="en-US-Wavenet-D">
        <prosody rate="slow" pitch="medium">
          Question ${questionNumber}.
        </prosody>
      </voice>
      <break time="1.2s"/>
      <voice name="en-US-Wavenet-F">
        <prosody rate="medium" pitch="medium">
          ${fixPronunciation(questionText)}
        </prosody>
      </voice>
      <break time="1.5s"/>
      ${renderChoiceSSML('A', answerA)}
      <break time="1s"/>
      ${renderChoiceSSML('B', answerB)}
      <break time="1s"/>
      ${renderChoiceSSML('C', answerC)}
    </speak>
  `;

  console.log("ssmlContent", ssmlContent);
  
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
  console.log('Google TTS response:', result);
  if (result.audioContent) {
    console.log('Audio generated successfully for Part 2');
    return `data:audio/mp3;base64,${result.audioContent}`;
  }
  console.error('Google TTS failed:', result);
  throw new Error('Audio generation failed: ' + JSON.stringify(result));
}

 