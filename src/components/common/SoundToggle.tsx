import React from 'react';

interface SoundToggleProps {
  soundEnabled: boolean;
  onToggle: () => void;
}

export const SoundToggle: React.FC<SoundToggleProps> = ({ soundEnabled, onToggle }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 12,
      right: 12,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      zIndex: 10,
    }}>
      <button
        onClick={onToggle}
        style={{
          background: soundEnabled ? '#14B24C' : '#f44336',
          border: 'none',
          borderRadius: '50%',
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: 16,
          color: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          transition: 'all 0.2s ease',
        }}
        title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
      >
        {soundEnabled ? '●' : '○'}
      </button>
      <span style={{
        fontSize: 10,
        color: '#666',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}>
        Sound
      </span>
    </div>
  );
}; 