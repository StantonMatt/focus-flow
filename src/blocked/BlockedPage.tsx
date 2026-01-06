import { useState, useEffect } from 'react';
import './BlockedPage.css';

// Motivational quotes
const quotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
];

export default function BlockedPage() {
  const [blockedUrl, setBlockedUrl] = useState('');
  const [message, setMessage] = useState('');
  const [quote, setQuote] = useState(quotes[0]);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  
  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    const url = params.get('url');
    const msg = params.get('message');
    
    if (url) {
      try {
        const decoded = decodeURIComponent(url);
        const urlObj = new URL(decoded);
        setBlockedUrl(urlObj.hostname);
      } catch {
        setBlockedUrl(url);
      }
    }
    
    if (msg) {
      setMessage(decodeURIComponent(msg));
    }
    
    // Random quote
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    
    // Breathing animation cycle
    const breathingCycle = () => {
      setBreathingPhase('inhale');
      setTimeout(() => setBreathingPhase('hold'), 4000);
      setTimeout(() => setBreathingPhase('exhale'), 7000);
    };
    
    breathingCycle();
    const interval = setInterval(breathingCycle, 11000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  };
  
  const handleOpenOptions = () => {
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('src/options/index.html') });
    });
  };
  
  return (
    <div className="blocked-page">
      <div className="blocked-bg">
        <div className="blocked-bg-gradient" />
        <div className="blocked-bg-pattern" />
      </div>
      
      <div className="blocked-content">
        <div className="blocked-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4" strokeLinecap="round" />
            <path d="M12 16h.01" strokeLinecap="round" />
          </svg>
        </div>
        
        <h1 className="blocked-title">Stay Focused</h1>
        
        <p className="blocked-site">
          {blockedUrl || 'This site'} is blocked
        </p>
        
        {message && (
          <p className="blocked-message">{message}</p>
        )}
        
        <div className="blocked-quote">
          <p className="quote-text">"{quote.text}"</p>
          <p className="quote-author">— {quote.author}</p>
        </div>
        
        <div className="breathing-exercise">
          <p className="breathing-label">Take a moment to breathe</p>
          <div className={`breathing-circle ${breathingPhase}`}>
            <span className="breathing-text">
              {breathingPhase === 'inhale' && 'Breathe in...'}
              {breathingPhase === 'hold' && 'Hold...'}
              {breathingPhase === 'exhale' && 'Breathe out...'}
            </span>
          </div>
        </div>
        
        <div className="blocked-actions">
          <button className="btn btn-primary btn-lg" onClick={handleGoBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Go Back
          </button>
          
          <button className="btn btn-ghost" onClick={handleOpenOptions}>
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}

