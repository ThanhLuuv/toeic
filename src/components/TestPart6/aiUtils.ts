// Hàm gọi OpenAI API cho Part 6 (Text Completion)
export async function analyzeWithAI(logText: string): Promise<any> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  const endpoint = "https://api.openai.com/v1/chat/completions";

  const messages = [
    {
      role: "system",
      content: "Bạn là một giáo viên TOEIC Part 6 thông minh của ETS, chuyên phân tích lỗi học viên và đưa ra bài luyện tập chính xác theo từng lỗi."
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

                        2. Sinh một câu luyện tập mới tương tự (giống cấu trúc đề TOEIC Part 6) với level tương tự, gồm:
                        - passage: đoạn văn với 4 chỗ trống (_____) - BẮT BUỘC PHẢI CÓ ĐÚNG 4 CHỖ TRỐNG
                        - questions: mảng gồm ĐÚNG 4 câu hỏi tương ứng với 4 chỗ trống
                        - choices: A/B/C/D là các đáp án cho từng câu hỏi
                        - choicesVi: bản dịch tiếng Việt cho mỗi đáp án
                        - correctAnswers: mảng đáp án đúng cho từng câu hỏi
                        - explanations: mảng giải thích cho từng câu hỏi
                        - traps: mô tả các bẫy được gài
                        - type: loại câu hỏi (grammar, vocabulary, context, etc.)

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
                            "passage": "...",
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
                        contextError      | Context Error     | Sai ngữ cảnh  
                        grammarError      | Grammar Error     | Lỗi ngữ pháp  
                        vocabularyError   | Vocabulary Error  | Sai từ vựng  
                        collocationError  | Collocation Error | Sai cụm từ  
                        tenseError        | Tense Error       | Sai thì  
                        prepositionError  | Preposition Error | Sai giới từ  
                        articleError      | Article Error     | Sai mạo từ  
                        similarWord       | Similar Word      | Từ tương tự nhưng sai nghĩa  

                        == QUY TẮC BẮT BUỘC ==
                        - Đoạn văn PHẢI CÓ ĐÚNG 4 CHỖ TRỐNG (_____) - KHÔNG ĐƯỢC THIẾU HOẶC THỪA
                        - Số lượng câu hỏi PHẢI BẰNG ĐÚNG số chỗ trống (4 câu hỏi cho 4 chỗ trống)
                        - Đáp án đúng phải phù hợp với ngữ cảnh và ngữ pháp
                        - Đáp án sai là đáp án có các lỗi sai như:
                        + Sai ngữ cảnh
                        + Sai ngữ pháp
                        + Sai từ vựng
                        + Sai cụm từ
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
  const content = data.choices[0].message.content;
  
  // Validate the generated content if it's JSON
  try {
    const result = JSON.parse(content);
    if (result.practiceQuestion) {
      const passage = result.practiceQuestion.passage;
      const questions = result.practiceQuestion.questions;
      
      // Count blanks in passage
      const blankCount = (passage.match(/_____/g) || []).length;
      
      // Validate number of questions matches number of blanks
      if (blankCount !== 4) {
        console.warn(`Warning: Số chỗ trống không đúng: ${blankCount} (cần 4 chỗ trống)`);
      }
      
      if (!questions || questions.length !== 4) {
        console.warn(`Warning: Số câu hỏi không đúng: ${questions?.length || 0} (cần 4 câu hỏi)`);
      }
    }
  } catch (e) {
    // If not JSON, return as is
  }
  
  return content;
}

// Hàm sinh 1 câu luyện tập TOEIC Part 6 theo yêu cầu người dùng
export async function generateToeicPracticeQuestionPart6(userRequest: string): Promise<any> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  const endpoint = "https://api.openai.com/v1/chat/completions";
  
  const messages = [
    {
      role: "system",
      content: `Bạn là người ra đề TOEIC của ETS, chuyên tạo bài luyện tập TOEIC Part 6 (Text Completion) theo yêu cầu.

== CẤU TRÚC TOEIC PART 6 ==
- 16 câu hỏi (4 đoạn văn, mỗi đoạn 4 câu hỏi)
- Mỗi đoạn văn có ĐÚNG 4 chỗ trống cần điền từ (_____)
- Số lượng câu hỏi PHẢI BẰNG ĐÚNG số chỗ trống (4 câu hỏi cho 4 chỗ trống)
- 4 lựa chọn A, B, C, D cho mỗi chỗ trống
- Tập trung vào: ngữ pháp, từ vựng, ngữ cảnh, cụm từ
- Loại văn bản: email, thư, memo, thông báo, quảng cáo, bài báo

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
    "passage": "...", // Đoạn văn với 4 chỗ trống (_____)
    "questions": [
      {
        "question": "Question 1", // Số thứ tự câu hỏi
        "choices": { "A": "...", "B": "...", "C": "...", "D": "..." },
        "choicesVi": { "A": "...", "B": "...", "C": "...", "D": "..." },
        "correctAnswer": "A" | "B" | "C" | "D",
        "explanation": "...", // Giải thích bằng tiếng Việt
        "type": "grammar|vocabulary|context|collocation|tense|preposition|article|conjunction|pronoun"
      }
    ],
    "traps": "...", // Mô tả bẫy bằng tiếng Việt
    "type": "email|letter|memo|notice|advertisement|article|report" // Loại văn bản
  }
}

== QUY TẮC TẠO BÀI TẬP THEO LEVEL ==
- Beginner: Ngữ pháp cơ bản, từ vựng đơn giản, bẫy dễ nhận biết
- Intermediate: Ngữ pháp vừa phải, từ vựng phổ thông, bẫy thông minh  
- Advanced: Ngữ pháp phức tạp, từ vựng nâng cao, bẫy tinh vi
- Đoạn văn phải là tiếng Anh, không dùng tiếng Việt
- Chỗ trống được đánh dấu bằng "_____"
- BẮT BUỘC: Đoạn văn phải có ĐÚNG 4 chỗ trống và ĐÚNG 4 câu hỏi tương ứng
- Không được ra những bài đã ra trước đó

== LOẠI CÂU HỎI PART 6 ==
- Grammar: Ngữ pháp (thì, cấu trúc câu, v.v.)
- Vocabulary: Từ vựng (nghĩa từ, từ đồng nghĩa, v.v.)
- Context: Ngữ cảnh (phù hợp với nội dung)
- Collocation: Cụm từ (từ đi kèm)
- Tense: Thì của động từ
- Preposition: Giới từ
- Article: Mạo từ (a, an, the)
- Conjunction: Liên từ
- Pronoun: Đại từ

== LOẠI VĂN BẢN PART 6 ==
- Email: Thư điện tử
- Letter: Thư tay
- Memo: Ghi nhớ
- Notice: Thông báo
- Advertisement: Quảng cáo
- Article: Bài báo
- Report: Báo cáo`
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
    const result = JSON.parse(data.choices[0].message.content);
    
    // Validate the generated content
    if (result.practiceQuestion) {
      const passage = result.practiceQuestion.passage;
      const questions = result.practiceQuestion.questions;
      
      // Count blanks in passage
      const blankCount = (passage.match(/_____/g) || []).length;
      
      // Validate number of questions matches number of blanks
      if (blankCount !== 4) {
        throw new Error(`Số chỗ trống không đúng: ${blankCount} (cần 4 chỗ trống)`);
      }
      
      if (!questions || questions.length !== 4) {
        throw new Error(`Số câu hỏi không đúng: ${questions?.length || 0} (cần 4 câu hỏi)`);
      }
    }
    
    return result;
  } catch (e) {
    throw new Error("Lỗi parse JSON từ AI: " + data.choices[0].message.content);
  }
} 