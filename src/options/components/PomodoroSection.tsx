import type { PomodoroSettings } from '../../shared/types';

interface Props {
  pomodoro: PomodoroSettings;
  onUpdate: (pomodoro: PomodoroSettings) => void;
}

export default function PomodoroSection({ pomodoro, onUpdate }: Props) {
  const handleChange = (field: keyof PomodoroSettings, value: unknown) => {
    onUpdate({ ...pomodoro, [field]: value });
  };
  
  return (
    <div>
      <div className="settings-section">
        <div className="settings-section-header">
          <div>
            <h2 className="settings-section-title">Timer Durations</h2>
            <p className="settings-section-desc">
              Customize your focus and break intervals
            </p>
          </div>
        </div>
        
        <div className="duration-grid">
          <div className="duration-card">
            <div className="duration-icon work">🎯</div>
            <div className="duration-label">Work</div>
            <div className="duration-input-group">
              <input
                type="number"
                className="duration-input"
                value={pomodoro.workDurationMinutes}
                onChange={(e) => handleChange('workDurationMinutes', parseInt(e.target.value) || 25)}
                min="1"
                max="120"
              />
              <span className="duration-unit">min</span>
            </div>
          </div>
          
          <div className="duration-card">
            <div className="duration-icon short">☕</div>
            <div className="duration-label">Short Break</div>
            <div className="duration-input-group">
              <input
                type="number"
                className="duration-input"
                value={pomodoro.shortBreakMinutes}
                onChange={(e) => handleChange('shortBreakMinutes', parseInt(e.target.value) || 5)}
                min="1"
                max="30"
              />
              <span className="duration-unit">min</span>
            </div>
          </div>
          
          <div className="duration-card">
            <div className="duration-icon long">🌴</div>
            <div className="duration-label">Long Break</div>
            <div className="duration-input-group">
              <input
                type="number"
                className="duration-input"
                value={pomodoro.longBreakMinutes}
                onChange={(e) => handleChange('longBreakMinutes', parseInt(e.target.value) || 15)}
                min="1"
                max="60"
              />
              <span className="duration-unit">min</span>
            </div>
          </div>
          
          <div className="duration-card">
            <div className="duration-icon sessions">🔄</div>
            <div className="duration-label">Sessions until long break</div>
            <div className="duration-input-group">
              <input
                type="number"
                className="duration-input"
                value={pomodoro.sessionsUntilLongBreak}
                onChange={(e) => handleChange('sessionsUntilLongBreak', parseInt(e.target.value) || 4)}
                min="2"
                max="10"
              />
              <span className="duration-unit">sessions</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="settings-section">
        <div className="settings-section-header">
          <div>
            <h2 className="settings-section-title">Behavior</h2>
            <p className="settings-section-desc">
              Customize how the timer behaves
            </p>
          </div>
        </div>
        
        <div className="toggle-list">
          <div className="toggle-item">
            <div className="toggle-info">
              <div className="toggle-title">Auto-start breaks</div>
              <div className="toggle-desc">Automatically start break timer when work session ends</div>
            </div>
            <button
              className={`toggle ${pomodoro.autoStartBreaks ? 'active' : ''}`}
              onClick={() => handleChange('autoStartBreaks', !pomodoro.autoStartBreaks)}
            />
          </div>
          
          <div className="toggle-item">
            <div className="toggle-info">
              <div className="toggle-title">Auto-start work sessions</div>
              <div className="toggle-desc">Automatically start work timer when break ends</div>
            </div>
            <button
              className={`toggle ${pomodoro.autoStartWork ? 'active' : ''}`}
              onClick={() => handleChange('autoStartWork', !pomodoro.autoStartWork)}
            />
          </div>
          
          <div className="toggle-item">
            <div className="toggle-info">
              <div className="toggle-title">Block during work sessions</div>
              <div className="toggle-desc">Enable strict blocking during focus time</div>
            </div>
            <button
              className={`toggle ${pomodoro.blockDuringWork ? 'active' : ''}`}
              onClick={() => handleChange('blockDuringWork', !pomodoro.blockDuringWork)}
            />
          </div>
          
          <div className="toggle-item">
            <div className="toggle-info">
              <div className="toggle-title">Desktop notifications</div>
              <div className="toggle-desc">Show notifications when sessions end</div>
            </div>
            <button
              className={`toggle ${pomodoro.notificationsEnabled ? 'active' : ''}`}
              onClick={() => handleChange('notificationsEnabled', !pomodoro.notificationsEnabled)}
            />
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
      `}</style>
    </div>
  );
}

