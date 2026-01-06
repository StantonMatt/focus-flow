import type { 
  Settings, 
  DailyTimeStats, 
  PomodoroState, 
  ActiveBypass 
} from './types';
import { 
  DEFAULT_SETTINGS, 
  STORAGE_KEYS 
} from './constants';

// Get settings from storage
export async function getSettings(): Promise<Settings> {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  return (result[STORAGE_KEYS.SETTINGS] as Settings | undefined) ?? DEFAULT_SETTINGS;
}

// Save settings to storage
export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEYS.SETTINGS]: settings });
}

// Update partial settings
export async function updateSettings(partial: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await saveSettings(updated);
  return updated;
}

// Get today's date string
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Get time stats from storage
export async function getTimeStats(): Promise<Record<string, DailyTimeStats>> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.TIME_STATS);
  return (result[STORAGE_KEYS.TIME_STATS] as Record<string, DailyTimeStats> | undefined) ?? {};
}

// Get today's time stats
export async function getTodayTimeStats(): Promise<DailyTimeStats> {
  const allStats = await getTimeStats();
  const today = getTodayString();
  return allStats[today] ?? {};
}

// Update time for a domain
export async function addTimeForDomain(domain: string, seconds: number): Promise<void> {
  const allStats = await getTimeStats();
  const today = getTodayString();
  
  if (!allStats[today]) {
    allStats[today] = {};
  }
  
  allStats[today][domain] = (allStats[today][domain] || 0) + seconds;
  
  // Clean up old entries (keep last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
  
  for (const date of Object.keys(allStats)) {
    if (date < cutoffDate) {
      delete allStats[date];
    }
  }
  
  await chrome.storage.local.set({ [STORAGE_KEYS.TIME_STATS]: allStats });
}

// Default pomodoro state
const DEFAULT_POMODORO_STATE: PomodoroState = {
  phase: 'idle',
  timeRemainingSeconds: 0,
  sessionsCompleted: 0,
  isRunning: false,
  todayPomodoros: 0,
};

// Get Pomodoro state
export async function getPomodoroState(): Promise<PomodoroState> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.POMODORO_STATE);
  return (result[STORAGE_KEYS.POMODORO_STATE] as PomodoroState | undefined) ?? DEFAULT_POMODORO_STATE;
}

// Save Pomodoro state
export async function savePomodoroState(state: PomodoroState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.POMODORO_STATE]: state });
}

// Get active bypasses
export async function getActiveBypasses(): Promise<ActiveBypass[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.ACTIVE_BYPASSES);
  const bypasses = (result[STORAGE_KEYS.ACTIVE_BYPASSES] as ActiveBypass[] | undefined) ?? [];
  
  // Filter out expired bypasses
  const now = Date.now();
  return bypasses.filter(b => b.expiresAt > now);
}

// Add a bypass
export async function addBypass(domain: string, durationMinutes: number): Promise<void> {
  const bypasses = await getActiveBypasses();
  const expiresAt = Date.now() + durationMinutes * 60 * 1000;
  
  // Remove existing bypass for this domain
  const filtered = bypasses.filter(b => b.domain !== domain);
  filtered.push({ domain, expiresAt });
  
  await chrome.storage.local.set({ [STORAGE_KEYS.ACTIVE_BYPASSES]: filtered });
}

// Check if a domain has an active bypass
export async function hasActiveBypass(domain: string): Promise<boolean> {
  const bypasses = await getActiveBypasses();
  return bypasses.some(b => b.domain === domain);
}

// Check if onboarding is complete
export async function isOnboardingComplete(): Promise<boolean> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.ONBOARDING_COMPLETE);
  return result[STORAGE_KEYS.ONBOARDING_COMPLETE] === true;
}

// Mark onboarding as complete
export async function completeOnboarding(): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.ONBOARDING_COMPLETE]: true });
}

// Listen for storage changes
export function onSettingsChange(callback: (settings: Settings) => void): () => void {
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes[STORAGE_KEYS.SETTINGS]) {
      callback(changes[STORAGE_KEYS.SETTINGS].newValue as Settings);
    }
  };
  
  chrome.storage.sync.onChanged.addListener(listener);
  return () => chrome.storage.sync.onChanged.removeListener(listener);
}
