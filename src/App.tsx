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
          path="*"
          element={
            <div className="bg-gray-50 min-h-screen">
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/part1" element={<Part1 />} />
                <Route path="/part2" element={<Part2 />} />
                <Route path="/part3" element={<NotFound />} />
                <Route path="/part4" element={<NotFound />} />
                <Route path="/part5" element={<NotFound />} />
                <Route path="/part6" element={<NotFound />} />
                <Route path="/part7" element={<NotFound />} />
              </Routes>
              <Footer />
              <FloatingFeedback />
            </div>
          }
        />
      </Routes>
      <FloatingFeedback />
    </Router>
  );
};

export default App;