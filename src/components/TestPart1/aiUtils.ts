// Hàm gọi OpenAI API
export async function analyzeWithAI(logText: string): Promise<any> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  const endpoint = "https://api.openai.com/v1/chat/completions";

  const messages = [
    {
      role: "system",
      content: "Bạn là một giáo viên TOEIC Part 1 thông minh, chuyên phân tích lỗi học viên và đưa ra bài luyện tập chính xác theo từng lỗi."
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

                        2. Sinh một câu luyện tập mới tương tự (giống cấu trúc đề TOEIC Part 1) với level tương tự, gồm:
                        - imageDescription: mô tả ảnh chi tiết bằng tiếng anh
                        - choices: A/B/C là câu mô tả ảnh (chỉ 1 câu đúng)
                        - choicesVi: bản dịch tiếng Việt cho mỗi câu
                        - correctAnswer: "A" / "B" / "C"
                        - explanation: giải thích vì sao đáp án đúng
                        - traps: mô tả các bẫy được gài (ví dụ: keywordMisuse, assumption…)

                        == YÊU CẦU ĐẦU RA ==
                        Trả về duy nhất 1 object JSON với schema sau:

                        {
                        "questionNumber": 6,
                        "analysis": {
                            "correctAnswer": "...",
                            "chosenAnswer": "...",
                            "mainError": "...",
                            "reasons": ["...", "..."],
                            "solutions": ["...", "..."]
                        },
                        "practiceQuestion": {
                            "imageDescription": "...",
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
                            "traps": "..."
                        }
                        }

                        == DANH MỤC BẪY ==
                        trapId            | Tên               | Mô tả  
                        ------------------|-------------------|--------------------------------------  
                        singularPlural    | Singular ↔ Plural | Sai số ít / số nhiều  
                        keywordMisuse     | Keyword Misuse    | Từ đúng nhưng sai hành động/vị trí  
                        assumption        | Assumption        | Mô tả hành động không tồn tại  
                        similarSound      | Similar Sound     | Nhầm lẫn do âm giống  
                        homophone         | Homophone         | Từ đồng âm khác nghĩa  
                        misfocus          | Misfocus          | Tập trung vào vật phụ không quan trọng  

                        == QUY TẮC BẮT BUỘC ==
                        - Đáp án đúng là đáp án mô tả chính xác vật thể trong ảnh không cần phải mô tả đủ, chỉ cần đúng về vật thể
                        - Đáp án sai là đáp án có các lỗi sai như:
                        + Sai về hành động
                        + Sai về vị trí/địa điểm
                        + Sai về số lượng
                        + Sai về thời gian
                        - Đáp án sai tránh sử dụng các từ đồng nghĩa hoặc có nghĩa hao hao giống mô tả ví dụ "Viết trên quyển số" và "Viết lên giấy"
                        - Không được đưa các đáp án sai có tính không chắn chắn, ví dụ như Ảnh mô tả là "một con dao đặt cạnh một giỏ hoa quả", thì không nên ghi đáp án sai là "Con dao được dùng thái hoa quả"
                        - Không nên đưa các đáp án sai có tính chung chung dẫn đến đáp án sai bị đúng, ví dụ như Mô tả ảnh là "Trên bàn được bày sổ, máy tính, nút" đáp án sai lại ghi là "Bàn được bày các dụng cụ văn phòng" dẫn đến đáp án sai lại thành đúng

                        == EXAMPLE ==
                        {
                            "questionNumber": 1,
                            "imageDescription": "A black-and-white photo shows a man holding a pen beside a closed laptop on a bare table.",
                            "choices": {
                                "A": "A man is holding a pen beside a closed laptop.",
                                "B": "A man is typing on a laptop.",
                                "C": "A book is on the table."
                            },
                            "choices": {
                                "A": "A man is holding a pen beside a closed laptop.",
                                "B": "A man is typing on a laptop.",
                                "C": "A book is on the table."
                            },
                            "choicesVi": {
                                "A": "Một người đàn ông đang cầm cây bút bên cạnh máy tính xách tay đã đóng.",
                                "B": "Một người đàn ông đang gõ phím trên máy tính xách tay.",
                                "C": "Một quyển sách nằm trên bàn."
                            },
                            "correctAnswer": "A",
                            "explanation": "Đáp án A đúng vì mô tả chính xác hành động và vị trí các vật. B sai về hành động (typing thay vì holding), C sai về vật thể (book thay vì pen).",
                            "traps": "Dùng từ đúng (laptop) nhưng hành động sai (typing thay vì holding pen), Tập trung sai vào vật không có (book) thay vì vật chính (pen)"
                        }

                        == QUY TRÌNH KIỂM TRA NHANH ==
                        - Đánh dấu chủ thể – hành động – vị trí – số lượng trong imageDescription.
                        - Đối chiếu từng lựa chọn: chỉ cần đúng với ảnh, không cần đầy đủ so với ảnh; Câu sai lệch ≥ 1 yếu tố.
                        - Kiểm tra:
                        + Số từ (≤15)
                        + Không màu sắc/ánh sáng
                        + Dùng đúng thì hiện tại tiếp diễn
                        + traps có đủ, giải thích chi tiết, ví dụ bẫy ở đây là từ "ship" /ʃɪp/ → con tàu, giống từ "sheep" /ʃiːp/ → con cừu
                        - Đảm bảo output là array JSON nếu nhiều câu.
                        - Câu từ trả về phải đúng ngữ pháp nữa
                        - Đáp án đúng phải random ngẫu nhiên về A hoặc B hoặc C
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

/**
 * Phân tích ảnh TOEIC bằng OpenAI Vision API
 * @param imageBase64OrUrl: base64 hoặc url ảnh
 * @returns { description, objects, suggestions }
 */
export async function analyzeImageWithAI(imageBase64OrUrl: string): Promise<any> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  const isUrl = imageBase64OrUrl.startsWith('http');
  const messages = [
    {
      role: 'system',
      content: 'Bạn là giáo viên TOEIC Part 1, chuyên phân tích ảnh đề thi TOEIC. Hãy mô tả chi tiết ảnh, liệt kê các vật thể chính, và gợi ý các đáp án A/B/C phù hợp cho đề TOEIC.'
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Phân tích ảnh TOEIC sau, trả về object JSON gồm: description (mô tả chi tiết), objects (mảng vật thể chính), suggestions (gợi ý đáp án A/B/C cho đề TOEIC Part 1, mỗi đáp án là 1 câu tiếng Anh mô tả ảnh, chỉ 1 đáp án đúng, 2 đáp án sai).'
        },
        isUrl
          ? { type: 'text', text: imageBase64OrUrl }
          : { type: 'image_url', image_url: { url: imageBase64OrUrl } }
      ]
    }
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages,
      max_tokens: 800
    })
  });
  if (!response.ok) throw new Error('OpenAI Vision API error');
  const data = await response.json();
  // Trích xuất JSON từ response
  const match = data.choices?.[0]?.message?.content?.match(/\{[\s\S]*\}/);
  if (match) {
    return JSON.parse(match[0]);
  }
  return data.choices?.[0]?.message?.content;
}

// Hàm tạo ảnh base64 từ Gemini
export async function generateImageBase64(imageDescription: string): Promise<string> {
  const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
  console.log(imageDescription);
  const prompt = `${imageDescription}. IMPORTANT: Create a black and white photograph (monochrome, grayscale, no color), realistic and professional quality, suitable for TOEIC test, documentary style. The photo should always depict a Western setting, specifically in England or the USA. The image must look natural and unposed, similar to scenes used in standardized English exams. Do not include any color. The setting, people, and objects should clearly reflect either British or American environments.`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: { prompt },
      parameters: { sampleCount: 1 }
    })
  });
  const result = await response.json();
  if (result.predictions?.[0]?.bytesBase64Encoded) {
    return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
  }
  throw new Error('Image generation failed');
}

// Hàm tạo audio base64 từ Google TTS
export async function generateAudioBase64(practiceQuestion: any): Promise<string> {
  const GOOGLE_TTS_KEY = process.env.REACT_APP_GOOGLE_TTS_KEY || 'AIzaSyAqO6_hgidkr_qandEMZUJlBcAhF3xOsUk';
  function fixPronunciation(text: string) {
    let fixedText = text;
    fixedText = fixedText.replace(/\ba man\b/gi, '<phoneme alphabet="ipa" ph="ə mæn">a man</phoneme>');
    fixedText = fixedText.replace(/\ba woman\b/gi, '<phoneme alphabet="ipa" ph="ə ˈwʊmən">a woman</phoneme>');
    fixedText = fixedText.replace(/\ba person\b/gi, '<phoneme alphabet="ipa" ph="ə ˈpɜrsən">a person</phoneme>');
    fixedText = fixedText.replace(/\ba boy\b/gi, '<phoneme alphabet="ipa" ph="ə bɔɪ">a boy</phoneme>');
    fixedText = fixedText.replace(/\ba girl\b/gi, '<phoneme alphabet="ipa" ph="ə ɡɜrl">a girl</phoneme>');
    fixedText = fixedText.replace(/\ba dog\b/gi, '<phoneme alphabet="ipa" ph="ə dɔɡ">a dog</phoneme>');
    fixedText = fixedText.replace(/\ba cat\b/gi, '<phoneme alphabet="ipa" ph="ə kæt">a cat</phoneme>');
    fixedText = fixedText.replace(/\ba book\b/gi, '<phoneme alphabet="ipa" ph="ə bʊk">a book</phoneme>');
    fixedText = fixedText.replace(/\ba house\b/gi, '<phoneme alphabet="ipa" ph="ə haʊs">a house</phoneme>');
    fixedText = fixedText.replace(/\ba car\b/gi, '<phoneme alphabet="ipa" ph="ə kɑr">a car</phoneme>');
    return fixedText;
  }
  const maleVoice = 'en-US-Wavenet-D';
  const questionNumber = practiceQuestion.questionNumber || 1;
  const questionText = `Look at picture number ${questionNumber}.`;
  const answerA = practiceQuestion.choices.A || '';
  const answerB = practiceQuestion.choices.B || '';
  const answerC = practiceQuestion.choices.C || '';
  const ssmlContent = `
    <speak>
      <voice name="${maleVoice}">
        <prosody rate="slow" pitch="medium">
          ${fixPronunciation(questionText)}
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
        speakingRate: 0.88,
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

// Hàm sinh 1 câu luyện tập TOEIC theo yêu cầu người dùng
export async function generateToeicPracticeQuestion(userRequest: string): Promise<any> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  const endpoint = "https://api.openai.com/v1/chat/completions";
  
  const messages = [
    {
      role: "system",
      content: `Bạn là giáo viên TOEIC, chuyên tạo bài luyện tập TOEIC Part 1 theo yêu cầu. Hãy sinh ra 1 câu hỏi luyện tập TOEIC phù hợp với yêu cầu sau của người dùng.

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
    "imageDescription": "...",
    "choices": { "A": "...", "B": "...", "C": "..." },
    "choicesVi": { "A": "...", "B": "...", "C": "..." },
    "correctAnswer": "A" | "B" | "C",
    "explanation": "...", // Giải thích bằng tiếng Việt
    "traps": "...", // Mô tả bẫy bằng tiếng Việt
    "transcript": "..." // transcript audio
  }
}

== QUY TẮC TẠO CÂU HỎI THEO LEVEL ==
- Beginner: Từ vựng cơ bản, cấu trúc đơn giản, bẫy dễ nhận biết
- Intermediate: Từ vựng phổ thông, cấu trúc vừa phải, bẫy thông minh  
- Advanced: Từ vựng nâng cao, cấu trúc phức tạp, bẫy tinh vi
- Mô tả ảnh phải là tiếng Anh, không dùng tiếng Việt
- Không được ra những câu đã ra trước đó`
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