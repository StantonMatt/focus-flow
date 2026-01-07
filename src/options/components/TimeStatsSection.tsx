import { useState, useEffect, useCallback } from 'react';
import type { DailyTimeStats } from '../../shared/types';
import { formatDuration } from '../../shared/utils';
import { useTranslation } from '../../shared/i18n';

export default function TimeStatsSection() {
  const { t, getDayName } = useTranslation();
  const [allStats, setAllStats] = useState<Record<string, DailyTimeStats>>({} as Record<string, DailyTimeStats>);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(60);
  
  const loadStats = useCallback(async () => {
    const result = await chrome.storage.local.get('timeStats');
    setAllStats((result.timeStats as Record<string, DailyTimeStats>) ?? {});
    setSecondsUntilRefresh(60);
  }, []);
  
  useEffect(() => {
    loadStats();
    
    // Auto-refresh every 60 seconds
    const refreshInterval = setInterval(() => {
      loadStats();
    }, 60000);
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setSecondsUntilRefresh(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, [loadStats]);
  
  const todayStats = allStats[selectedDate] || {};
  const sortedDomains = Object.entries(todayStats)
    .sort(([, a], [, b]) => b - a);
  
  const totalTime = Object.values(todayStats).reduce((a, b) => a + b, 0);
  const maxTime = sortedDomains.length > 0 ? sortedDomains[0][1] : 0;
  
  // Get last 7 days for the chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });
  
  const dailyTotals = last7Days.map(date => {
    const stats = allStats[date] || {};
    return Object.values(stats).reduce((a, b) => a + b, 0);
  });
  
  const maxDailyTotal = Math.max(...dailyTotals, 1);
  
  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return getDayName(date.getDay());
  };
  
  const availableDates = Object.keys(allStats).sort().reverse();
  
  const isToday = (dateStr: string) => {
    return dateStr === new Date().toISOString().split('T')[0];
  };
  
  return (
    <div>
      <div className="settings-section">
        <div className="settings-section-header">
          <div>
            <h2 className="settings-section-title">{t('stats.weeklyOverview')}</h2>
            <p className="settings-section-desc">
              {t('stats.weeklyDesc')}
            </p>
          </div>
          <div className="refresh-info">
            <button className="refresh-btn" onClick={loadStats} title="Refresh">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
            <span className="refresh-countdown">{secondsUntilRefresh}{t('common.seconds')}</span>
          </div>
        </div>
        
        <div className="weekly-chart">
          {last7Days.map((date, i) => (
            <div 
              key={date} 
              className={`chart-bar-container ${date === selectedDate ? 'selected' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <div 
                className="chart-bar"
                style={{ height: `${(dailyTotals[i] / maxDailyTotal) * 100}%` }}
              />
              <div className="chart-label">{formatDateShort(date)}</div>
              <div className="chart-value">{formatDuration(dailyTotals[i])}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="settings-section">
        <div className="settings-section-header">
          <div>
            <h2 className="settings-section-title">
              {isToday(selectedDate) ? t('common.today') : selectedDate}
            </h2>
            <p className="settings-section-desc">
              {t('common.total')}: {formatDuration(totalTime)}
            </p>
          </div>
          
          {availableDates.length > 1 && (
            <select
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: 'auto' }}
            >
              {availableDates.map(date => (
                <option key={date} value={date}>
                  {isToday(date) ? t('common.today') : date}
                </option>
              ))}
            </select>
          )}
        </div>
        
        {sortedDomains.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p className="empty-state-title">{t('stats.noDataForDay')}</p>
            <p className="empty-state-text">
              {t('stats.browseToSee')}
            </p>
          </div>
        ) : (
          <div className="stats-list">
            {sortedDomains.map(([domain, seconds], index) => (
              <div key={domain} className="stats-item">
                <div className="stats-rank">{index + 1}</div>
                <img 
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                  alt=""
                  className="stats-favicon"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="stats-domain">{domain}</div>
                <div className="stats-time">{formatDuration(seconds)}</div>
                <div className="stats-bar-container">
                  <div 
                    className="stats-bar" 
                    style={{ width: `${(seconds / maxTime) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style>{`
        .refresh-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .refresh-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .refresh-btn:hover {
          background: var(--bg-tertiary);
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }
        
        .refresh-countdown {
          font-size: 0.75rem;
          font-family: var(--font-mono);
          color: var(--text-muted);
          min-width: 28px;
        }
        
        .weekly-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 160px;
          padding: 20px 0;
          gap: 12px;
        }
        
        .chart-bar-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          cursor: pointer;
          padding: 8px;
          border-radius: var(--border-radius-sm);
          transition: background var(--transition-fast);
        }
        
        .chart-bar-container:hover {
          background: var(--bg-primary);
        }
        
        .chart-bar-container.selected {
          background: rgba(0, 212, 170, 0.1);
        }
        
        .chart-bar {
          width: 100%;
          max-width: 48px;
          background: linear-gradient(180deg, var(--accent-primary), var(--accent-tertiary));
          border-radius: 4px 4px 0 0;
          min-height: 4px;
          margin-top: auto;
          transition: height 0.3s ease-out;
        }
        
        .chart-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 8px;
        }
        
        .chart-value {
          font-size: 0.6875rem;
          font-family: var(--font-mono);
          color: var(--text-secondary);
          margin-top: 2px;
        }
        
        .stats-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .stats-item {
          display: grid;
          grid-template-columns: 24px 24px 1fr auto 100px;
          gap: 12px;
          align-items: center;
          padding: 12px 16px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
        }
        
        .stats-rank {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
          text-align: center;
        }
        
        .stats-favicon {
          width: 20px;
          height: 20px;
          border-radius: 2px;
        }
        
        .stats-domain {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .stats-time {
          font-size: 0.875rem;
          font-family: var(--font-mono);
          color: var(--accent-primary);
          font-weight: 500;
        }
        
        .stats-bar-container {
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .stats-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-tertiary));
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
