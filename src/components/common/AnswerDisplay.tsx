import React from 'react';

interface AnswerItem {
  word: string;
  phonetic: string;
  type: string;
  meaning: string;
}

interface AnswerDisplayProps {
  showAnswer: boolean;
  onToggleAnswer: () => void;
  answers: AnswerItem[];
  title?: string;
}

export const AnswerDisplay: React.FC<AnswerDisplayProps> = ({
  showAnswer,
  onToggleAnswer,
  answers,
  title = "Missing words:"
}) => {
  if (!showAnswer) {
    return (
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <button
          onClick={onToggleAnswer}
          style={{
            background: 'none',
            border: 'none',
            color: '#000',
            fontSize: '14px',
            cursor: 'pointer',
            textDecoration: 'underline',
            fontFamily: 'inherit',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f0fdf4';
            e.currentTarget.style.color = '#000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          Show Answer
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
      <div style={{ 
        marginTop: '12px',
        background: '#fffbeb',
        border: '2px solid #fbbf24',
        borderRadius: '12px',
        padding: '20px',
        display: 'inline-block',
        minWidth: '280px',
        textAlign: 'left'
      }}>
        <div style={{ 
          fontSize: '15px', 
          lineHeight: '1.6',
          color: '#374151'
        }}>
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#1f2937' }}>{title}</strong>
          </div>
          {answers.map((answer, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <strong style={{ color: '#14B24C', marginRight: '8px' }}>
                {answer.word}
              </strong>
              <span style={{ color: '#059669', marginRight: '8px' }}>
                {answer.phonetic}
              </span>
              <span style={{ color: '#dc2626', fontSize: '13px', marginRight: '8px' }}>
                ({answer.type})
              </span>
              <span style={{ color: '#dc2626' }}>
                {answer.meaning}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 