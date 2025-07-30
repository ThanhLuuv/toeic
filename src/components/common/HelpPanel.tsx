import React, { useRef, useState, useCallback, useEffect } from 'react';

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
  // Drag state
  const [panelPos, setPanelPos] = useState<{ left: number; top: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  // Calculate initial position based on positionStyles
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
          bottom: 70,
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
          top: 70,
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
        left: 'calc(50% + 200px)',
        transform: 'translateY(-50%)',
        zIndex: 2100,
      },
      panel: {
        position: 'fixed' as const,
        top: '50%',
        left: 'calc(50% + 220px)',
        transform: 'translateY(-50%)',
        zIndex: 2000,
      }
    };
  };
  const positionStyles = getPositionStyles();

  // Set initial panel position when showHelp is opened
  useEffect(() => {
    if (showHelp) {
      // Only set if not already set
      if (!panelPos) {
        let left = 0, top = 0;
        if (position === 'bottom') {
          left = window.innerWidth - 280;
          top = window.innerHeight - 250;
        } else if (position === 'top') {
          left = window.innerWidth - 280;
          top = 80;
        } else {
          // right default
          left = window.innerWidth / 2 + 220;
          top = window.innerHeight / 2 - 80;
        }
        setPanelPos({ left, top });
      }
    } else {
      setPanelPos(null); // Reset when closed
    }
  }, [showHelp, position]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      left: panelPos?.left || 0,
      top: panelPos?.top || 0,
    };
    e.preventDefault();
  }, [panelPos]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    let newLeft = dragStart.current.left + dx;
    let newTop = dragStart.current.top + dy;
    // Clamp to viewport
    newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - 220));
    newTop = Math.max(0, Math.min(newTop, window.innerHeight - 100));
    setPanelPos({ left: newLeft, top: newTop });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!showHelp) {
    return (
      <div style={positionStyles.container}>
        <button
          onClick={onToggleHelp}
          style={{
            background: 'linear-gradient(135deg, #f8fafc 70%, #f0fdf4 100%)',
            border: '1.5px solid #e0e0e0',
            borderRadius: '50%',
            width: 36,
            height: 36,
            boxShadow: '0 2px 8px #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 20,
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

  // Panel style: use panelPos if dragging, else fallback to positionStyles.panel
  const panelStyle = panelPos
    ? {
        position: 'fixed' as const,
        left: panelPos.left,
        top: panelPos.top,
        zIndex: 2000,
        cursor: isDragging ? 'grabbing' : 'grab',
        background: 'linear-gradient(135deg, #f8fafc 70%, #f0fdf4 100%)',
        border: '1.5px solid #e0e0e0',
        borderRadius: '14px',
        boxShadow: '0 6px 32px rgba(80,120,200,0.13)',
        padding: '16px 20px 12px 20px',
        minWidth: '220px',
        maxWidth: '280px',
        fontFamily: 'inherit',
        display: 'flex' as const,
        flexDirection: 'column' as const,
        alignItems: 'center' as const,
        gap: '12px',
      }
    : {
        ...positionStyles.panel,
        position: 'fixed' as const,
        background: 'linear-gradient(135deg, #f8fafc 70%, #f0fdf4 100%)',
        border: '1.5px solid #e0e0e0',
        borderRadius: '14px',
        boxShadow: '0 6px 32px rgba(80,120,200,0.13)',
        padding: '16px 20px 12px 20px',
        minWidth: '220px',
        maxWidth: '280px',
        fontFamily: 'inherit',
        display: 'flex' as const,
        flexDirection: 'column' as const,
        alignItems: 'center' as const,
        gap: '12px',
      };

  return (
    <div
      style={panelStyle}
      onMouseDown={handleMouseDown}
    >
      <button
        onClick={onToggleHelp}
        style={{
          position: 'absolute',
          top: 8, // match panel padding top (16px) minus half the button height (12px)
          right: 8, // match panel padding right (20px) minus half the button width (12px)
          width: 24,
          height: 24,
          background: 'none',
          border: 'none',
          fontSize: 15,
          color: '#888',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
        }}
        title="Close"
      >
        ×
      </button>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#14B24C', marginBottom: 0, letterSpacing: 0.2 }}>
        Shortcuts
      </div>
      <div style={{ width: '100%', borderBottom: '1.5px dashed #e0e0e0', margin: '6px 0 4px 0' }} />
      <ul style={{ fontSize: 12, color: '#444', margin: 0, padding: 0, listStyle: 'none', textAlign: 'left', lineHeight: 1.6, width: '100%' }}>
        {shortcuts.map((shortcut, index) => (
          <li key={index} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: index > 0 ? 2 : 0 }}>
            <span style={{ 
              background: '#f0fdf4', 
              color: '#14B24C', 
              borderRadius: 4, 
              padding: '1px 6px', 
              fontWeight: 700, 
              fontSize: 11, 
              minWidth: 40, 
              maxWidth: 40, 
              textAlign: 'center',
              display: 'inline-block',
              flexShrink: 0
            }}>
              {shortcut.key}
            </span>
            <span style={{fontSize: 11, flex: 1, textAlign: 'left', display: 'inline-block', wordBreak: 'break-word'}}>{shortcut.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}; 