import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { part1Service, Part1Question } from '../services/part1Service';
import TestList from '../components/PartSession/TestList';
import { preloadImages, getImageUrlsFromQuestions } from '../utils/imagePreloader';

const QUESTIONS_PER_TEST = 6;

const Part1: React.FC = () => {
  const navigate = useNavigate();
  const [loadingTests, setLoadingTests] = useState<Set<string>>(new Set());
  const [loadingProgress, setLoadingProgress] = useState<{[testId: string]: {loaded: number, total: number}}>({});
  const [part1Questions, setPart1Questions] = useState<Part1Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm lấy danh sách bài test - không lọc theo chủ đề nữa
  const getTests = () => {
    const totalQuestions = part1Questions.length;
    const numberOfTests = Math.ceil(totalQuestions / QUESTIONS_PER_TEST);
    
    console.log(`Total Questions: ${totalQuestions}, Number of Tests: ${numberOfTests}`);
    
    const tests = Array.from({ length: numberOfTests }, (_, i) => ({
      id: `test${i + 1}`,
      title: `Test #${i + 1}`,
      category: 'all',
      level: 1,
      questions: Math.min(QUESTIONS_PER_TEST, totalQuestions - i * QUESTIONS_PER_TEST),
      completed: false,
      score: 0,
    }));
    
    return tests;
  };

  // Load questions from Firebase
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const questions = await part1Service.getAllQuestions();
        setPart1Questions(questions);
      } catch (err) {
        setError('Không thể tải dữ liệu câu hỏi. Vui lòng thử lại sau.');
        console.error('Error loading questions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Lấy danh sách bài test
  const tests = getTests();

  const startTest = async (testId: string) => {
    const testNumber = parseInt(testId.replace('test', ''), 10);
    
    // Bắt đầu loading
    setLoadingTests(prev => new Set(prev).add(testId));
    setLoadingProgress(prev => ({
      ...prev,
      [testId]: { loaded: 0, total: 0 }
    }));

    try {
      // Lấy questions cho test này
      const testIndex = testNumber - 1;
      const testQuestions = part1Questions.slice(testIndex * QUESTIONS_PER_TEST, (testIndex + 1) * QUESTIONS_PER_TEST);
      
      // Lấy tất cả URL ảnh
      const imageUrls = getImageUrlsFromQuestions(testQuestions);
      
      if (imageUrls.length === 0) {
        // Nếu không có ảnh nào, navigate luôn
        navigate('/test-part1', { state: { testId, category: 'all', level: 'level1' } });
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
      navigate('/test-part1', { state: { testId, category: 'all', level: 'level1' } });
      
    } catch (error) {
      console.error('Error preloading images:', error);
      // Nếu có lỗi, vẫn navigate để user có thể làm bài
      navigate('/test-part1', { state: { testId, category: 'all', level: 'level1' } });
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

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

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
        currentTab="all"
        setCurrentTab={() => {}} // No-op since we don't need tab switching
        startTest={startTest}
        loadingTests={loadingTests}
        loadingProgress={loadingProgress}
      />
    </div>
  );
};

export default Part1;