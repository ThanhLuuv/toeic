import React from 'react';

interface ProgressBarProps {
  progress: number;
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  borderRadius?: number;
  marginBottom?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  backgroundColor = '#f0f0f0',
  progressColor = '#14B24C',
  borderRadius = 8,
  marginBottom = 18
}) => {
  return (
    <div style={{ 
      height, 
      background: backgroundColor, 
      borderRadius, 
      marginBottom, 
      overflow: 'hidden' 
    }}>
      <div style={{ 
        width: `${progress}%`, 
        height: '100%', 
        background: progressColor, 
        transition: 'width 0.3s' 
      }} />
    </div>
  );
}; 