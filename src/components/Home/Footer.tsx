// File: components/Footer.tsx
import React from 'react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-white mt-20">
      {/* Top Section - Four Columns */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* HỖ TRỢ KHÁCH HÀNG */}
          <div>
            <h3 className="text-lg font-semibold mb-4">HỖ TRỢ KHÁCH HÀNG</h3>
            <div className="space-y-2 text-sm">
              <p>Hotline: 0877709376</p>
              <p>Email: cskh@antoree.com</p>
              <p>Phản hồi dịch vụ: anh.pham2@antoree.com</p>
            </div>
          </div>

          {/* THÔNG TIN DỊCH VỤ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">THÔNG TIN DỊCH VỤ</h3>
            <div className="space-y-2 text-sm">
              <a href="#" className="block hover:text-green-400 transition-colors">Điều khoản sử dụng</a>
              <a href="#" className="block hover:text-green-400 transition-colors">Chính sách bảo mật</a>
              <a href="#" className="block hover:text-green-400 transition-colors">Chính sách hoàn tiền</a>
              <a href="#" className="block hover:text-green-400 transition-colors">FAQS</a>
              <a href="#" className="block hover:text-green-400 transition-colors">Cam kết đầu ra</a>
            </div>
          </div>

          {/* KẾT NỐI VỚI ANTOREE */}
          <div>
            <h3 className="text-lg font-semibold mb-4">KẾT NỐI VỚI ANTOREE</h3>
            <div className="space-y-4">
              <a href="#" className="block hover:text-green-400 transition-colors text-sm">Cộng đồng</a>
              <a 
                href="https://antoree.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors inline-block"
              >
                Trở thành giáo viên
              </a>
              <div className="flex space-x-4">
                <a href="#" className="text-white hover:text-green-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-green-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-green-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
                <a href="#" className="text-white hover:text-green-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* TẢI ỨNG DỤNG TRÊN ĐIỆN THOẠI */}
          <div>
            <h3 className="text-lg font-semibold mb-4">TẢI ỨNG DỤNG TRÊN ĐIỆN THOẠI</h3>
            <div className="space-y-3">
              <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <span>GET IT ON Google Play</span>
              </button>
              <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
                </svg>
                <span>Download on the App Store</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section - Company Information */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-6 py-8">
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold">Công ty Giáo dục và Đào tạo ANTOREE INTERNATIONAL PTE. LTD. (MST: 201436698Z)</p>
              <p>10 Anson Road, #27-15, International Plaza, Singapore 079903</p>
            </div>
            <div>
              <p className="font-semibold">Đối tác đại diện tại Việt Nam: CÔNG TY TNHH PHÁT TRIỂN GIÁO DỤC ANTOREE (MST: 0313769851)</p>
              <p>Văn phòng chính: 187/7 Điện Biên Phủ, P. Đa Kao, Q 1, TP Hồ Chí Minh, Việt Nam</p>
              <p>Văn phòng đại diện: Số 55A Trần Thái Tông, Phường 15, Quận Tân Bình, Hồ Chí Minh, Việt Nam</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Copyright and Legal Links */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold">
                Zalo
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm">© 2025 Antoree Pte.Ltd</p>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm hover:text-green-400 transition-colors">Chính sách bảo mật</a>
              <a href="#" className="text-sm hover:text-green-400 transition-colors">Điều khoản sử dụng</a>
              <button 
                onClick={scrollToTop}
                className="bg-white text-black w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-400">
              Phát triển bởi thanhlaptrinh
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;