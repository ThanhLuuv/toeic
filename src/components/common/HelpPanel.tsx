import React from 'react';

interface HelpPanelProps {
  showHelp: boolean;
  onToggleHelp: () => void;
  shortcuts: Array<{
    key: string;
    description: string;
  }>;
  position?: 'right' | 'bottom' | 'top';
}

export const HelpPanel: React.FC<HelpPanelProps> = ({ 
  showHelp, 
  onToggleHelp, 
  shortcuts,
  position = 'right'
}) => {
  const getPositionStyles = () => {
    if (position === 'bottom') {
      return {
        container: {
          position: 'fixed' as const,
          bottom: 20,
          right: 20,
          zIndex: 2100,
        },
        panel: {
          position: 'fixed' as const,
          bottom: 80,
          right: 20,
          zIndex: 2000,
          transform: 'none' as const,
        }
      };
    }
    
    if (position === 'top') {
      return {
        container: {
          position: 'fixed' as const,
          top: 20,
          right: 20,
          zIndex: 2100,
        },
        panel: {
          position: 'fixed' as const,
          top: 80,
          right: 20,
          zIndex: 2000,
          transform: 'none' as const,
        }
      };
    }
    
    // Default right position
    return {
      container: {
        position: 'fixed' as const,
        top: '50%',
        left: 'calc(50% + 240px)',
        transform: 'translateY(-50%)',
        zIndex: 2100,
      },
      panel: {
        position: 'fixed' as const,
        top: '50%',
        left: 'calc(50% + 260px)',
        transform: 'translateY(-50%)',
        zIndex: 2000,
      }
    };
  };

  const positionStyles = getPositionStyles();

  if (!showHelp) {
    return (
      <div style={positionStyles.container}>
        <button
          onClick={onToggleHelp}
          style={{
            background: 'linear-gradient(135deg, #f8fafc 70%, #f0fdf4 100%)',
            border: '1.5px solid #e0e0e0',
            borderRadius: '50%',
            width: 44,
            height: 44,
            boxShadow: '0 2px 8px #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 26,
            color: '#14B24C',
            outline: 'none',
            borderWidth: 2,
            transition: 'box-shadow 0.2s',
          }}
          title="Show help"
        >
          <span role="img" aria-label="help">❔</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{
      ...positionStyles.panel,
      background: 'linear-gradient(135deg, #f8fafc 70%, #f0fdf4 100%)',
      border: '1.5px solid #e0e0e0',
      borderRadius: 18,
      boxShadow: '0 6px 32px rgba(80,120,200,0.13)',
      padding: '28px 32px 22px 32px',
      minWidth: 260,
      maxWidth: 320,
      fontFamily: 'inherit',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 20,
    }}>
      <button
        onClick={onToggleHelp}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'none',
          border: 'none',
          fontSize: 22,
          color: '#888',
          cursor: 'pointer',
        }}
        title="Close"
      >
        ×
      </button>
      <div style={{ fontWeight: 700, fontSize: 18, color: '#14B24C', marginBottom: 2, letterSpacing: 0.2 }}>
        Shortcuts
      </div>
      <div style={{ width: '100%', borderBottom: '1.5px dashed #e0e0e0', margin: '10px 0 8px 0' }} />
      <ul style={{ fontSize: 14, color: '#444', margin: 0, padding: 0, listStyle: 'none', textAlign: 'left', lineHeight: 1.8, width: '100%' }}>
        {shortcuts.map((shortcut, index) => (
          <li key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: index > 0 ? 4 : 0 }}>
            <span style={{ 
              background: '#f0fdf4', 
              color: '#14B24C', 
              borderRadius: 6, 
              padding: '2px 10px', 
              fontWeight: 700, 
              fontSize: 13, 
              minWidth: 44, 
              textAlign: 'center' 
            }}>
              {shortcut.key}
            </span>
            <span style={{fontSize: 13}}>{shortcut.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}; 