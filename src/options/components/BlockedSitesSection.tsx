import { useState } from 'react';
import type { BlockedSite, BlockMode } from '../../shared/types';
import { generateId } from '../../shared/utils';

interface Props {
  sites: BlockedSite[];
  onUpdate: (sites: BlockedSite[]) => void;
}

export default function BlockedSitesSection({ sites, onUpdate }: Props) {
  const [newPattern, setNewPattern] = useState('');
  const [newMode, setNewMode] = useState<BlockMode>('block');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const handleAdd = () => {
    if (!newPattern.trim()) return;
    
    const newSite: BlockedSite = {
      id: generateId(),
      pattern: newPattern.trim().toLowerCase(),
      mode: newMode,
      enabled: true,
      dailyLimitMinutes: newMode === 'time-limit' ? 30 : undefined,
    };
    
    onUpdate([...sites, newSite]);
    setNewPattern('');
    setNewMode('block');
  };
  
  const handleToggle = (id: string) => {
    onUpdate(sites.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };
  
  const handleDelete = (id: string) => {
    onUpdate(sites.filter(s => s.id !== id));
  };
  
  const handleUpdateMode = (id: string, mode: BlockMode) => {
    onUpdate(sites.map(s => 
      s.id === id ? { 
        ...s, 
        mode,
        dailyLimitMinutes: mode === 'time-limit' ? (s.dailyLimitMinutes || 30) : undefined
      } : s
    ));
  };
  
  const handleUpdateLimit = (id: string, minutes: number) => {
    onUpdate(sites.map(s => 
      s.id === id ? { ...s, dailyLimitMinutes: minutes } : s
    ));
  };
  
  const getModeLabel = (mode: BlockMode) => {
    switch (mode) {
      case 'block': return 'Block';
      case 'friction': return 'Friction';
      case 'time-limit': return 'Time Limit';
    }
  };
  
  const getModeColor = (mode: BlockMode) => {
    switch (mode) {
      case 'block': return 'var(--danger)';
      case 'friction': return 'var(--warning)';
      case 'time-limit': return 'var(--accent-tertiary)';
    }
  };
  
  return (
    <div>
      <div className="settings-section">
        <div className="settings-section-header">
          <div>
            <h2 className="settings-section-title">Add Blocked Site</h2>
            <p className="settings-section-desc">
              Enter a domain or URL pattern to block (e.g., youtube.com/shorts, x.com)
            </p>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <input
              type="text"
              className="form-input"
              placeholder="example.com or example.com/path"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
          </div>
          
          <div className="form-group">
            <select
              className="form-input"
              value={newMode}
              onChange={(e) => setNewMode(e.target.value as BlockMode)}
            >
              <option value="block">Block</option>
              <option value="friction">Friction</option>
              <option value="time-limit">Time Limit</option>
            </select>
          </div>
          
          <button className="btn btn-primary" onClick={handleAdd}>
            Add Site
          </button>
        </div>
      </div>
      
      <div className="settings-section">
        <div className="settings-section-header">
          <div>
            <h2 className="settings-section-title">Blocked Sites</h2>
            <p className="settings-section-desc">
              {sites.length} site{sites.length !== 1 ? 's' : ''} in your blocklist
            </p>
          </div>
        </div>
        
        {sites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚫</div>
            <p className="empty-state-title">No blocked sites yet</p>
            <p className="empty-state-text">
              Add your first site above to start blocking distractions
            </p>
          </div>
        ) : (
          <div className="item-list">
            {sites.map((site) => (
              <div key={site.id} className="item-card">
                <button
                  className={`toggle ${site.enabled ? 'active' : ''}`}
                  onClick={() => handleToggle(site.id)}
                />
                
                <div className="item-card-content">
                  <div className="item-card-title">{site.pattern}</div>
                  <div className="item-card-subtitle">
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
                      <span className="limit-text">
                        {site.dailyLimitMinutes} min/day
                      </span>
                    )}
                  </div>
                </div>
                
                {editingId === site.id ? (
                  <div className="edit-controls">
                    <select
                      className="form-input form-input-small"
                      value={site.mode}
                      onChange={(e) => handleUpdateMode(site.id, e.target.value as BlockMode)}
                    >
                      <option value="block">Block</option>
                      <option value="friction">Friction</option>
                      <option value="time-limit">Time Limit</option>
                    </select>
                    
                    {site.mode === 'time-limit' && (
                      <input
                        type="number"
                        className="form-input form-input-small"
                        value={site.dailyLimitMinutes || 30}
                        onChange={(e) => handleUpdateLimit(site.id, parseInt(e.target.value) || 30)}
                        min="1"
                        max="480"
                      />
                    )}
                    
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => setEditingId(null)}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="item-card-actions">
                    <button 
                      className="btn-icon-sm"
                      onClick={() => setEditingId(site.id)}
                      title="Edit"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button 
                      className="btn-icon-sm danger"
                      onClick={() => handleDelete(site.id)}
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style>{`
        .mode-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .limit-text {
          margin-left: 8px;
          color: var(--text-muted);
          font-size: 0.8125rem;
        }
        
        .edit-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}

