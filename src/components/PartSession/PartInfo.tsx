import React from 'react';
import { Level } from '../../data/levelData';

interface PartInfoProps {
  partTitle: string;
  partDescription: string;
  currentLevel: Level;
}

const PartInfo: React.FC<PartInfoProps> = ({ partTitle, partDescription, currentLevel }) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg mb-4 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">{partTitle}</h1>
          <p className="text-gray-600 text-sm">{partDescription}</p>
        </div>
        <div className="level-badge text-white px-3 py-1 rounded-xl text-sm font-medium">{currentLevel.name}</div>
      </div>
    </div>
  );
};

export default PartInfo;