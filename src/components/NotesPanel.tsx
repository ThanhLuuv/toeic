import React, { useState } from 'react';

const NotesPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        title="Notes"
        className="fixed bottom-20 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        ✏️
      </button>
      <div className={`fixed bottom-24 right-6 w-72 bg-white border border-gray-300 rounded-xl p-4 shadow-lg z-50 ${isOpen ? '' : 'hidden'}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">Notes</h3>
          <button
            className="text-gray-400 hover:text-gray-600 text-sm"
            onClick={() => setIsOpen(false)}
          >
            ✖
          </button>
        </div>
        <textarea
          placeholder="Write your notes here..."
          className="w-full h-24 p-2 border border-gray-200 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </>
  );
};

export default NotesPanel;