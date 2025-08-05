// Hàm gọi OpenAI API
export async function analyzeWithAI(logText: string): Promise<any> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  const endpoint = "https://api.openai.com/v1/chat/completions";
  
  // Random đáp án đúng trước khi gửi yêu cầu AI
  const correctAnswer = await getRandomAnswer();

  // console.log("correctAnswer", correctAnswer);
  // console.log("logText", logText);

  const messages = [
    {
      role: "system",
      content: "Bạn là một giáo viên TOEIC Part 1 thông minh của ETS, chuyên phân tích lỗi học viên và đưa ra bài luyện tập chính xác theo từng lỗi."
    },
    {
      role: "user",
      content: `Đây là câu mà học viên ${logText}

                        == YÊU CẦU XỬ LÝ ==
                        Bạn thực hiện 2 việc:

                        1. Phân tích lỗi học viên, trả về các mục sau bằng tiếng việt:
                        - mainError: lỗi chính người học mắc phải (ngắn gọn, tập trung vào lỗi MCQ Steps hoặc Audio Question)
                        - reasons: mảng gồm 2–3 nguyên nhân cụ thể (phân tích từng step sai và lý do)
                        - solutions: mảng gồm 2–3 giải pháp rõ ràng, đơn giản để cải thiện (tập trung vào cách học từ vựng và nghe hiểu)

                        2. Tạo câu hỏi luyện tập mới với đáp án đúng BẮT BUỘC là "${correctAnswer} với level intermediate"

                        == QUAN TRỌNG: ĐÁP ÁN ĐÚNG PHẢI LÀ "${correctAnswer}" ==
                        Bạn PHẢI tạo câu hỏi sao cho đáp án đúng là "${correctAnswer}". Điều này BẮT BUỘC!

                        == THAM KHẢO ĐỀ ETS == 
                            Test 1:
                              Number one. Look at the picture marked number one in your test book. 
                              A. She's eating in a picnic area. 
                              B. She's waiting in line at a food truck. 
                              C. She's wiping off a bench. 
                              D. She's throwing away a plate. 
                              Number two. Look at the picture marked number two in your test book. 
                              
                              A. The man is brushing snow off the roof of a car. 
                              B. The man is standing in the snow beside a car. 
                              C. The man is shoveling snow from a walkway. 
                              D. The man is running through the snow. 
                              Go on to the next page. Number three. Look at the picture marked number three in your test book. 
                              
                              A. Some workers are hanging art in a gallery. 
                              B. Two of the people are having a conversation. 
                              C. One of the men is rearranging cushions on a sofa. 
                              D. One of the men is painting a picture. 
                              Number four. Look at the picture marked number four in your test book. 
                              
                              A. Vehicles are entering a parking garage. 
                              B. Clothes hangers are scattered on the ground. 
                              C. Empty racks are lined up next to a building. 
                              D. Clothing is being displayed under a tent. 
                              Number five. Look at the picture marked number five in your test book. 
                              
                              A. Potted plants have been suspended from a ceiling. 
                              B. Chairs have been stacked in front of an entryway. 
                              C. A computer station has been set up on a desk. 
                              D. A rug has been rolled up against a wall. 
                              Number six. Look at the picture marked number six in your test book. 
                              
                              A. One of the men is sweeping a patio. 
                              B. One of the men is replacing some flooring. 
                              C. A door has been taken off its frame. 
                              D. A light fixture has been left on the ground.
                              Test 2
                              Number one. Look at the picture marked number one in your test book. 
                              
                              A. She's inserting a cord into an outlet. 
                              B. She's pressing a button on a machine. 
                              C. She's gripping the handle of a drawer. 
                              D. She's tacking a notice onto the wall. 
                              Number two. Look at the picture marked number two in your test book. 
                              
                              A. Some window shutters are being replaced. 
                              B. A pillow is being arranged on a seat. 
                              C. An outdoor table is being cleared off. 
                              D. Some wooden boards are being painted. 
                              D. She's putting a piece of wood on the table. 
                              Go on to the next page. Number three. Look at the picture marked number three in your test book. 
                              
                              A. Some utensils have been discarded in a bin. 
                              B. Some bottles are being emptied into a sink. 
                              C. A rolling chair has been placed next to a counter. 
                              D. Some drawers have been left open. 
                              Number four. Look at the picture marked number four in your test book. 
                              
                              A. A man is chopping some wood into pieces. 
                              B. Leaves are scattered across the grass. 
                              C. A man is closing a window
                              D. Wood is piled near a fence. 
                              Number five. Look at the picture marked number five in your test book
                              
                              A. People are standing in line in a lobby. 
                              B. Items are being loaded into shopping bags. 
                              C. Tents have been set up in a parking area. 
                              D. A worker is putting up a canopy. 
                              Number six. Look at the picture marked number six in your test book. 
                              
                              A. Some luggage is stacked next to an escalator. 
                              B. A suitcase is being lifted onto a shuttle bus. 
                              C. Some suitcases are displayed in a shop window. 
                              D. A luggage rack has two levels.
                              Test 3
                              Number one. Look at the picture marked number one in your test book. 
                              
                              A. She's cleaning an oven. 
                              B. She's moving a pot. 
                              C. She's opening a cabinet. 
                              D. She's holding a towel. 
                              Number two. Look at the picture marked number two in your test book. 
                              
                              A. They're putting trash in a bag. 
                              B. They're taking off their jackets. 
                              C. They're facing a shelving unit. 
                              D. They're painting a room. 
                              Go on to the next page. Number three. Look at the picture marked number three in your test book. 
                              
                              A. One of the men is removing his hat. 
                              B. A line of customers extends out a door. 
                              C. Some workers are installing a sign. 
                              D. Musicians have gathered in a circle. 
                              Number four. Look at the picture marked number four in your test book. 
                              
                              A. Some tools have been left on a chair. 
                              B. Some tool sets have been laid out. 
                              C. A cup of coffee has spilled. 
                              D. A table leg is being repaired. 
                              Number five. Look at the picture marked number five in your test book. 
                              
                              A. A railing is being removed. 
                              B. A roof is under construction. 
                              C. Some workers are carrying a ladder. 
                              D. Some workers are holding sheets of metal. 
                              Number six. Look at the picture marked number six in your test book. 
                              
                              A. A ladder has been leaned against a tree. 
                              B. There are piles of tree branches discarded in a field. 
                              C. Wooden benches have been arranged in a circle. 
                              D. A wooden structure has been built near some trees.

                              Test 4
                              Number one. Look at the picture marked number one in your test book. 
                              
                              A. He's cleaning the floor. 
                              B. He's setting a plant on a shelf. 
                              C. He's pouring some liquid into a cup. 
                              D. He's ironing a shirt. 
                              Number two. Look at the picture marked number two in your test book. 
                              
                              A. They're glancing at a monitor. 
                              B. They're putting pens in a jar. 
                              C. They're wiping off a desk. 
                              D. They're examining a document. 
                              Go on to the next page. Number three. Look at the picture marked number three in your test book. 
                              
                              A. Some people are taking a ride on a boat. 
                              B. A boat is floating under a bridge. 
                              C. A boat is being loaded with cargo. 
                              D. Some people are rowing a boat past a lighthouse. 
                              Number four. Look at the picture marked number four in your test book. 
                              
                              A. There's a fire burning in a fireplace. 
                              B. There's a guitar beside a fireplace. 
                              C. Some cables have been left on the ground in a pile. 
                              D. A television is being packed into a box. 
                              Number five. Look at the picture marked number five in your test book. 
                              
                              A. Some people are riding bicycles through a field. 
                              B. Some people are moving a picnic table. 
                              C. There are some mountains in the distance. 
                              D. A bicycle has fallen over on the ground. 
                              Number six. Look at the picture marked number six in your test book. 
                              
                              A. Some couches have been pushed against a wall. 
                              B. Some lights have been hung from the ceiling. 
                              C. Some cushions have been stacked on the floor. 
                              D. Some flowers have been arranged in a vase. 


                        2. Sinh một câu luyện tập mới để khắc phục lỗi sai nhưng khác với câu hỏi cũ và phải đa dạng từ vựng cũng như chủ thể như đề ETS (giống cấu trúc đề TOEIC Part 1), gồm:
                        - imageDescription: mô tả ảnh chi tiết bằng tiếng anh
                        - mcqSteps: 3 bước MCQ với từng bước có 4 options (A/B/C/D), mỗi option có text, pronunciation, meaning, isCorrect
                        - audioQuestion: câu hỏi audio với choices A/B/C, mỗi choice có english và vietnamese
                        - correctAnswer: "A" / "B" / "C" / "D"
                        - traps: mô tả các bẫy được gài

                        == HƯỚNG DẪN PHÂN TÍCH MCQ STEPS ==
                        - Step 1: Từ vựng về chủ thể (người, vật) - nếu sai thì học viên yếu về từ vựng chủ thể
                        - Step 2: Từ vựng về hành động - nếu sai thì học viên yếu về động từ hành động
                        - Step 3: Từ vựng về vị trí/địa điểm - nếu sai thì học viên yếu về từ vựng địa điểm
                        - Nếu tất cả steps đúng nhưng audio question sai: học viên yếu về kỹ năng nghe hiểu

                        == YÊU CẦU ĐẦU RA ==
                        Trả về JSON object duy nhất với format:
                        {
                          "analysis": {
                            "mainError": "...",
                            "reasons": ["...", "...", "..."],
                            "solutions": ["...", "...", "..."]
                          },
                          "practiceQuestion": {
                            "questionNumber": 1,
                            "level": "beginner|intermediate|advanced",
                            "imageDescription": "...",
                            "mcqSteps": [...],
                            "audioQuestion": {
                              "choices": { "A": {...}, "B": {...}, "C": {...}, "D": {...} },
                              "correctAnswer": "${correctAnswer}",
                              "traps": "..."
                            }
                          }
                        }

                        == QUAN TRỌNG: ĐÁP ÁN ĐÚNG PHẢI LÀ "${correctAnswer}" ==
                        Trả về duy nhất 1 object JSON với schema sau ví dụ:

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
                          "questionNumber": 1,
                          "level": "Basic",
                          "type": "people",
                          "imageDescription": "A woman is eating alone from a plate of food placed on a table, sitting on a bench at a stone picnic table near a parked car in a rest area.",
                          "mcqSteps": [
                            {
                              "stepNumber": 1,
                              "options": [
                                {
                                  "value": "woman",
                                  "text": "woman",
                                  "pronunciation": "/ˈwʊmən/",
                                  "meaning": "người phụ nữ",
                                  "isCorrect": true
                                },
                                {
                                  "value": "man",
                                  "text": "man",
                                  "pronunciation": "/mæn/",
                                  "meaning": "người đàn ông",
                                  "isCorrect": false
                                },
                                {
                                  "value": "food truck",
                                  "text": "food truck",
                                  "pronunciation": "/ˈfʊd ˈtrʌk/",
                                  "meaning": "xe bán thức ăn",
                                  "isCorrect": false
                                },
                                {
                                  "value": "table",
                                  "text": "table",
                                  "pronunciation": "/ˈtɛbl/",
                                  "meaning": "bàn",
                                  "isCorrect": false
                                }
                              ]
                            },
                            {
                              "stepNumber": 2,
                              "options": [
                                {
                                  "value": "eating",
                                  "text": "eating",
                                  "pronunciation": "/ˈiːtɪŋ/",
                                  "meaning": "đang ăn",
                                  "isCorrect": true
                                },
                                {
                                  "value": "waiting",
                                  "text": "waiting",
                                  "pronunciation": "/ˈweɪtɪŋ/",
                                  "meaning": "đang chờ",
                                  "isCorrect": false
                                },
                                {
                                  "value": "reading",
                                  "text": "reading",
                                  "pronunciation": "/ˈriːdɪŋ/",
                                  "meaning": "đang đọc",
                                  "isCorrect": false
                                },
                                {
                                  "value": "talking",
                                  "text": "talking",
                                  "pronunciation": "/ˈtɔːkɪŋ/",
                                  "meaning": "đang nói chuyện",
                                  "isCorrect": false
                                }
                              ]
                            },
                            {
                              "stepNumber": 3,
                              "options": [
                                {
                                  "value": "picnic area",
                                  "text": "picnic area",
                                  "pronunciation": "/ˈpɪknɪk ˈeəriə/",
                                  "meaning": "khu vực picnic",
                                  "isCorrect": true
                                },
                                {
                                  "value": "restaurant",
                                  "text": "restaurant",
                                  "pronunciation": "/ˈrestrɒnt/",
                                  "meaning": "nhà hàng",
                                  "isCorrect": false
                                },
                                {
                                  "value": "office",
                                  "text": "office",
                                  "pronunciation": "/ˈɒfɪs/",
                                  "meaning": "văn phòng",
                                  "isCorrect": false
                                },
                                {
                                  "value": "home",
                                  "text": "home",
                                  "pronunciation": "/həʊm/",
                                  "meaning": "nhà",
                                  "isCorrect": false
                                }
                              ]
                            }
                          ],
                          
                          "audioQuestion": {
                            "choices": {
                              "A": {
                                "english": "She's eating in a picnic area.",
                                "vietnamese": "Cô ấy đang ăn trong khu vực picnic."
                              },
                              "B": {
                                "english": "She's waiting in line at a food truck.",
                                "vietnamese": "Cô ấy đang chờ xếp hàng tại xe bán thức ăn."
                              },
                              "C": {
                                "english": "She's wiping off a bench.",
                                "vietnamese": "Cô ấy đang lau ghế."
                              },
                              "D": {
                                "english": "She's throwing away a plate.",
                                "vietnamese": "Cô ấy đang vứt một cái đĩa."
                              }
                            },
                            "correctAnswer": "A",
                            "traps": "Trong ảnh có hình chiếc xe nên sẽ bị nhầm qua câu B là food truck, câu C có từ bench nên sẽ bị nhầm vì trong ảnh người phụ nữ đang ngồi trên bench, còn câu D có hình ảnh chiếc đĩa (plate) nên nếu không nghe kĩ hành động thì sẽ bị lừa cả 3 câu"
                          }
                        } 
                        }

                        == QUY TẮC BẮT BUỘC ==
                        - MCQ Steps: 3 bước, mỗi bước 4 options (A/B/C/D), chỉ 1 đáp án đúng
                        - Step 1: Từ vựng về chủ thể (người, vật)
                        - Step 2: Từ vựng về hành động
                        - Step 3: Từ vựng về vị trí/địa điểm
                        - Audio Question: 4 choices (A/B/C/D), chỉ 1 đáp án đúng
                        - Đáp án đúng là đáp án mô tả chính xác vật thể trong ảnh
                        - Đáp án sai là đáp án có các lỗi sai như:
                        + Sai về hành động
                        + Sai về vị trí/địa điểm
                        + Sai về số lượng
                        + Sai về thời gian
                        - Đáp án sai tránh sử dụng các từ đồng nghĩa hoặc có nghĩa hao hao giống mô tả
                        - Không được đưa các đáp án sai có tính không chắn chắn
                        - Không nên đưa các đáp án sai có tính chung chung dẫn đến đáp án sai bị đúng

                        == QUY TRÌNH KIỂM TRA NHANH ==
                        - Đánh dấu chủ thể – hành động – vị trí – số lượng trong imageDescription.
                        - Đối chiếu từng lựa chọn: chỉ cần đúng với ảnh, không cần đầy đủ so với ảnh; Câu sai lệch ≥ 1 yếu tố.
                        - Kiểm tra:
                        + Số từ (≤15)
                        + Không màu sắc/ánh sáng
                        + Dùng đúng thì hiện tại tiếp diễn
                        + traps phải là giải thích cặn kẽ bằng tiếng Việt
                        - Đảm bảo output là object JSON duy nhất
                        - Câu từ trả về phải đúng ngữ pháp
                        - Đáp án đúng phải là "${correctAnswer}"
                        - 👉 CHỈ TRẢ VỀ JSON, KHÔNG GIẢI THÍCH, KHÔNG MARKDOWN.
                        `
    }
  ];

  // console.log("Sending request to OpenAI...");
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
      max_tokens: 3048,
      top_p: 1.0
    })
  });

  // console.log("Response status:", response.status);
  if (!response.ok) {
    console.error("Response error:", response.statusText);
    if (response.status === 401) {
      throw new Error("OpenAI API key is invalid or expired. Please check your REACT_APP_OPENAI_API_KEY environment variable.");
    }
    throw new Error("OpenAI API error: " + response.statusText);
  }

  const data = await response.json();
  // console.log("OpenAI response received");
  // console.log("AI response content:", data.choices[0].message.content);
  
  // Parse JSON và kiểm tra đáp án đúng
  try {
    const result = JSON.parse(data.choices[0].message.content);
    // console.log("Parsed result:", result);
    
    // Đảm bảo đáp án đúng khớp với đáp án đã random
    if (result.practiceQuestion && result.practiceQuestion.audioQuestion && 
        result.practiceQuestion.audioQuestion.correctAnswer !== correctAnswer) {
      console.warn(`AI trả về đáp án ${result.practiceQuestion.audioQuestion.correctAnswer} nhưng yêu cầu là ${correctAnswer}`);
      // Có thể thêm logic để sửa đáp án nếu cần
    }
    
    return result;
  } catch (e) {
    console.error("JSON parse error:", e);
    console.error("Raw content:", data.choices[0].message.content);
    // Nếu không parse được JSON, trả về content gốc
    return data.choices[0].message.content;
  }
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
  // console.log(imageDescription);
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
  console.log('practiceQuestion:', practiceQuestion);
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
  const questionText = `Number ${questionNumber}. Look at the picture marked number ${questionNumber} in your textbook.`;
  const answerA = practiceQuestion.audioQuestion?.choices?.A?.english || '';
  const answerB = practiceQuestion.audioQuestion?.choices?.B?.english || '';
  const answerC = practiceQuestion.audioQuestion?.choices?.C?.english || '';
  const answerD = practiceQuestion.audioQuestion?.choices?.D?.english || '';
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
        <break time="0.8s"/>
        <prosody rate="medium" pitch="medium">
          D. ${fixPronunciation(answerD)}
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

// Hàm random đáp án ABCD với logic tránh trùng lặp và phân bố đều
async function getRandomAnswer(): Promise<string> {
  const answers = ['A', 'B', 'C', 'D'];
  
  try {
    // Import động để tránh circular dependency
    const { getLatestQuestion, getAnswerDistribution } = await import('../../services/practiceService');
    
    // Lấy phân bố đáp án hiện tại
    const distribution = await getAnswerDistribution();
    const lastCorrectAnswer = await getLatestQuestion();
    
    // console.log('📊 Phân bố đáp án hiện tại:', distribution);
    // console.log('🔄 Đáp án câu trước:', lastCorrectAnswer);
    
    // Tính tổng số câu hỏi
    const totalQuestions = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    
    if (totalQuestions > 0) {
      // Tìm đáp án có tần suất thấp nhất
      const minCount = Math.min(...Object.values(distribution));
      const leastUsedAnswers = answers.filter(answer => distribution[answer as keyof typeof distribution] === minCount);
      
      // console.log('📈 Đáp án ít dùng nhất:', leastUsedAnswers, '(số lần:', minCount, ')');
      
      // Nếu có đáp án trùng với câu trước, ưu tiên đáp án ít dùng nhất
      if (lastCorrectAnswer && answers.includes(lastCorrectAnswer)) {
        const filteredLeastUsed = leastUsedAnswers.filter(answer => answer !== lastCorrectAnswer);
        // console.log('🚫 Đáp án ít dùng (khác câu trước):', filteredLeastUsed);
        
        if (filteredLeastUsed.length > 0) {
          // 95% xác suất chọn đáp án ít dùng nhất (khác câu trước)
          if (Math.random() < 0.95) {
            const result = filteredLeastUsed[Math.floor(Math.random() * filteredLeastUsed.length)];
            // console.log('✅ Chọn đáp án ít dùng (khác câu trước):', result);
            return result;
          }
        } else if (leastUsedAnswers.length > 0) {
          // Nếu tất cả đáp án ít dùng đều trùng, chọn ngẫu nhiên
          const result = leastUsedAnswers[Math.floor(Math.random() * leastUsedAnswers.length)];
          // console.log('⚠️ Chọn đáp án ít dùng (có trùng):', result);
          return result;
        }
      } else {
        // Không có câu trước, chọn đáp án ít dùng nhất
        const result = leastUsedAnswers[Math.floor(Math.random() * leastUsedAnswers.length)];
        // console.log('🎯 Chọn đáp án ít dùng nhất:', result);
        return result;
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra phân bố đáp án:', error);
  }
  
  // Fallback: random bình thường
  const result = answers[Math.floor(Math.random() * answers.length)];
  // console.log('🔄 Fallback random:', result);
  return result;
}

// Hàm shuffle array để random thứ tự đáp án
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Hàm sinh 1 câu luyện tập TOEIC theo yêu cầu người dùng
export async function generateToeicPracticeQuestion(userRequest: string): Promise<any> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  const endpoint = "https://api.openai.com/v1/chat/completions";
  
  // Random đáp án đúng trước khi gửi yêu cầu AI
  const correctAnswer = await getRandomAnswer();
  
  const messages = [
    {
      role: "system",
      content: `Bạn là sẽ là người ra đề Toeic của ETS, chuyên tạo bài luyện tập TOEIC Part 1 theo yêu cầu. Hãy sinh ra 1 câu hỏi luyện tập TOEIC phù hợp với yêu cầu sau của người dùng.

== HƯỚNG DẪN PHÂN TÍCH LEVEL ==
Tự động nhận diện mức độ khó từ yêu cầu người dùng:
- Level 1/Beginner: Từ khóa "dễ", "cơ bản", "đơn giản", "level 1", "beginner"
- Level 2/Intermediate: Từ khóa "trung bình", "vừa phải", "level 2", "intermediate" hoặc không có từ khóa level
- Level 3/Advanced: Từ khóa "khó", "nâng cao", "phức tạp", "level 3", "advanced"

== YÊU CẦU NGƯỜI DÙNG ==
${userRequest}

== QUAN TRỌNG: ĐÁP ÁN ĐÚNG PHẢI LÀ "${correctAnswer}" ==
Bạn phải tạo câu hỏi sao cho đáp án đúng là "${correctAnswer}". Điều này rất quan trọng!

== ĐẦU RA PHẢI LÀ OBJECT JSON DUY NHẤT, KHÔNG GIẢI THÍCH, KHÔNG MARKDOWN ==

Đây là mẫu Schema để tham khảo:
{
  "practiceQuestion": {
    "questionNumber": 1,
    "level": "beginner|intermediate|advanced",
    "imageDescription": "...",
    "mcqSteps": [...],
    "audioQuestion": {
      "choices": {
        "A": {
          "english": "She's eating in a picnic area.",
          "vietnamese": "Cô ấy đang ăn trong khu vực picnic."
        },
        "B": {
          "english": "She's waiting in line at a food truck.",
          "vietnamese": "Cô ấy đang chờ xếp hàng tại xe bán thức ăn."
        },
        "C": {
          "english": "She's wiping off a bench.",
          "vietnamese": "Cô ấy đang lau ghế."
        },
        "D": {
          "english": "She's throwing away a plate.",
          "vietnamese": "Cô ấy đang vứt một cái đĩa."
        }
      },
      "correctAnswer": "A",
      "traps": "Trong ảnh có hình chiếc xe nên sẽ bị nhầm qua câu B là food truck, câu C có từ bench nên sẽ bị nhầm vì trong ảnh người phụ nữ đang ngồi trên bench, còn câu D có hình ảnh chiếc đĩa (plate) nên nếu không nghe kĩ hành động thì sẽ bị lừa cả 3 câu"
    }
  }
}

== QUY TẮC TẠO CÂU HỎI THEO LEVEL ==
- Beginner: Từ vựng cơ bản, cấu trúc đơn giản, bẫy dễ nhận biết
- Intermediate: Từ vựng phổ thông, cấu trúc vừa phải, bẫy thông minh  
- Advanced: Từ vựng nâng cao, cấu trúc phức tạp, bẫy tinh vi
- Mô tả ảnh phải là tiếng Anh, không dùng tiếng Việt
- traps phải là giải thích cặn kẽ bằng tiếng Việt
- Không được ra những câu đã ra trước đó
- ĐÁP ÁN ĐÚNG PHẢI LÀ "${correctAnswer}" - ĐIỀU NÀY BẮT BUỘC!`
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
    
    // Đảm bảo đáp án đúng khớp với đáp án đã random
    if (result.practiceQuestion && result.practiceQuestion.correctAnswer !== correctAnswer) {
      // console.warn(`AI trả về đáp án ${result.practiceQuestion.correctAnswer} nhưng yêu cầu là ${correctAnswer}`);
      // Có thể thêm logic để sửa đáp án nếu cần
    }
    
    return result;
  } catch (e) {
    throw new Error("Lỗi parse JSON từ AI: " + data.choices[0].message.content);
  }
} 

// Hàm retry với exponential backoff
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt === maxRetries || !error.message.includes('Rate limit exceeded')) {
        throw error;
      }
      
      // Exponential backoff: 2^attempt seconds
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Rate limit hit, retrying in ${delay/1000} seconds... (attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

// Hàm phân tích ảnh và tạo bài tập TOEIC
export async function analyzeImageAndCreatePractice(imageUrl: string, userQuestion: string): Promise<any> {
  console.log('AI analysis started with image URL:', imageUrl);
  
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  console.log('API key available:', !!apiKey);
  
  if (!apiKey) {
    throw new Error('API key không được cấu hình. Vui lòng thêm REACT_APP_API_KEY_OPENAI vào file .env và restart ứng dụng');
  }
  
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  
  const prompt = `Bạn là chuyên gia TOEIC. Hãy phân tích ảnh này và tạo một bài tập TOEIC Part 5 (Incomplete Sentences) dựa trên yêu cầu của người dùng: "${userQuestion}".

Yêu cầu:
1. Phân tích nội dung ảnh để hiểu context
2. Tạo một câu hỏi TOEIC Part 5 với 4 đáp án A, B, C, D
3. Cung cấp giải thích chi tiết bằng tiếng Việt và đưa cấu trúc của câu trong đề bài
4. Xác định loại câu hỏi (grammar, vocabulary, etc.)
5. Đánh giá độ khó (1-5)
6. Đề xuất chủ đề (topic)

Trả về JSON với format:
{
  "practiceQuestion": {
    "imageUrl": "${imageUrl}",
    "question": "Câu hỏi tiếng Anh",
    "choices": {
      "A": "Đáp án A",
      "B": "Đáp án B", 
      "C": "Đáp án C",
      "D": "Đáp án D"
    },
    "choicesVi": {
      "A": "Đáp án A tiếng Việt",
      "B": "Đáp án B tiếng Việt",
      "C": "Đáp án C tiếng Việt", 
      "D": "Đáp án D tiếng Việt"
    },
    "correctAnswer": "A",
    "explanation": "Giải thích chi tiết bằng tiếng Việt, và đưa cấu trúc của câu trong đề bài",
    "type": "Sẽ là loại câu hỏi của TOEIC Part 5"
  }
}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Bạn là chuyên gia TOEIC với kinh nghiệm 10 năm giảng dạy. Bạn có khả năng phân tích ảnh và tạo bài tập TOEIC chất lượng cao.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      max_tokens: 3000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Vui lòng thử lại sau vài phút hoặc nâng cấp tài khoản OpenAI.');
    } else if (response.status === 401) {
      throw new Error('API key không hợp lệ hoặc đã hết hạn.');
    } else if (response.status === 403) {
      throw new Error('Tài khoản không có quyền truy cập hoặc đã hết credit.');
    } else {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    // Tìm JSON trong response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Không tìm thấy JSON trong response');
    }
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
    console.log('Raw response:', content);
    throw new Error('Lỗi phân tích response từ AI');
  }
} 

// Hàm tạo câu mẫu sử dụng từ vựng
export async function generateExampleSentence(word: string, meaning: string, type: string): Promise<any> {
  const apiKey = process.env.REACT_APP_API_KEY_OPENAI;
  
  if (!apiKey) {
    throw new Error('API key không được cấu hình. Vui lòng thêm REACT_APP_API_KEY_OPENAI vào file .env và restart ứng dụng');
  }
  
  const endpoint = 'https://api.openai.com/v1/chat/completions';
  
  const prompt = `Tạo một câu mẫu sử dụng từ "${word}" (${meaning}) - loại từ: ${type}.

Yêu cầu:
1. Tạo một câu tiếng Anh tự nhiên, đúng ngữ pháp ngắn và đơn giản
2. Sử dụng từ "${word}" trong ngữ cảnh phù hợp
3. Cung cấp bản dịch tiếng Việt
4. Câu phải dễ hiểu và thực tế

Trả về JSON với format:
{
  "exampleSentence": {
    "english": "Câu tiếng Anh mẫu",
    "vietnamese": "Bản dịch tiếng Việt",
    "wordHighlight": "${word}",
    "context": "Giải thích ngắn về cách sử dụng từ này bằng tiếng Việt"
  }
}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Bạn là giáo viên tiếng Anh chuyên tạo câu mẫu để giúp học sinh hiểu cách sử dụng từ vựng trong ngữ cảnh thực tế.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Vui lòng thử lại sau vài phút.');
    } else if (response.status === 401) {
      throw new Error('API key không hợp lệ hoặc đã hết hạn.');
    } else if (response.status === 403) {
      throw new Error('Tài khoản không có quyền truy cập hoặc đã hết credit.');
    } else {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    // Tìm JSON trong response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Không tìm thấy JSON trong response');
    }
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
    console.log('Raw response:', content);
    throw new Error('Lỗi phân tích response từ AI');
  }
} 