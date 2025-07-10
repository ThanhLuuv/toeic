# API Keys Setup Guide

## Lỗi 401 Unauthorized

Nếu bạn gặp lỗi "401 Unauthorized" khi sử dụng tính năng AI, có nghĩa là API keys đã hết hạn hoặc không hợp lệ.

## Cách khắc phục

### 1. Tạo file .env

Tạo file `.env` trong thư mục gốc của dự án với nội dung:

```env
# OpenAI API Key
REACT_APP_OPENAI_API_KEY=your-openai-api-key-here

# Google Gemini API Key  
REACT_APP_GEMINI_API_KEY=your-gemini-api-key-here

# Google Text-to-Speech API Key
REACT_APP_GOOGLE_TTS_KEY=your-google-tts-key-here
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
1. Kiểm tra API key có đúng format không
2. Kiểm tra tài khoản có đủ credit không
3. Kiểm tra API có được enable chưa
4. Thử restart lại ứng dụng 