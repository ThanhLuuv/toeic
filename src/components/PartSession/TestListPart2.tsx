import React from 'react';
import { Test } from '../../data/levelData';

interface TestListPart2Props {
  tests: Test[];
  startTest: (testId: string) => void;
}

const TestListPart2: React.FC<TestListPart2Props> = ({ tests, startTest }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {tests.map((test) => (
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
                  <path fillRule="evenodd" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-700 font-medium">Question-Response</span>
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-600">{test.questions} questions</span>
              </div>
            </div>

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
      ))}
    </div>
  );
};

export default TestListPart2; 