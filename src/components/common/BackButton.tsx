import React from 'react';

interface BackButtonProps {
  onClick: () => void;
  text?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, text = '← Quay lại' }) => {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'absolute',
        top: 32,
        left: 32,
        background: '#fff',
        border: '1.5px solid #e0e0e0',
        borderRadius: 8,
        padding: '6px 18px',
        fontWeight: 600,
        fontSize: 16,
        color: '#000',
        cursor: 'pointer',
        boxShadow: '0 2px 8px #e0e0e0',
        zIndex: 100,
        transition: 'background 0.2s',
      }}
    >
      {text}
    </button>
  );
}; 