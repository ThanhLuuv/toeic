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

// Đọc file part1.json
const part1Data = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../src/data/part1.json'), 'utf8')
);

// Đọc file part2.json
const part2Data = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../src/data/part2.json'), 'utf8')
);

async function importToeicPart1() {
  try {
    console.log('🚀 Bắt đầu import TOEIC Part 1 vào Firebase...');
    console.log(`📊 Tổng số câu hỏi Part 1: ${part1Data.length}`);

    let totalImported = 0;
    let totalErrors = 0;

    // Import từng câu hỏi Part 1
    for (let i = 0; i < part1Data.length; i++) {
      const question = part1Data[i];
      
      try {
        // Chuẩn bị dữ liệu để import cho Part 1
        const questionData = {
          sentence: question.sentence,
          sentence_translation: question.sentence_translation,
          words: question.words,
          audio: question.audio,
          part: 'part1',
          questionNumber: i + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Thêm vào Firestore
        const docRef = await addDoc(collection(db, 'toeic_questions'), questionData);
        console.log(`  ✅ Đã import Part 1 câu ${i + 1}: ${docRef.id}`);
        totalImported++;
        
        // Delay nhỏ để tránh quá tải Firebase
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`  ❌ Lỗi khi import Part 1 câu ${i + 1}:`, error.message);
        totalErrors++;
      }
    }

    console.log('\n🎉 Hoàn thành import TOEIC Part 1!');
    console.log(`📈 Tổng số câu hỏi Part 1 đã import: ${totalImported}`);
    if (totalErrors > 0) {
      console.log(`⚠️ Số câu hỏi Part 1 lỗi: ${totalErrors}`);
    }

    return { imported: totalImported, errors: totalErrors };

  } catch (error) {
    console.error('❌ Lỗi khi import TOEIC Part 1:', error);
    throw error;
  }
}

async function importToeicPart2() {
  try {
    console.log('\n🚀 Bắt đầu import TOEIC Part 2 vào Firebase...');
    console.log(`📊 Tổng số câu hỏi Part 2: ${part2Data.length}`);

    let totalImported = 0;
    let totalErrors = 0;

    // Import từng câu hỏi Part 2
    for (let i = 0; i < part2Data.length; i++) {
      const question = part2Data[i];
      
      try {
        // Chuẩn bị dữ liệu để import cho Part 2
        const questionData = {
          sentence: question.sentence,
          sentence_translation: question.sentence_translation,
          words: question.words,
          audio: question.sentence_audio, // Part 2 uses sentence_audio instead of audio
          part: 'part2',
          questionNumber: i + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Thêm vào Firestore
        const docRef = await addDoc(collection(db, 'toeic_questions'), questionData);
        console.log(`  ✅ Đã import Part 2 câu ${i + 1}: ${docRef.id}`);
        totalImported++;
        
        // Delay nhỏ để tránh quá tải Firebase
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`  ❌ Lỗi khi import Part 2 câu ${i + 1}:`, error.message);
        totalErrors++;
      }
    }

    console.log('\n🎉 Hoàn thành import TOEIC Part 2!');
    console.log(`📈 Tổng số câu hỏi Part 2 đã import: ${totalImported}`);
    if (totalErrors > 0) {
      console.log(`⚠️ Số câu hỏi Part 2 lỗi: ${totalErrors}`);
    }

    return { imported: totalImported, errors: totalErrors };

  } catch (error) {
    console.error('❌ Lỗi khi import TOEIC Part 2:', error);
    throw error;
  }
}

async function importAllParts() {
  try {
    console.log('🎯 Bắt đầu import tất cả các phần TOEIC vào Firebase...\n');

    // Import Part 1
    const part1Result = await importToeicPart1();
    
    // Import Part 2
    const part2Result = await importToeicPart2();

    // Tổng kết
    const totalImported = part1Result.imported + part2Result.imported;
    const totalErrors = part1Result.errors + part2Result.errors;

    console.log('\n🎊 HOÀN THÀNH IMPORT TẤT CẢ CÁC PHẦN!');
    console.log('='.repeat(50));
    console.log(`📊 Tổng số câu hỏi đã import: ${totalImported}`);
    console.log(`   - Part 1: ${part1Result.imported} câu`);
    console.log(`   - Part 2: ${part2Result.imported} câu`);
    if (totalErrors > 0) {
      console.log(`⚠️ Tổng số câu hỏi lỗi: ${totalErrors}`);
      console.log(`   - Part 1: ${part1Result.errors} lỗi`);
      console.log(`   - Part 2: ${part2Result.errors} lỗi`);
    }
    console.log('='.repeat(50));

    return {
      part1: part1Result,
      part2: part2Result,
      total: { imported: totalImported, errors: totalErrors }
    };

  } catch (error) {
    console.error('❌ Lỗi khi import tất cả các phần:', error);
    throw error;
  }
}

// Hàm để chạy import
async function runImport() {
  try {
    await importAllParts();
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

module.exports = { 
  importToeicPart1, 
  importToeicPart2, 
  importAllParts, 
  runImport 
}; 