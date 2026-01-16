import { useState, useEffect, useCallback } from 'react';
import type { DailyTimeStats, SiteCategory } from '../../shared/types';
import { 
  formatDuration, 
  getDateRange, 
  aggregateStats,
  getChartDataPoints,
  groupByCategory,
  type StatsPeriod
} from '../../shared/utils';
import { useTranslation } from '../../shared/i18n';
import { StatsChart, type ChartDataPoint } from '../../shared/components';
import { getSettings } from '../../shared/storage';

type ViewMode = 'sites' | 'categories';

export default function TimeStatsSection() {
  const { t } = useTranslation();
  const [allStats, setAllStats] = useState<Record<string, DailyTimeStats>>({});
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [period, setPeriod] = useState<StatsPeriod>('week');
  const [offset, setOffset] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('sites');
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(60);
  
  const loadData = useCallback(async () => {
    const [statsResult, settings] = await Promise.all([
      chrome.storage.local.get('timeStats'),
      getSettings()
    ]);
    setAllStats((statsResult.timeStats as Record<string, DailyTimeStats>) ?? {});
    setCategories(settings.siteCategories || []);
    setSecondsUntilRefresh(60);
  }, []);
  
  useEffect(() => {
    loadData();
    
    const refreshInterval = setInterval(loadData, 60000);
    const countdownInterval = setInterval(() => {
      setSecondsUntilRefresh(prev => Math.max(0, prev - 1));
    }, 1000);
    
    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, [loadData]);

  // Reset offset when period changes
  useEffect(() => {
    setOffset(0);
  }, [period]);

  // Get date range info
  const { start, end, label: dateRangeLabel } = getDateRange(period, offset);
  
  // Get aggregated stats for the period
  const { domains: periodDomains, total: periodTotal } = aggregateStats(allStats, start, end);
  
  // Get chart data
  const chartData: ChartDataPoint[] = getChartDataPoints(period, allStats, offset);
  
  // Get sorted domains or categories
  const sortedDomains = Object.entries(periodDomains)
    .sort(([, a], [, b]) => b - a);
  
  const maxTime = sortedDomains.length > 0 ? sortedDomains[0][1] : 0;
  
  // Group by category if in category view
  const { categoryStats, uncategorized } = groupByCategory(periodDomains, categories);
  const uncategorizedTotal = Object.values(uncategorized).reduce((sum: number, val: number) => sum + val, 0);
  
  // Combine categoryStats with "Other" and sort by time
  const allCategoryStats = [...categoryStats];
  if (uncategorizedTotal > 0) {
    allCategoryStats.push({
      id: 'other',
      name: t('stats.categoryOther'),
      icon: '📁',
      seconds: uncategorizedTotal,
      isOther: true
    } as typeof categoryStats[0] & { isOther?: boolean });
  }
  allCategoryStats.sort((a, b) => b.seconds - a.seconds);
  
  const maxCategoryTime = allCategoryStats.length > 0 ? allCategoryStats[0].seconds : 0;

  // Navigation handlers
  const goBack = () => setOffset(prev => prev - 1);
  const goForward = () => setOffset(prev => Math.min(prev + 1, 0));
  const canGoForward = offset < 0;

  // Determine chart type based on period
  const chartType = period === 'year' ? 'bar' : 'line';

  return (
    <div className="time-stats-section">
      {/* Period Navigation */}
      <div className="settings-section">
        <div className="period-nav">
          <div className="period-nav-left">
            <button 
              className="nav-arrow" 
              onClick={goBack}
              title="Previous"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button 
              className="nav-arrow" 
              onClick={goForward}
              disabled={!canGoForward}
              title="Next"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <span className="date-range-label">{dateRangeLabel}</span>
          </div>
          
          <div className="period-toggle">
            {(['day', 'week', 'month', 'year'] as StatsPeriod[]).map(p => (
              <button
                key={p}
                className={`period-btn ${period === p ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {t(`stats.periods.${p}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Chart - only show for week/month/year */}
        {period !== 'day' && chartData.length > 1 && (
          <div className="chart-container">
            <StatsChart 
              data={chartData}
              type={chartType}
              height={180}
            />
          </div>
        )}

        {/* Total time for period */}
        <div className="period-total">
          <span className="period-total-label">{t('common.total')}</span>
          <span className="period-total-value">{formatDuration(periodTotal)}</span>
        </div>
      </div>

      {/* Sites/Categories List */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'sites' ? 'active' : ''}`}
              onClick={() => setViewMode('sites')}
            >
              {t('stats.views.sites')}
            </button>
            <button
              className={`view-btn ${viewMode === 'categories' ? 'active' : ''}`}
              onClick={() => setViewMode('categories')}
            >
              {t('stats.views.categories')}
            </button>
          </div>
          
          <div className="refresh-info">
            <button className="refresh-btn" onClick={loadData} title="Refresh">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
            <span className="refresh-countdown">{secondsUntilRefresh}{t('common.seconds')}</span>
          </div>
        </div>
        
        {viewMode === 'sites' ? (
          // Sites view
          sortedDomains.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p className="empty-state-title">{t('stats.noDataForDay')}</p>
              <p className="empty-state-text">{t('stats.browseToSee')}</p>
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
          )
        ) : (
          // Categories view
          allCategoryStats.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p className="empty-state-title">{t('stats.noDataForDay')}</p>
              <p className="empty-state-text">{t('stats.browseToSee')}</p>
            </div>
          ) : (
            <div className="stats-list">
              {allCategoryStats.map((cat, index) => {
                const isOther = (cat as typeof cat & { isOther?: boolean }).isOther;
                return (
                  <div key={cat.id} className={`stats-item category-item ${isOther ? 'other' : ''}`}>
                    <div className="stats-rank">{index + 1}</div>
                    <div className="stats-category-icon">{cat.icon}</div>
                    <div className="stats-domain">
                      {cat.nameKey ? t(cat.nameKey) : cat.name}
                    </div>
                    <div className="stats-time">{formatDuration(cat.seconds)}</div>
                    <div className="stats-bar-container">
                      <div 
                        className={`stats-bar ${isOther ? 'other-bar' : ''}`}
                        style={{ width: `${(cat.seconds / maxCategoryTime) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      <style>{`
        .time-stats-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .period-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }

        .period-nav-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-arrow {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-arrow:hover:not(:disabled) {
          background: var(--bg-tertiary);
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        .nav-arrow:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .date-range-label {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-left: 8px;
        }

        .period-toggle {
          display: flex;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          overflow: hidden;
        }

        .period-btn {
          padding: 8px 16px;
          font-size: 0.8125rem;
          font-weight: 500;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .period-btn:hover {
          background: var(--bg-tertiary);
        }

        .period-btn.active {
          background: var(--accent-primary);
          color: var(--bg-primary);
        }

        .chart-container {
          margin: 16px 0;
          padding: 16px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-md);
        }

        .period-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
        }

        .period-total-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .period-total-value {
          font-size: 1.25rem;
          font-weight: 700;
          font-family: var(--font-mono);
          color: var(--accent-primary);
        }

        .view-toggle {
          display: flex;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          overflow: hidden;
        }

        .view-btn {
          padding: 8px 20px;
          font-size: 0.875rem;
          font-weight: 500;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-btn:hover {
          background: var(--bg-tertiary);
        }

        .view-btn.active {
          background: var(--accent-primary);
          color: var(--bg-primary);
        }

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
        
        .stats-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .stats-item {
          display: grid;
          grid-template-columns: 24px 24px 1fr auto 120px;
          gap: 12px;
          align-items: center;
          padding: 12px 16px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          transition: border-color 0.2s;
        }

        .stats-item:hover {
          border-color: var(--accent-primary);
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

        .stats-category-icon {
          font-size: 1.25rem;
          text-align: center;
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
          transition: width 0.3s ease-out;
        }

        .stats-bar.other-bar {
          background: var(--text-muted);
          opacity: 0.5;
        }

        .category-item.other {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}
