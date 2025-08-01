// Hàm gọi OpenAI API cho Part 4 (Short Talks)
export async function analyzeWithAI(logText: string): Promise<any> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  const endpoint = "https://api.openai.com/v1/chat/completions";

  const messages = [
    {
      role: "system",
      content: "Bạn là một giáo viên TOEIC Part 4 thông minh của ETS, chuyên phân tích lỗi học viên và đưa ra bài luyện tập chính xác theo từng lỗi."
    },
    {
      role: "user",
      content: `Đây là câu mà học viên ${logText}

                        == YÊU CẦU XỬ LÝ ==
                        Bạn thực hiện 2 việc:

                        1. Phân tích lỗi học viên, trả về các mục sau bằng tiếng việt:
                        - mainError: lỗi chính người học mắc phải (ngắn gọn)
                        - reasons: mảng gồm 2–3 nguyên nhân cụ thể
                        - solutions: mảng gồm 2–3 giải pháp rõ ràng, đơn giản để cải thiện

                        2. Sinh một câu luyện tập mới tương tự (giống cấu trúc đề TOEIC Part 4) với level tương tự, gồm:
                        - transcript: nội dung bài nói ngắn
                        - question: câu hỏi về bài nói
                        - choices: A/B/C là các đáp án
                        - choicesVi: bản dịch tiếng Việt cho mỗi đáp án
                        - correctAnswer: "A" / "B" / "C"
                        - explanation: giải thích vì sao đáp án đúng
                        - traps: mô tả các bẫy được gài
                        - type: loại câu hỏi (main idea, detail, inference, etc.)

                        == YÊU CẦU ĐẦU RA ==
                        Trả về duy nhất 1 object JSON với schema sau:

                        {
                        "questionNumber": 1,
                        "analysis": {
                            "correctAnswer": "...",
                            "chosenAnswer": "...",
                            "mainError": "...",
                            "reasons": ["...", "..."],
                            "solutions": ["...", "..."]
                        },
                        "practiceQuestion": {
                            "transcript": "...",
                            "question": "...",
                            "choices": {
                            "A": "...",
                            "B": "...",
                            "C": "..."
                            },
                            "choicesVi": {
                            "A": "...",
                            "B": "...",
                            "C": "..."
                            },
                            "correctAnswer": "A" | "B" | "C",
                            "explanation": "...",
                            "traps": "...",
                            "type": "..."
                        }
                        }

                        == DANH MỤC BẪY ==
                        trapId            | Tên               | Mô tả  
                        ------------------|-------------------|--------------------------------------  
                        keywordMisuse     | Keyword Misuse    | Từ đúng nhưng sai ngữ cảnh  
                        assumption        | Assumption        | Suy luận không có trong bài  
                        similarSound      | Similar Sound     | Nhầm lẫn do âm giống  
                        homophone         | Homophone         | Từ đồng âm khác nghĩa  
                        misfocus          | Misfocus          | Tập trung vào chi tiết phụ  
                        timeConfusion     | Time Confusion    | Nhầm lẫn về thời gian  
                        numberConfusion   | Number Confusion  | Nhầm lẫn về số liệu  

                        == QUY TẮC BẮT BUỘC ==
                        - Đáp án đúng phải có trong transcript hoặc có thể suy luận trực tiếp
                        - Đáp án sai là đáp án có các lỗi sai như:
                        + Sai về thông tin cụ thể
                        + Sai về thời gian/địa điểm
                        + Sai về số liệu
                        + Suy luận quá xa
                        - Transcript phải ngắn gọn (30-60 giây)
                        - Câu hỏi phải rõ ràng, không mơ hồ
                        - 👉 CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH, KHÔNG MARKDOWN.
                        `
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
      max_tokens: 2048,
      top_p: 1.0
    })
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("OpenAI API key is invalid or expired. Please check your REACT_APP_OPENAI_API_KEY environment variable.");
    }
    throw new Error("OpenAI API error: " + response.statusText);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Hàm tạo audio base64 từ Google TTS cho Part 4
export async function generateAudioBase64Part4(practiceQuestion: any): Promise<string> {
  const GOOGLE_TTS_KEY = process.env.REACT_APP_GOOGLE_TTS_KEY || 'AIzaSyAqO6_hgidkr_qandEMZUJlBcAhF3xOsUk';
  
  function fixPronunciation(text: string) {
    let fixedText = text;
    // Fix common pronunciation issues
    fixedText = fixedText.replace(/\ba man\b/gi, '<phoneme alphabet="ipa" ph="ə mæn">a man</phoneme>');
    fixedText = fixedText.replace(/\ba woman\b/gi, '<phoneme alphabet="ipa" ph="ə ˈwʊmən">a woman</phoneme>');
    fixedText = fixedText.replace(/\ba person\b/gi, '<phoneme alphabet="ipa" ph="ə ˈpɜrsən">a person</phoneme>');
    return fixedText;
  }

  const maleVoice = 'en-US-Wavenet-D';
  const questionNumber = practiceQuestion.questionNumber || 1;
  const transcript = practiceQuestion.transcript || '';
  const question = practiceQuestion.question || '';
  const answerA = practiceQuestion.choices?.A || '';
  const answerB = practiceQuestion.choices?.B || '';
  const answerC = practiceQuestion.choices?.C || '';

  const ssmlContent = `
    <speak>
      <voice name="${maleVoice}">
        <prosody rate="medium" pitch="medium">
          ${fixPronunciation(transcript)}
        </prosody>
        <break time="1.5s"/>
        <prosody rate="slow" pitch="medium">
          ${fixPronunciation(question)}
        </prosody>
        <break time="1.2s"/>
        <prosody rate="medium" pitch="medium">
          A. ${fixPronunciation(answerA)}
        </prosody>
        <break time="0.8s"/>
        <prosody rate="medium" pitch="medium">
          B. ${fixPronunciation(answerB)}
        </prosody>
        <break time="0.8s"/>
        <prosody rate="medium" pitch="medium">
          C. ${fixPronunciation(answerC)}
        </prosody>
      </voice>
    </speak>
  `;

  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { ssml: ssmlContent },
      voice: { languageCode: 'en-US', name: maleVoice },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9,
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

// Hàm sinh 1 câu luyện tập TOEIC Part 4 theo yêu cầu người dùng
export async function generateToeicPracticeQuestionPart4(userRequest: string): Promise<any> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  const endpoint = "https://api.openai.com/v1/chat/completions";
  
  const messages = [
    {
      role: "system",
      content: `Bạn là sẽ là người ra đề Toeic của ETS, chuyên tạo bài luyện tập TOEIC Part 4 (Short Talks) theo yêu cầu. Hãy sinh ra 1 câu hỏi luyện tập TOEIC phù hợp với yêu cầu sau của người dùng.

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
    "transcript": "...", // Nội dung bài nói ngắn (30-60 giây)
    "question": "...", // Câu hỏi về bài nói
    "choices": { "A": "...", "B": "...", "C": "..." },
    "choicesVi": { "A": "...", "B": "...", "C": "..." },
    "correctAnswer": "A" | "B" | "C",
    "explanation": "...", // Giải thích bằng tiếng Việt
    "traps": "...", // Mô tả bẫy bằng tiếng Việt
    "type": "main idea|detail|inference|purpose|attitude", // Loại câu hỏi
    "answerType": "..." // Mô tả loại đáp án
  }
}

== QUY TẮC TẠO CÂU HỎI THEO LEVEL ==
- Beginner: Từ vựng cơ bản, cấu trúc đơn giản, bẫy dễ nhận biết
- Intermediate: Từ vựng phổ thông, cấu trúc vừa phải, bẫy thông minh  
- Advanced: Từ vựng nâng cao, cấu trúc phức tạp, bẫy tinh vi
- Transcript phải là tiếng Anh, không dùng tiếng Việt
- Không được ra những câu đã ra trước đó

== LOẠI CÂU HỎI PART 4 ==
- Main idea: Ý chính của bài nói
- Detail: Chi tiết cụ thể trong bài
- Inference: Suy luận từ thông tin trong bài
- Purpose: Mục đích của bài nói
- Attitude: Thái độ của người nói
- Time/Date: Thời gian, ngày tháng
- Location: Địa điểm
- Number: Số liệu, số lượng`
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
  
  // Trả về object JSON duy nhất
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch (e) {
    throw new Error("Lỗi parse JSON từ AI: " + data.choices[0].message.content);
  }
} 