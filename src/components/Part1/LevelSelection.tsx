import React from 'react';
import { Level, levelData } from '../../data/levelData';

interface LevelSelectionProps {
  currentLevel: number;
  setCurrentLevel: (level: number) => void;
  totalTests: number;
  completedTests: number;
}

const LevelSelection: React.FC<LevelSelectionProps> = ({ currentLevel, setCurrentLevel, totalTests, completedTests }) => {
  const levels = [
    { level: 1, name: 'Beginner', description: 'Mới học - Hình ảnh đơn giản', badgeColor: 'bg-green-100 text-green-800' },
    { level: 2, name: 'Elementary', description: 'Sơ cấp - Hoạt động đa dạng', badgeColor: 'bg-blue-100 text-blue-800' },
    { level: 3, name: 'Pre-Inter', description: 'Trung cấp thấp - Nhiều đối tượng', badgeColor: 'bg-yellow-100 text-yellow-800' },
    { level: 4, name: 'Intermediate', description: 'Trung cấp - Tình huống phức tạp', badgeColor: 'bg-orange-100 text-orange-800' },
    { level: 5, name: 'Advanced', description: 'Khó - Ngữ cảnh phức tạp', badgeColor: 'bg-red-100 text-red-800' },
  ];

  const accuracy = completedTests > 0
    ? Math.round(
        Object.values(levelData).reduce((acc, level) =>
          acc + level.tests.reduce((sum, test) => (test.completed ? sum + test.score : sum), 0), 0) / completedTests
      )
    : 0;

  return (
    <div className="w-80">
      <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Chọn cấp độ</h3>
        <div className="space-y-3">
          {levels.map((lvl) => {
            const completedInLevel = levelData[lvl.level].tests.filter((test) => test.completed).length;
            const totalInLevel = levelData[lvl.level].tests.length;
            return (
              <div
                key={lvl.level}
                className={`level-card bg-white rounded-xl p-4 cursor-pointer ${currentLevel === lvl.level ? 'active' : ''}`}
                onClick={() => setCurrentLevel(lvl.level)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">Level {lvl.level}</h4>
                  <span className={`text-xs ${lvl.badgeColor} px-2 py-1 rounded-full`}>{lvl.name}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{lvl.description}</p>
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