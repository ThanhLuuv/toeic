import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Target, 
  Sprout, 
  Rocket, 
  BookOpen, 
  AlertTriangle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import GrammarTopicCard from '../components/Grammar/GrammarTopicCard';
import { grammarService } from '../services/grammarService';
import { GrammarTopic } from '../types/grammar';

const GrammarTopics: React.FC = () => {
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      
      // Cập nhật số lượng câu hỏi cho tất cả topics trước
      await grammarService.updateTopicQuestionCounts();
      
      // Sau đó lấy danh sách topics với số câu hỏi đã được cập nhật
      const fetchedTopics = await grammarService.getGrammarTopics();
      setTopics(fetchedTopics);
    } catch (err) {
      setError('Không thể tải danh sách chủ đề. Vui lòng thử lại sau.');
      console.error('Error loading topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicClick = (topic: GrammarTopic) => {
    navigate(`/grammar/practice/${encodeURIComponent(topic.name)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải danh sách chủ đề...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadTopics}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Luyện Ngữ Pháp</h1>
              <p className="text-gray-600">Chọn chủ đề ngữ pháp bạn muốn luyện tập</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/grammar/insert')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm dữ liệu
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="container mx-auto px-6 py-12">
        {topics.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Chưa có chủ đề nào</h3>
            <p className="text-gray-600">Vui lòng thêm dữ liệu vào Firebase để bắt đầu luyện tập.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <GrammarTopicCard
                key={topic.id}
                topic={topic}
                onClick={() => handleTopicClick(topic)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-6 py-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Luyện tập nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/grammar/practice/mixed')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-center group"
            >
              <Target className="h-8 w-8 text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-gray-800 mb-1">Luyện tập tổng hợp</h3>
              <p className="text-sm text-gray-600">Câu hỏi từ nhiều chủ đề khác nhau</p>
            </button>
            
            <button
              onClick={() => navigate('/grammar/practice/beginner')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-center group"
            >
              <Sprout className="h-8 w-8 text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-gray-800 mb-1">Cơ bản</h3>
              <p className="text-sm text-gray-600">Dành cho người mới bắt đầu</p>
            </button>
            
            <button
              onClick={() => navigate('/grammar/practice/advanced')}
              className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all text-center group"
            >
              <Rocket className="h-8 w-8 text-green-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-medium text-gray-800 mb-1">Nâng cao</h3>
              <p className="text-sm text-gray-600">Thử thách cho người có kinh nghiệm</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrammarTopics;