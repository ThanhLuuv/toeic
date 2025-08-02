import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toeicPart3Data from '../data/toeic_part3.json';

import TestListPart3 from '../components/PartSession/TestListPart3';
import { Test } from '../data/levelData';

// Số lượng câu hỏi mỗi đề (Part 3: mỗi đề là 1 hội thoại, 3 câu hỏi)
const QUESTIONS_PER_TEST = 3;

// Lấy danh sách bài test (tất cả levels)
const getTests = (): Test[] => {
  const allKeys = Object.keys(toeicPart3Data);
  let allTests: any[] = [];
  
  // Lấy tests từ tất cả levels
  for (let level = 1; level <= 3; level++) {
    const levelKey = `level${level}`;
    const foundKey = allKeys.find(k => k.trim() === levelKey);
    if (foundKey) {
      const tests = (toeicPart3Data as any)[foundKey] || [];
      allTests = allTests.concat(tests);
    }
  }
  
  return allTests.map((t: any, idx: number) => ({
    id: t.id || `test${idx + 1}`,
    title: `Test ${t.id || idx + 1}`,
    category: 'part3',
    level: 1, // Chỉ dùng 1 level chung
    questions: t.questions.length,
    completed: false,
    score: 0,
  }));
};

const Part3: React.FC = () => {
  const navigate = useNavigate();

  const testsRaw = getTests();
  // Map to Part3Test type for TestListPart3
  const testsForList: any[] = testsRaw.map((t) => {
    const allKeys = Object.keys(toeicPart3Data);
    let original: any = null;
    
    // Tìm test gốc từ tất cả levels
    for (let level = 1; level <= 3; level++) {
      const levelKey = `level${level}`;
      const foundKey = allKeys.find(k => k.trim() === levelKey);
      if (foundKey) {
        const testList = (toeicPart3Data as any)[foundKey] || [];
        original = testList.find((item: any) => String(item.id) === String(t.id));
        if (original) break;
      }
    }
    
          return {
        ...t,
        id: String(t.id),
        level: "",
        audio: original?.audio || '',
        questions: original?.questions || [],
      };
  });

  const startTest = (testId: string) => {
    navigate(`/test-part3/${testId}`);
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Title Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Part 3 - Conversations</h1>
        <p className="text-slate-600 text-lg">Listen to conversations and answer questions</p>
        <div className="mt-4 flex justify-center items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" clipRule="evenodd" />
            </svg>
            <span>Conversation-based</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            <span>3 questions per conversation</span>
          </div>
        </div>
      </div>
      
      <TestListPart3
        tests={testsForList}
        startTest={startTest}
      />
    </div>
  );
};

export default Part3; 