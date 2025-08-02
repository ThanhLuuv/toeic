const { importVocabularyToFirebase } = require('./importVocabulary');
const { importToeicPart1 } = require('./importToeicPart1');
const { importToeicPart2 } = require('./importToeicPart2');
const { importToeicPart3 } = require('./importToeicPart3');

async function importAllData() {
  try {
    console.log('🚀 Bắt đầu import tất cả dữ liệu vào Firebase...\n');

    // Import vocabulary
    console.log('📚 Importing Vocabulary...');
    await importVocabularyToFirebase();
    console.log('✅ Vocabulary imported successfully!\n');

    // Import TOEIC Part 1
    console.log('🎯 Importing TOEIC Part 1...');
    await importToeicPart1();
    console.log('✅ TOEIC Part 1 imported successfully!\n');

    // Import TOEIC Part 2
    console.log('🎯 Importing TOEIC Part 2...');
    await importToeicPart2();
    console.log('✅ TOEIC Part 2 imported successfully!\n');

    // Import TOEIC Part 3
    console.log('🎯 Importing TOEIC Part 3...');
    await importToeicPart3();
    console.log('✅ TOEIC Part 3 imported successfully!\n');

    console.log('🎉 Tất cả dữ liệu đã được import thành công!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi import dữ liệu:', error);
    process.exit(1);
  }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  importAllData();
}

module.exports = { importAllData }; 