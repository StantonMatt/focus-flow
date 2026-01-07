import { useState, useEffect } from 'react';
import { useTranslation } from '../shared/i18n';
import './BlockedPage.css';

export default function BlockedPage() {
  const { t, getQuotes } = useTranslation();
  const [blockedUrl, setBlockedUrl] = useState('');
  const [message, setMessage] = useState('');
  const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);
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
    
    // Random quote from translations
    const quotes = getQuotes();
    if (quotes.length > 0) {
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }
    
    // Breathing animation cycle
    const breathingCycle = () => {
      setBreathingPhase('inhale');
      setTimeout(() => setBreathingPhase('hold'), 4000);
      setTimeout(() => setBreathingPhase('exhale'), 7000);
    };
    
    breathingCycle();
    const interval = setInterval(breathingCycle, 11000);
    
    return () => clearInterval(interval);
  }, [getQuotes]);
  
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
  
  const getBreathingText = () => {
    switch (breathingPhase) {
      case 'inhale':
        return t('blocked.breatheIn');
      case 'hold':
        return t('blocked.hold');
      case 'exhale':
        return t('blocked.breatheOut');
    }
  };
  
  const getBlockedMessage = () => {
    if (message) {
      // Check if it's a known message key
      if (message === 'Daily time limit reached') {
        return t('blocked.dailyLimitReached');
      }
      return message;
    }
    if (blockedUrl) {
      return t('blocked.siteBlocked', { site: blockedUrl });
    }
    return t('blocked.thisIsBlocked');
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
        
        <h1 className="blocked-title">{t('blocked.stayFocused')}</h1>
        
        <p className="blocked-site">
          {getBlockedMessage()}
        </p>
        
        {quote && (
          <div className="blocked-quote">
            <p className="quote-text">"{quote.text}"</p>
            <p className="quote-author">— {quote.author}</p>
          </div>
        )}
        
        <div className="breathing-exercise">
          <p className="breathing-label">{t('blocked.breathe')}</p>
          <div className={`breathing-circle ${breathingPhase}`}>
            <span className="breathing-text">
              {getBreathingText()}
            </span>
          </div>
        </div>
        
        <div className="blocked-actions">
          <button className="btn btn-primary btn-lg" onClick={handleGoBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t('blocked.goBack')}
          </button>
          
          <button className="btn btn-ghost" onClick={handleOpenOptions}>
            {t('common.settings')}
          </button>
        </div>
      </div>
    </div>
  );
}
