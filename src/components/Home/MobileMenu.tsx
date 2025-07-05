import React from 'react';

const MobileMenu: React.FC = () => {
  return (
    <div className="md:hidden bg-white/10 backdrop-blur-sm mt-4 rounded-lg p-4 space-y-2">
      <a href="#" className="block text-white font-medium px-4 py-2 rounded-lg hover:bg-white/10">Luyện đề</a>
      <a href="#" className="block text-white font-medium px-4 py-2 rounded-lg hover:bg-white/10">Làm bài thi</a>
      <a href="#" className="block text-white font-medium px-4 py-2 rounded-lg hover:bg-white/10">Chat với AI</a>
      <a href="#" className="block text-white font-medium px-4 py-2 rounded-lg hover:bg-white/10">Trang cá nhân</a>
    </div>
  );
};

export default MobileMenu;