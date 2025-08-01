// Hàm gọi OpenAI API cho Part 7 (Reading Comprehension)
export async function analyzeWithAI(logText: string): Promise<any> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  const endpoint = "https://api.openai.com/v1/chat/completions";

  const messages = [
    {
      role: "system",
      content: "Bạn là một giáo viên TOEIC Part 7 thông minh của ETS, chuyên phân tích lỗi học viên và đưa ra bài luyện tập chính xác theo từng lỗi."
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

                        2. Sinh một câu luyện tập mới tương tự (giống cấu trúc đề TOEIC Part 7) với level tương tự, gồm:
                        - passages: mảng các đoạn văn (1-2 đoạn)
                        - questions: mảng các câu hỏi về đoạn văn
                        - choices: A/B/C/D là các đáp án cho từng câu hỏi
                        - choicesVi: bản dịch tiếng Việt cho mỗi đáp án
                        - correctAnswers: mảng đáp án đúng cho từng câu hỏi
                        - explanations: mảng giải thích cho từng câu hỏi
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
                            "passages": ["..."],
                            "questions": [
                                {
                                    "question": "...",
                                    "choices": {
                                        "A": "...",
                                        "B": "...",
                                        "C": "...",
                                        "D": "..."
                                    },
                                    "choicesVi": {
                                        "A": "...",
                                        "B": "...",
                                        "C": "...",
                                        "D": "..."
                                    },
                                    "correctAnswer": "A" | "B" | "C" | "D",
                                    "explanation": "...",
                                    "type": "..."
                                }
                            ],
                            "traps": "...",
                            "type": "..."
                        }
                        }

                        == DANH MỤC BẪY ==
                        trapId            | Tên               | Mô tả  
                        ------------------|-------------------|--------------------------------------  
                        mainIdeaError     | Main Idea Error   | Sai ý chính  
                        detailError       | Detail Error      | Sai chi tiết  
                        inferenceError    | Inference Error   | Sai suy luận  
                        vocabularyError   | Vocabulary Error  | Sai từ vựng  
                        contextError      | Context Error     | Sai ngữ cảnh  
                        similarWord       | Similar Word      | Từ tương tự nhưng sai nghĩa  

                        == QUY TẮC BẮT BUỘC ==
                        - Đáp án đúng phải dựa trên thông tin trong đoạn văn
                        - Đáp án sai là đáp án có các lỗi sai như:
                        + Không có trong đoạn văn
                        + Sai ý chính
                        + Sai chi tiết
                        + Sai suy luận
                        - Đoạn văn phải có logic, mạch lạc
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

// Hàm sinh 1 câu luyện tập TOEIC Part 7 theo yêu cầu người dùng
export async function generateToeicPracticeQuestionPart7(userRequest: string): Promise<any> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  const endpoint = "https://api.openai.com/v1/chat/completions";
  
  const messages = [
    {
      role: "system",
      content: `Bạn là người ra đề TOEIC của ETS, chuyên tạo bài luyện tập TOEIC Part 7 (Reading Comprehension) theo yêu cầu.

== CẤU TRÚC TOEIC PART 7 ==
- 54 câu hỏi đọc hiểu
- Đoạn văn đơn (Single passages): 29 câu hỏi
- Đoạn văn kép (Double passages): 25 câu hỏi
- Mỗi đoạn văn có 2-5 câu hỏi
- 4 lựa chọn A, B, C, D cho mỗi câu hỏi
- Tập trung vào: ý chính, chi tiết, suy luận, từ vựng, ngữ cảnh
- Loại văn bản: email, thư, memo, thông báo, quảng cáo, bài báo, báo cáo, biểu mẫu

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
    "passages": ["..."], // Mảng 1-2 đoạn văn
    "questions": [
      {
        "question": "...", // Câu hỏi về đoạn văn
        "choices": { "A": "...", "B": "...", "C": "...", "D": "..." },
        "choicesVi": { "A": "...", "B": "...", "C": "...", "D": "..." },
        "correctAnswer": "A" | "B" | "C" | "D",
        "explanation": "...", // Giải thích bằng tiếng Việt
        "type": "mainIdea|detail|inference|vocabulary|context|purpose|tone|organization"
      }
    ],
    "traps": "...", // Mô tả bẫy bằng tiếng Việt
    "type": "single|double", // Loại đoạn văn (đơn/kép)
    "passageType": "email|letter|memo|notice|advertisement|article|report|form" // Loại văn bản
  }
}

== QUY TẮC TẠO BÀI TẬP THEO LEVEL ==
- Beginner: Từ vựng đơn giản, câu ngắn, bẫy dễ nhận biết
- Intermediate: Từ vựng vừa phải, câu vừa, bẫy thông minh  
- Advanced: Từ vựng nâng cao, câu phức tạp, bẫy tinh vi
- Đoạn văn phải là tiếng Anh, không dùng tiếng Việt
- Không được ra những bài đã ra trước đó

== LOẠI CÂU HỎI PART 7 ==
- Main Idea: Ý chính của đoạn văn
- Detail: Chi tiết cụ thể trong đoạn văn
- Inference: Suy luận từ thông tin trong đoạn văn
- Vocabulary: Từ vựng (nghĩa từ, từ đồng nghĩa)
- Context: Ngữ cảnh (phù hợp với nội dung)
- Purpose: Mục đích của văn bản
- Tone: Giọng điệu của văn bản
- Organization: Cấu trúc tổ chức văn bản

== LOẠI VĂN BẢN PART 7 ==
- Email: Thư điện tử
- Letter: Thư tay
- Memo: Ghi nhớ
- Notice: Thông báo
- Advertisement: Quảng cáo
- Article: Bài báo
- Report: Báo cáo
- Form: Biểu mẫu`
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

// Hàm tạo audio cho Part 7
export async function generateAudioBase64Part7(practiceQuestion: any): Promise<string> {
  try {
    const textToSpeak = `${practiceQuestion.passages.join(' ')}. Question: ${practiceQuestion.questions.map((q: any, index: number) => 
      `${index + 1}. ${q.question} A. ${q.choices.A} B. ${q.choices.B} C. ${q.choices.C} D. ${q.choices.D}`
    ).join(' ')}`;

    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_GOOGLE_API_KEY}`
      },
      body: JSON.stringify({
        input: { text: textToSpeak },
        voice: { languageCode: 'en-US', name: 'en-US-Neural2-F' },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 0.8 }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.audioContent;
  } catch (error) {
    console.error('Lỗi khi tạo audio cho Part 7:', error);
    return '';
  }
} 