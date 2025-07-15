import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import levelData from '../data/toeic_part1.json';
import PartInfo from '../components/PartSession/PartInfo';
import TestList from '../components/PartSession/TestList';
import LevelSelection from '../components/PartSession/LevelSelection';

const QUESTIONS_PER_TEST = 6;

const Part1: React.FC = () => {
  const navigate = useNavigate();
  // State này nên được đồng bộ với tab chủ đề và LevelSelection
  const [currentCategory, setCurrentCategory] = useState<string>('people');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [totalTests, setTotalTests] = useState<number>(0);
  const [completedTests, setCompletedTests] = useState<number>(0);
  const [currentTab, setCurrentTab] = useState<string>('all');

  // Hàm lấy danh sách bài test theo tab và level
  const getTestsByTabAndLevel = (tab: string, level: number) => {
    let categories: string[] = [];
    
    if (tab === 'all') {
      // Tab "Tất cả" - hiển thị tất cả categories
      categories = ['people', 'object', 'environment'];
    } else {
      // Các tab khác - hiển thị category tương ứng
      categories = [tab];
    }
    
    let allTests: any[] = [];
    categories.forEach((cat) => {
      // Dữ liệu có thể có key thừa dấu cách, nên thử cả hai
      const questions = (levelData as any)[cat]?.[`level${level}`] || (levelData as any)[cat]?.[`level${level} `] || [];
      console.log(`Category: ${cat}, Level: ${level}, Questions: ${questions.length}`);
      const tests = Array.from({ length: Math.ceil(questions.length / QUESTIONS_PER_TEST) }, (_, i) => ({
        id: `${cat}-level${level}-test${i + 1}`,
        title: `# ${i + 1} (${cat === 'people' ? 'Con người' : cat === 'object' ? 'Vật thể' : cat === 'environment' ? 'Môi trường' : 'Khác'})`,
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

  // Tạo dữ liệu levels cho LevelSelection
  const levels = [
    { 
      level: 1, 
      name: 'Level 1 - Basic', 
      tests: getTestsByTabAndLevel(currentTab, 1) 
    },
    { 
      level: 2, 
      name: 'Level 2 - Intermediate', 
      tests: getTestsByTabAndLevel(currentTab, 2) 
    },
    { 
      level: 3, 
      name: 'Level 3 - Advanced', 
      tests: getTestsByTabAndLevel(currentTab, 3) 
    }
  ];

  useEffect(() => {
    // Tính tổng số bài test từ tất cả levels
    const totalTestsCount = levels.reduce((sum, level) => sum + level.tests.length, 0);
    setTotalTests(totalTestsCount);
    
    // Tính số bài test đã hoàn thành (hiện tại là 0 vì chưa có logic lưu trữ)
    setCompletedTests(0);
  }, [currentTab, currentLevel, levels]);

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
        levels={levels}
      />
    </div>
  );
};

export default Part1;