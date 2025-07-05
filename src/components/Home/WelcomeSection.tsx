import React from 'react';

const WelcomeSection: React.FC = () => {
  return (
    <div className="text-center mb-16">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
        Luyện thi <span className="text-indigo-600">TOEIC</span> hiệu quả
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Nâng cao kỹ năng tiếng Anh với hệ thống luyện đề TOEIC toàn diện và thông minh
      </p>
    </div>
  );
};

export default WelcomeSection;