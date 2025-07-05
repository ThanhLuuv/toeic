import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import levelData from '../data/toeic_part1.json';
import PartInfo from '../components/Part1/PartInfo';
import TestList from '../components/Part1/TestList';
import LevelSelection from '../components/Part1/LevelSelection';

const QUESTIONS_PER_TEST = 6;

const Part1: React.FC = () => {
  const navigate = useNavigate();
  // State này nên được đồng bộ với tab chủ đề và LevelSelection
  const [currentCategory, setCurrentCategory] = useState<string>('people');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [totalTests, setTotalTests] = useState<number>(0);
  const [completedTests, setCompletedTests] = useState<number>(0);
  const [currentTab, setCurrentTab] = useState<string>('mixed');

  // Hàm lấy danh sách bài test theo tab và level
  const getTestsByTabAndLevel = (tab: string, level: number) => {
    const categories = tab === 'mixed' ? Object.keys(levelData) : [tab];
    let allTests: any[] = [];
    categories.forEach((cat) => {
      // Dữ liệu có thể có key thừa dấu cách, nên thử cả hai
      const questions = (levelData as any)[cat]?.[`level${level}`] || (levelData as any)[cat]?.[`level${level} `] || [];
      const tests = Array.from({ length: Math.ceil(questions.length / QUESTIONS_PER_TEST) }, (_, i) => ({
        id: `${cat}-level${level}-test${i + 1}`,
        title: `Bài số ${i + 1} (${cat === 'people' ? 'Người' : cat === 'object' ? 'Vật thể' : 'Khác'})`,
        category: cat,
        level: level,
        questions: questions.slice(i * QUESTIONS_PER_TEST, (i + 1) * QUESTIONS_PER_TEST).length,
        completed: false,
        score: 0,
      }));
      allTests = allTests.concat(tests);
    });
    return allTests;
  };

  // Lấy danh sách bài test theo tab và level hiện tại
  const tests = getTestsByTabAndLevel(currentTab, currentLevel);

  useEffect(() => {
    setTotalTests(tests.length);
    setCompletedTests(0);
  }, [currentTab, currentLevel, tests.length]);

  const startTest = (testId: string) => {
    const [category, level, testNumber] = testId.split('-');
    navigate('/test-part1', { state: { testId, category, level } });
  };

  return (
    <div className="container mx-auto py-8 flex gap-8">
      <div className="flex-1">
        <PartInfo
          partTitle="Part 1 - Photographs"
          partDescription="6 câu hỏi - mô tả hình ảnh"
          currentLevel={{ name: `level${currentLevel}`, tests }}
        />
        <TestList
          tests={tests}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
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

export default Part1;