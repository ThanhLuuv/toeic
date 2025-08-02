import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Luyện đề');
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = ['Luyện đề', 'Chép chính tả', 'Luyện ngữ pháp'];

  // Xác định menu active dựa trên current location
  React.useEffect(() => {
    if (location.pathname === '/') {
      setActiveNav('Luyện đề');
    } else if (location.pathname === '/dictation-list' || location.pathname.startsWith('/dictation-practice')) {
      setActiveNav('Chép chính tả');
    } else if (location.pathname === '/grammar') {
      setActiveNav('Luyện ngữ pháp');
    }
  }, [location.pathname]);

  const handleNavClick = (item: string) => {
    setActiveNav(item);
  };

  const goBack = () => {
    navigate('/');
  };

  const isPart1Page = location.pathname === '/part1' || location.pathname === '/part2' || location.pathname === '/part3' || location.pathname.includes('/dictation-list') || location.pathname.includes('/dictation-practice/');

  return (
    <header className="gradient-bg-header shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isPart1Page && (
              <button onClick={goBack} className="back-btn text-black hover:text-gray-700 flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                <span>Quay lại</span>
              </button>
            )}
            <a href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img src="/logo.png" alt="Antoree TOEIC" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="text-black text-xl">
                  {location.pathname === '/part1' ? 'Part 1 - Photographs' :
                   location.pathname === '/part2' ? 'Part 2 - Question-Response' :
                   location.pathname === '/part3' ? 'Part 3 - Conversations' :
                   location.pathname === '/dictation-list' ? 'Dictation' :
                   location.pathname.startsWith('/dictation-practice') ? 'Dictation' :
                   'Antoeic '}
                </span>
              </div>
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {!isPart1Page ? (
              <>
                {navItems.map((item) => (
                  <a
                    key={item}
                    href={item === 'Luyện đề' ? '/' : item === 'Chép chính tả' ? '/dictation-list' : '/grammar'}
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
                  Chat trợ lý
                </button>
              </>
            ) : (
              <div className="text-black/90 text-sm">
                <span className="font-semibold">Xin chào</span>
              </div>
            )}
            <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/30 transition-all">
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>

          <button className="md:hidden text-black" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;