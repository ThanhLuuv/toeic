import React from 'react';
import { Test } from '../../data/levelData';

interface TestListProps {
  tests: Test[];
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  startTest: (testId: string) => void;
  loadingTests: Set<string>;
  loadingProgress: {[testId: string]: {loaded: number, total: number}};
}

const TestList: React.FC<TestListProps> = ({ 
  tests, 
  currentTab, 
  setCurrentTab, 
  startTest, 
  loadingTests, 
  loadingProgress 
}) => {
  const filteredTests = currentTab === 'all' ? tests : tests.filter((test) => test.category === currentTab);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg slide-in">
      <div className="flex mb-6 border-b text-sm">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'people', label: 'Con người' },
          { key: 'object', label: 'Vật thể' },
          { key: 'environment', label: 'Môi trường' },
          { key: 'mixed', label: 'Hỗn hợp' }
        ].map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn px-4 py-2 ${currentTab === tab.key ? 'active' : ''}`}
            data-tab={tab.key}
            onClick={() => setCurrentTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map((test) => {
          const isLoading = loadingTests.has(String(test.id));
          const progress = loadingProgress[String(test.id)];
          const progressPercentage = progress && progress.total > 0
            ? Math.round((progress.loaded / progress.total) * 100)
            : 0;
          
          return (
            <div
              key={test.id}
              className={`test-card bg-white rounded-lg p-4 shadow-sm border border-gray-100 ${test.completed ? 'completed-card' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800 text-sm line-clamp-2 leading-tight">{test.title}</h4>
                  <div className="flex items-center mt-1.5 text-xs text-gray-500">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {test.questions} câu
                  </div>
                </div>
                {test.completed && (
                  <div className="score-badge text-white text-xs font-semibold px-2 py-1 rounded-full ml-2">
                    {test.score}%
                  </div>
                )}
              </div>
              
              {/* Loading progress bar */}
              {isLoading && progress && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Đang tải ảnh...</span>
                    <span>{progress.loaded}/{progress.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="mt-auto">
                <button
                  className={`w-full text-xs py-2.5 px-4 rounded-md font-medium transition-all ${
                    isLoading
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : test.completed 
                      ? 'retry-btn text-gray-600 hover:text-gray-800 border border-gray-200' 
                      : 'start-btn'
                  }`}
                  onClick={() => startTest(String(test.id))}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-3 h-3 inline mr-1" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang tải... ({progressPercentage}%)
                    </>
                  ) : test.completed ? (
                    <>
                      <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                      </svg>
                      Làm lại
                    </>
                  ) : (
                    'Bắt đầu kiểm tra'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestList;