const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase config từ firebase.ts
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

// Định nghĩa các chủ đề theo thứ tự trong file JSON
const TOPICS = [
  'Tourism',           // 0-39 (40 từ đầu)
  'Accommodations & Food', // 40-79 (40 từ tiếp theo)
  'Transportation',    // 80-119 (40 từ tiếp theo)
  'Stores',           // 120-159 (40 từ tiếp theo)
  'Purchase & Warranty', // 160-199 (40 từ tiếp theo)
  'Performance',      // 200-239 (40 từ tiếp theo)
  'Exhibition & Museums', // 240-279 (40 từ tiếp theo)
  'Media',            // 280-319 (40 từ tiếp theo)
  'Real Estate',      // 320-359 (40 từ tiếp theo)
  'Arts'              // 360-399 (40 từ cuối)
];

const WORDS_PER_TOPIC = 40;

// Đọc file vocabulary.json
const vocabularyData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/vocabulary.json'), 'utf8')
);

async function importVocabularyToFirebase() {
  try {
    console.log('🚀 Bắt đầu import vocabulary vào Firebase...');
    console.log(`📊 Tổng số từ vựng: ${vocabularyData.length}`);
    console.log(`📚 Số chủ đề: ${TOPICS.length}`);
    console.log(`📝 Từ vựng mỗi chủ đề: ${WORDS_PER_TOPIC}`);

    let totalImported = 0;
    let totalErrors = 0;

    // Xử lý từng chủ đề
    for (let topicIndex = 0; topicIndex < TOPICS.length; topicIndex++) {
      const topic = TOPICS[topicIndex];
      const startIndex = topicIndex * WORDS_PER_TOPIC;
      const endIndex = startIndex + WORDS_PER_TOPIC;
      
      console.log(`\n📖 Đang xử lý chủ đề: ${topic} (${startIndex + 1}-${endIndex})`);
      
      // Lấy từ vựng cho chủ đề này
      const topicVocabulary = vocabularyData.slice(startIndex, endIndex);
      
      // Import từng từ vựng trong chủ đề
      for (let i = 0; i < topicVocabulary.length; i++) {
        const vocab = topicVocabulary[i];
        
        try {
          // Chuẩn bị dữ liệu để import
          const vocabularyData = {
            word: vocab.word,
            type: vocab.type,
            phonetic: vocab.phonetic,
            meaning: vocab.meaning,
            audio: vocab.audio,
            topic: topic, // Thêm chủ đề vào mỗi từ vựng
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          // Thêm vào Firestore
          const docRef = await addDoc(collection(db, 'vocabulary'), vocabularyData);
          console.log(`  ✅ Đã import: ${vocab.word} (ID: ${docRef.id})`);
          totalImported++;
          
          // Delay nhỏ để tránh quá tải Firebase
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`  ❌ Lỗi khi import "${vocab.word}":`, error.message);
          totalErrors++;
        }
      }

      console.log(`✅ Hoàn thành chủ đề "${topic}": ${topicVocabulary.length} từ vựng`);
      
      // Delay giữa các chủ đề
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n🎉 Hoàn thành import vocabulary!');
    console.log(`📈 Tổng số từ vựng đã import: ${totalImported}`);
    if (totalErrors > 0) {
      console.log(`⚠️ Số từ vựng lỗi: ${totalErrors}`);
    }

    // Hiển thị thống kê theo chủ đề
    console.log('\n📊 Thống kê theo chủ đề:');
    for (let i = 0; i < TOPICS.length; i++) {
      const topic = TOPICS[i];
      const startIndex = i * WORDS_PER_TOPIC;
      const endIndex = startIndex + WORDS_PER_TOPIC;
      const topicVocabulary = vocabularyData.slice(startIndex, endIndex);
      
      console.log(`  • ${topic}: ${topicVocabulary.length} từ vựng`);
    }

  } catch (error) {
    console.error('❌ Lỗi khi import vocabulary:', error);
    throw error;
  }
}

// Hàm để chạy import
async function runImport() {
  try {
    await importVocabularyToFirebase();
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

module.exports = { importVocabularyToFirebase, runImport }; 