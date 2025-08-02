import React, { useState, useRef } from 'react';
import { vocabularyService, Vocabulary } from '../services/vocabularyService';

const VocabularyDataInsert: React.FC = () => {
  const [formData, setFormData] = useState<Omit<Vocabulary, 'id'>>({
    word: '',
    type: '',
    phonetic: '',
    meaning: '',
    audio: '',
    topic: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Validate required fields
      if (!formData.word.trim() || !formData.meaning.trim()) {
        throw new Error('Word và Meaning là bắt buộc');
      }

      await vocabularyService.addVocabulary(formData);
      setMessage({ type: 'success', text: 'Thêm vocabulary thành công!' });
      setFormData({
        word: '',
        type: '',
        phonetic: '',
        meaning: '',
        audio: '',
        topic: ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: `Lỗi: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(null);
    setImportProgress(null);

    try {
      const text = await file.text();
      const vocabularyList: Vocabulary[] = JSON.parse(text);

      if (!Array.isArray(vocabularyList)) {
        throw new Error('File JSON phải chứa một mảng vocabulary');
      }

      setImportProgress({ current: 0, total: vocabularyList.length });

      // Process in batches to avoid overwhelming Firebase
      const batchSize = 10;
      const processedVocab: Omit<Vocabulary, 'id'>[] = [];

      for (let i = 0; i < vocabularyList.length; i++) {
        const vocab = vocabularyList[i];
        
        // Validate required fields
        if (!vocab.word || !vocab.meaning) {
          console.warn(`Skipping invalid vocabulary at index ${i}:`, vocab);
          continue;
        }

        processedVocab.push({
          word: vocab.word.trim(),
          type: vocab.type || '',
          phonetic: vocab.phonetic || '',
          meaning: vocab.meaning.trim(),
          audio: vocab.audio || '',
          topic: vocab.topic || ''
        });

        // Update progress
        setImportProgress({ current: i + 1, total: vocabularyList.length });

        // Process in batches
        if (processedVocab.length >= batchSize || i === vocabularyList.length - 1) {
          await vocabularyService.addMultipleVocabulary(processedVocab);
          processedVocab.length = 0; // Clear array
        }
      }

      setMessage({ 
        type: 'success', 
        text: `Import thành công ${vocabularyList.length} vocabulary!` 
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Lỗi import: ${error instanceof Error ? error.message : 'Invalid JSON format'}` 
      });
    } finally {
      setIsLoading(false);
      setImportProgress(null);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        word: "example",
        type: "n.",
        phonetic: "/ɪɡˈzæmpəl/",
        meaning: "ví dụ",
        audio: "https://example.com/audio.mp3",
        topic: "General"
      }
    ];

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vocabulary_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Quản lý Vocabulary
            </h1>
            <p className="text-gray-600">
              Thêm từ vựng mới hoặc import từ file JSON
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 border border-green-400 text-green-700' 
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* Import Progress */}
          {importProgress && (
            <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span>Đang import...</span>
                <span>{importProgress.current}/{importProgress.total}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Import Section */}
          <div className="mb-8 p-6 bg-gray-50 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Import từ File JSON
            </h2>
            <div className="flex flex-wrap gap-4 items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileImport}
                disabled={isLoading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                onClick={downloadTemplate}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Tải Template
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Upload file JSON chứa mảng vocabulary để import hàng loạt
            </p>
          </div>

          {/* Manual Add Form */}
          <div className="border-t pt-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Thêm Vocabulary Mới
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Từ vựng *
                  </label>
                  <input
                    type="text"
                    name="word"
                    value={formData.word}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập từ vựng..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại từ
                  </label>
                  <input
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="n., v., adj., adv., etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chủ đề
                  </label>
                  <select
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn chủ đề...</option>
                    <option value="Tourism">Du lịch</option>
                    <option value="Accommodations & Food">Chỗ ở & Ẩm thực</option>
                    <option value="Transportation">Giao thông</option>
                    <option value="Stores">Cửa hàng</option>
                    <option value="Purchase & Warranty">Mua sắm & Bảo hành</option>
                    <option value="Performance">Biểu diễn</option>
                    <option value="Exhibition & Museums">Triển lãm & Bảo tàng</option>
                    <option value="Media">Truyền thông</option>
                    <option value="Real Estate">Bất động sản</option>
                    <option value="Arts">Nghệ thuật</option>
                    <option value="Business">Kinh doanh</option>
                    <option value="Technology">Công nghệ</option>
                    <option value="Health">Sức khỏe</option>
                    <option value="Education">Giáo dục</option>
                    <option value="General">Chung</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phiên âm
                  </label>
                  <input
                    type="text"
                    name="phonetic"
                    value={formData.phonetic}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="/ˈwɜːrd/"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio URL
                  </label>
                  <input
                    type="url"
                    name="audio"
                    value={formData.audio}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/audio.mp3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nghĩa *
                </label>
                <textarea
                  name="meaning"
                  value={formData.meaning}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập nghĩa của từ..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? 'Đang thêm...' : 'Thêm Vocabulary'}
                </button>
              </div>
            </form>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Hướng dẫn sử dụng
            </h3>
            <ul className="text-blue-700 space-y-2 text-sm">
              <li>• <strong>Import từ file:</strong> Upload file JSON chứa mảng vocabulary để thêm hàng loạt</li>
              <li>• <strong>Thêm thủ công:</strong> Điền form để thêm từng vocabulary một</li>
              <li>• <strong>Word và Meaning:</strong> Là các trường bắt buộc</li>
              <li>• <strong>Type:</strong> Loại từ (n., v., adj., adv., etc.)</li>
              <li>• <strong>Phonetic:</strong> Phiên âm quốc tế</li>
              <li>• <strong>Audio URL:</strong> Link đến file audio phát âm</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyDataInsert; 