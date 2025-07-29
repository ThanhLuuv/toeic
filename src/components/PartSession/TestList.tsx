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
    <>
      <div className="flex justify-start mb-8">
        <div className="relative">
          <select
            value={currentTab}
            onChange={(e) => setCurrentTab(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer"
          >
            {[
              { key: 'all', label: 'All Categories' },
              { key: 'people', label: 'People' },
              { key: 'object', label: 'Objects' },
              { key: 'environment', label: 'Landscapes' },
              { key: 'mixed', label: 'Mixed' }
            ].map((tab) => (
              <option key={tab.key} value={tab.key}>
                {tab.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTests.map((test) => {
          const isLoading = loadingTests.has(String(test.id));
          const progress = loadingProgress[String(test.id)];
          const progressPercentage = progress && progress.total > 0
            ? Math.round((progress.loaded / progress.total) * 100)
            : 0;
          
          return (
            <div
              key={test.id}
              className={`test-card bg-white rounded-xl p-5 shadow-lg cursor-pointer transition-all duration-300 transform hover:shadow-xl hover:scale-105 hover:-translate-y-1 ${test.completed ? 'completed-card' : ''}`}
              onClick={() => startTest(String(test.id))}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <h3 className="text-lg font-bold text-slate-800">Set {test.id}</h3>
                  {test.completed && (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                      ✓ Hoàn thành
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-slate-700 font-medium">
                      {test.category === 'people' ? 'People' : 
                       test.category === 'object' ? 'Objects' : 
                       test.category === 'environment' ? 'Environment' : 
                       test.category === 'mixed' ? 'Mixed' : 'Topic'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-slate-600">{test.questions} questions</span>
                  </div>
                </div>

                {/* Loading progress bar */}
                {isLoading && progress && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Loading images...</span>
                      <span>{progress.loaded}/{progress.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <div className="w-full bg-slate-100 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        test.completed ? 'bg-green-600 w-full' : 'bg-green-600 w-0'
                      }`}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 text-center">
                    {test.completed ? 'Completed' : 'Start'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TestList;