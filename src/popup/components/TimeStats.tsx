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
import './TimeStats.css';

type ViewMode = 'sites' | 'categories';

export default function TimeStats() {
  const { t } = useTranslation();
  const [allStats, setAllStats] = useState<Record<string, DailyTimeStats>>({});
  const [categories, setCategories] = useState<SiteCategory[]>([]);
  const [period, setPeriod] = useState<StatsPeriod>('week');
  const [offset, setOffset] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('sites');
  
  const loadData = useCallback(async () => {
    const [statsResult, settings] = await Promise.all([
      chrome.storage.local.get('timeStats'),
      getSettings()
    ]);
    setAllStats((statsResult.timeStats as Record<string, DailyTimeStats>) ?? {});
    setCategories(settings.siteCategories || []);
  }, []);
  
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
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
  
  // Get sorted domains (top 8 for popup)
  const sortedDomains = Object.entries(periodDomains)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);
  
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

  // Empty state
  if (Object.keys(allStats).length === 0) {
    return (
      <div className="stats-empty">
        <div className="stats-empty-icon">📊</div>
        <p className="stats-empty-title">{t('stats.noActivityYet')}</p>
        <p className="stats-empty-text">{t('stats.startBrowsing')}</p>
      </div>
    );
  }

  return (
    <div className="time-stats">
      {/* Period Navigation - Compact */}
      <div className="stats-nav">
        <div className="stats-nav-arrows">
          <button className="nav-arrow-sm" onClick={goBack}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button className="nav-arrow-sm" onClick={goForward} disabled={!canGoForward}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <span className="date-label">{dateRangeLabel}</span>
        </div>
        
        <div className="period-pills">
          {(['day', 'week', 'month', 'year'] as StatsPeriod[]).map(p => (
            <button
              key={p}
              className={`period-pill ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {t(`stats.periods.${p}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart - compact version for week/month/year */}
      {period !== 'day' && chartData.length > 1 && (
        <div className="chart-wrapper">
          <StatsChart 
            data={chartData}
            type={chartType}
            height={100}
            compact
          />
        </div>
      )}

      {/* Total */}
      <div className="stats-header">
        <div className="view-pills">
          <button
            className={`view-pill ${viewMode === 'sites' ? 'active' : ''}`}
            onClick={() => setViewMode('sites')}
          >
            {t('stats.views.sites')}
          </button>
          <button
            className={`view-pill ${viewMode === 'categories' ? 'active' : ''}`}
            onClick={() => setViewMode('categories')}
          >
            {t('stats.views.categories')}
          </button>
        </div>
        <span className="stats-total">{formatDuration(periodTotal)}</span>
      </div>
      
      {/* Sites/Categories List */}
      {viewMode === 'sites' ? (
        sortedDomains.length === 0 ? (
          <div className="stats-empty-mini">
            <p>{t('stats.noDataForDay')}</p>
          </div>
        ) : (
          <div className="stats-list">
            {sortedDomains.map(([domain, seconds], index) => (
              <div key={domain} className="stats-item" style={{ animationDelay: `${index * 40}ms` }}>
                <div className="stats-item-header">
                  <span className="stats-domain">
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                      alt=""
                      className="stats-favicon"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {domain}
                  </span>
                  <span className="stats-time">{formatDuration(seconds)}</span>
                </div>
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
          <div className="stats-empty-mini">
            <p>{t('stats.noDataForDay')}</p>
          </div>
        ) : (
          <div className="stats-list">
            {allCategoryStats.slice(0, 6).map((cat, index) => {
              const isOther = (cat as typeof cat & { isOther?: boolean }).isOther;
              return (
                <div key={cat.id} className={`stats-item ${isOther ? 'other' : ''}`} style={{ animationDelay: `${index * 40}ms` }}>
                  <div className="stats-item-header">
                    <span className="stats-domain">
                      <span className="stats-cat-icon">{cat.icon}</span>
                      {cat.nameKey ? t(cat.nameKey) : cat.name}
                    </span>
                    <span className="stats-time">{formatDuration(cat.seconds)}</span>
                  </div>
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
  );
}
