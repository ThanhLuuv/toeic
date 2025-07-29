import React from 'react';

const MobileMenu: React.FC = () => {
  return (
    <div className="md:hidden bg-black/20 backdrop-blur-sm mt-4 rounded-lg p-4 space-y-2">
      <a href="#" className="block text-black font-medium px-4 py-2 rounded-lg hover:bg-black/10">Luyện đề</a>
      <a href="#" className="block text-black font-medium px-4 py-2 rounded-lg hover:bg-black/10">Làm bài thi</a>
      <a href="#" className="block text-black font-medium px-4 py-2 rounded-lg hover:bg-black/10">Chat với AI</a>
      <a href="#" className="block text-black font-medium px-4 py-2 rounded-lg hover:bg-black/10">Trang cá nhân</a>
      <a href="/dictation" className="block text-black font-medium px-4 py-2 rounded-lg hover:bg-black/10">Chép chính tả</a>
    </div>
  );
};

export default MobileMenu;