import React from 'react';

interface ActionButton {
  text: string;
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
  show?: boolean;
}

interface ActionButtonsProps {
  buttons: ActionButton[];
  gap?: number;
  marginBottom?: number;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  buttons, 
  gap = 14, 
  marginBottom = 10 
}) => {
  const getButtonStyle = (variant: string, disabled: boolean = false, text: string) => {
    // Check if button should be circular (for navigation buttons)
    const isCircular = text === '←' || text === '⏭';
    // Check if button should have rounded border (for Check and Next buttons)
    const isRounded = text === 'Check' || text === 'Next';
    
    const baseStyle = {
      border: 'none',
      borderRadius: isCircular ? '50%' : (isRounded ? 24 : 8),
      padding: isCircular ? '12px' : '8px 22px',
      width: isCircular ? '44px' : 'auto',
      height: isCircular ? '44px' : 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontSize: isCircular ? 18 : 15,
      cursor: disabled ? 'not-allowed' : 'pointer',
      boxShadow: '0 1px 4px #e0e0e0',
      opacity: disabled ? 0.7 : 1,
      transition: 'all 0.2s ease'
    };

    switch (variant) {
      case 'primary':
        return { ...baseStyle, background: '#1976d2', color: 'white' };
      case 'secondary':
        return { ...baseStyle, background: '#6b7280', color: 'white' };
      case 'success':
        return { ...baseStyle, background: '#4caf50', color: 'white' };
      case 'warning':
        return { ...baseStyle, background: '#ff9800', color: 'white' };
      case 'danger':
        return { ...baseStyle, background: '#f44336', color: 'white' };
      default:
        return { ...baseStyle, background: '#1976d2', color: 'white' };
    }
  };

  const visibleButtons = buttons.filter(button => button.show !== false);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      gap, 
      marginBottom 
    }}>
      {visibleButtons.map((button, index) => (
        <button
          key={index}
          onClick={button.onClick}
          disabled={button.disabled}
          style={getButtonStyle(button.variant, button.disabled, button.text)}
        >
          {button.text}
        </button>
      ))}
    </div>
  );
}; 