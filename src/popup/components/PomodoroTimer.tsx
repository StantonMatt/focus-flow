import type { PomodoroState, PomodoroSettings } from '../../shared/types';
import { formatTime } from '../../shared/utils';
import { useTranslation } from '../../shared/i18n';
import './PomodoroTimer.css';

interface Props {
  state: PomodoroState;
  settings: PomodoroSettings;
  onAction: (action: 'start' | 'pause' | 'reset' | 'skip') => void;
}

export default function PomodoroTimer({ state, settings, onAction }: Props) {
  const { t } = useTranslation();
  
  const getPhaseLabel = () => {
    switch (state.phase) {
      case 'work':
        return t('pomodoro.focusTime');
      case 'short-break':
        return t('pomodoro.shortBreak');
      case 'long-break':
        return t('pomodoro.longBreak');
      default:
        return t('pomodoro.readyToFocus');
    }
  };
  
  const getPhaseColor = () => {
    switch (state.phase) {
      case 'work':
        return 'var(--accent-primary)';
      case 'short-break':
        return 'var(--accent-tertiary)';
      case 'long-break':
        return 'var(--warning)';
      default:
        return 'var(--text-muted)';
    }
  };
  
  const getProgress = () => {
    if (state.phase === 'idle') return 0;
    
    let totalSeconds = 0;
    switch (state.phase) {
      case 'work':
        totalSeconds = settings.workDurationMinutes * 60;
        break;
      case 'short-break':
        totalSeconds = settings.shortBreakMinutes * 60;
        break;
      case 'long-break':
        totalSeconds = settings.longBreakMinutes * 60;
        break;
    }
    
    return ((totalSeconds - state.timeRemainingSeconds) / totalSeconds) * 100;
  };
  
  const displayTime = state.phase === 'idle' 
    ? formatTime(settings.workDurationMinutes * 60)
    : formatTime(state.timeRemainingSeconds);
  
  const progress = getProgress();
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="pomodoro-timer">
      <div className="timer-ring-container">
        <svg className="timer-ring" viewBox="0 0 200 200">
          {/* Background ring */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="var(--bg-tertiary)"
            strokeWidth="8"
          />
          {/* Progress ring */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke={getPhaseColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 100 100)"
            className="timer-progress-ring"
          />
        </svg>
        
        <div className="timer-content">
          <span className="timer-phase" style={{ color: getPhaseColor() }}>
            {getPhaseLabel()}
          </span>
          <span className="timer-time">{displayTime}</span>
          <span className="timer-sessions">
            {t('pomodoro.session')} {state.sessionsCompleted + 1}
          </span>
        </div>
      </div>
      
      <div className="timer-controls">
        {!state.isRunning ? (
          <button 
            className="timer-btn timer-btn-primary"
            onClick={() => onAction('start')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            {state.phase === 'idle' ? t('pomodoro.start') : t('pomodoro.resume')}
          </button>
        ) : (
          <button 
            className="timer-btn timer-btn-secondary"
            onClick={() => onAction('pause')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
            {t('pomodoro.pause')}
          </button>
        )}
        
        <button 
          className="timer-btn-icon"
          onClick={() => onAction('skip')}
          title={t('pomodoro.skipToNext')}
          disabled={state.phase === 'idle'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4l10 8-10 8V4zM18 4v16h-2V4h2z" />
          </svg>
        </button>
        
        <button 
          className="timer-btn-icon"
          onClick={() => onAction('reset')}
          title={t('pomodoro.resetTimer')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
      
      <div className="timer-info">
        <div className="timer-info-item">
          <span className="timer-info-value">{settings.workDurationMinutes}{t('common.minutes')}</span>
          <span className="timer-info-label">{t('pomodoro.work')}</span>
        </div>
        <div className="timer-info-divider" />
        <div className="timer-info-item">
          <span className="timer-info-value">{settings.shortBreakMinutes}{t('common.minutes')}</span>
          <span className="timer-info-label">{t('pomodoro.break')}</span>
        </div>
        <div className="timer-info-divider" />
        <div className="timer-info-item">
          <span className="timer-info-value">{state.todayPomodoros}</span>
          <span className="timer-info-label">{t('common.done')}</span>
        </div>
      </div>
    </div>
  );
}
