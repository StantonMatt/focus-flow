import { useState, useMemo, useRef, useLayoutEffect, useCallback, useEffect } from 'react';
import type { SiteCategory, BlockedSite, BlockMode } from '../../shared/types';
import { generateId } from '../../shared/utils';
import { useTranslation } from '../../shared/i18n';

interface Props {
  categories: SiteCategory[];
  onUpdate: (categories: SiteCategory[]) => void;
  highlightSite?: string | null;
  onHighlightClear?: () => void;
}

// Site favicon component
function SiteIcon({ domain }: { domain: string }) {
  const [error, setError] = useState(false);
  
  if (error) {
    return <div className="site-icon-fallback">🌐</div>;
  }
  
  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt=""
      className="site-icon"
      onError={() => setError(true)}
      width={20}
      height={20}
    />
  );
}

export default function BlockedSitesSection({ categories, onUpdate, highlightSite, onHighlightClear }: Props) {
  const { t } = useTranslation();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingToCategory, setAddingToCategory] = useState<string | null>(null);
  const [newSitePattern, setNewSitePattern] = useState('');
  const [newSiteMode, setNewSiteMode] = useState<BlockMode>('friction');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📁');
  const [highlightedSiteId, setHighlightedSiteId] = useState<string | null>(null);
  
  // FLIP animation refs
  const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const positionsRef = useRef<Map<string, DOMRect>>(new Map());
  const isFirstRender = useRef(true);
  const siteRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // Handle highlight site from URL
  useEffect(() => {
    if (!highlightSite) return;
    
    // Find the site and its category (only visible/non-hidden sites)
    for (const category of categories) {
      const site = category.sites.find(s => 
        !s.hidden && (highlightSite.includes(s.pattern) || s.pattern.includes(highlightSite))
      );
      if (site) {
        // Expand the category
        setExpandedCategories(prev => new Set([...prev, category.id]));
        // Set the highlighted site
        setHighlightedSiteId(site.id);
        
        // Scroll to site after a short delay to allow expansion
        setTimeout(() => {
          const siteEl = siteRefs.current.get(site.id);
          if (siteEl) {
            siteEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        
        // Clear highlight after 3 seconds
        setTimeout(() => {
          setHighlightedSiteId(null);
          onHighlightClear?.();
        }, 3000);
        
        break;
      }
    }
  }, [highlightSite, categories, onHighlightClear]);
  
  // Store positions before render
  const capturePositions = useCallback(() => {
    categoryRefs.current.forEach((el, id) => {
      if (el) {
        positionsRef.current.set(id, el.getBoundingClientRect());
      }
    });
  }, []);
  
  // Animate from old positions to new positions (FLIP technique)
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    categoryRefs.current.forEach((el, id) => {
      if (!el) return;
      
      const oldPos = positionsRef.current.get(id);
      const newPos = el.getBoundingClientRect();
      
      if (oldPos) {
        const deltaY = oldPos.top - newPos.top;
        
        if (Math.abs(deltaY) > 5) {
          // Apply inverse transform
          el.style.transform = `translateY(${deltaY}px)`;
          el.style.transition = 'none';
          
          // Force reflow
          el.offsetHeight;
          
          // Animate to final position
          el.style.transform = '';
          el.style.transition = 'transform 0.3s ease-out';
        }
      }
    });
    
    // Clear old positions
    positionsRef.current.clear();
  }, [categories]);
  
  // Helper to get category name for sorting
  const getCategoryNameForSort = (cat: SiteCategory): string => {
    if (cat.nameKey) {
      return t(cat.nameKey);
    }
    return cat.name;
  };
  
  // Sort categories: enabled first (alphabetically), then disabled (alphabetically)
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      // First sort by enabled status (enabled comes first)
      if (a.enabled !== b.enabled) {
        return a.enabled ? -1 : 1;
      }
      // Then sort alphabetically by name
      return getCategoryNameForSort(a).localeCompare(getCategoryNameForSort(b));
    });
  }, [categories, t]);
  
  // Toggle category expansion
  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };
  
  // Toggle entire category enabled/disabled
  const toggleCategory = (categoryId: string) => {
    // Capture positions before the update for FLIP animation
    capturePositions();
    onUpdate(categories.map(cat => 
      cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat
    ));
  };
  
  // Toggle individual site
  const toggleSite = (categoryId: string, siteId: string) => {
    onUpdate(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, sites: cat.sites.map(s => s.id === siteId ? { ...s, enabled: !s.enabled } : s) }
        : cat
    ));
  };
  
  // Toggle all sites in a category on or off
  const toggleAllSitesInCategory = (categoryId: string, enable: boolean) => {
    onUpdate(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, sites: cat.sites.map(s => ({ ...s, enabled: enable })) }
        : cat
    ));
  };
  
  // Check if all visible sites in a category are enabled
  const areAllVisibleSitesEnabled = (category: SiteCategory): boolean => {
    const visibleSites = category.sites.filter(s => !s.hidden);
    if (visibleSites.length === 0) return false;
    return visibleSites.every(s => s.enabled);
  };
  
  // Update site mode
  const updateSiteMode = (categoryId: string, siteId: string, mode: BlockMode) => {
    onUpdate(categories.map(cat => 
      cat.id === categoryId 
        ? { 
            ...cat, 
            sites: cat.sites.map(s => 
              s.id === siteId 
                ? { ...s, mode, dailyLimitMinutes: mode === 'time-limit' ? (s.dailyLimitMinutes || 30) : undefined }
                : s
            ) 
          }
        : cat
    ));
  };
  
  // Update site time limit
  const updateSiteLimit = (categoryId: string, siteId: string, minutes: number) => {
    onUpdate(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, sites: cat.sites.map(s => s.id === siteId ? { ...s, dailyLimitMinutes: minutes } : s) }
        : cat
    ));
  };
  
  // Delete site from category
  const deleteSite = (categoryId: string, siteId: string) => {
    onUpdate(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, sites: cat.sites.filter(s => s.id !== siteId) }
        : cat
    ));
  };
  
  // Add site to category
  const addSiteToCategory = (categoryId: string) => {
    if (!newSitePattern.trim()) return;
    
    const newSite: BlockedSite = {
      id: generateId(),
      pattern: newSitePattern.trim().toLowerCase(),
      mode: newSiteMode,
      enabled: true,
      dailyLimitMinutes: newSiteMode === 'time-limit' ? 30 : undefined,
    };
    
    onUpdate(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, sites: [...cat.sites, newSite] }
        : cat
    ));
    
    setNewSitePattern('');
    setNewSiteMode('friction');
    setAddingToCategory(null);
  };
  
  // Create new category
  const createCategory = () => {
    if (!newCategoryName.trim()) return;
    
    const newCategory: SiteCategory = {
      id: generateId(),
      name: newCategoryName.trim(),
      icon: newCategoryIcon,
      enabled: true,
      isCustom: true,
      sites: [],
    };
    
    onUpdate([...categories, newCategory]);
    setNewCategoryName('');
    setNewCategoryIcon('📁');
    setCreatingCategory(false);
    setExpandedCategories(new Set([...expandedCategories, newCategory.id]));
  };
  
  // Delete category
  const deleteCategory = (categoryId: string) => {
    onUpdate(categories.filter(cat => cat.id !== categoryId));
  };
  
  const getModeLabel = (mode: BlockMode) => {
    switch (mode) {
      case 'block': return t('blockedSites.modeBlock');
      case 'friction': return t('blockedSites.modeFriction');
      case 'time-limit': return t('blockedSites.modeTimeLimit');
    }
  };
  
  const getModeColor = (mode: BlockMode) => {
    switch (mode) {
      case 'block': return 'var(--danger)';
      case 'friction': return 'var(--warning)';
      case 'time-limit': return 'var(--accent-tertiary)';
    }
  };
  
  // Get translated category name
  const getCategoryName = (category: SiteCategory): string => {
    if (category.nameKey) {
      const translated = t(category.nameKey);
      // If translation returns the key itself, fall back to name
      if (translated !== category.nameKey) {
        return translated;
      }
    }
    return category.name;
  };
  
  const emojiOptions = ['📱', '📺', '📰', '🎮', '🔞', '💼', '🎵', '🛒', '📧', '⭐', '📁', '🚫'];
  
  return (
    <div>
      <div className="settings-section">
        <div className="settings-section-header">
          <div>
            <h2 className="settings-section-title">{t('blockedSites.title')}</h2>
          </div>
        </div>
        
        {/* Category Cards */}
        <div className="category-list">
          {sortedCategories.map((category) => (
            <div 
              key={category.id} 
              ref={(el) => {
                if (el) categoryRefs.current.set(category.id, el);
                else categoryRefs.current.delete(category.id);
              }}
              className={`category-card ${category.enabled ? 'enabled' : 'disabled'}`}
            >
              {/* Category Header */}
              <div className="category-header" onClick={() => toggleExpand(category.id)}>
                <div className="category-icon">{category.icon}</div>
                <div className="category-info">
                  <div className="category-name">{getCategoryName(category)}</div>
                  <div className="category-count">
                    {(() => {
                      // Only count visible (non-hidden) sites
                      const visibleSites = category.sites.filter(s => !s.hidden);
                      return `${visibleSites.length} ${visibleSites.length === 1 ? t('blockedSites.site') : t('blockedSites.sites')}`;
                    })()}
                  </div>
                </div>
                <div className="category-actions">
                  <button
                    className={`toggle ${category.enabled ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleCategory(category.id); }}
                    title={category.enabled ? t('common.disable') : t('common.enable')}
                  />
                  {category.isCustom && (
                    <button
                      className="btn-icon-sm danger"
                      onClick={(e) => { e.stopPropagation(); deleteCategory(category.id); }}
                      title={t('common.delete')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                  <button className={`expand-btn ${expandedCategories.has(category.id) ? 'expanded' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Category Sites (expandable) */}
              {expandedCategories.has(category.id) && (
                <div className="category-sites">
                  {/* Toggle All Sites button - only show if there are visible sites */}
                  {(() => {
                    const visibleSites = category.sites.filter(s => !s.hidden);
                    if (visibleSites.length > 0) {
                      const allEnabled = areAllVisibleSitesEnabled(category);
                      return (
                        <div className="toggle-all-row">
                          <button
                            className="btn-toggle-all"
                            onClick={() => toggleAllSitesInCategory(category.id, !allEnabled)}
                          >
                            {allEnabled ? t('common.disable') : t('common.enable')} {t('blockedSites.sites')} ({visibleSites.length})
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  {/* Show empty state if no visible sites */}
                  {category.sites.filter(s => !s.hidden).length === 0 ? (
                    <div className="category-empty">
                      <p>{t('blockedSites.noSitesInCategory')}</p>
                    </div>
                  ) : (
                    category.sites.filter(site => !site.hidden).map((site) => (
                      <div 
                        key={site.id} 
                        ref={(el) => {
                          if (el) siteRefs.current.set(site.id, el);
                          else siteRefs.current.delete(site.id);
                        }}
                        className={`site-item ${site.enabled ? '' : 'disabled'} ${highlightedSiteId === site.id ? 'highlighted' : ''}`}
                      >
                        <SiteIcon domain={site.pattern} />
                          <div className="site-info">
                            <span className="site-pattern">{site.pattern}</span>
                            <span 
                              className="mode-badge"
                              style={{ 
                                background: `${getModeColor(site.mode)}22`,
                                color: getModeColor(site.mode)
                              }}
                            >
                              {getModeLabel(site.mode)}
                            </span>
                            {site.mode === 'time-limit' && site.dailyLimitMinutes && (
                              <span className="limit-text">{site.dailyLimitMinutes}m</span>
                            )}
                          </div>
                        
                          {editingId === site.id ? (
                            <div className="site-edit">
                              <select
                                className="form-input form-input-small"
                                value={site.mode}
                                onChange={(e) => updateSiteMode(category.id, site.id, e.target.value as BlockMode)}
                              >
                                <option value="block">{t('blockedSites.modeBlock')}</option>
                                <option value="friction">{t('blockedSites.modeFriction')}</option>
                                <option value="time-limit">{t('blockedSites.modeTimeLimit')}</option>
                              </select>
                              {site.mode === 'time-limit' && (
                                <input
                                  type="number"
                                  className="form-input form-input-small"
                                  value={site.dailyLimitMinutes || 30}
                                  onChange={(e) => updateSiteLimit(category.id, site.id, parseInt(e.target.value) || 30)}
                                  min="1"
                                  max="480"
                                  style={{ width: '70px' }}
                                />
                              )}
                              <button className="btn btn-sm btn-primary" onClick={() => setEditingId(null)}>
                                {t('common.done')}
                              </button>
                            </div>
                          ) : (
                            <div className="site-actions">
                              <button
                                className={`toggle toggle-sm ${site.enabled ? 'active' : ''}`}
                                onClick={() => toggleSite(category.id, site.id)}
                              />
                              <button
                                className="btn-icon-sm"
                                onClick={() => setEditingId(site.id)}
                                title={t('common.edit')}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                            <button
                              className="btn-icon-sm danger"
                              onClick={() => deleteSite(category.id, site.id)}
                              title={t('common.delete')}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                            </div>
                          )}
                        </div>
                    ))
                  )}
                  
                  {/* Add site form */}
                  {addingToCategory === category.id ? (
                    <div className="add-site-form">
                      <input
                        type="text"
                        className="form-input"
                        placeholder={t('blockedSites.placeholder')}
                        value={newSitePattern}
                        onChange={(e) => setNewSitePattern(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSiteToCategory(category.id)}
                        autoFocus
                      />
                      <select
                        className="form-input"
                        value={newSiteMode}
                        onChange={(e) => setNewSiteMode(e.target.value as BlockMode)}
                      >
                        <option value="block">{t('blockedSites.modeBlock')}</option>
                        <option value="friction">{t('blockedSites.modeFriction')}</option>
                        <option value="time-limit">{t('blockedSites.modeTimeLimit')}</option>
                      </select>
                      <button className="btn btn-primary btn-sm" onClick={() => addSiteToCategory(category.id)}>
                        {t('common.add')}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setAddingToCategory(null)}>
                        {t('common.cancel')}
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="add-site-btn"
                      onClick={() => setAddingToCategory(category.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      {t('blockedSites.addSiteToCategory')}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Create new category */}
        {creatingCategory ? (
          <div className="create-category-form">
            <div className="form-row">
              <select
                className="form-input emoji-select"
                value={newCategoryIcon}
                onChange={(e) => setNewCategoryIcon(e.target.value)}
              >
                {emojiOptions.map(emoji => (
                  <option key={emoji} value={emoji}>{emoji}</option>
                ))}
              </select>
              <input
                type="text"
                className="form-input"
                placeholder={t('blockedSites.categoryNamePlaceholder')}
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createCategory()}
                autoFocus
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={createCategory}>
                {t('blockedSites.createCategory')}
              </button>
              <button className="btn btn-ghost" onClick={() => setCreatingCategory(false)}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        ) : (
          <button 
            className="create-category-btn"
            onClick={() => setCreatingCategory(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t('blockedSites.newCategory')}
          </button>
        )}
      </div>
      
      <style>{`
        .category-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .category-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          transition: opacity 0.2s, border-color 0.2s;
          will-change: transform;
        }
        
        .category-card.disabled {
          opacity: 0.6;
        }
        
        .category-card.enabled {
          border-color: var(--accent-primary);
        }
        
        .category-header {
          display: flex;
          align-items: center;
          padding: 16px;
          cursor: pointer;
          gap: 12px;
          transition: background 0.2s;
        }
        
        .category-header:hover {
          background: var(--bg-secondary);
        }
        
        .category-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border-radius: 8px;
        }
        
        .category-info {
          flex: 1;
        }
        
        .category-name {
          font-weight: 600;
          font-size: 1rem;
          color: var(--text-primary);
        }
        
        .category-count {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }
        
        .category-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .expand-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          padding: 4px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .expand-btn.expanded {
          transform: rotate(180deg);
        }
        
        .category-sites {
          padding: 0 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-top: 1px solid var(--border);
          padding-top: 12px;
        }
        
        .category-empty {
          text-align: center;
          padding: 20px;
          color: var(--text-muted);
        }
        
        .site-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: var(--bg-secondary);
          border-radius: 8px;
          transition: opacity 0.2s;
        }
        
        .site-item.disabled {
          opacity: 0.5;
        }
        
        .site-item.highlighted {
          animation: highlight-pulse 2s ease-out;
          background: rgba(0, 212, 170, 0.2);
          border: 1px solid var(--accent-primary);
        }
        
        @keyframes highlight-pulse {
          0% {
            background: rgba(0, 212, 170, 0.4);
            box-shadow: 0 0 0 4px rgba(0, 212, 170, 0.3);
          }
          100% {
            background: rgba(0, 212, 170, 0.1);
            box-shadow: 0 0 0 0 rgba(0, 212, 170, 0);
          }
        }
        
        .site-item.site-hidden {
          cursor: pointer;
          border: 1px dashed var(--border);
          background: var(--bg-tertiary);
        }
        
        .site-item.site-hidden:hover {
          border-color: var(--text-muted);
        }
        
        .site-item.site-revealed {
          background: rgba(0, 212, 170, 0.05);
          border: 1px solid rgba(0, 212, 170, 0.2);
        }
        
        .site-hidden-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        
        .site-revealed-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
          flex-shrink: 0;
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        
        .site-revealed-icon:hover {
          opacity: 1;
        }
        
        .site-pattern-hidden {
          color: var(--text-muted);
          font-style: italic;
        }
        
        .site-reveal-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
          opacity: 0.7;
        }
        
        .site-icon {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        
        .site-icon-fallback {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }
        
        .site-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .site-pattern {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875rem;
          color: var(--text-primary);
        }
        
        .mode-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 500;
        }
        
        .limit-text {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        
        .site-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .site-actions .btn-icon-sm + .btn-icon-sm {
          margin-left: -6px;
        }
        
        .site-edit {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .toggle-sm {
          width: 32px;
          height: 18px;
        }
        
        .toggle-sm::after {
          top: 2px;
          left: 2px;
          width: 14px;
          height: 14px;
        }
        
        .toggle-sm.active::after {
          transform: translateX(14px);
        }
        
        .add-site-form {
          display: flex;
          gap: 8px;
          padding: 8px;
          background: var(--bg-secondary);
          border-radius: 8px;
        }
        
        .add-site-form .form-input {
          padding: 8px 12px;
          font-size: 0.875rem;
        }
        
        .add-site-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: none;
          border: 1px dashed var(--border);
          border-radius: 8px;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
          width: 100%;
          justify-content: center;
        }
        
        .add-site-btn:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }
        
        .create-category-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          background: none;
          border: 2px dashed var(--border);
          border-radius: 12px;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.2s;
          width: 100%;
          margin-top: 12px;
        }
        
        .create-category-btn:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }
        
        .create-category-form {
          margin-top: 12px;
          padding: 16px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 12px;
        }
        
        .emoji-select {
          width: 60px;
          font-size: 1.25rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
