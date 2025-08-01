// Hàm gọi OpenAI API cho Part 5 (Incomplete Sentences)
export async function analyzeWithAI(logText: string): Promise<any> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  const endpoint = "https://api.openai.com/v1/chat/completions";

  const messages = [
    {
      role: "system",
      content: "Bạn là một giáo viên TOEIC Part 5 thông minh của ETS, chuyên phân tích lỗi học viên và đưa ra bài luyện tập chính xác theo từng lỗi."
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

                        2. Sinh một câu luyện tập mới tương tự (giống cấu trúc đề TOEIC Part 5) với level tương tự, gồm:
                        - sentence: câu chưa hoàn chỉnh với chỗ trống
                        - choices: A/B/C/D là các đáp án
                        - choicesVi: bản dịch tiếng Việt cho mỗi đáp án
                        - correctAnswer: "A" / "B" / "C" / "D"
                        - explanation: giải thích vì sao đáp án đúng
                        - traps: mô tả các bẫy được gài
                        - type: loại câu hỏi (grammar, vocabulary, etc.)

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
                            "sentence": "...",
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
                            "traps": "...",
                            "type": "..."
                        }
                        }

                        == DANH MỤC BẪY ==
                        trapId            | Tên               | Mô tả  
                        ------------------|-------------------|--------------------------------------  
                        grammarError      | Grammar Error     | Lỗi ngữ pháp cơ bản  
                        vocabularyError   | Vocabulary Error  | Sai từ vựng  
                        collocationError  | Collocation Error | Sai cụm từ  
                        tenseError        | Tense Error       | Sai thì  
                        prepositionError  | Preposition Error | Sai giới từ  
                        articleError      | Article Error     | Sai mạo từ  
                        similarWord       | Similar Word      | Từ tương tự nhưng sai nghĩa  

                        == QUY TẮC BẮT BUỘC ==
                        - Đáp án đúng phải đúng ngữ pháp và ngữ nghĩa
                        - Đáp án sai là đáp án có các lỗi sai như:
                        + Sai ngữ pháp
                        + Sai từ vựng
                        + Sai cụm từ
                        + Sai thì
                        - Câu chưa hoàn chỉnh phải rõ ràng, không mơ hồ
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

// Hàm sinh 1 câu luyện tập TOEIC Part 5 theo yêu cầu người dùng
export async function generateToeicPracticeQuestionPart5(userRequest: string): Promise<any> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  const endpoint = "https://api.openai.com/v1/chat/completions";
  
  const messages = [
    {
      role: "system",
      content: `Bạn là người ra đề TOEIC của ETS, chuyên tạo bài luyện tập TOEIC Part 5 (Incomplete Sentences) theo yêu cầu. 

== CẤU TRÚC TOEIC PART 5 ==
- 30 câu hỏi trắc nghiệm
- Mỗi câu có 1 chỗ trống trong câu
- 4 lựa chọn A, B, C, D
- Tập trung vào: ngữ pháp, từ vựng, cụm từ, thì, giới từ, mạo từ

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
    "sentence": "...", // Câu chưa hoàn chỉnh với chỗ trống (_____)
    "choices": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "choicesVi": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "correctAnswer": "A" | "B" | "C" | "D",
    "explanation": "...", // Giải thích bằng tiếng Việt
    "traps": "...", // Mô tả bẫy bằng tiếng Việt
    "type": "grammar|vocabulary|collocation|tense|preposition|article|conjunction|pronoun|adjective|adverb"
  }
}

== QUY TẮC TẠO CÂU HỎI THEO LEVEL ==
- Beginner: Ngữ pháp cơ bản, từ vựng đơn giản, bẫy dễ nhận biết
- Intermediate: Ngữ pháp vừa phải, từ vựng phổ thông, bẫy thông minh  
- Advanced: Ngữ pháp phức tạp, từ vựng nâng cao, bẫy tinh vi
- Câu chưa hoàn chỉnh phải là tiếng Anh, không dùng tiếng Việt
- Chỗ trống được đánh dấu bằng "_____"
- Không được ra những câu đã ra trước đó

== LOẠI CÂU HỎI PART 5 ==
- Grammar: Ngữ pháp (thì, cấu trúc câu, v.v.)
- Vocabulary: Từ vựng (nghĩa từ, từ đồng nghĩa, v.v.)
- Collocation: Cụm từ (từ đi kèm)
- Tense: Thì của động từ
- Preposition: Giới từ
- Article: Mạo từ (a, an, the)
- Conjunction: Liên từ
- Pronoun: Đại từ
- Adjective/Adverb: Tính từ/Trạng từ`
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