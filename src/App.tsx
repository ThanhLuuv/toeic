import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Home/Header';
import Footer from './components/Home/Footer';
import FloatingFeedback from './components/FloatingFeedback';
import DictationPractice from './components/DictationPractice';
import DictationList from './pages/DictationList';
import Part1DictationPractice from './components/Part1DictationPractice';
import Part2DictationPractice from './components/Part2DictationPractice';
import Chatbot from './components/Chatbot';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/dictation-practice/:setIndex"
          element={<DictationPractice />}
        />
        <Route
          path="/dictation-practice/part1/:setIndex"
          element={<Part1DictationPractice />}
        />
        <Route
          path="/dictation-practice/part2/:setIndex"
          element={<Part2DictationPractice />}
        />
        <Route
          path="*"
          element={
            <div className="bg-gray-50 min-h-screen">
              <Header />
              <Routes>
                <Route path="/" element={<DictationList />} />
              </Routes>
              <Footer />
              <Chatbot />
              <FloatingFeedback />
            </div>
          }
        />
      </Routes>
      <Chatbot />
      <FloatingFeedback />
    </Router>
  );
};

export default App;