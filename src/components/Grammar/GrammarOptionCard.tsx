import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface GrammarOption {
  label: string;
  text: string;
  translation: string;
  type: string;
}

interface GrammarOptionCardProps {
  option: GrammarOption;
  isSelected: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  showResult: boolean;
  expandedOptions: { [key: string]: boolean };
  onOptionClick: (optionLabel: string) => void;
  onToggleTranslation: (optionLabel: string, e: React.MouseEvent) => void;
}

const GrammarOptionCard: React.FC<GrammarOptionCardProps> = ({
  option,
  isSelected,
  isCorrect,
  isWrong,
  showResult,
  expandedOptions,
  onOptionClick,
  onToggleTranslation
}) => {
  const getOptionClass = () => {
    if (!showResult) {
      return isSelected 
        ? 'border-green-500 bg-green-50' 
        : 'border-gray-200 hover:border-green-300 hover:bg-green-50';
    }

    if (isCorrect) {
      return 'border-green-500 bg-green-100 text-green-800';
    }
    
    if (isWrong) {
      return 'border-red-500 bg-red-100 text-red-800';
    }
    
    return 'border-gray-200 bg-gray-50';
  };

  return (
    <div
      onClick={() => onOptionClick(option.label)}
      className={`p-2 border-2 rounded-full cursor-pointer transition-all duration-200 ${getOptionClass()}`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-semibold text-sm">
          {option.label}
        </div>
        <div className="flex-1">
          {/* Hiển thị text tiếng Anh hoặc bản dịch tùy theo trạng thái toggle */}
          <div className="font-medium text-lg mb-1">
            {showResult && expandedOptions[option.label] 
              ? `${option.translation} (${option.type})`
              : option.text
            }
          </div>
        </div>
        
        {/* Nút toggle translation chỉ hiển thị sau khi đã chọn đáp án */}
        {showResult && (
          <button
            onClick={(e) => onToggleTranslation(option.label, e)}
            className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title={expandedOptions[option.label] ? "Xem tiếng Anh" : "Xem bản dịch"}
          >
            {expandedOptions[option.label] ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default GrammarOptionCard; 