import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import part2Data from '../data/toeic_part2.json';

import TestListPart2 from '../components/PartSession/TestListPart2';

const QUESTIONS_PER_TEST = 10; // Giảm xuống 10 câu mỗi bài test

const Part2: React.FC = () => {
  const navigate = useNavigate();

  // Lấy danh sách bài test (tất cả levels)
  const getTests = () => {
    console.log('Getting all tests');
    
    // Tìm key đúng trong JSON (có thể có dấu cách)
    const allKeys = Object.keys(part2Data);
    console.log('All keys in part2Data:', allKeys);
    
    let allQuestions: any[] = [];
    
    // Lấy questions từ tất cả levels
    for (let level = 1; level <= 3; level++) {
      const levelKey = `level${level}`;
      const foundKey = allKeys.find(k => k.trim() === levelKey);
      console.log('Looking for key:', levelKey, 'Found:', foundKey);
      
      if (foundKey) {
        const questions = (part2Data as any)[foundKey] || [];
        console.log('Questions found for level:', level, 'Count:', questions.length);
        allQuestions = allQuestions.concat(questions);
      }
    }
    
    console.log('Total questions:', allQuestions.length);
    
    // Chỉ tạo test nếu có đủ câu hỏi
    if (allQuestions.length === 0) {
      console.log('No questions available');
      return [];
    }
    
    const tests = Array.from({ length: Math.ceil(allQuestions.length / QUESTIONS_PER_TEST) }, (_, i) => ({
      id: `part2-test${i + 1}`,
      title: `# ${i + 1}`,
      category: 'part2',
      level: 1, // Chỉ dùng 1 level chung
      questions: allQuestions.slice(i * QUESTIONS_PER_TEST, (i + 1) * QUESTIONS_PER_TEST).length,
      completed: false,
      score: 0,
    }));
    
    console.log('Created tests:', tests);
    return tests;
  };

  const tests = getTests();

  const startTest = (testId: string) => {
    navigate(`/test-part2/${testId}`);
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Title Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Part 2 - Question-Response</h1>
        <p className="text-slate-600 text-lg">Listen and choose the appropriate answer</p>
        <div className="mt-4 flex justify-center items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span>Audio-based questions</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            <span>10 questions per test</span>
          </div>
        </div>
      </div>
      
      <TestListPart2
        tests={tests}
        startTest={startTest}
      />
    </div>
  );
};

export default Part2; 