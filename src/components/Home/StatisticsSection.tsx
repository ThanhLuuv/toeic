import React, { useEffect, useRef } from 'react';

const StatisticsSection: React.FC = () => {
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.pulse-animation');
            counters.forEach((counter) => {
              (counter as HTMLElement).style.animationPlayState = 'running';
            });
          }
        });
      },
      { threshold: 0.5, rootMargin: '0px 0px -100px 0px' }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  return (
    <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Thống kê học tập</h2>
      <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-indigo-600 mb-2 pulse-animation">1,250</div>
          <div className="text-gray-600">Câu hỏi đã làm</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2 pulse-animation">85%</div>
          <div className="text-gray-600">Độ chính xác</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2 pulse-animation">24</div>
          <div className="text-gray-600">Ngày liên tiếp</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2 pulse-animation">750</div>
          <div className="text-gray-600">Điểm dự đoán</div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsSection;