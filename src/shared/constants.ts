import type { Settings, FrictionSettings, PomodoroSettings, BlockedSite, Schedule } from './types';

// Default friction settings
export const DEFAULT_FRICTION: FrictionSettings = {
  delaySeconds: 10,
  requirePhrase: true,
  phrase: 'I want to procrastinate',
  bypassDurationMinutes: 15,
};

// Default Pomodoro settings
export const DEFAULT_POMODORO: PomodoroSettings = {
  workDurationMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  blockDuringWork: true,
  notificationsEnabled: true,
};

// Default blocked sites (common distractions)
export const DEFAULT_BLOCKED_SITES: BlockedSite[] = [
  {
    id: 'youtube-shorts',
    pattern: 'youtube.com/shorts',
    mode: 'block',
    enabled: true,
  },
  {
    id: 'x-twitter',
    pattern: 'x.com',
    mode: 'friction',
    enabled: true,
  },
  {
    id: 'twitter',
    pattern: 'twitter.com',
    mode: 'friction',
    enabled: true,
  },
  {
    id: 'instagram',
    pattern: 'instagram.com',
    mode: 'friction',
    enabled: true,
  },
  {
    id: 'tiktok',
    pattern: 'tiktok.com',
    mode: 'block',
    enabled: true,
  },
  {
    id: 'reddit',
    pattern: 'reddit.com',
    mode: 'time-limit',
    dailyLimitMinutes: 30,
    enabled: false,
  },
];

// Default schedules (empty - user creates their own with localized names)
export const DEFAULT_SCHEDULES: Schedule[] = [];

// Default settings
export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  blockedSites: DEFAULT_BLOCKED_SITES,
  schedules: DEFAULT_SCHEDULES,
  friction: DEFAULT_FRICTION,
  pomodoro: DEFAULT_POMODORO,
  language: 'auto',
};

// Storage keys
export const STORAGE_KEYS = {
  SETTINGS: 'settings',
  TIME_STATS: 'timeStats',
  POMODORO_STATE: 'pomodoroState',
  ACTIVE_BYPASSES: 'activeBypasses',
  ONBOARDING_COMPLETE: 'onboardingComplete',
} as const;

// Heartbeat interval in milliseconds (5 seconds)
export const HEARTBEAT_INTERVAL = 5000;

// Alarm names
export const ALARMS = {
  POMODORO_TICK: 'pomodoro-tick',
  CLEANUP_BYPASSES: 'cleanup-bypasses',
  DAILY_RESET: 'daily-reset',
} as const;

