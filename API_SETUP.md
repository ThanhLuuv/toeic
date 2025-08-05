# API Keys Setup Guide

## Lỗi thường gặp

### Lỗi "API key không được cấu hình"
- **Nguyên nhân**: File `.env` chưa được tạo hoặc API key chưa được thêm
- **Cách khắc phục**: Tạo file `.env` và thêm API key theo hướng dẫn bên dưới

### Lỗi "401 Unauthorized" 
- **Nguyên nhân**: API keys đã hết hạn hoặc không hợp lệ
- **Cách khắc phục**: Tạo API key mới và cập nhật vào file `.env`

## Cách khắc phục

### 1. Tạo file .env

Tạo file `.env` trong thư mục gốc của dự án với nội dung:

```env
# OpenAI API Key
REACT_APP_API_KEY_OPENAI=your-openai-api-key-here

# Google Gemini API Key  
REACT_APP_GEMINI_API_KEY=your-gemini-api-key-here

# Google Text-to-Speech API Key
REACT_APP_GOOGLE_TTS_KEY=your-google-tts-key-here

# Cloudinary Configuration (đã được cấu hình sẵn trong code)
# CLOUDINARY_UPLOAD_URL=https://api.cloudinary.com/v1_1/deroljhou/auto/upload
# CLOUDINARY_UPLOAD_PRESET=part1_test
# CLOUDINARY_FOLDER=ai_practice_questions
```

### 2. Lấy API Keys

#### OpenAI API Key
1. Truy cập: https://platform.openai.com/api-keys
2. Đăng nhập hoặc tạo tài khoản
3. Tạo API key mới
4. Copy và paste vào `REACT_APP_OPENAI_API_KEY`

#### Google Gemini API Key
1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập bằng Google account
3. Tạo API key mới
4. Copy và paste vào `REACT_APP_GEMINI_API_KEY`

#### Google Text-to-Speech API Key
1. Truy cập: https://console.cloud.google.com/apis/credentials
2. Tạo project mới hoặc chọn project có sẵn
3. Enable Text-to-Speech API
4. Tạo API key
5. Copy và paste vào `REACT_APP_GOOGLE_TTS_KEY`

#### Cloudinary (Đã cấu hình sẵn)
- Cloudinary đã được cấu hình sẵn trong code để upload ảnh
- Không cần thêm API key cho Cloudinary
- Ảnh sẽ được upload tự động khi sử dụng tính năng phân tích ảnh

### 3. Restart ứng dụng

Sau khi tạo file `.env`, restart lại ứng dụng:

```bash
npm start
```

## Lưu ý bảo mật

- **KHÔNG** commit file `.env` lên Git
- File `.env` đã được thêm vào `.gitignore`
- Chỉ sử dụng API keys cho mục đích phát triển và test

## Troubleshooting

Nếu vẫn gặp lỗi:

### 1. Kiểm tra file .env
- Đảm bảo file `.env` được tạo trong thư mục gốc của dự án
- Kiểm tra tên biến môi trường: `REACT_APP_API_KEY_OPENAI` (không phải `REACT_APP_OPENAI_API_KEY`)

### 2. Kiểm tra API key
- API key phải bắt đầu bằng `sk-`
- Kiểm tra API key có đúng format không
- Kiểm tra tài khoản có đủ credit không

### 3. Restart ứng dụng
- Sau khi tạo/sửa file `.env`, phải restart ứng dụng:
```bash
npm start
```

### 4. Kiểm tra console
- Mở Developer Tools (F12) và kiểm tra tab Console
- Tìm các lỗi liên quan đến API key hoặc network

### 5. Test API key
- Truy cập: https://platform.openai.com/api-keys
- Kiểm tra API key có hoạt động không 