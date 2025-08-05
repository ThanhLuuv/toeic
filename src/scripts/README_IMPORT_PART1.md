# Import TOEIC Part 1 vào Firebase

## Mô tả
Script này import dữ liệu từ file `toeic_part1.json` vào Firebase Firestore collection `ai_practice_questions`.

## Cấu trúc dữ liệu
Script sẽ import dữ liệu theo cấu trúc `Part1Question` interface:

```typescript
interface Part1Question {
  id: string;
  questionNumber: number;
  level: string;
  type: string;
  imageDescription: string;
  image: string;
  audio: string;
  mcqSteps: {
    stepNumber: number;
    options: {
      value: string;
      text: string;
      pronunciation: string;
      meaning: string;
      isCorrect: boolean;
    }[];
  }[];
  audioQuestion: {
    choices: { [key: string]: { english: string; vietnamese: string } };
    correctAnswer: string;
    traps: string;
  };
}
```

## Cách sử dụng

### 1. Cài đặt dependencies
```bash
cd src/scripts
npm install
```

### 2. Chạy script import
```bash
# Sử dụng npm script
npm run import-part1-firebase

# Hoặc chạy trực tiếp
node importToeicPart1ToFirebase.js
```

## Firebase Collection
Dữ liệu sẽ được import vào collection: `ai_practice_questions`

## Các trường dữ liệu được import
- `questionNumber`: Số thứ tự câu hỏi
- `level`: Mức độ (Basic, Intermediate, Advanced)
- `type`: Loại câu hỏi (people, objects, scenes)
- `imageDescription`: Mô tả hình ảnh
- `image`: URL hình ảnh
- `audio`: URL audio
- `mcqSteps`: Các bước MCQ với từng bước có options
- `audioQuestion`: Câu hỏi audio với choices và đáp án
- `part`: Phần thi (luôn là 'part1')
- `createdAt`: Thời gian tạo
- `updatedAt`: Thời gian cập nhật

## Lưu ý
- Script có delay 100ms giữa các lần import để tránh quá tải Firebase
- Mỗi câu hỏi sẽ được tạo với document ID tự động từ Firebase
- Script sẽ hiển thị tiến trình import và báo cáo kết quả cuối cùng

## Xử lý lỗi
- Script sẽ tiếp tục import các câu hỏi khác nếu một câu hỏi bị lỗi
- Tổng số lỗi sẽ được báo cáo ở cuối quá trình import 