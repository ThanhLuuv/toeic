import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toeicPart3Data from '../data/toeic_part3.json';
import PartInfo from '../components/PartSession/PartInfo';
import TestListPart3 from '../components/PartSession/TestListPart3';
import LevelSelection from '../components/PartSession/LevelSelection';
import { Test, Level } from '../data/levelData';

// Số lượng câu hỏi mỗi đề (Part 3: mỗi đề là 1 hội thoại, 3 câu hỏi)
const QUESTIONS_PER_TEST = 3;

// Lấy danh sách bài test theo level
const getTestsByLevel = (level: number): Test[] => {
  const allKeys = Object.keys(toeicPart3Data);
  const levelKey = `level${level}`;
  const foundKey = allKeys.find(k => k.trim() === levelKey);
  if (!foundKey) return [];
  const tests = (toeicPart3Data as any)[foundKey] || [];
  return tests.map((t: any, idx: number) => ({
    id: t.id || `${levelKey}-test${idx + 1}`,
    title: `Đề ${t.id || idx + 1}`,
    category: 'part3',
    level: level,
    questions: t.questions.length,
    completed: false,
    score: 0,
  }));
};

const Part3: React.FC = () => {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [totalTests, setTotalTests] = useState<number>(0);
  const [completedTests, setCompletedTests] = useState<number>(0);

  // Tạo dữ liệu levels cho LevelSelection
  const levels = [
    { level: 1, name: 'Basic', tests: getTestsByLevel(1) },
    { level: 2, name: 'Intermediate', tests: getTestsByLevel(2) },
    { level: 3, name: 'Advanced', tests: getTestsByLevel(3) }
  ];

  useEffect(() => {
    // Tính tổng số bài test từ tất cả levels
    const totalTestsCount = levels.reduce((sum, level) => sum + level.tests.length, 0);
    setTotalTests(totalTestsCount);
    // Tính số bài test đã hoàn thành (hiện tại là 0 vì chưa có logic lưu trữ)
    setCompletedTests(0);
  }, [currentLevel, levels]);

  const testsRaw = getTestsByLevel(currentLevel);
  // Map to Part3Test type for TestListPart3 (level as number)
  const testsForList = testsRaw.map((t) => {
    const allKeys = Object.keys(toeicPart3Data);
    const levelKey = `level${currentLevel}`;
    const foundKey = allKeys.find(k => k.trim() === levelKey);
    const testList = foundKey ? (toeicPart3Data as any)[foundKey] : [];
    // Always use string for id
    const original = testList.find((item: any) => String(item.id) === String(t.id));
    return {
      ...t,
      id: String(t.id),
      level: `Level ${currentLevel}`,
      audio: original?.audio || '',
      questions: original?.questions || [],
    };
  });

  const startTest = (testId: string) => {
    navigate(`/test-part3/${testId}`);
  };

  return (
    <div className="container mx-auto py-8 flex gap-8">
      <div className="flex-1">
        <PartInfo
          partTitle="Part 3 - Conversations"
          partDescription="Mỗi đề gồm 1 đoạn hội thoại và 3 câu hỏi. Nghe hội thoại và chọn đáp án đúng cho từng câu."
          currentLevel={{ name: `Level ${currentLevel} - ${['Basic', 'Intermediate', 'Advanced'][currentLevel-1]}`, tests: testsRaw }}
        />
        <TestListPart3
          tests={testsForList}
          startTest={startTest}
        />
      </div>
      <LevelSelection
        currentLevel={currentLevel}
        setCurrentLevel={setCurrentLevel}
        totalTests={totalTests}
        completedTests={completedTests}
        levels={levels}
      />
    </div>
  );
};

export default Part3; 