import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Dictation Practice');
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = ['Dictation Practice'];

  // Determine active menu based on current location
  React.useEffect(() => {
    if (location.pathname === '/') {
      setActiveNav('Dictation Practice');
    } 
  }, [location.pathname]);

  const handleNavClick = (item: string) => {
    setActiveNav(item);
  };

  return (
    <header className="gradient-bg-header shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img src="/logo.png" alt="Antoree TOEIC" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-black text-xl">
                  Antoree TOEIC
                </span>
              </div>
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item}
                href="/dictation-list"
                className={`nav-item text-black font-medium px-4 py-2 transition-all duration-300 ${activeNav === item ? 'border-b-2 border-green-600' : ''}`}
                onClick={() => handleNavClick(item)}
              >
                {item}
              </a>
            ))}
            <button
              className="nav-item text-black font-medium px-4 py-2 transition-all duration-300"
              style={{ marginLeft: 8 }}
              onClick={() => (window as any).openChatbot && (window as any).openChatbot()}
            >
              Chat Assistant
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;