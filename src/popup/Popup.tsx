import { useState, useEffect, useCallback } from 'react';
import type { Settings, PomodoroState, DailyTimeStats } from '../shared/types';
import { formatDuration } from '../shared/utils';
import { useTranslation } from '../shared/i18n';
import PomodoroTimer from './components/PomodoroTimer';
import TimeStats from './components/TimeStats';

type Tab = 'timer' | 'stats';

export default function Popup() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [pomodoroState, setPomodoroState] = useState<PomodoroState | null>(null);
  const [timeStats, setTimeStats] = useState<DailyTimeStats>({});
  const [activeTab, setActiveTab] = useState<Tab>('timer');
  const [loading, setLoading] = useState(true);
  
  const fetchData = useCallback(async () => {
    try {
      const [settingsRes, pomodoroRes, statsRes] = await Promise.all([
        chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }),
        chrome.runtime.sendMessage({ type: 'GET_POMODORO_STATE' }),
        chrome.runtime.sendMessage({ type: 'GET_TIME_STATS' }),
      ]);
      
      setSettings(settingsRes);
      setPomodoroState(pomodoroRes);
      setTimeStats(statsRes || {});
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchData();
    
    // Poll for updates every second (for timer)
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [fetchData]);
  
  const handleToggleEnabled = async () => {
    if (!settings) return;
    
    const newSettings = { ...settings, enabled: !settings.enabled };
    await chrome.runtime.sendMessage({ 
      type: 'UPDATE_SETTINGS', 
      payload: newSettings 
    });
    setSettings(newSettings);
  };
  
  const handlePomodoroAction = async (action: 'start' | 'pause' | 'reset' | 'skip') => {
    const newState = await chrome.runtime.sendMessage({
      type: 'POMODORO_ACTION',
      payload: { action },
    });
    setPomodoroState(newState);
  };
  
  const openOptions = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/options/index.html') });
  };
  
  if (loading) {
    return (
      <div className="popup-loading">
        <div className="spinner" />
      </div>
    );
  }
  
  const totalTimeToday = Object.values(timeStats).reduce((a, b) => a + b, 0);
  
  return (
    <div className="popup">
      <header className="popup-header">
        <div className="popup-logo">
          <img src="/icons/icon32.png" alt="" width="24" height="24" />
          <span>Focus Flow</span>
        </div>
        
        <div className="popup-controls">
          <button 
            className={`toggle ${settings?.enabled ? 'active' : ''}`}
            onClick={handleToggleEnabled}
            title={settings?.enabled ? t('popup.disableBlocking') : t('popup.enableBlocking')}
          />
          <button className="btn-icon" onClick={openOptions} title={t('common.settings')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </header>
      
      <div className="popup-tabs">
        <button 
          className={`popup-tab ${activeTab === 'timer' ? 'active' : ''}`}
          onClick={() => setActiveTab('timer')}
        >
          <img src="/icons/icon32.png" alt="" width="16" height="16" />
          {t('popup.timer')}
        </button>
        <button 
          className={`popup-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('popup.stats')}
        </button>
      </div>
      
      <main className="popup-content">
        {activeTab === 'timer' && pomodoroState && settings && (
          <PomodoroTimer 
            state={pomodoroState}
            settings={settings.pomodoro}
            onAction={handlePomodoroAction}
          />
        )}
        
        {activeTab === 'stats' && (
          <TimeStats stats={timeStats} />
        )}
      </main>
      
      <footer className="popup-footer">
        <div className="footer-stat">
          <span className="footer-label">{t('common.today')}</span>
          <span className="footer-value">{formatDuration(totalTimeToday)}</span>
        </div>
        <div className="footer-stat">
          <span className="footer-label">{t('popup.pomodoros')}</span>
          <span className="footer-value">{pomodoroState?.todayPomodoros || 0}</span>
        </div>
        <div className="footer-stat">
          <span className="footer-label">{t('popup.status')}</span>
          <span className={`footer-badge ${settings?.enabled ? 'active' : ''}`}>
            {settings?.enabled ? t('common.active') : t('common.off')}
          </span>
        </div>
      </footer>
    </div>
  );
}
