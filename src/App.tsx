import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Home/Header';
import Home from './pages/Home';
import Part1 from './pages/Part1';
import TestPart1 from './pages/TestPart1';
import NotFound from './components/NotFound';
import Footer from './components/Home/Footer';
import Part2 from './pages/Part2';
import TestPart2 from './pages/TestPart2';
import FloatingFeedback from './components/FloatingFeedback';
import Part3 from './pages/Part3';
import TestPart3 from './pages/TestPart3';
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
          path="/test-part1"
          element={<TestPart1 />}
        />
        <Route
          path="/test-part2/:testId"
          element={<TestPart2 />}
        />
        <Route
          path="/test-part3/:testId"
          element={<TestPart3 />}
        />
        <Route
          path="/dictation/:setIndex"
          element={<DictationPractice />}
        />
        <Route
          path="/dictation/part1/:setIndex"
          element={<Part1DictationPractice />}
        />
        <Route
          path="/dictation/part2/:setIndex"
          element={<Part2DictationPractice />}
        />
        <Route
          path="*"
          element={
            <div className="bg-gray-50 min-h-screen">
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/part1" element={<Part1 />} />
                <Route path="/part2" element={<Part2 />} />
                <Route path="/part3" element={<Part3 />} />
                <Route path="/part4" element={<NotFound />} />
                <Route path="/part5" element={<NotFound />} />
                <Route path="/part6" element={<NotFound />} />
                <Route path="/part7" element={<NotFound />} />
                <Route path="/dictation-list" element={<DictationList />} />
                <Route path="/not-found" element={<NotFound />} />
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