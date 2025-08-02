import React from 'react';
import { ChevronRight, BookOpen } from 'lucide-react';
import { GrammarTopic } from '../../types/grammar';

interface GrammarTopicCardProps {
  topic: GrammarTopic;
  onClick: () => void;
}

const GrammarTopicCard: React.FC<GrammarTopicCardProps> = ({ topic, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 hover:border-green-300 group"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <BookOpen className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">{topic.questionCount} câu hỏi</span>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
          {topic.name}
        </h3>
        
        <p className="text-gray-600 text-sm leading-relaxed">
          {topic.description}
        </p>
        
        <div className="mt-4 flex items-center text-green-600 text-sm font-medium">
          <span>Bắt đầu luyện tập</span>
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default GrammarTopicCard; 