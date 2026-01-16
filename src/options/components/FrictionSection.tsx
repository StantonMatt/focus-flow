import { useState, useEffect, useCallback } from 'react';
import type { FrictionSettings } from '../../shared/types';
import { useTranslation } from '../../shared/i18n';

interface Props {
  friction: FrictionSettings;
  onUpdate: (friction: FrictionSettings) => void;
}

export default function FrictionSection({ friction, onUpdate }: Props) {
  const { t } = useTranslation();
  
  // Preview state - added 'safety' and 'procrastination' phases
  const [previewPhase, setPreviewPhase] = useState<'waiting' | 'typing' | 'safety' | 'procrastination'>('waiting');
  const [previewTimer, setPreviewTimer] = useState(friction.delaySeconds);
  const [previewInput, setPreviewInput] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  
  // Reset preview when relevant settings change
  const resetPreview = useCallback(() => {
    setPreviewPhase('waiting');
    setPreviewTimer(friction.delaySeconds);
    setPreviewInput('');
    setIsTimerRunning(true);
  }, [friction.delaySeconds]);
  
  useEffect(() => {
    resetPreview();
  }, [friction.delaySeconds, friction.requirePhrase, resetPreview]);
  
  // Timer countdown
  useEffect(() => {
    if (previewPhase !== 'waiting' || !isTimerRunning) return;
    
    const interval = setInterval(() => {
      setPreviewTimer(prev => {
        if (prev <= 1) {
          if (friction.requirePhrase) {
            setPreviewPhase('typing');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [previewPhase, isTimerRunning, friction.requirePhrase]);
  
  const handleChange = (field: keyof FrictionSettings, value: unknown) => {
    onUpdate({ ...friction, [field]: value });
  };
  
  const getPreviewProgress = () => {
    return ((friction.delaySeconds - previewTimer) / friction.delaySeconds) * 100;
  };
  
  const isPhraseMatch = previewInput.trim().toLowerCase() === friction.phrase.trim().toLowerCase();
  const canContinue = previewPhase === 'waiting' && previewTimer === 0 && !friction.requirePhrase 
    || previewPhase === 'typing' && isPhraseMatch;
  
  const handleContinue = () => {
    if (canContinue) {
      setPreviewPhase('procrastination');
    }
  };
  
  const handleReturn = () => {
    setPreviewPhase('safety');
  };
  
  // Custom number input handlers
  const incrementValue = (field: 'delaySeconds' | 'bypassDurationMinutes', step: number, max: number) => {
    const currentValue = field === 'delaySeconds' ? friction.delaySeconds : friction.bypassDurationMinutes;
    const newValue = Math.min(max, currentValue + step);
    handleChange(field, newValue);
  };
  
  const decrementValue = (field: 'delaySeconds' | 'bypassDurationMinutes', step: number, min: number) => {
    const currentValue = field === 'delaySeconds' ? friction.delaySeconds : friction.bypassDurationMinutes;
    const newValue = Math.max(min, currentValue - step);
    handleChange(field, newValue);
  };
  
  return (
    <div>
      <div className="settings-section">
        <div className="settings-section-header">
          <div>
            <h2 className="settings-section-title">{t('friction.title')}</h2>
            <p className="settings-section-desc">
              {t('friction.description')}
            </p>
          </div>
        </div>
        
        {/* Interactive Preview */}
        <div className="friction-preview-visual">
          <div className="preview-header">
            <span className="preview-label">{t('friction.preview')}</span>
            <span className="preview-site">
              {previewPhase === 'safety' ? 'google.com' : 'distractingsite.com'}
            </span>
          </div>
          <div className="friction-mock">
            {previewPhase === 'safety' ? (
              // Safety state - returned to safe page (Google)
              <div className="friction-result-state">
                <div className="mock-browser">
                  <div className="mock-browser-bar">
                    <span className="mock-dot red"></span>
                    <span className="mock-dot yellow"></span>
                    <span className="mock-dot green"></span>
                    <span className="mock-url">google.com</span>
                  </div>
                  <div className="mock-browser-content safe">
                    <div className="mock-google-logo">Google</div>
                    <div className="mock-search-bar"></div>
                    <p className="mock-safe-message">✓ {t('friction.previewStayedFocused')}</p>
                  </div>
                </div>
                <button className="friction-mock-btn primary" onClick={resetPreview}>
                  {t('friction.previewReset')}
                </button>
              </div>
            ) : previewPhase === 'procrastination' ? (
              // Procrastination state - gave in to distraction (funny page)
              <div className="friction-result-state">
                <div className="mock-browser procrastination">
                  <div className="mock-browser-bar">
                    <span className="mock-dot red"></span>
                    <span className="mock-dot yellow"></span>
                    <span className="mock-dot green"></span>
                    <span className="mock-url">endless-cat-videos.com</span>
                  </div>
                  <div className="mock-browser-content procrastination">
                    <div className="mock-procrastination-content">
                      <div className="mock-cat">🐱</div>
                      <div className="mock-video-title">Cat Falls Off Table #4,729</div>
                      <div className="mock-video-bar">
                        <div className="mock-video-progress"></div>
                      </div>
                      <div className="mock-up-next">
                        <span className="mock-up-next-label">Up next:</span>
                        <span className="mock-up-next-title">10 Hours of Cats Being Cats</span>
                      </div>
                    </div>
                    <p className="mock-procrastination-message">🎉 {t('friction.previewProcrastinating')}</p>
                  </div>
                </div>
                <button className="friction-mock-btn primary" onClick={resetPreview}>
                  {t('friction.previewReset')}
                </button>
              </div>
            ) : (
              // Waiting/Typing state (friction active)
              <>
                <p className="friction-mock-explanation">{t('frictionOverlay.explanation')}</p>
                <button className="friction-mock-settings-link">
                  ⚙️ {t('frictionOverlay.openSettings')}
                </button>
                <div className="friction-mock-icon">⏳</div>
                <h3 className="friction-mock-title">
                  {previewPhase === 'waiting' && previewTimer > 0 && t('frictionOverlay.wait')}
                  {previewPhase === 'waiting' && previewTimer === 0 && !friction.requirePhrase && t('friction.previewReady')}
                  {previewPhase === 'typing' && t('frictionOverlay.almostThere')}
                </h3>
                
                {previewPhase === 'waiting' && previewTimer > 0 && (
                  <div className="friction-timer-section">
                    <div className="friction-mock-timer">{previewTimer}</div>
                    <div className="friction-mock-progress">
                      <div 
                        className="friction-mock-progress-bar" 
                        style={{ width: `${getPreviewProgress()}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {previewPhase === 'waiting' && previewTimer === 0 && !friction.requirePhrase && (
                  <p className="friction-ready-message">{t('friction.previewClickContinue')}</p>
                )}
                
                {previewPhase === 'typing' && (
                  <div className="friction-mock-phrase">
                    <p className="friction-mock-phrase-label">{t('frictionOverlay.typePhrase')}</p>
                    <div className="friction-mock-phrase-target">"{friction.phrase}"</div>
                    <input
                      type="text"
                      className={`friction-mock-input-field ${isPhraseMatch ? 'valid' : ''}`}
                      value={previewInput}
                      onChange={(e) => setPreviewInput(e.target.value)}
                      placeholder={t('friction.previewTypePlaceholder')}
                    />
                  </div>
                )}
                
                <div className="friction-mock-buttons">
                  <button className="friction-mock-btn secondary" onClick={handleReturn}>
                    {t('frictionOverlay.returnToSafety')}
                  </button>
                  <button 
                    className="friction-mock-btn primary" 
                    disabled={!canContinue}
                    onClick={handleContinue}
                  >
                    {t('frictionOverlay.continue')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Settings */}
        <div className="friction-settings-grid">
          {/* Delay Duration */}
          <div className="form-group">
            <label className="form-label">{t('friction.delayDuration')}</label>
            <div className="custom-number-input">
              <button 
                className="number-btn"
                onClick={() => decrementValue('delaySeconds', 5, 1)}
                disabled={friction.delaySeconds <= 1}
              >
                −
              </button>
              <input
                type="number"
                className="number-field"
                min="1"
                max="600"
                value={friction.delaySeconds}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  handleChange('delaySeconds', Math.min(600, Math.max(1, val)));
                }}
              />
              <button 
                className="number-btn"
                onClick={() => incrementValue('delaySeconds', 5, 600)}
                disabled={friction.delaySeconds >= 600}
              >
                +
              </button>
              <span className="number-unit">{t('common.seconds')}</span>
            </div>
          </div>
          
          {/* Spacer for grid alignment */}
          <div></div>
          
          {/* Require Phrase Toggle */}
          <div className="form-group toggle-row-group">
            <div className="toggle-row">
              <span className="toggle-row-label">{t('friction.requirePhrase')}</span>
              <button
                type="button"
                className={`toggle ${friction.requirePhrase ? 'active' : ''}`}
                onClick={() => handleChange('requirePhrase', !friction.requirePhrase)}
                aria-pressed={friction.requirePhrase}
              />
            </div>
          </div>
          
          {/* Phrase to Type - only shown when requirePhrase is true */}
          {friction.requirePhrase && (
            <div className="form-group">
              <label className="form-label">{t('friction.phraseToType')}</label>
              <input
                type="text"
                className="form-input"
                value={friction.phrase}
                onChange={(e) => handleChange('phrase', e.target.value)}
                placeholder={t('friction.phrasePlaceholder')}
              />
              <p className="form-hint">
                {t('friction.phraseHint')}
              </p>
            </div>
          )}
          
          {/* Bypass Duration Toggle */}
          <div className="form-group toggle-row-group">
            <div className="toggle-row">
              <span className="toggle-row-label">{t('friction.limitBypass')}</span>
              <button
                type="button"
                className={`toggle ${friction.bypassLimited ? 'active' : ''}`}
                onClick={() => handleChange('bypassLimited', !friction.bypassLimited)}
                aria-pressed={friction.bypassLimited ?? false}
              />
            </div>
            <p className="form-hint">
              {friction.bypassLimited 
                ? t('friction.bypassLimitedHint', { minutes: friction.bypassDurationMinutes })
                : t('friction.bypassUnlimitedHint')
              }
            </p>
          </div>
          
          {friction.bypassLimited && (
            <div className="form-group">
              <label className="form-label">{t('friction.bypassDuration')}</label>
              <div className="custom-number-input">
              <button 
                className="number-btn"
                onClick={() => decrementValue('bypassDurationMinutes', 1, 1)}
                disabled={friction.bypassDurationMinutes <= 1}
              >
                −
              </button>
                <input
                  type="number"
                  className="number-field"
                  min="1"
                  max="120"
                  value={friction.bypassDurationMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    handleChange('bypassDurationMinutes', Math.min(120, Math.max(1, val)));
                  }}
                />
              <button 
                className="number-btn"
                onClick={() => incrementValue('bypassDurationMinutes', 1, 120)}
                disabled={friction.bypassDurationMinutes >= 120}
              >
                +
              </button>
                <span className="number-unit">{t('common.minutes')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .friction-preview-visual {
          background: #0f1419;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          overflow: hidden;
        }
        
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .preview-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #8b99a8;
        }
        
        .preview-site {
          font-size: 0.75rem;
          color: #5c6a7a;
          font-family: 'JetBrains Mono', monospace;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        
        .friction-mock {
          text-align: center;
          padding: 24px 16px;
          min-height: 340px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .friction-mock-explanation {
          font-size: 12px;
          color: #8b99a8;
          margin-bottom: 8px;
          text-align: center;
        }
        
        .friction-mock-settings-link {
          font-size: 11px;
          color: #00d4aa;
          background: rgba(0, 212, 170, 0.1);
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .friction-mock-settings-link:hover {
          background: rgba(0, 212, 170, 0.2);
        }
        
        .friction-mock-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .friction-mock-title {
          font-size: 20px;
          font-weight: 600;
          color: #00d4aa;
          margin-bottom: 12px;
        }
        
        .friction-timer-section {
          margin-bottom: 8px;
        }
        
        .friction-mock-timer {
          font-size: 36px;
          font-weight: 700;
          font-family: 'JetBrains Mono', 'SF Mono', monospace;
          color: #00d4aa;
          margin-bottom: 16px;
        }
        
        .friction-mock-progress {
          width: 160px;
          height: 4px;
          background: #2d3548;
          border-radius: 2px;
          overflow: hidden;
          margin: 0 auto;
        }
        
        .friction-mock-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #00d4aa, #0984e3);
          transition: width 0.1s linear;
        }
        
        .friction-ready-message {
          font-size: 14px;
          color: #8b99a8;
          margin-bottom: 16px;
        }
        
        .friction-mock-phrase {
          margin-bottom: 8px;
          width: 100%;
          max-width: 280px;
        }
        
        .friction-mock-phrase-label {
          font-size: 12px;
          color: #8b99a8;
          margin-bottom: 8px;
        }
        
        .friction-mock-phrase-target {
          font-size: 14px;
          font-family: 'JetBrains Mono', 'SF Mono', monospace;
          color: #feca57;
          padding: 8px 16px;
          background: rgba(254, 202, 87, 0.1);
          border-radius: 6px;
          display: inline-block;
          margin-bottom: 12px;
        }
        
        .friction-mock-input-field {
          width: 100%;
          padding: 10px 14px;
          font-size: 14px;
          font-family: 'JetBrains Mono', 'SF Mono', monospace;
          background: #1a1f2e;
          border: 2px solid #2d3548;
          border-radius: 6px;
          color: #e7edf4;
          text-align: center;
          outline: none;
          transition: border-color 0.2s;
        }
        
        .friction-mock-input-field:focus {
          border-color: #5c6a7a;
        }
        
        .friction-mock-input-field.valid {
          border-color: #00d4aa;
        }
        
        .friction-mock-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 20px;
        }
        
        .friction-mock-btn {
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .friction-mock-btn.primary {
          background: #00d4aa;
          color: #0f1419;
        }
        
        .friction-mock-btn.primary:hover:not(:disabled) {
          background: #00b894;
        }
        
        .friction-mock-btn.primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .friction-mock-btn.secondary {
          background: #2d3548;
          color: #e7edf4;
        }
        
        .friction-mock-btn.secondary:hover {
          background: #3d4558;
        }
        
        /* Result states (safety & procrastination) */
        .friction-result-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        
        .mock-browser {
          width: 260px;
          background: #1a1f2e;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #2d3548;
        }
        
        .mock-browser.procrastination {
          border-color: #ff6b6b;
        }
        
        .mock-browser-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: #252b3b;
          border-bottom: 1px solid #2d3548;
        }
        
        .mock-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #3d4558;
        }
        
        .mock-dot.red { background: #ff5f56; }
        .mock-dot.yellow { background: #ffbd2e; }
        .mock-dot.green { background: #27ca40; }
        
        .mock-url {
          flex: 1;
          font-size: 10px;
          color: #5c6a7a;
          font-family: 'JetBrains Mono', monospace;
          margin-left: 8px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }
        
        .mock-browser-content {
          padding: 20px;
          text-align: center;
        }
        
        .mock-browser-content.safe {
          background: linear-gradient(180deg, #1a1f2e 0%, #1a2820 100%);
        }
        
        .mock-browser-content.procrastination {
          background: linear-gradient(180deg, #1a1f2e 0%, #2a1a1a 100%);
        }
        
        .mock-google-logo {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(90deg, #4285f4, #ea4335, #fbbc05, #34a853);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
        }
        
        .mock-search-bar {
          height: 32px;
          background: #252b3b;
          border-radius: 16px;
          border: 1px solid #3d4558;
          margin-bottom: 16px;
        }
        
        .mock-safe-message {
          font-size: 12px;
          color: #00d4aa;
          margin: 0;
        }
        
        /* Procrastination mock content */
        .mock-procrastination-content {
          margin-bottom: 12px;
        }
        
        .mock-cat {
          font-size: 40px;
          margin-bottom: 8px;
        }
        
        .mock-video-title {
          font-size: 12px;
          font-weight: 600;
          color: #e7edf4;
          margin-bottom: 8px;
        }
        
        .mock-video-bar {
          height: 4px;
          background: #3d4558;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        
        .mock-video-progress {
          width: 35%;
          height: 100%;
          background: #ff6b6b;
        }
        
        .mock-up-next {
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 10px;
          text-align: left;
          padding: 8px;
          background: rgba(255, 107, 107, 0.1);
          border-radius: 4px;
        }
        
        .mock-up-next-label {
          color: #5c6a7a;
          text-transform: uppercase;
          font-size: 9px;
        }
        
        .mock-up-next-title {
          color: #8b99a8;
        }
        
        .mock-procrastination-message {
          font-size: 12px;
          color: #ff6b6b;
          margin: 0;
        }
        
        /* Custom number input */
        .custom-number-input {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .number-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        
        .number-btn:hover:not(:disabled) {
          background: var(--bg-elevated);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }
        
        .number-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .number-field {
          width: 60px;
          height: 36px;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-primary);
          -moz-appearance: textfield;
        }
        
        .number-field::-webkit-outer-spin-button,
        .number-field::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        .number-field:focus {
          border-color: var(--accent-primary);
          outline: none;
        }
        
        .number-unit {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-left: 4px;
        }
        
        /* Settings grid */
        .friction-settings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        
        .form-group-full {
          grid-column: 1 / -1;
        }
        
        .toggle-row-group {
          grid-column: 1 / -1;
        }
        
        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
        }
        
        .toggle-row-label {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        
        .toggle-row-group .form-hint {
          margin-top: 8px;
        }
        
        .form-hint {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }
        
        @media (max-width: 600px) {
          .friction-settings-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
