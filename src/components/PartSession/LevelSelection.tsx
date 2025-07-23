import React from 'react';

interface Test {
  id: string | number;
  title: string;
  category: string;
  level?: number;
  questions: number;
  completed: boolean;
  score: number;
}

interface Level {
  name: string;
  tests: Test[];
}

interface LevelSelectionProps {
  currentLevel: number;
  setCurrentLevel: (level: number) => void;
  totalTests: number;
  completedTests: number;
  levels?: { level: number; name: string; tests: Test[] }[];
}

const LevelSelection: React.FC<LevelSelectionProps> = ({ 
  currentLevel, 
  setCurrentLevel, 
  totalTests, 
  completedTests,
  levels = []
}) => {
  // Nếu không có levels từ props, sử dụng dữ liệu mặc định cho Part 2
  const defaultLevels = [
    { level: 1, name: 'Basic sdsfsdsffsfsffsf', tests: [] },
    { level: 2, name: 'Intermediate', tests: [] },
    { level: 3, name: 'Advanced', tests: [] }
  ];

  const displayLevels = levels.length > 0 ? levels : defaultLevels;

  const accuracy = completedTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0;

  return (
    <div className="w-80">
      <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Chọn cấp độ</h3>
        <div className="space-y-3">
          {displayLevels.map((lvl) => {
            const completedInLevel = lvl.tests.filter((test: any) => test.completed).length;
            const totalInLevel = lvl.tests.length;
            return (
              <div
                key={lvl.level}
                className={`level-card bg-white rounded-xl p-4 cursor-pointer transition-all ${
                  currentLevel === lvl.level 
                    ? 'active-level' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setCurrentLevel(lvl.level)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{lvl.name}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Level {lvl.level}</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>{completedInLevel}/{totalInLevel} bài hoàn thành</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
          <h4 className="font-semibold text-gray-800 mb-3">📊 Thống kê nhanh</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Độ chính xác:</span>
              <span className="font-semibold text-green-600">{accuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bài hoàn thành:</span>
              <span className="font-semibold text-blue-600">{completedTests}/{totalTests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thời gian TB:</span>
              <span className="font-semibold text-purple-600">{completedTests > 0 ? '12s/câu' : '0s/câu'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelSelection;