import React from 'react';
import WelcomeSection from '../components/Home/WelcomeSection';
import ToeicPartCard from '../components/Home/ToeicPartCard';
import QuickActionCard from '../components/Home/QuickActionCard';
import StatisticsSection from '../components/Home/StatisticsSection';

const Home: React.FC = () => {
  const toeicParts = [
    {
      part: 'Part 1',
      title: 'Photographs',
      description: '6 câu hỏi mô tả hình ảnh',
      svgPath: 'M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z',
    },
    {
      part: 'Part 2',
      title: 'Question-Response',
      description: '25 câu hỏi - đáp',
      svgPath: 'M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z',
    },
    {
      part: 'Part 3',
      title: 'Conversations',
      description: '39 câu hội thoại',
      svgPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      part: 'Part 4',
      title: 'Talks',
      description: '30 câu bài nói',
      svgPath: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
    },
    {
      part: 'Part 5',
      title: 'Incomplete Sentences',
      description: '30 câu điền từ',
      svgPath: 'M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z',
    },
    {
      part: 'Part 6',
      title: 'Text Completion',
      description: '16 câu hoàn thành đoạn văn',
      svgPath: 'M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z',
    },
    {
      part: 'Part 7',
      title: 'Reading Comprehension',
      description: '54 câu đọc hiểu đoạn văn',
      svgPath: 'M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V9a1 1 0 00-1-1h-1v-1z',
      className: 'lg:col-span-2',
    },
  ];

  const quickActions = [
    {
      title: 'Luyện đề nhanh',
      description: 'Thực hành từng part một cách linh hoạt',
      buttonText: 'Bắt đầu ngay',
      svgPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      animationDelay: '0s',
      onClick: () => window.location.href = '/not-found',
    },
    {
      title: 'Thi thử đầy đủ',
      description: 'Mô phỏng bài thi TOEIC thực tế 120 phút',
      buttonText: 'Thi thử ngay',
      svgPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      animationDelay: '0.5s',
      onClick: () => window.location.href = '/not-found',
    },
    {
      title: 'AI Trợ lý',
      description: 'Hỏi đáp và giải thích chi tiết với AI',
      buttonText: 'Chat ngay',
      svgPath: 'M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      animationDelay: '1s',
      onClick: () => (window as any).openChatbot && (window as any).openChatbot(),
    },
  ];

  return (
    <main className="container mx-auto px-6 py-12 max-w-6xl">
      <WelcomeSection />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {toeicParts.map((part, index) => (
          <ToeicPartCard
            key={index}
            part={part.part}
            title={part.title}
            description={part.description}
            count={part.description}
            svgPath={part.svgPath}
            className={part.className}
          />
        ))}
      </div>
      <div className="mt-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Bắt đầu luyện tập</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              title={action.title}
              description={action.description}
              buttonText={action.buttonText}
              svgPath={action.svgPath}
              bgColor={action.bgColor}
              textColor={action.textColor}
              animationDelay={action.animationDelay}
              onClick={action.onClick}
            />
          ))}
        </div>
      </div>
      <StatisticsSection />
    </main>
  );
};

export default Home;