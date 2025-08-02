import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ToeicPartCardProps {
  part: string;
  title: string;
  description: string;
  count: string;
  svgPath: string;
  className?: string;
}

const ToeicPartCard: React.FC<ToeicPartCardProps> = ({ part, title, description, count, svgPath, className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Extract the part number (e.g., "1" from "Part 1")
    const partNumber = part.replace('Part ', '').trim();
    navigate(`/part${partNumber}`);
  };

  return (
    <div className={`part-card card-hover rounded-2xl p-6 text-black relative overflow-hidden shadow-lg ${className}`} onClick={handleClick}>
      <div className="absolute top-0 right-0 w-20 h-20 part-circle rounded-full -mr-10 -mt-10"></div>
      <div className="relative z-10">
        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d={svgPath}></path>
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">{part}</h3>
        <p className="text-black/90 text-sm mb-4">{title}</p>
        <p className="text-black/80 text-xs">{count}</p>
      </div>
    </div>
  );
};

export default ToeicPartCard;