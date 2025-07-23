import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileMenu from './MobileMenu';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Luyện đề');
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = ['Luyện đề'];

  const handleNavClick = (item: string) => {
    setActiveNav(item);
  };

  const goBack = () => {
    navigate('/');
  };

  const isPart1Page = location.pathname === '/part1' || location.pathname === '/part2' || location.pathname === '/part3';

  return (
    <header className="gradient-bg shadow-lg">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isPart1Page && (
              <button onClick={goBack} className="back-btn text-white hover:text-gray-200 flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                <span>Quay lại</span>
              </button>
            )}
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-600">T</span>
            </div>
            <div>

              <a href="/" className="text-white text-xl font-bold">Thành TOEIC</a>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {!isPart1Page ? (
              <>
                {navItems.map((item) => (
                  <a
                    key={item}
                    href="/"
                    className={`nav-item text-white font-medium px-4 py-2 rounded-lg hover:bg-white/10 ${activeNav === item ? 'active' : ''}`}
                    onClick={() => handleNavClick(item)}
                  >
                    {item}
                  </a>
                ))}
                <button
                  className="nav-item text-white font-medium px-4 py-2 rounded-lg hover:bg-white/10"
                  style={{ marginLeft: 8 }}
                  onClick={() => (window as any).openChatbot && (window as any).openChatbot()}
                >
                  Chat trợ lý
                </button>
              </>
            ) : (
              <div className="text-white/90 text-sm">
                <span className="font-semibold">Xin chào</span>
              </div>
            )}
            <div className="w-10 h-10 bg-white/theory/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        {isMobileMenuOpen && <MobileMenu />}
      </nav>
    </header>
  );
};

export default Header;