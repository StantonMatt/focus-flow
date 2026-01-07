import type { DailyTimeStats } from '../../shared/types';
import { formatDuration } from '../../shared/utils';
import { useTranslation } from '../../shared/i18n';
import './TimeStats.css';

interface Props {
  stats: DailyTimeStats;
}

export default function TimeStats({ stats }: Props) {
  const { t } = useTranslation();
  
  // Sort domains by time spent (descending)
  const sortedDomains = Object.entries(stats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10); // Top 10
  
  const totalTime = Object.values(stats).reduce((a, b) => a + b, 0);
  const maxTime = sortedDomains.length > 0 ? sortedDomains[0][1] : 0;
  
  if (sortedDomains.length === 0) {
    return (
      <div className="stats-empty">
        <div className="stats-empty-icon">📊</div>
        <p className="stats-empty-title">{t('stats.noActivityYet')}</p>
        <p className="stats-empty-text">
          {t('stats.startBrowsing')}
        </p>
      </div>
    );
  }
  
  return (
    <div className="time-stats">
      <div className="stats-header">
        <h3>{t('stats.todaysActivity')}</h3>
        <span className="stats-total">{formatDuration(totalTime)}</span>
      </div>
      
      <div className="stats-list">
        {sortedDomains.map(([domain, seconds], index) => (
          <div key={domain} className="stats-item" style={{ animationDelay: `${index * 50}ms` }}>
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
    </div>
  );
}
