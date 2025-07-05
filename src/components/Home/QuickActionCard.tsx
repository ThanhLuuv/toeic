import React from 'react';

interface QuickActionCardProps {
  title: string;
  description: string;
  buttonText: string;
  svgPath: string;
  bgColor: string;
  textColor: string;
  buttonBgColor: string;
  buttonHoverBgColor: string;
  animationDelay?: string;
  onClick: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  buttonText,
  svgPath,
  bgColor,
  textColor,
  buttonBgColor,
  buttonHoverBgColor,
  animationDelay,
  onClick,
}) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg card-hover text-center">
      <div className={`w-16 h-16 ${bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6 floating-animation`} style={{ animationDelay }}>
        <svg className={`w-8 h-8 ${textColor}`} fill="currentColor" viewBox="0 0 20 20">
          <path d={svgPath}></path>
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <button className={`${buttonBgColor} text-white px-6 py-3 rounded-xl hover:${buttonHoverBgColor} transition-all font-medium`} onClick={onClick}>
        {buttonText}
      </button>
    </div>
  );
};

export default QuickActionCard;