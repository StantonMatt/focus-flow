import type { PomodoroSettings, PomodoroOverlayMode } from '../../shared/types';
import { useTranslation } from '../../shared/i18n';

interface Props {
  pomodoro: PomodoroSettings;
  onUpdate: (pomodoro: PomodoroSettings) => void;
}

export default function PomodoroSection({ pomodoro, onUpdate }: Props) {
  const { t } = useTranslation();
  
  const handleChange = (field: keyof PomodoroSettings, value: unknown) => {
    onUpdate({ ...pomodoro, [field]: value });
  };
  
  return (
    <div>
      <div className="settings-section">
        <div className="settings-section-header">
          <div>
            <h2 className="settings-section-title">{t('pomodoroSettings.durationsTitle')}</h2>
            <p className="settings-section-desc">
              {t('pomodoroSettings.durationsDesc')}
            </p>
          </div>
        </div>
        
        <div className="duration-grid">
          <div className="duration-card">
            <div className="duration-icon work">🎯</div>
            <div className="duration-label">{t('pomodoro.work')}</div>
            <div className="duration-input-group">
              <input
                type="number"
                className="duration-input"
                value={pomodoro.workDurationMinutes}
                onChange={(e) => handleChange('workDurationMinutes', parseInt(e.target.value) || 25)}
                min="1"
                max="120"
              />
              <span className="duration-unit">{t('common.minutes')}</span>
            </div>
          </div>
          
          <div className="duration-card">
            <div className="duration-icon short">☕</div>
            <div className="duration-label">{t('pomodoroSettings.shortBreak')}</div>
            <div className="duration-input-group">
              <input
                type="number"
                className="duration-input"
                value={pomodoro.shortBreakMinutes}
                onChange={(e) => handleChange('shortBreakMinutes', parseInt(e.target.value) || 5)}
                min="1"
                max="30"
              />
              <span className="duration-unit">{t('common.minutes')}</span>
            </div>
          </div>
          
          <div className="duration-card">
            <div className="duration-icon long">🌴</div>
            <div className="duration-label">{t('pomodoroSettings.longBreak')}</div>
            <div className="duration-input-group">
              <input
                type="number"
                className="duration-input"
                value={pomodoro.longBreakMinutes}
                onChange={(e) => handleChange('longBreakMinutes', parseInt(e.target.value) || 15)}
                min="1"
                max="60"
              />
              <span className="duration-unit">{t('common.minutes')}</span>
            </div>
          </div>
          
          <div className="duration-card">
            <div className="duration-icon sessions">🔄</div>
            <div className="duration-label">{t('pomodoroSettings.sessionsUntilLong')}</div>
            <div className="duration-input-group">
              <input
                type="number"
                className="duration-input"
                value={pomodoro.sessionsUntilLongBreak}
                onChange={(e) => handleChange('sessionsUntilLongBreak', parseInt(e.target.value) || 4)}
                min="2"
                max="10"
              />
              <span className="duration-unit">{t('common.sessions')}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="settings-section">
        <div className="settings-section-header">
          <div>
            <h2 className="settings-section-title">{t('pomodoroSettings.behaviorTitle')}</h2>
            <p className="settings-section-desc">
              {t('pomodoroSettings.behaviorDesc')}
            </p>
          </div>
        </div>
        
        <div className="toggle-list">
          <div className="toggle-item">
            <div className="toggle-info">
              <div className="toggle-title">{t('pomodoroSettings.autoStartBreaks')}</div>
              <div className="toggle-desc">{t('pomodoroSettings.autoStartBreaksDesc')}</div>
            </div>
            <button
              className={`toggle ${pomodoro.autoStartBreaks ? 'active' : ''}`}
              onClick={() => handleChange('autoStartBreaks', !pomodoro.autoStartBreaks)}
            />
          </div>
          
          <div className="toggle-item">
            <div className="toggle-info">
              <div className="toggle-title">{t('pomodoroSettings.autoStartWork')}</div>
              <div className="toggle-desc">{t('pomodoroSettings.autoStartWorkDesc')}</div>
            </div>
            <button
              className={`toggle ${pomodoro.autoStartWork ? 'active' : ''}`}
              onClick={() => handleChange('autoStartWork', !pomodoro.autoStartWork)}
            />
          </div>
          
          <div className="toggle-item">
            <div className="toggle-info">
              <div className="toggle-title">{t('pomodoroSettings.blockDuringWork')}</div>
              <div className="toggle-desc">{t('pomodoroSettings.blockDuringWorkDesc')}</div>
            </div>
            <button
              className={`toggle ${pomodoro.blockDuringWork ? 'active' : ''}`}
              onClick={() => handleChange('blockDuringWork', !pomodoro.blockDuringWork)}
            />
          </div>
          
          <div className="toggle-item">
            <div className="toggle-info">
              <div className="toggle-title">{t('pomodoroSettings.notifications')}</div>
              <div className="toggle-desc">{t('pomodoroSettings.notificationsDesc')}</div>
            </div>
            <button
              className={`toggle ${pomodoro.notificationsEnabled ? 'active' : ''}`}
              onClick={() => handleChange('notificationsEnabled', !pomodoro.notificationsEnabled)}
            />
          </div>
          
          <div className="toggle-item overlay-mode-item">
            <div className="toggle-info">
              <div className="toggle-title">{t('pomodoroSettings.overlayMode')}</div>
              <div className="toggle-desc">{t('pomodoroSettings.overlayModeDesc')}</div>
            </div>
            <div className="overlay-mode-options">
              <button
                className={`overlay-option ${pomodoro.overlayMode === 'never' ? 'active' : ''}`}
                onClick={() => handleChange('overlayMode', 'never' as PomodoroOverlayMode)}
              >
                {t('pomodoroSettings.overlayNever')}
              </button>
              <button
                className={`overlay-option ${pomodoro.overlayMode === 'whenActive' ? 'active' : ''}`}
                onClick={() => handleChange('overlayMode', 'whenActive' as PomodoroOverlayMode)}
              >
                {t('pomodoroSettings.overlayWhenActive')}
              </button>
              <button
                className={`overlay-option ${pomodoro.overlayMode === 'always' ? 'active' : ''}`}
                onClick={() => handleChange('overlayMode', 'always' as PomodoroOverlayMode)}
              >
                {t('pomodoroSettings.overlayAlways')}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .duration-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        
        .duration-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 20px;
          text-align: center;
        }
        
        .duration-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }
        
        .duration-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        
        .duration-input-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .duration-input {
          width: 80px;
          padding: 10px;
          font-size: 1.25rem;
          font-weight: 600;
          font-family: var(--font-mono);
          text-align: center;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          color: var(--text-primary);
        }
        
        .duration-input:focus {
          border-color: var(--accent-primary);
          outline: none;
        }
        
        .duration-unit {
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        
        .toggle-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .toggle-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
        }
        
        .toggle-info {
          flex: 1;
        }
        
        .toggle-title {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        
        .toggle-desc {
          font-size: 0.8125rem;
          color: var(--text-muted);
        }
        
        .overlay-mode-item {
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .overlay-mode-options {
          display: flex;
          gap: 8px;
        }
        
        .overlay-option {
          padding: 8px 16px;
          font-size: 0.8125rem;
          font-weight: 500;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .overlay-option:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }
        
        .overlay-option.active {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: var(--bg-primary);
        }
      `}</style>
    </div>
  );
}
