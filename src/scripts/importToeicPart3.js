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

// Đọc file toeic_part3.json
const part3Data = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/toeic_part3.json'), 'utf8')
);

async function importToeicPart3() {
  try {
    console.log('🚀 Bắt đầu import TOEIC Part 3 vào Firebase...');
    console.log(`📊 Tổng số câu hỏi: ${part3Data.length}`);

    let totalImported = 0;
    let totalErrors = 0;

    // Import từng câu hỏi
    for (let i = 0; i < part3Data.length; i++) {
      const question = part3Data[i];
      
      try {
        // Chuẩn bị dữ liệu để import
        const questionData = {
          questionNumber: question.questionNumber,
          level: question.level,
          type: question.type,
          conversation: question.conversation,
          questions: question.questions,
          choices: question.choices,
          choicesVi: question.choicesVi,
          correctAnswers: question.correctAnswers,
          explanations: question.explanations,
          traps: question.traps,
          audio: question.audio,
          part: 'part3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Thêm vào Firestore
        const docRef = await addDoc(collection(db, 'toeic_questions'), questionData);
        console.log(`  ✅ Đã import câu ${question.questionNumber}: ${docRef.id}`);
        totalImported++;
        
        // Delay nhỏ để tránh quá tải Firebase
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`  ❌ Lỗi khi import câu ${question.questionNumber}:`, error.message);
        totalErrors++;
      }
    }

    console.log('\n🎉 Hoàn thành import TOEIC Part 3!');
    console.log(`📈 Tổng số câu hỏi đã import: ${totalImported}`);
    if (totalErrors > 0) {
      console.log(`⚠️ Số câu hỏi lỗi: ${totalErrors}`);
    }

  } catch (error) {
    console.error('❌ Lỗi khi import TOEIC Part 3:', error);
    throw error;
  }
}

// Hàm để chạy import
async function runImport() {
  try {
    await importToeicPart3();
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

module.exports = { importToeicPart3, runImport }; 