import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Page Not Implemented</h1>
      <p className="text-gray-600 mb-6">This page is not yet implemented.</p>
      <button
        onClick={() => navigate('/')}
        className=" px-6 py-3 rounded-xl hover:bg-gray-200 transition-all font-medium border border-gray-300"
      >
        Back to Home
      </button>
    </div>
  );
};

export default NotFound;