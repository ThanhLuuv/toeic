import React from 'react';

interface AudioButtonProps {
  onClick: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large';
}

export const AudioButton: React.FC<AudioButtonProps> = ({ 
  onClick, 
  title = "Play audio",
  size = 'medium'
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          padding: '8px',
          minWidth: '36px',
          minHeight: '36px',
          fontSize: '16px'
        };
      case 'large':
        return {
          padding: '16px',
          minWidth: '60px',
          minHeight: '60px',
          fontSize: '24px'
        };
      default:
        return {
          padding: '12px',
          minWidth: '48px',
          minHeight: '48px',
          fontSize: '20px'
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <button 
      onClick={onClick} 
      style={{
        padding: sizeStyles.padding,
        borderRadius: '50%',
        border: '2px solid #14B24C',
        background: '#ffffff',
        color: '#14B24C',
        fontSize: sizeStyles.fontSize,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: sizeStyles.minWidth,
        minHeight: sizeStyles.minHeight
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#14B24C';
        e.currentTarget.style.color = '#ffffff';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#ffffff';
        e.currentTarget.style.color = '#14B24C';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      title={title}
    >
      🔊
    </button>
  );
}; 