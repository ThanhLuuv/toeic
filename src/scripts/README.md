# Scripts Import Data vào Firebase

Các script này được sử dụng để import dữ liệu từ file JSON vào Firebase Firestore.

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

## Các script có sẵn

### 1. Import Vocabulary
```bash
node importVocabulary.js
```
Import dữ liệu vocabulary từ `src/data/vocabulary.json` vào collection `vocabulary` với phân loại theo chủ đề.

### 2. Import TOEIC Part 1
```bash
node importToeicPart1.js
```
Import dữ liệu TOEIC Part 1 từ `src/data/toeic_part1.json` vào collection `toeic_questions`.

### 3. Import TOEIC Part 2
```bash
node importToeicPart2.js
```
Import dữ liệu TOEIC Part 2 từ `src/data/toeic_part2.json` vào collection `toeic_questions`.

### 4. Import TOEIC Part 3
```bash
node importToeicPart3.js
```
Import dữ liệu TOEIC Part 3 từ `src/data/toeic_part3.json` vào collection `toeic_questions`.

### 5. Import tất cả dữ liệu
```bash
node importAll.js
```
Import tất cả dữ liệu (vocabulary + TOEIC Part 1, 2, 3) vào Firebase.

## Cấu trúc dữ liệu

### Vocabulary Collection
- `word`: Từ vựng
- `type`: Loại từ
- `phonetic`: Phiên âm
- `meaning`: Nghĩa
- `audio`: Link audio
- `topic`: Chủ đề (Tourism, Accommodations & Food, etc.)

### TOEIC Questions Collection
- `questionNumber`: Số thứ tự câu hỏi
- `level`: Cấp độ (Basic, Intermediate, Advanced)
- `type`: Loại câu hỏi
- `part`: Phần thi (part1, part2, part3)
- `choices`: Các lựa chọn
- `correctAnswer`: Đáp án đúng
- `explanation`: Giải thích
- `audio`: Link audio

## Lưu ý

1. **Firebase Rules**: Đảm bảo đã cập nhật Firestore rules để cho phép đọc/ghi vào các collection:
   - `vocabulary`
   - `toeic_questions`

2. **Rate Limiting**: Scripts có delay giữa các lần ghi để tránh quá tải Firebase.

3. **Error Handling**: Scripts sẽ hiển thị lỗi nếu có và tiếp tục với các item khác.

## Troubleshooting

- **Permission Denied**: Kiểm tra Firebase rules
- **Module not found**: Chạy `npm install` để cài đặt dependencies
- **File not found**: Đảm bảo các file JSON tồn tại trong thư mục `src/data/` 