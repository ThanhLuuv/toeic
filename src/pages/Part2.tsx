import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import part2Data from '../data/toeic_part2.json';
import PartInfo from '../components/Part1/PartInfo';
import TestListPart2 from '../components/Part1/TestListPart2';
import LevelSelection from '../components/Part1/LevelSelection';

const QUESTIONS_PER_TEST = 25;

const Part2: React.FC = () => {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [totalTests, setTotalTests] = useState<number>(0);
  const [completedTests, setCompletedTests] = useState<number>(0);

  // Lấy danh sách bài test theo level (không phân chủ đề)
  const getTestsByLevel = (level: number) => {
    console.log('Getting tests for level:', level);
    
    // Tìm key đúng trong JSON (có thể có dấu cách)
    const allKeys = Object.keys(part2Data);
    console.log('All keys in part2Data:', allKeys);
    
    const levelKey = `level${level}`;
    const foundKey = allKeys.find(k => k.trim() === levelKey);
    console.log('Looking for key:', levelKey, 'Found:', foundKey);
    
    if (!foundKey) {
      console.log('No data found for level:', level);
      return [];
    }
    
    const questions = (part2Data as any)[foundKey] || [];
    console.log('Questions found for level:', level, 'Count:', questions.length);
    
    const tests = Array.from({ length: Math.ceil(questions.length / QUESTIONS_PER_TEST) }, (_, i) => ({
      id: `part2-level${level}-test${i + 1}`,
      title: `Bài số ${i + 1}`,
      category: 'part2',
      level: level,
      questions: questions.slice(i * QUESTIONS_PER_TEST, (i + 1) * QUESTIONS_PER_TEST).length,
      completed: false,
      score: 0,
    }));
    
    console.log('Created tests:', tests);
    return tests;
  };

  const tests = getTestsByLevel(currentLevel);

  useEffect(() => {
    setTotalTests(tests.length);
    setCompletedTests(0);
  }, [currentLevel, tests.length]);

  const startTest = (testId: string) => {
    navigate(`/test-part2/${testId}`);
  };

  return (
    <div className="container mx-auto py-8 flex gap-8">
      <div className="flex-1">
        <PartInfo
          partTitle="Part 2 - Question-Response"
          partDescription="30 câu hỏi - nghe và chọn đáp án phù hợp"
          currentLevel={{ name: `level${currentLevel}`, tests }}
        />
        <TestListPart2
          tests={tests}
          startTest={startTest}
        />
      </div>
      <LevelSelection
        currentLevel={currentLevel}
        setCurrentLevel={setCurrentLevel}
        totalTests={totalTests}
        completedTests={completedTests}
      />
    </div>
  );
};

export default Part2; 