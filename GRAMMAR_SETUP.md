# Hướng dẫn Setup Firebase cho Grammar Practice

## 1. Cấu hình Firebase

Dự án đã được cấu hình với Firebase. Thông tin cấu hình trong `src/config/firebase.ts`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB4TKhzR9ffuEHWqmm0wfTRO_8nuihskA4",
  authDomain: "toeic-grammar.firebaseapp.com",
  projectId: "toeic-grammar",
  storageBucket: "toeic-grammar.firebasestorage.app",
  messagingSenderId: "952825377455",
  appId: "1:952825377455:web:3554a3c59afda594ee9a5a",
  measurementId: "G-1SNE0CJGVK"
};
```

## 2. Cấu trúc Database

### Collection: `grammar_topics`
Chứa các chủ đề ngữ pháp:

```javascript
{
  id: "tense",
  name: "Thì (Tense)",
  description: "Luyện tập các thì trong tiếng Anh: hiện tại, quá khứ, tương lai",
  questionCount: 15,
  icon: "⏰"
}
```

### Collection: `grammar_questions`
Chứa các câu hỏi ngữ pháp:

```javascript
{
  id: "q001",
  grammarTopic: "Tense",
  question: "While the manager _____ the report, the employees were discussing the proposal.",
  options: [
    {
      label: "A",
      text: "prepares",
      type: "Verb (present simple)",
      translation: "chuẩn bị"
    },
    // ... các options khác
  ],
  correctAnswer: "B",
  explanation: "Câu có 2 hành động xảy ra đồng thời trong quá khứ...",
  translation: "Trong khi người quản lý đang chuẩn bị báo cáo...",
  level: "Intermediate",
  trap: {
    type: "Tense Confusion",
    description: "Thí sinh thường bị bẫy bởi thì quá khứ đơn...",
    commonMistakes: ["C", "D"]
  }
}
```

## 3. Demo Data

Khi Firebase chưa có dữ liệu, ứng dụng sẽ tự động sử dụng demo data từ `src/data/grammarDemoData.ts`.

## 4. Cách sử dụng

1. **Truy cập trang chủ**: Click vào "Luyện Ngữ Pháp" trên trang chủ
2. **Chọn chủ đề**: Chọn chủ đề ngữ pháp muốn luyện tập
3. **Luyện tập**: Trả lời các câu hỏi và xem giải thích
4. **Xem kết quả**: Sau khi hoàn thành, xem kết quả chi tiết

## 5. Tính năng

- ✅ Luyện tập theo chủ đề
- ✅ Luyện tập theo level (Beginner, Intermediate, Advanced)
- ✅ Luyện tập tổng hợp
- ✅ Hiển thị giải thích chi tiết
- ✅ Hiển thị bản dịch
- ✅ Cảnh báo lỗi thường gặp
- ✅ Progress tracking
- ✅ Kết quả chi tiết
- ✅ Responsive design

## 6. Routes

- `/grammar` - Trang danh sách chủ đề
- `/grammar/practice/:topicId` - Trang luyện tập theo chủ đề
- `/grammar/practice/mixed` - Luyện tập tổng hợp
- `/grammar/practice/beginner` - Luyện tập cơ bản
- `/grammar/practice/advanced` - Luyện tập nâng cao

## 7. Thêm dữ liệu vào Firebase

### Thêm chủ đề mới:
```javascript
// Trong Firebase Console > Firestore Database
// Collection: grammar_topics
{
  id: "new-topic",
  name: "Tên chủ đề",
  description: "Mô tả chủ đề",
  questionCount: 10,
  icon: "🎯"
}
```

### Thêm câu hỏi mới:
```javascript
// Collection: grammar_questions
{
  id: "q999",
  grammarTopic: "Tên chủ đề",
  question: "Câu hỏi...",
  options: [...],
  correctAnswer: "A",
  explanation: "Giải thích...",
  translation: "Bản dịch...",
  level: "Intermediate",
  trap: {...}
}
```

## 8. Troubleshooting

- Nếu không kết nối được Firebase, ứng dụng sẽ sử dụng demo data
- Kiểm tra console để xem log lỗi
- Đảm bảo Firebase project đã được setup đúng
- Kiểm tra Firestore rules cho phép read access 