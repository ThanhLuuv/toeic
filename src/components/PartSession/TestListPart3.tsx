import React from 'react';

interface Part3Test {
  id: number | string;
  level: string;
  audio: string;
  questions: Array<any>;
  completed?: boolean;
  score?: number;
}

interface TestListPart3Props {
  tests: Part3Test[];
  startTest: (testId: string) => void;
}

const TestListPart3: React.FC<TestListPart3Props> = ({ tests, startTest }) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg slide-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((test) => (
          <div
            key={test.id}
            className={`test-card bg-white rounded-lg p-4 shadow-sm border border-gray-100 ${test.completed ? 'completed-card' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 text-sm line-clamp-2 leading-tight">Đề {test.id} - {test.level}</h4>
                <div className="flex items-center mt-1.5 text-xs text-gray-500">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {test.questions.length} câu
                </div>
              </div>
              {test.completed && (
                <div className="score-badge text-white text-xs font-semibold px-2 py-1 rounded-full ml-2">
                  {test.score}%
                </div>
              )}
            </div>
            <div className="mt-auto">
              <button
                className={`w-full text-xs py-2.5 px-4 rounded-md font-medium ${test.completed ? 'retry-btn text-gray-600 hover:text-gray-800 border border-gray-200' : 'start-btn'}`}
                onClick={() => startTest(String(test.id))}
              >
                {test.completed ? (
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
        ))}
      </div>
    </div>
  );
};

export default TestListPart3; 