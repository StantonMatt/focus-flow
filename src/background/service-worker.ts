import { 
  getSettings, 
  saveSettings,
  getTodayTimeStats, 
  addTimeForDomain,
  getPomodoroState,
  savePomodoroState,
  addBypass,
  hasActiveBypass,
  getActiveBypasses,
  getTodayString
} from '../shared/storage';
import { 
  findMatchingBlockedSite, 
  isAnyScheduleActive, 
  extractDomain 
} from '../shared/utils';
import { ALARMS, DEFAULT_SETTINGS } from '../shared/constants';
import type { 
  Settings, 
  PomodoroState, 
  Message, 
  CheckBlockedResponse 
} from '../shared/types';

// Initialize extension
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Set default settings on first install
    await saveSettings(DEFAULT_SETTINGS);
    
    // Open options page for onboarding
    chrome.tabs.create({ url: chrome.runtime.getURL('src/options/index.html') });
  }
  
  // Set up alarms
  setupAlarms();
});

// Set up recurring alarms
function setupAlarms() {
  // Pomodoro tick every second when timer is running
  chrome.alarms.create(ALARMS.POMODORO_TICK, { periodInMinutes: 1 / 60 });
  
  // Clean up expired bypasses every minute
  chrome.alarms.create(ALARMS.CLEANUP_BYPASSES, { periodInMinutes: 1 });
  
  // Daily reset at midnight
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const msUntilMidnight = tomorrow.getTime() - now.getTime();
  
  chrome.alarms.create(ALARMS.DAILY_RESET, { 
    when: Date.now() + msUntilMidnight,
    periodInMinutes: 24 * 60 
  });
}

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  switch (alarm.name) {
    case ALARMS.POMODORO_TICK:
      await handlePomodoroTick();
      break;
    case ALARMS.CLEANUP_BYPASSES:
      await getActiveBypasses(); // This automatically cleans up expired ones
      break;
    case ALARMS.DAILY_RESET:
      await handleDailyReset();
      break;
  }
});

// Pomodoro timer tick
async function handlePomodoroTick() {
  const state = await getPomodoroState();
  
  if (!state.isRunning || state.phase === 'idle') return;
  
  const newState: PomodoroState = {
    ...state,
    timeRemainingSeconds: Math.max(0, state.timeRemainingSeconds - 1),
  };
  
  if (newState.timeRemainingSeconds === 0) {
    await handlePomodoroPhaseComplete(newState);
  } else {
    await savePomodoroState(newState);
  }
}

// Handle pomodoro phase completion
async function handlePomodoroPhaseComplete(state: PomodoroState) {
  const settings = await getSettings();
  const { pomodoro } = settings;
  
  let newPhase = state.phase;
  let newTimeRemaining = 0;
  let sessionsCompleted = state.sessionsCompleted;
  let todayPomodoros = state.todayPomodoros;
  let isRunning = false;
  
  if (state.phase === 'work') {
    sessionsCompleted++;
    todayPomodoros++;
    
    // Determine break type
    if (sessionsCompleted % pomodoro.sessionsUntilLongBreak === 0) {
      newPhase = 'long-break';
      newTimeRemaining = pomodoro.longBreakMinutes * 60;
    } else {
      newPhase = 'short-break';
      newTimeRemaining = pomodoro.shortBreakMinutes * 60;
    }
    
    isRunning = pomodoro.autoStartBreaks;
    
    // Notify
    if (pomodoro.notificationsEnabled) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon128.png'),
        title: 'Focus Session Complete!',
        message: `Great work! Time for a ${newPhase === 'long-break' ? 'long' : 'short'} break.`,
      });
    }
  } else {
    // Break complete, start work
    newPhase = 'work';
    newTimeRemaining = pomodoro.workDurationMinutes * 60;
    isRunning = pomodoro.autoStartWork;
    
    if (pomodoro.notificationsEnabled) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon128.png'),
        title: 'Break Over!',
        message: 'Ready to focus again?',
      });
    }
  }
  
  await savePomodoroState({
    phase: newPhase,
    timeRemainingSeconds: newTimeRemaining,
    sessionsCompleted,
    todayPomodoros,
    isRunning,
  });
}

// Daily reset
async function handleDailyReset() {
  const state = await getPomodoroState();
  await savePomodoroState({
    ...state,
    todayPomodoros: 0,
  });
}

// Check if a URL should be blocked
async function checkIfBlocked(url: string): Promise<CheckBlockedResponse> {
  const settings = await getSettings();
  
  if (!settings.enabled) {
    return { isBlocked: false };
  }
  
  // Check if within any active schedule
  if (!isAnyScheduleActive(settings.schedules) && settings.schedules.some(s => s.enabled)) {
    // If schedules exist and are enabled but none are active, don't block
    return { isBlocked: false };
  }
  
  const domain = extractDomain(url);
  const matchingSite = findMatchingBlockedSite(url, settings.blockedSites);
  
  if (!matchingSite) {
    return { isBlocked: false };
  }
  
  // Check for active bypass
  if (await hasActiveBypass(domain)) {
    return { isBlocked: false };
  }
  
  // Check pomodoro state - if in break, don't block
  const pomodoroState = await getPomodoroState();
  if (pomodoroState.phase !== 'work' && pomodoroState.phase !== 'idle') {
    return { isBlocked: false };
  }
  
  // Check time limit mode
  if (matchingSite.mode === 'time-limit' && matchingSite.dailyLimitMinutes) {
    const todayStats = await getTodayTimeStats();
    const timeSpent = todayStats[domain] || 0;
    const limitSeconds = matchingSite.dailyLimitMinutes * 60;
    
    if (timeSpent < limitSeconds) {
      return { 
        isBlocked: false,
        remainingTime: limitSeconds - timeSpent,
      };
    }
  }
  
  return {
    isBlocked: true,
    mode: matchingSite.mode,
    reason: `${matchingSite.pattern} is blocked`,
  };
}

// Message handling
chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch(err => {
      console.error('Message handler error:', err);
      sendResponse({ error: err.message });
    });
  
  return true; // Keep the message channel open for async response
});

async function handleMessage(message: Message): Promise<unknown> {
  switch (message.type) {
    case 'CHECK_BLOCKED': {
      const url = message.payload as string;
      return await checkIfBlocked(url);
    }
    
    case 'HEARTBEAT': {
      const { domain, seconds } = message.payload as { domain: string; seconds: number };
      await addTimeForDomain(domain, seconds);
      return { success: true };
    }
    
    case 'GET_SETTINGS': {
      return await getSettings();
    }
    
    case 'UPDATE_SETTINGS': {
      const settings = message.payload as Settings;
      await saveSettings(settings);
      return { success: true };
    }
    
    case 'GET_TIME_STATS': {
      return await getTodayTimeStats();
    }
    
    case 'GET_POMODORO_STATE': {
      return await getPomodoroState();
    }
    
    case 'POMODORO_ACTION': {
      const action = message.payload as { 
        action: 'start' | 'pause' | 'reset' | 'skip';
      };
      return await handlePomodoroAction(action.action);
    }
    
    case 'REQUEST_BYPASS': {
      const { domain, durationMinutes } = message.payload as { 
        domain: string; 
        durationMinutes: number;
      };
      await addBypass(domain, durationMinutes);
      return { success: true };
    }
    
    case 'FRICTION_COMPLETED': {
      const { domain } = message.payload as { domain: string };
      const settings = await getSettings();
      await addBypass(domain, settings.friction.bypassDurationMinutes);
      return { success: true };
    }
    
    default:
      return { error: 'Unknown message type' };
  }
}

// Handle pomodoro actions
async function handlePomodoroAction(action: 'start' | 'pause' | 'reset' | 'skip'): Promise<PomodoroState> {
  const state = await getPomodoroState();
  const settings = await getSettings();
  
  let newState: PomodoroState;
  
  switch (action) {
    case 'start': {
      if (state.phase === 'idle' || state.timeRemainingSeconds === 0) {
        newState = {
          ...state,
          phase: 'work',
          timeRemainingSeconds: settings.pomodoro.workDurationMinutes * 60,
          isRunning: true,
        };
      } else {
        newState = {
          ...state,
          isRunning: true,
        };
      }
      break;
    }
    
    case 'pause': {
      newState = {
        ...state,
        isRunning: false,
      };
      break;
    }
    
    case 'reset': {
      newState = {
        phase: 'idle',
        timeRemainingSeconds: 0,
        sessionsCompleted: 0,
        isRunning: false,
        todayPomodoros: state.todayPomodoros,
      };
      break;
    }
    
    case 'skip': {
      // Skip to next phase
      if (state.phase === 'work') {
        const isLongBreak = (state.sessionsCompleted + 1) % settings.pomodoro.sessionsUntilLongBreak === 0;
        newState = {
          ...state,
          phase: isLongBreak ? 'long-break' : 'short-break',
          timeRemainingSeconds: isLongBreak 
            ? settings.pomodoro.longBreakMinutes * 60 
            : settings.pomodoro.shortBreakMinutes * 60,
          sessionsCompleted: state.sessionsCompleted + 1,
          todayPomodoros: state.todayPomodoros + 1,
          isRunning: false,
        };
      } else {
        newState = {
          ...state,
          phase: 'work',
          timeRemainingSeconds: settings.pomodoro.workDurationMinutes * 60,
          isRunning: false,
        };
      }
      break;
    }
    
    default:
      newState = state;
  }
  
  await savePomodoroState(newState);
  return newState;
}

// Log startup
console.log('Focus Flow service worker started', getTodayString());

