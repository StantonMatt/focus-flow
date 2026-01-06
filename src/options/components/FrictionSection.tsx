import type { FrictionSettings } from '../../shared/types';

interface Props {
  friction: FrictionSettings;
  onUpdate: (friction: FrictionSettings) => void;
}

export default function FrictionSection({ friction, onUpdate }: Props) {
  const handleChange = (field: keyof FrictionSettings, value: unknown) => {
    onUpdate({ ...friction, [field]: value });
  };
  
  return (
    <div>
      <div className="settings-section">
        <div className="settings-section-header">
          <div>
            <h2 className="settings-section-title">Friction Settings</h2>
            <p className="settings-section-desc">
              Configure the delay and requirements for accessing friction-mode sites
            </p>
          </div>
        </div>
        
        <div className="friction-preview">
          <div className="preview-label">Preview</div>
          <div className="preview-content">
            <p>When visiting a friction-enabled site:</p>
            <ol>
              <li>Wait {friction.delaySeconds} seconds</li>
              {friction.requirePhrase && (
                <li>Type: "{friction.phrase}"</li>
              )}
              <li>Access granted for {friction.bypassDurationMinutes} minutes</li>
            </ol>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Delay Duration (seconds)</label>
          <input
            type="range"
            className="form-range"
            min="5"
            max="60"
            step="5"
            value={friction.delaySeconds}
            onChange={(e) => handleChange('delaySeconds', parseInt(e.target.value))}
          />
          <div className="range-labels">
            <span>5s</span>
            <span className="range-value">{friction.delaySeconds}s</span>
            <span>60s</span>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={friction.requirePhrase}
              onChange={(e) => handleChange('requirePhrase', e.target.checked)}
            />
            <span className="form-checkbox-label">Require typing a phrase</span>
          </label>
        </div>
        
        {friction.requirePhrase && (
          <div className="form-group">
            <label className="form-label">Phrase to Type</label>
            <input
              type="text"
              className="form-input"
              value={friction.phrase}
              onChange={(e) => handleChange('phrase', e.target.value)}
              placeholder="e.g., I want to procrastinate"
            />
            <p className="form-hint">
              Users must type this phrase exactly to access the site
            </p>
          </div>
        )}
        
        <div className="form-group">
          <label className="form-label">Bypass Duration (minutes)</label>
          <input
            type="range"
            className="form-range"
            min="5"
            max="60"
            step="5"
            value={friction.bypassDurationMinutes}
            onChange={(e) => handleChange('bypassDurationMinutes', parseInt(e.target.value))}
          />
          <div className="range-labels">
            <span>5m</span>
            <span className="range-value">{friction.bypassDurationMinutes}m</span>
            <span>60m</span>
          </div>
          <p className="form-hint">
            After completing friction, access is granted for this duration
          </p>
        </div>
      </div>
      
      <style>{`
        .friction-preview {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 16px;
          margin-bottom: 24px;
        }
        
        .preview-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        
        .preview-content {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        
        .preview-content p {
          margin-bottom: 8px;
        }
        
        .preview-content ol {
          padding-left: 20px;
        }
        
        .preview-content li {
          margin-bottom: 4px;
        }
        
        .form-range {
          width: 100%;
          height: 6px;
          background: var(--bg-tertiary);
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
        }
        
        .form-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: var(--accent-primary);
          border-radius: 50%;
          cursor: pointer;
          transition: transform var(--transition-fast);
        }
        
        .form-range::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        
        .range-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        
        .range-value {
          font-weight: 600;
          color: var(--accent-primary);
        }
        
        .form-hint {
          margin-top: 6px;
          font-size: 0.8125rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

