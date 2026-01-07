import { useState } from 'react';
import type { ContentFilters } from '../../shared/types';
import { useTranslation } from '../../shared/i18n';

// Get favicon URL for a domain using Google's favicon service
function getFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

interface FilterGroup {
  platform: string;
  platformKey: string;
  domain: string; // Domain for favicon
  filters: {
    key: keyof ContentFilters;
    nameKey: string;
    descKey: string;
  }[];
}

const FILTER_GROUPS: FilterGroup[] = [
  {
    platform: 'YouTube',
    platformKey: 'youtube',
    domain: 'youtube.com',
    filters: [
      { key: 'youtubeShorts', nameKey: 'contentFilters.youtubeShorts', descKey: 'contentFilters.youtubeShortsDesc' },
      { key: 'youtubeRecommendations', nameKey: 'contentFilters.youtubeRecommendations', descKey: 'contentFilters.youtubeRecommendationsDesc' },
      { key: 'youtubeComments', nameKey: 'contentFilters.youtubeComments', descKey: 'contentFilters.youtubeCommentsDesc' },
    ],
  },
  {
    platform: 'Instagram',
    platformKey: 'instagram',
    domain: 'instagram.com',
    filters: [
      { key: 'instagramReels', nameKey: 'contentFilters.instagramReels', descKey: 'contentFilters.instagramReelsDesc' },
      { key: 'instagramStories', nameKey: 'contentFilters.instagramStories', descKey: 'contentFilters.instagramStoriesDesc' },
    ],
  },
  {
    platform: 'Facebook',
    platformKey: 'facebook',
    domain: 'facebook.com',
    filters: [
      { key: 'facebookReels', nameKey: 'contentFilters.facebookReels', descKey: 'contentFilters.facebookReelsDesc' },
      { key: 'facebookStories', nameKey: 'contentFilters.facebookStories', descKey: 'contentFilters.facebookStoriesDesc' },
    ],
  },
  {
    platform: 'Twitter / X',
    platformKey: 'twitter',
    domain: 'x.com',
    filters: [
      { key: 'twitterForYou', nameKey: 'contentFilters.twitterForYou', descKey: 'contentFilters.twitterForYouDesc' },
      { key: 'twitterExplore', nameKey: 'contentFilters.twitterExplore', descKey: 'contentFilters.twitterExploreDesc' },
    ],
  },
  {
    platform: 'Reddit',
    platformKey: 'reddit',
    domain: 'reddit.com',
    filters: [
      { key: 'redditPopular', nameKey: 'contentFilters.redditPopular', descKey: 'contentFilters.redditPopularDesc' },
      { key: 'redditComments', nameKey: 'contentFilters.redditComments', descKey: 'contentFilters.redditCommentsDesc' },
    ],
  },
  {
    platform: 'TikTok',
    platformKey: 'tiktok',
    domain: 'tiktok.com',
    filters: [
      { key: 'tiktokForYou', nameKey: 'contentFilters.tiktokForYou', descKey: 'contentFilters.tiktokForYouDesc' },
    ],
  },
  {
    platform: 'Twitch',
    platformKey: 'twitch',
    domain: 'twitch.tv',
    filters: [
      { key: 'twitchRecommended', nameKey: 'contentFilters.twitchRecommended', descKey: 'contentFilters.twitchRecommendedDesc' },
    ],
  },
  {
    platform: 'LinkedIn',
    platformKey: 'linkedin',
    domain: 'linkedin.com',
    filters: [
      { key: 'linkedinFeed', nameKey: 'contentFilters.linkedinFeed', descKey: 'contentFilters.linkedinFeedDesc' },
    ],
  },
  {
    platform: 'Snapchat',
    platformKey: 'snapchat',
    domain: 'snapchat.com',
    filters: [
      { key: 'snapchatStories', nameKey: 'contentFilters.snapchatStories', descKey: 'contentFilters.snapchatStoriesDesc' },
    ],
  },
];

interface Props {
  filters: ContentFilters;
  onUpdate: (filters: ContentFilters) => void;
}

export default function ContentFiltersSection({ filters, onUpdate }: Props) {
  const { t } = useTranslation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['youtube']));
  
  const toggleGroup = (platformKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(platformKey)) {
      newExpanded.delete(platformKey);
    } else {
      newExpanded.add(platformKey);
    }
    setExpandedGroups(newExpanded);
  };
  
  const toggleFilter = (key: keyof ContentFilters) => {
    onUpdate({
      ...filters,
      [key]: !filters[key],
    });
  };
  
  const getActiveCount = (group: FilterGroup): number => {
    return group.filters.filter(f => filters[f.key]).length;
  };
  
  return (
    <div className="content-filters-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">{t('contentFilters.title')}</h2>
          <p className="section-desc">{t('contentFilters.description')}</p>
        </div>
      </div>
      
      <div className="filter-groups">
        {FILTER_GROUPS.map((group) => {
          const isExpanded = expandedGroups.has(group.platformKey);
          const activeCount = getActiveCount(group);
          
          return (
            <div 
              key={group.platformKey} 
              className={`filter-group ${isExpanded ? 'expanded' : ''}`}
            >
              <button 
                className="filter-group-header"
                onClick={() => toggleGroup(group.platformKey)}
              >
                <img 
                  className="filter-group-favicon" 
                  src={getFaviconUrl(group.domain)} 
                  alt={group.platform}
                  width="24"
                  height="24"
                />
                <span className="filter-group-name">{group.platform}</span>
                {activeCount > 0 && (
                  <span className="filter-group-badge">{activeCount}</span>
                )}
                <svg 
                  className="filter-group-chevron" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              
              {isExpanded && (
                <div className="filter-group-content">
                  {group.filters.map((filter) => (
                    <div key={filter.key} className="filter-item">
                      <div className="filter-item-info">
                        <div className="filter-item-name">{t(filter.nameKey)}</div>
                        <div className="filter-item-desc">{t(filter.descKey)}</div>
                      </div>
                      <button
                        className={`toggle ${filters[filter.key] ? 'active' : ''}`}
                        onClick={() => toggleFilter(filter.key)}
                        aria-label={filters[filter.key] ? t('common.disable') : t('common.enable')}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <style>{`
        .content-filters-section {
          margin-bottom: 24px;
        }
        
        .section-header {
          margin-bottom: 20px;
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }
        
        .section-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin: 0;
        }
        
        .filter-groups {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .filter-group {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        
        .filter-group:hover {
          border-color: var(--border-hover);
        }
        
        .filter-group.expanded {
          border-color: var(--accent-primary);
        }
        
        .filter-group-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-primary);
          text-align: left;
        }
        
        .filter-group-header:hover {
          background: var(--bg-tertiary);
        }
        
        .filter-group-favicon {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          object-fit: contain;
          flex-shrink: 0;
        }
        
        .filter-group-name {
          flex: 1;
          font-size: 1rem;
          font-weight: 600;
        }
        
        .filter-group-badge {
          background: var(--accent-primary);
          color: var(--bg-primary);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 10px;
          min-width: 20px;
          text-align: center;
        }
        
        .filter-group-chevron {
          color: var(--text-muted);
          transition: transform 0.2s ease;
        }
        
        .filter-group.expanded .filter-group-chevron {
          transform: rotate(180deg);
        }
        
        .filter-group-content {
          border-top: 1px solid var(--border-color);
          background: var(--bg-primary);
        }
        
        .filter-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-color);
        }
        
        .filter-item:last-child {
          border-bottom: none;
        }
        
        .filter-item-info {
          flex: 1;
        }
        
        .filter-item-name {
          font-weight: 500;
          font-size: 0.9375rem;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        
        .filter-item-desc {
          font-size: 0.8125rem;
          color: var(--text-muted);
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}

