import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  CheckCircle, 
  XCircle,
  Loader2,
  Upload,
  FileJson
} from 'lucide-react';
import { grammarService } from '../services/grammarService';
import { GrammarQuestion, GrammarTopic, GrammarOption, GrammarTrap } from '../types/grammar';

const GrammarDataInsert: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'topic' | 'question' | 'json'>('topic');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [jsonData, setJsonData] = useState('');
  const [importProgress, setImportProgress] = useState<{
    total: number;
    current: number;
    success: number;
    failed: number;
  } | null>(null);

  // Topic form state
  const [topicForm, setTopicForm] = useState({
    name: '',
    description: '',
    questionCount: 0
  });

  // Question form state
  const [questionForm, setQuestionForm] = useState({
    grammarTopic: '',
    question: '',
    correctAnswer: 'A',
    level: 'Beginner',
    explanation: '',
    translation: '',
    options: [
      { label: 'A', text: '', type: '', translation: '' },
      { label: 'B', text: '', type: '', translation: '' },
      { label: 'C', text: '', type: '', translation: '' },
      { label: 'D', text: '', type: '', translation: '' }
    ],
    trap: {
      type: '',
      description: '',
      commonMistakes: [] as string[]
    }
  });

  // Load topics when component mounts
  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoadingTopics(true);
      const fetchedTopics = await grammarService.getGrammarTopics();
      setTopics(fetchedTopics);
    } catch (error) {
      console.error('Error loading topics:', error);
      setMessage({ type: 'error', text: 'Không thể tải danh sách chủ đề. Vui lòng thử lại.' });
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleTopicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const topicData: Omit<GrammarTopic, 'id'> = {
        name: topicForm.name,
        description: topicForm.description,
        questionCount: topicForm.questionCount
      };

      await grammarService.addGrammarTopic(topicData);
      setMessage({ type: 'success', text: 'Chủ đề ngữ pháp đã được thêm thành công!' });
      setTopicForm({ name: '', description: '', questionCount: 0 });
      
      // Reload topics after adding new topic
      await loadTopics();
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi khi thêm chủ đề: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const questionData: Omit<GrammarQuestion, 'id'> = {
        grammarTopic: questionForm.grammarTopic,
        question: questionForm.question,
        options: questionForm.options,
        correctAnswer: questionForm.correctAnswer,
        explanation: questionForm.explanation,
        translation: questionForm.translation,
        level: questionForm.level,
        trap: questionForm.trap
      };

      await grammarService.addGrammarQuestion(questionData);
      setMessage({ type: 'success', text: 'Câu hỏi ngữ pháp đã được thêm thành công!' });
      resetQuestionForm();
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi khi thêm câu hỏi: ' + (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleJsonImport = async () => {
    if (!jsonData.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập dữ liệu JSON hoặc chọn file.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setImportProgress(null);

    try {
      const parsedData = JSON.parse(jsonData);
      let totalItems = 0;
      let successCount = 0;
      let failedCount = 0;

      // Process topics
      if (parsedData.topics && Array.isArray(parsedData.topics)) {
        totalItems += parsedData.topics.length;
        for (let i = 0; i < parsedData.topics.length; i++) {
          try {
            setImportProgress({
              total: totalItems,
              current: i + 1,
              success: successCount,
              failed: failedCount
            });
            await grammarService.addGrammarTopic(parsedData.topics[i]);
            successCount++;
          } catch (error) {
            console.error('Error importing topic:', error);
            failedCount++;
          }
        }
      }

      // Process questions
      if (parsedData.questions && Array.isArray(parsedData.questions)) {
        const currentTotal = totalItems;
        totalItems += parsedData.questions.length;
        for (let i = 0; i < parsedData.questions.length; i++) {
          try {
            setImportProgress({
              total: totalItems,
              current: currentTotal + i + 1,
              success: successCount,
              failed: failedCount
            });
            await grammarService.addGrammarQuestion(parsedData.questions[i]);
            successCount++;
          } catch (error) {
            console.error('Error importing question:', error);
            failedCount++;
          }
        }
      }

      // Process single question or topic
      if (!parsedData.topics && !parsedData.questions) {
        if (parsedData.grammarTopic) {
          // Single question
          await grammarService.addGrammarQuestion(parsedData);
          successCount++;
        } else if (parsedData.name) {
          // Single topic
          await grammarService.addGrammarTopic(parsedData);
          successCount++;
        }
      }

      setMessage({ 
        type: 'success', 
        text: `Import thành công! ${successCount} items đã được thêm${failedCount > 0 ? `, ${failedCount} items thất bại` : ''}.` 
      });
      setJsonData('');
      
      // Reload topics after import
      await loadTopics();
    } catch (error) {
      setMessage({ type: 'error', text: 'Lỗi khi parse JSON: ' + (error as Error).message });
    } finally {
      setLoading(false);
      setImportProgress(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonData(content);
    };
    reader.readAsText(file);
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      grammarTopic: '',
      question: '',
      correctAnswer: 'A',
      level: 'Beginner',
      explanation: '',
      translation: '',
      options: [
        { label: 'A', text: '', type: '', translation: '' },
        { label: 'B', text: '', type: '', translation: '' },
        { label: 'C', text: '', type: '', translation: '' },
        { label: 'D', text: '', type: '', translation: '' }
      ],
      trap: {
        type: '',
        description: '',
        commonMistakes: [] as string[]
      }
    });
  };

  const updateOption = (index: number, field: keyof GrammarOption, value: string) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const updateTrapField = (field: keyof GrammarTrap, value: string | string[]) => {
    setQuestionForm({
      ...questionForm,
      trap: { ...questionForm.trap, [field]: value }
    });
  };

  const getSampleJson = () => {
    return JSON.stringify({
      topics: [
        {
          name: "Tense",
          description: "Các thì trong tiếng Anh",
          questionCount: 0
        }
      ],
      questions: [
        {
          grammarTopic: "Tense",
          question: "While the manager _____ the report, the employees were discussing the proposal.",
          options: [
            {
              label: "A",
              text: "prepares",
              type: "Verb (present simple)",
              translation: "chuẩn bị"
            },
            {
              label: "B",
              text: "was preparing",
              type: "Verb (past continuous)",
              translation: "đang chuẩn bị"
            },
            {
              label: "C",
              text: "prepared",
              type: "Verb (past simple)",
              translation: "đã chuẩn bị"
            },
            {
              label: "D",
              text: "had prepared",
              type: "Verb (past perfect)",
              translation: "đã chuẩn bị xong"
            }
          ],
          correctAnswer: "B",
          explanation: "Câu có 2 hành động xảy ra đồng thời trong quá khứ. 'While' thường đi với thì quá khứ tiếp diễn.",
          translation: "Trong khi người quản lý đang chuẩn bị báo cáo, các nhân viên đang thảo luận về đề xuất.",
          level: "Intermediate",
          trap: {
            type: "Tense Confusion",
            description: "Thí sinh thường bị bẫy bởi thì quá khứ đơn hoặc thì quá khứ hoàn thành.",
            commonMistakes: ["C", "D"]
          }
        }
      ]
    }, null, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý dữ liệu ngữ pháp</h1>
            <button
              onClick={() => navigate('/grammar')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </button>
          </div>
          <p className="text-gray-600">Thêm chủ đề và câu hỏi ngữ pháp vào cơ sở dữ liệu</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        {/* Import Progress */}
        {importProgress && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">
                Đang import: {importProgress.current}/{importProgress.total}
              </span>
              <span className="text-sm text-blue-600">
                Thành công: {importProgress.success} | Thất bại: {importProgress.failed}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('topic')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'topic'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Thêm chủ đề
              </button>
              <button
                onClick={() => setActiveTab('question')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'question'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Thêm câu hỏi
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'json'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileJson className="h-4 w-4 mr-2" />
                Import JSON
              </button>
            </nav>
          </div>
        </div>

        {/* Topic Form */}
        {activeTab === 'topic' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
              Thêm chủ đề ngữ pháp mới
            </h2>
            <form onSubmit={handleTopicSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên chủ đề
                </label>
                <input
                  type="text"
                  value={topicForm.name}
                  onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số câu hỏi
                </label>
                <input
                  type="number"
                  value={topicForm.questionCount}
                  onChange={(e) => setTopicForm({ ...topicForm, questionCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Thêm chủ đề
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Question Form */}
        {activeTab === 'question' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Thêm câu hỏi ngữ pháp mới
            </h2>
            <form onSubmit={handleQuestionSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chủ đề ngữ pháp
                  </label>
                  {loadingTopics ? (
                    <div className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin text-gray-500" />
                      <span className="text-gray-500">Đang tải chủ đề...</span>
                    </div>
                  ) : (
                    <select
                      value={questionForm.grammarTopic}
                      onChange={(e) => setQuestionForm({ ...questionForm, grammarTopic: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Chọn chủ đề ngữ pháp</option>
                      {topics.map((topic) => (
                        <option key={topic.id} value={topic.name}>
                          {topic.name} ({topic.questionCount} câu hỏi)
                        </option>
                      ))}
                    </select>
                  )}
                  {topics.length === 0 && !loadingTopics && (
                    <p className="text-sm text-orange-600 mt-1">
                      Chưa có chủ đề nào. Vui lòng thêm chủ đề trước khi tạo câu hỏi.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cấp độ
                  </label>
                  <select
                    value={questionForm.level}
                    onChange={(e) => setQuestionForm({ ...questionForm, level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Câu hỏi
                </label>
                <textarea
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Các lựa chọn
                </label>
                <div className="space-y-3">
                  {questionForm.options.map((option, index) => (
                    <div key={option.label} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          value={option.label}
                          checked={questionForm.correctAnswer === option.label}
                          onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value })}
                          className="mr-2"
                        />
                        <span className="font-medium text-gray-700">Đáp án {option.label}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Nội dung"
                          value={option.text}
                          onChange={(e) => updateOption(index, 'text', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Loại từ"
                          value={option.type}
                          onChange={(e) => updateOption(index, 'type', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Nghĩa tiếng Việt"
                          value={option.translation}
                          onChange={(e) => updateOption(index, 'translation', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation and Translation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giải thích
                  </label>
                  <textarea
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bản dịch
                  </label>
                  <textarea
                    value={questionForm.translation}
                    onChange={(e) => setQuestionForm({ ...questionForm, translation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Trap */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Thông tin bẫy</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại bẫy
                    </label>
                    <input
                      type="text"
                      value={questionForm.trap.type}
                      onChange={(e) => updateTrapField('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả bẫy
                    </label>
                    <textarea
                      value={questionForm.trap.description}
                      onChange={(e) => updateTrapField('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lỗi thường gặp (phân cách bằng dấu phẩy)
                    </label>
                    <input
                      type="text"
                      value={questionForm.trap.commonMistakes.join(', ')}
                      onChange={(e) => updateTrapField('commonMistakes', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="A, B, C"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading || topics.length === 0}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Thêm câu hỏi
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetQuestionForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Làm mới
                </button>
              </div>
            </form>
          </div>
        )}

        {/* JSON Import Form */}
        {activeTab === 'json' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FileJson className="h-5 w-5 mr-2 text-blue-600" />
              Import dữ liệu bằng JSON
            </h2>
            
            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload file JSON
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Chọn file
                  </button>
                  <span className="text-sm text-gray-500">
                    Hoặc paste JSON trực tiếp bên dưới
                  </span>
                </div>
              </div>

              {/* JSON Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Dữ liệu JSON
                  </label>
                  <button
                    type="button"
                    onClick={() => setJsonData(getSampleJson())}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Xem mẫu
                  </button>
                </div>
                <textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows={15}
                  placeholder="Paste JSON data here..."
                />
              </div>

              {/* Import Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Hướng dẫn sử dụng:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Hỗ trợ import nhiều chủ đề và câu hỏi cùng lúc</li>
                  <li>• Format: topics: [...], questions: [...]</li>
                  <li>• Hoặc import từng item riêng lẻ</li>
                  <li>• File JSON phải có cấu trúc đúng định dạng</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleJsonImport}
                disabled={loading || !jsonData.trim()}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang import...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import dữ liệu
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrammarDataInsert; 