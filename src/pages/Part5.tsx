import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { part5Service, Part5Question } from '../services/part5Service';
import TestList from '../components/PartSession/TestList';
import { BackButton } from '../components/common/BackButton';

const QUESTIONS_PER_TEST = 30;

const Part5: React.FC = () => {
  const navigate = useNavigate();
  const [loadingTests, setLoadingTests] = useState<Set<string>>(new Set());
  const [loadingProgress, setLoadingProgress] = useState<{[testId: string]: {loaded: number, total: number}}>({});
  const [part5Questions, setPart5Questions] = useState<Part5Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('vocabulary');

  // Hàm lấy danh sách bài test theo category
  const getTests = (category: string) => {
    const filteredQuestions = part5Questions.filter(q => q.type === category);
    const totalQuestions = filteredQuestions.length;
    const numberOfTests = Math.ceil(totalQuestions / QUESTIONS_PER_TEST);
    
    console.log(`Category: ${category}, Total Questions: ${totalQuestions}, Number of Tests: ${numberOfTests}`);
    
    const tests = Array.from({ length: numberOfTests }, (_, i) => ({
      id: `${category}-test${i + 1}`,
      title: `${category === 'vocabulary' ? 'Từ vựng' : 'Ngữ pháp'} Test #${i + 1}`,
      category: category,
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
        const questions = await part5Service.getAllQuestions();
        setPart5Questions(questions);
      } catch (err) {
        setError('Không thể tải dữ liệu câu hỏi. Vui lòng thử lại sau.');
        console.error('Error loading questions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Lấy danh sách bài test cho tab hiện tại
  const tests = getTests(currentTab);

  const startTest = async (testId: string) => {
    // Bắt đầu loading
    setLoadingTests(prev => new Set(prev).add(testId));
    setLoadingProgress(prev => ({
      ...prev,
      [testId]: { loaded: 0, total: 0 }
    }));

    try {
      // Parse testId để lấy category và test number
      const [category, testNumberStr] = testId.split('-');
      const testNumber = parseInt(testNumberStr.replace('test', ''), 10);
      
      // Lấy questions cho test này
      const filteredQuestions = part5Questions.filter(q => q.type === category);
      const testIndex = testNumber - 1;
      const testQuestions = filteredQuestions.slice(testIndex * QUESTIONS_PER_TEST, (testIndex + 1) * QUESTIONS_PER_TEST);
      
      // Simulate loading progress
      setLoadingProgress(prev => ({
        ...prev,
        [testId]: { loaded: 1, total: 1 }
      }));

      // Navigate tới trang test
      navigate('/test-part5', { 
        state: { 
          testId, 
          category: category, 
          level: 'basic' 
        } 
      });
      
    } catch (error) {
      console.error('Error starting test:', error);
      // Nếu có lỗi, vẫn navigate để user có thể làm bài
      const [category] = testId.split('-');
      navigate('/test-part5', { 
        state: { 
          testId, 
          category: category, 
          level: 'basic' 
        } 
      });
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">        
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Part 5 - Incomplete Sentences</h1>
          <p className="text-slate-600 text-lg">Chọn từ phù hợp nhất để hoàn thành câu</p>
          <div className="mt-4 flex justify-center items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" clipRule="evenodd" />
              </svg>
              <span>Vocabulary & Grammar</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              <span>30 questions per test</span>
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
          filterType="part5"
        />
      </div>
    </div>
  );
};

export default Part5; 