import React, { useState } from 'react';

const FloatingFeedback: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  
    const formData = new FormData();
    formData.append("entry.1723349186", feedback); // 🔁 Thay entry.xxx bằng đúng mã bạn tìm được
  
    try {
      await fetch("https://docs.google.com/forms/d/e/1FAIpQLSdW34TmB7whrC-fyA4neEDaSn-GhNfbv8yEqwOC8i3Rjm1B2A/formResponse", {
        method: "POST",
        body: formData,
        mode: "no-cors", // ⚠️ PHẢI CÓ để tránh CORS
      });
    } catch (err) {
      console.error("Lỗi gửi:", err);
    }
  
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setFeedback('');
    }, 2000);
  };
  
  

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {!open && (
        <button
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
        onClick={() => setOpen(true)}
        title="Gửi phản hồi"
      >
        <div className="flex items-center justify-center px-4 py-3 min-w-14 min-h-14">
          <span role="img" aria-label="feedback" className="text-2xl group-hover:scale-110 transition-transform duration-150">💬</span>
          <span className="ml-2 text-base font-semibold hidden sm:inline">Feedback</span>
        </div>
      </button>
      )}
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl p-4 w-80 animate-fade-in flex flex-col items-stretch">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-blue-700">Góp ý / Feedback</span>
            <button
              className="text-gray-400 hover:text-gray-600 text-xl font-bold px-2"
              onClick={() => setOpen(false)}
              title="Đóng"
            >
              ×
            </button>
          </div>
          {submitted ? (
            <div className="text-green-600 text-center py-6 font-semibold">Cảm ơn bạn đã gửi góp ý!</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                rows={4}
                placeholder="Nhập góp ý, phản hồi hoặc báo lỗi..."
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
                disabled={!feedback.trim()}
              >
                Gửi
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingFeedback; 