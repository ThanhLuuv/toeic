import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import levelData from '../data/toeic_part1.json';

import TestList from '../components/PartSession/TestList';
import { preloadImages, getImageUrlsFromQuestions } from '../utils/imagePreloader';

const QUESTIONS_PER_TEST = 6;

const Part1: React.FC = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState<string>('all');
  const [loadingTests, setLoadingTests] = useState<Set<string>>(new Set());
  const [loadingProgress, setLoadingProgress] = useState<{[testId: string]: {loaded: number, total: number}}>({});

  // Hàm lấy danh sách bài test theo tab (không phân level)
  const getTestsByTab = (tab: string) => {
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
      // Lấy tất cả questions từ tất cả levels
      let allQuestions: any[] = [];
      for (let level = 1; level <= 3; level++) {
        const questions = (levelData as any)[cat]?.[`level${level}`] || (levelData as any)[cat]?.[`level${level} `] || [];
        allQuestions = allQuestions.concat(questions);
      }
      
      console.log(`Category: ${cat}, Total Questions: ${allQuestions.length}`);
      const tests = Array.from({ length: Math.ceil(allQuestions.length / QUESTIONS_PER_TEST) }, (_, i) => ({
        id: `${cat}-test${i + 1}`,
        title: `# ${i + 1} (${cat === 'people' ? 'People' : cat === 'object' ? 'Objects' : cat === 'environment' ? 'Environment' : 'Other'})`,
        category: cat,
        level: 1, // Chỉ dùng 1 level chung
        questions: allQuestions.slice(i * QUESTIONS_PER_TEST, (i + 1) * QUESTIONS_PER_TEST).length,
        completed: false,
        score: 0,
      }));
      allTests = allTests.concat(tests);
    });
    return allTests;
  };

  // Lấy danh sách bài test theo tab hiện tại
  const tests = getTestsByTab(currentTab);



  const startTest = async (testId: string) => {
    const [category, testNumber] = testId.split('-');
    
    // Bắt đầu loading
    setLoadingTests(prev => new Set(prev).add(testId));
    setLoadingProgress(prev => ({
      ...prev,
      [testId]: { loaded: 0, total: 0 }
    }));

    try {
      // Lấy tất cả questions từ tất cả levels cho category này
      let allQuestions: any[] = [];
      for (let level = 1; level <= 3; level++) {
        const questions = (levelData as any)[category]?.[`level${level}`] || (levelData as any)[category]?.[`level${level} `] || [];
        allQuestions = allQuestions.concat(questions);
      }
      
      const testIndex = parseInt(testNumber.replace('test', ''), 10) - 1;
      const testQuestions = allQuestions.slice(testIndex * QUESTIONS_PER_TEST, (testIndex + 1) * QUESTIONS_PER_TEST);
      
      // Lấy tất cả URL ảnh
      const imageUrls = getImageUrlsFromQuestions(testQuestions);
      
      if (imageUrls.length === 0) {
        // Nếu không có ảnh nào, navigate luôn
        navigate('/test-part1', { state: { testId, category, level: 'level1' } });
        return;
      }

      // Preload tất cả ảnh
      await preloadImages(imageUrls, (loaded, total) => {
        setLoadingProgress(prev => ({
          ...prev,
          [testId]: { loaded, total }
        }));
      });

      // Khi đã preload xong, navigate tới trang test
      navigate('/test-part1', { state: { testId, category, level: 'level1' } });
      
    } catch (error) {
      console.error('Error preloading images:', error);
      // Nếu có lỗi, vẫn navigate để user có thể làm bài
      navigate('/test-part1', { state: { testId, category, level: 'level1' } });
    } finally {
      // Cleanup loading state
      setLoadingTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
      setLoadingProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[testId];
        return newProgress;
      });
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Title Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Part 1 - Photographs</h1>
        <p className="text-slate-600 text-lg">Look at the image and choose the best description</p>
        <div className="mt-4 flex justify-center items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span>Image-based questions</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            <span>6 questions per test</span>
          </div>
        </div>
      </div>
      
      <TestList
        tests={tests}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        startTest={startTest}
        loadingTests={loadingTests}
        loadingProgress={loadingProgress}
      />
    </div>
  );
};

export default Part1;