import React, { useState, useEffect } from 'react';

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept, onDecline }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem('cookie-consent');
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
    onDecline();
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#1a1a1a',
      color: 'white',
      padding: '16px 20px',
      zIndex: 9999,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
      fontFamily: 'inherit'
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ 
            fontSize: 16, 
            fontWeight: 'bold', 
            marginBottom: 8 
          }}>
            🍪 Cookie Consent
          </div>
          <div style={{ 
            fontSize: 14, 
            color: '#ccc',
            lineHeight: 1.4
          }}>
            Chúng tôi sử dụng cookie để cải thiện trải nghiệm học tập và phân tích lưu lượng truy cập. 
            Bằng cách tiếp tục sử dụng trang web này, bạn đồng ý với việc sử dụng cookie của chúng tôi.
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: 12,
          flexShrink: 0
        }}>
          <button
            onClick={handleDecline}
            style={{
              padding: '10px 20px',
              border: '1px solid #666',
              background: 'transparent',
              color: 'white',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#333';
              e.currentTarget.style.borderColor = '#888';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = '#666';
            }}
          >
            Từ chối
          </button>
          
          <button
            onClick={handleAccept}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: '#14B24C',
              color: 'white',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#12A045';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#14B24C';
            }}
          >
            Chấp nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 