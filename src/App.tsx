import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import DictationPractice from './components/DictationPractice';
import Part1DictationPractice from './components/Part1DictationPractice';
import Part2DictationPractice from './components/Part2DictationPractice';
import DictationList from './pages/DictationList';
import { CookieConsent } from './components/common';

declare global {
  interface Window {
    loadGoogleAnalytics?: () => void;
  }
}

function App() {
  const handleCookieAccept = () => {
    // Load Google Analytics when user accepts cookies
    if (window.loadGoogleAnalytics) {
      window.loadGoogleAnalytics();
    }
  };

  const handleCookieDecline = () => {
    // Do nothing when user declines cookies
    console.log('User declined cookies');
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<DictationList />} />
          <Route path="/dictation/:setIndex" element={<DictationPractice />} />
          <Route path="/part1/:setIndex" element={<Part1DictationPractice />} />
          <Route path="/part2/:setIndex" element={<Part2DictationPractice />} />
          <Route path="/dictation-list" element={<DictationList />} />
        </Routes>
        
        <CookieConsent 
          onAccept={handleCookieAccept}
          onDecline={handleCookieDecline}
        />
      </div>
    </Router>
  );
}

export default App;