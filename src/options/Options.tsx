import { useState, useEffect } from 'react';
import type { Settings, Language } from '../shared/types';
import { useTranslation } from '../shared/i18n';
import BlockedSitesSection from './components/BlockedSitesSection';
import ContentFiltersSection from './components/ContentFiltersSection';
import SchedulesSection from './components/SchedulesSection';
import FrictionSection from './components/FrictionSection';
import PomodoroSection from './components/PomodoroSection';
import TimeStatsSection from './components/TimeStatsSection';

type Tab = 'blocked' | 'filters' | 'schedules' | 'friction' | 'pomodoro' | 'stats';

export default function Options() {
  const { t, language, setLanguage } = useTranslation();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('blocked');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [highlightSite, setHighlightSite] = useState<string | null>(null);
  
  useEffect(() => {
    loadSettings();
    
    // Parse URL hash for tab and site highlight
    const parseHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const [tabPart, queryPart] = hash.slice(1).split('?');
        if (tabPart && ['blocked', 'filters', 'schedules', 'friction', 'pomodoro', 'stats'].includes(tabPart)) {
          setActiveTab(tabPart as Tab);
        }
        if (queryPart) {
          const params = new URLSearchParams(queryPart);
          const site = params.get('site');
          if (site) {
            setHighlightSite(site);
          }
        }
      }
    };
    
    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
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
  
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    if (settings) {
      saveSettings({ ...settings, language: newLanguage });
    }
  };
  
  if (!settings) {
    return (
      <div className="options-loading">
        <div className="spinner" />
        <p>{t('common.loading')}</p>
      </div>
    );
  }
  
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { 
      id: 'blocked', 
      label: t('blockedSites.title'),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93l14.14 14.14"/></svg>
    },
    { 
      id: 'filters', 
      label: t('contentFilters.tabTitle'),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
    },
    { 
      id: 'schedules', 
      label: t('schedules.title'),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    },
    { 
      id: 'friction', 
      label: t('friction.title'),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
    },
    { 
      id: 'pomodoro', 
      label: t('pomodoroSettings.tabTitle'),
      icon: <img src="/icons/icon32.png" alt="" width="20" height="20" />
    },
    { 
      id: 'stats', 
      label: t('stats.weeklyOverview'),
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
          <div className="language-selector">
            <label className="language-label">{t('language.title')}</label>
            <select
              className="language-select"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as Language)}
            >
              <option value="auto">{t('language.auto')}</option>
              <option value="en">{t('language.en')}</option>
              <option value="es">{t('language.es')}</option>
              <option value="zh-CN">{t('language.zh-CN')}</option>
              <option value="pt-BR">{t('language.pt-BR')}</option>
            </select>
          </div>
          
          <div className="master-toggle">
            <div className="master-toggle-info">
              <span className="master-toggle-label">{t('common.extension')}</span>
              <span className={`master-toggle-status ${settings.enabled ? 'active' : ''}`}>
                {settings.enabled ? t('common.active') : t('common.disabled')}
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
            <span className={`save-indicator ${saving ? 'saving visible' : ''} ${saved ? 'saved visible' : ''}`}>
              {saving ? t('common.saving') : `✓ ${t('common.saved')}`}
            </span>
          </div>
        </header>
        
        <div className="options-content">
          {activeTab === 'blocked' && (
            <BlockedSitesSection 
              categories={settings.siteCategories}
              onUpdate={(categories) => saveSettings({ ...settings, siteCategories: categories })}
              highlightSite={highlightSite}
              onHighlightClear={() => setHighlightSite(null)}
            />
          )}
          
          {activeTab === 'filters' && (
            <ContentFiltersSection
              filters={settings.contentFilters}
              onUpdate={(filters) => saveSettings({ ...settings, contentFilters: filters })}
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
      
      <style>{`
        .language-selector {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 12px;
        }
        
        .language-label {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        
        .language-select {
          width: 100%;
          padding: 8px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          color: var(--text-primary);
          font-size: 0.875rem;
          cursor: pointer;
        }
        
        .language-select:focus {
          outline: none;
          border-color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}
