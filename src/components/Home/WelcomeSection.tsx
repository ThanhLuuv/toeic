import React from 'react';

const WelcomeSection: React.FC = () => {
  return (
    <div className="text-center mb-16">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
        Mẹo luyện <span className="text-blue-600">chiến lược thi TOEIC</span> điểm cao
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
      Học tiếng Anh hiệu quả hơn 40% với phương pháp luyện thi TOEIC ứng dụng AI và format đề thi thông minh 
      </p>
    </div>
  );
};

export default WelcomeSection;