import { useState, useEffect } from 'react';
import type { Settings } from '../shared/types';
import BlockedSitesSection from './components/BlockedSitesSection';
import SchedulesSection from './components/SchedulesSection';
import FrictionSection from './components/FrictionSection';
import PomodoroSection from './components/PomodoroSection';
import TimeStatsSection from './components/TimeStatsSection';

type Tab = 'blocked' | 'schedules' | 'friction' | 'pomodoro' | 'stats';

export default function Options() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('blocked');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    const result = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
    setSettings(result);
  };
  
  const saveSettings = async (newSettings: Settings) => {
    setSaving(true);
    setSaved(false);
    
    await chrome.runtime.sendMessage({ 
      type: 'UPDATE_SETTINGS', 
      payload: newSettings 
    });
    
    setSettings(newSettings);
    setSaving(false);
    setSaved(true);
    
    setTimeout(() => setSaved(false), 2000);
  };
  
  const handleToggleEnabled = async () => {
    if (!settings) return;
    await saveSettings({ ...settings, enabled: !settings.enabled });
  };
  
  if (!settings) {
    return (
      <div className="options-loading">
        <div className="spinner" />
        <p>Loading settings...</p>
      </div>
    );
  }
  
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { 
      id: 'blocked', 
      label: 'Blocked Sites',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></svg>
    },
    { 
      id: 'schedules', 
      label: 'Schedules',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    },
    { 
      id: 'friction', 
      label: 'Friction',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    },
    { 
      id: 'pomodoro', 
      label: 'Pomodoro',
      icon: <img src="/icons/icon32.png" alt="" width="20" height="20" />
    },
    { 
      id: 'stats', 
      label: 'Statistics',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
    },
  ];
  
  return (
    <div className="options">
      <aside className="options-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/icons/icon32.png" alt="" width="28" height="28" />
            <span>Focus Flow</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <div className="master-toggle">
            <div className="master-toggle-info">
              <span className="master-toggle-label">Extension</span>
              <span className={`master-toggle-status ${settings.enabled ? 'active' : ''}`}>
                {settings.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <button 
              className={`toggle ${settings.enabled ? 'active' : ''}`}
              onClick={handleToggleEnabled}
            />
          </div>
        </div>
      </aside>
      
      <main className="options-main">
        <header className="options-header">
          <h1>{tabs.find(t => t.id === activeTab)?.label}</h1>
          
          <div className="header-actions">
            {saving && <span className="save-indicator saving">Saving...</span>}
            {saved && <span className="save-indicator saved">✓ Saved</span>}
          </div>
        </header>
        
        <div className="options-content">
          {activeTab === 'blocked' && (
            <BlockedSitesSection 
              sites={settings.blockedSites}
              onUpdate={(sites) => saveSettings({ ...settings, blockedSites: sites })}
            />
          )}
          
          {activeTab === 'schedules' && (
            <SchedulesSection
              schedules={settings.schedules}
              onUpdate={(schedules) => saveSettings({ ...settings, schedules })}
            />
          )}
          
          {activeTab === 'friction' && (
            <FrictionSection
              friction={settings.friction}
              onUpdate={(friction) => saveSettings({ ...settings, friction })}
            />
          )}
          
          {activeTab === 'pomodoro' && (
            <PomodoroSection
              pomodoro={settings.pomodoro}
              onUpdate={(pomodoro) => saveSettings({ ...settings, pomodoro })}
            />
          )}
          
          {activeTab === 'stats' && (
            <TimeStatsSection />
          )}
        </div>
      </main>
    </div>
  );
}

