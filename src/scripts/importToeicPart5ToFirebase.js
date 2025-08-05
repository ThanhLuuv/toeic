const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB4TKhzR9ffuEHWqmm0wfTRO_8nuihskA4",
  authDomain: "toeic-grammar.firebaseapp.com",
  projectId: "toeic-grammar",
  storageBucket: "toeic-grammar.firebasestorage.app",
  messagingSenderId: "952825377455",
  appId: "1:952825377455:web:3554a3c59afda594ee9a5a",
  measurementId: "G-1SNE0CJGVK"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Đọc file toeic_part5.json
const part5Data = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/toeic_part5.json'), 'utf8')
);

async function importToeicPart5ToFirebase() {
  try {
    console.log('🚀 Bắt đầu import TOEIC Part 5 vào Firebase (toeic_questions collection)...');
    console.log(`📊 Tổng số câu hỏi: ${part5Data.length}`);

    let totalImported = 0;
    let totalErrors = 0;

    // Import từng câu hỏi
    for (let i = 0; i < part5Data.length; i++) {
      const question = part5Data[i];
      
      try {
        // Chuẩn bị dữ liệu để import theo cấu trúc Part5Question
        const questionData = {
          questionNumber: question.id,
          type: question.type,
          level: 'basic', // Default level, can be updated later
          question: question.question,
          choices: question.choices,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          part: 'part5',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Thêm vào Firestore collection toeic_questions
        const docRef = await addDoc(collection(db, 'toeic_questions'), questionData);
        console.log(`  ✅ Đã import câu ${question.id}: ${docRef.id}`);
        totalImported++;
        
        // Delay nhỏ để tránh quá tải Firebase
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`  ❌ Lỗi khi import câu ${question.id}:`, error.message);
        totalErrors++;
      }
    }

    console.log('\n🎉 Hoàn thành import TOEIC Part 5 vào toeic_questions!');
    console.log(`📈 Tổng số câu hỏi đã import: ${totalImported}`);
    if (totalErrors > 0) {
      console.log(`⚠️ Số câu hỏi lỗi: ${totalErrors}`);
    }

  } catch (error) {
    console.error('❌ Lỗi khi import TOEIC Part 5:', error);
    throw error;
  }
}

// Hàm để chạy import
async function runImport() {
  try {
    await importToeicPart5ToFirebase();
    console.log('✅ Import hoàn tất thành công!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Import thất bại:', error);
    process.exit(1);
  }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  runImport();
}

module.exports = { importToeicPart5ToFirebase, runImport }; 