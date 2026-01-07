// Blocking modes for sites
export type BlockMode = 'block' | 'friction' | 'time-limit';

// A site entry in the blocklist
export interface BlockedSite {
  id: string;
  pattern: string;           // e.g., "youtube.com/shorts", "x.com", "instagram.com"
  mode: BlockMode;
  dailyLimitMinutes?: number; // Only used for 'time-limit' mode
  enabled: boolean;
}

// Category of blocked sites
export interface SiteCategory {
  id: string;
  name: string;              // Display name (e.g., "Social Media")
  nameKey?: string;          // i18n key for translation (e.g., "categories.socialMedia")
  icon: string;              // Emoji for category
  enabled: boolean;          // Toggle entire category
  sites: BlockedSite[];
  isCustom: boolean;         // User-created category
  collapsed?: boolean;       // UI state for collapsible cards
}

// Schedule for time-based blocking
export interface Schedule {
  id: string;
  name: string;
  days: number[];            // 0-6 (Sunday-Saturday)
  startTime: string;         // "HH:MM" format, e.g., "09:00"
  endTime: string;           // "HH:MM" format, e.g., "17:00"
  enabled: boolean;
}

// Friction settings
export interface FrictionSettings {
  delaySeconds: number;      // How long to wait before allowing access
  requirePhrase: boolean;    // Whether to require typing a phrase
  phrase: string;            // The phrase to type
  bypassDurationMinutes: number; // How long the bypass lasts
}

// Pomodoro settings
export interface PomodoroSettings {
  workDurationMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  blockDuringWork: boolean;  // Auto-enable blocking during work sessions
  notificationsEnabled: boolean;
}

// Pomodoro timer state
export type PomodoroPhase = 'work' | 'short-break' | 'long-break' | 'idle';

export interface PomodoroState {
  phase: PomodoroPhase;
  timeRemainingSeconds: number;
  sessionsCompleted: number;
  isRunning: boolean;
  todayPomodoros: number;
}

// Time tracking entry
export interface TimeEntry {
  domain: string;
  date: string;              // "YYYY-MM-DD" format
  seconds: number;
}

// Daily time tracking aggregated by domain
export interface DailyTimeStats {
  [domain: string]: number;  // seconds spent
}

// Supported languages
export type Language = 'auto' | 'en' | 'es' | 'zh-CN' | 'pt-BR';

// Content filter types for partial blocking
export interface ContentFilters {
  // YouTube
  youtubeShorts: boolean;
  youtubeRecommendations: boolean;
  youtubeComments: boolean;
  // Instagram
  instagramReels: boolean;
  instagramStories: boolean;
  // Facebook
  facebookReels: boolean;
  facebookStories: boolean;
  // Twitter/X
  twitterForYou: boolean;
  twitterExplore: boolean;
  // Reddit
  redditPopular: boolean;
  redditComments: boolean;
  // Other platforms
  tiktokForYou: boolean;
  twitchRecommended: boolean;
  linkedinFeed: boolean;
  snapchatStories: boolean;
}

// Main settings object
export interface Settings {
  enabled: boolean;
  siteCategories: SiteCategory[];  // Categorized blocked sites
  contentFilters: ContentFilters;  // Partial content blocking
  schedules: Schedule[];
  friction: FrictionSettings;
  pomodoro: PomodoroSettings;
  language: Language;
  // Legacy fields for migration (will be removed after migration)
  blockedSites?: BlockedSite[];
  blockYouTubeShorts?: boolean;    // Migrated to contentFilters.youtubeShorts
}

// Messages between content scripts and service worker
export type MessageType = 
  | 'CHECK_BLOCKED'
  | 'HEARTBEAT'
  | 'GET_SETTINGS'
  | 'UPDATE_SETTINGS'
  | 'GET_TIME_STATS'
  | 'GET_POMODORO_STATE'
  | 'POMODORO_ACTION'
  | 'REQUEST_BYPASS'
  | 'FRICTION_COMPLETED'
  | 'CLEAR_BYPASS';

export interface Message {
  type: MessageType;
  payload?: unknown;
}

export interface CheckBlockedResponse {
  isBlocked: boolean;
  mode?: BlockMode;
  reason?: string;
  remainingTime?: number; // For time-limit mode
}

export interface BypassRequest {
  domain: string;
  durationMinutes: number;
}

// Active bypasses (friction mode temporary access)
export interface ActiveBypass {
  domain: string;
  expiresAt: number; // timestamp
}

