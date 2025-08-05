# Import TOEIC Part 5 vào Firebase

## Mô tả
Script này import dữ liệu từ file `toeic_part5.json` vào Firebase Firestore collection `toeic_questions`.

## Cấu trúc dữ liệu
Script sẽ import dữ liệu theo cấu trúc `Part5Question` interface:

```typescript
interface Part5Question {
  id: string;
  questionNumber: number;
  type: string;
  level?: string;
  question: string;
  choices: {
    A: { english: string; vietnamese: string };
    B: { english: string; vietnamese: string };
    C: { english: string; vietnamese: string };
    D: { english: string; vietnamese: string };
  };
  correctAnswer: string;
  explanation: string;
  part: string;
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
npm run import-part5-firebase

# Hoặc chạy trực tiếp
node importToeicPart5ToFirebase.js
```

## Firebase Collection
Dữ liệu sẽ được import vào collection: `toeic_questions`

## Các trường dữ liệu được import
- `questionNumber`: Số thứ tự câu hỏi (từ field id)
- `type`: Loại câu hỏi (vocabulary, grammar)
- `level`: Mức độ (mặc định là 'basic')
- `question`: Câu hỏi với chỗ trống
- `choices`: 4 lựa chọn A, B, C, D với tiếng Anh và tiếng Việt
- `correctAnswer`: Đáp án đúng
- `explanation`: Giải thích đáp án
- `part`: Phần thi (luôn là 'part5')
- `createdAt`: Thời gian tạo
- `updatedAt`: Thời gian cập nhật

## Giao diện TestPart5

### Tính năng chính:
- **Trang Part5**: Hiển thị thông tin và cho phép chọn loại test (vocabulary/grammar)
- **Trang TestPart5**: Giao diện làm bài test với các tính năng:
  - Hiển thị câu hỏi với 4 lựa chọn
  - Tự động chuyển câu hỏi sau khi chọn đáp án
  - Điều hướng câu hỏi (trước/sau)
  - Xem giải thích đáp án
  - Thanh tiến độ và timer
  - Grid điều hướng câu hỏi với màu sắc trạng thái
  - Kết quả bài test với thống kê chi tiết

### Routing:
- `/part5`: Trang chính Part 5
- `/test-part5`: Trang làm bài test

### State Management:
- Load câu hỏi từ Firebase theo loại (vocabulary/grammar)
- Theo dõi đáp án người dùng
- Timer và tiến độ bài test
- Hiển thị kết quả cuối cùng

## Lưu ý
- Script có delay 100ms giữa các lần import để tránh quá tải Firebase
- Mỗi câu hỏi sẽ được tạo với document ID tự động từ Firebase
- Script sẽ hiển thị tiến trình import và báo cáo kết quả cuối cùng
- Giao diện hỗ trợ responsive và có UX tốt

## Xử lý lỗi
- Script sẽ tiếp tục import các câu hỏi khác nếu một câu hỏi bị lỗi
- Tổng số lỗi sẽ được báo cáo ở cuối quá trình import
- Giao diện có loading state và error handling 