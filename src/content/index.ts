import type { CheckBlockedResponse, Message, Settings, PomodoroState, PomodoroSettings } from '../shared/types';
import { extractDomain, formatDuration, formatTime } from '../shared/utils';
import { HEARTBEAT_INTERVAL } from '../shared/constants';
import { getTranslator } from '../shared/i18n';
import { initFilters } from './filters';

// Import filter registrations (they auto-register on import)
import './filters/youtube';
import './filters/instagram';
import './filters/facebook';
import './filters/twitter';
import './filters/reddit';
import './filters/tiktok';
import './filters/twitch';
import './filters/linkedin';
import './filters/snapchat';

// Track state
let isInitialized = false;
let heartbeatInterval: number | null = null;
let isFrictionActive = false;
let isBlocked = false;
let timeLimitWidget: HTMLElement | null = null;
let timeLimitRemaining = 0;
let bypassedDomain: string | null = null; // Track if we bypassed friction on this page

// Pomodoro timer widget state
let pomodoroWidget: HTMLElement | null = null;
let pomodoroWidgetDismissed = false;
let pomodoroPollingInterval: number | null = null;

// Translation function (will be initialized)
let t: (key: string, params?: Record<string, string | number>) => string = (key) => key;

// Check if extension context is still valid
function isExtensionValid(): boolean {
  try {
    return !!chrome.runtime?.id;
  } catch {
    return false;
  }
}

// Safe message sender that handles extension context invalidation
async function sendMessage<T>(message: Message): Promise<T | null> {
  if (!isExtensionValid()) {
    console.log('Focus Flow: Extension context invalidated, please reload the page');
    return null;
  }
  
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Focus Flow: Message failed -', chrome.runtime.lastError.message);
          resolve(null);
          return;
        }
        resolve(response as T);
      });
    } catch (e) {
      console.log('Focus Flow: Extension context invalidated');
      resolve(null);
    }
  });
}

// Wait for DOM to be ready
function waitForDOM(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => resolve());
    } else {
      resolve();
    }
  });
}

// Wait for body to exist (for very early injection)
function waitForBody(): Promise<void> {
  return new Promise((resolve) => {
    if (document.body) {
      resolve();
      return;
    }
    
    const observer = new MutationObserver(() => {
      if (document.body) {
        observer.disconnect();
        resolve();
      }
    });
    
    observer.observe(document.documentElement, { childList: true });
  });
}

// Initialize content script
async function init() {
  if (isInitialized) return;
  
  // Skip non-http pages (about:blank, chrome://, etc.)
  if (!window.location.href.startsWith('http')) {
    return;
  }
  
  isInitialized = true;
  
  // Wait for body to exist before doing anything
  await waitForBody();
  
  // Initialize translations
  try {
    const translator = await getTranslator();
    t = translator.t;
  } catch (e) {
    console.log('Focus Flow: Could not load translations, using defaults');
  }
  
  // Small delay to ensure service worker is ready
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Check if current page should be blocked FIRST
  await checkAndBlock();
  
  // Initialize content filters (YouTube Shorts, Instagram Reels, etc.)
  if (!isBlocked && !isFrictionActive) {
    const settings = await sendMessage<Settings>({
      type: 'GET_SETTINGS',
    });
    
    if (settings?.contentFilters) {
      initFilters(settings.contentFilters, window.location.href);
    }
  }
  
  // Initialize Pomodoro timer widget (if overlay mode is enabled)
  if (!isBlocked && !isFrictionActive) {
    initPomodoroWidget();
    
    // Listen for storage changes to update widget when settings change
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.settings) {
        const newSettings = changes.settings.newValue as Settings | undefined;
        if (newSettings?.pomodoro) {
          // Re-initialize widget with new settings
          pomodoroWidgetDismissed = false;
          initPomodoroWidget();
        }
      }
    });
  }
  
  // Start time tracking
  startTimeTracking();
  
  // Listen for visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Clear bypass when page is closed (user consciously leaves the site)
  // Note: Using only pagehide as beforeunload causes permissions policy violations
  window.addEventListener('pagehide', handlePageHide);
}

// Check if the current page should be blocked
async function checkAndBlock() {
  const url = window.location.href;
  
  const response = await sendMessage<CheckBlockedResponse>({
    type: 'CHECK_BLOCKED',
    payload: url,
  });
  
  if (!response) {
    // Extension context invalid or no response
    return;
  }
  
  if (response.isBlocked) {
    if (response.mode === 'block') {
      isBlocked = true;
      showBlockedPage();
    } else if (response.mode === 'friction') {
      isFrictionActive = true;
      await waitForDOM();
      showFrictionOverlay();
    } else if (response.mode === 'time-limit') {
      isBlocked = true;
      showBlockedPage(t('blocked.dailyLimitReached'));
    }
  } else if (response.remainingTime !== undefined && response.remainingTime > 0) {
    // Site has a time limit but not exceeded yet - show countdown widget
    timeLimitRemaining = response.remainingTime;
    await waitForDOM();
    showTimeLimitWidget();
  }
}

// Show the blocked page
function showBlockedPage(message?: string) {
  if (!isExtensionValid()) return;
  
  // Pause any playing media before redirecting
  pauseAllMedia();
  
  try {
    const blockedUrl = chrome.runtime.getURL('src/blocked/index.html');
    const currentUrl = encodeURIComponent(window.location.href);
    const msg = message ? encodeURIComponent(message) : '';
    
    window.location.replace(`${blockedUrl}?url=${currentUrl}&message=${msg}`);
  } catch (e) {
    console.log('Focus Flow: Could not redirect to blocked page');
  }
}

// Show time limit countdown widget
function showTimeLimitWidget() {
  if (timeLimitWidget) return;
  
  const timeRemainingLabel = t('timeLimitWidget.timeRemaining');
  const hideWidgetLabel = t('timeLimitWidget.hideWidget');
  
  timeLimitWidget = document.createElement('div');
  timeLimitWidget.id = 'focus-flow-time-limit-widget';
  timeLimitWidget.innerHTML = `
    <style>
      #focus-flow-time-limit-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%);
        border: 1px solid #2d3548;
        border-radius: 12px;
        padding: 12px 16px;
        z-index: 2147483646;
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: move;
        user-select: none;
        animation: slideIn 0.3s ease-out;
      }
      
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      #focus-flow-time-limit-widget.warning {
        border-color: #ff6b6b;
        animation: pulse 1s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { box-shadow: 0 4px 20px rgba(255, 107, 107, 0.3); }
        50% { box-shadow: 0 4px 30px rgba(255, 107, 107, 0.5); }
      }
      
      .time-limit-icon {
        font-size: 24px;
      }
      
      .time-limit-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      
      .time-limit-label {
        font-size: 11px;
        color: #8b99a8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .time-limit-time {
        font-size: 18px;
        font-weight: 600;
        font-family: 'JetBrains Mono', monospace;
        color: #00d4aa;
      }
      
      .time-limit-time.warning {
        color: #ff6b6b;
      }
      
      .time-limit-close {
        background: none;
        border: none;
        color: #5c6a7a;
        cursor: pointer;
        padding: 4px;
        font-size: 16px;
        line-height: 1;
        transition: color 0.2s;
      }
      
      .time-limit-close:hover {
        color: #e7edf4;
      }
    </style>
    
    <div class="time-limit-icon">⏱️</div>
    <div class="time-limit-info">
      <span class="time-limit-label">${timeRemainingLabel}</span>
      <span class="time-limit-time" id="time-limit-countdown">${formatDuration(timeLimitRemaining)}</span>
    </div>
    <button class="time-limit-close" id="time-limit-close" title="${hideWidgetLabel}">×</button>
  `;
  
  document.body.appendChild(timeLimitWidget);
  
  // Close button
  const closeBtn = timeLimitWidget.querySelector('#time-limit-close');
  closeBtn?.addEventListener('click', () => {
    timeLimitWidget?.remove();
    timeLimitWidget = null;
  });
  
  // Update countdown - sync with actual tracked time from service worker
  const countdownEl = timeLimitWidget.querySelector('#time-limit-countdown') as HTMLElement;
  let lastSyncTime = Date.now();
  
  const updateCountdown = async () => {
    if (!timeLimitWidget || !isExtensionValid()) return;
    
    // Only decrement if tab is visible (matching heartbeat logic)
    if (document.visibilityState === 'visible') {
      timeLimitRemaining = Math.max(0, timeLimitRemaining - 1);
    }
    
    // Sync with server every 30 seconds to ensure accuracy
    if (Date.now() - lastSyncTime > 30000) {
      lastSyncTime = Date.now();
      const response = await sendMessage<CheckBlockedResponse>({
        type: 'CHECK_BLOCKED',
        payload: window.location.href,
      });
      
      if (response?.isBlocked && response.mode === 'time-limit') {
        // Time limit exceeded - redirect
        showBlockedPage(t('blocked.dailyLimitReached'));
        return;
      } else if (response?.remainingTime !== undefined) {
        timeLimitRemaining = response.remainingTime;
      }
    }
    
    countdownEl.textContent = formatDuration(timeLimitRemaining);
    
    // Warning state when less than 5 minutes
    if (timeLimitRemaining < 300) {
      timeLimitWidget.classList.add('warning');
      countdownEl.classList.add('warning');
    } else {
      timeLimitWidget.classList.remove('warning');
      countdownEl.classList.remove('warning');
    }
    
    // Time's up - redirect to blocked page
    if (timeLimitRemaining <= 0) {
      showBlockedPage(t('blocked.dailyLimitReached'));
      return;
    }
    
    setTimeout(updateCountdown, 1000);
  };
  
  setTimeout(updateCountdown, 1000);
  
  // Make widget draggable
  makeDraggable(timeLimitWidget);
}

// Make an element draggable
function makeDraggable(element: HTMLElement) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  
  element.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    isDragging = true;
    offsetX = e.clientX - element.getBoundingClientRect().left;
    offsetY = e.clientY - element.getBoundingClientRect().top;
    element.style.transition = 'none';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    element.style.left = `${x}px`;
    element.style.right = 'auto';
    element.style.top = `${y}px`;
    element.style.bottom = 'auto';
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
    element.style.transition = '';
  });
}

// Initialize Pomodoro timer widget
async function initPomodoroWidget() {
  if (pomodoroWidgetDismissed) return;
  
  // Start polling for Pomodoro state (polling handles show/hide based on settings)
  if (!pomodoroPollingInterval) {
    pomodoroPollingInterval = window.setInterval(updatePomodoroWidget, 1000);
  }
  
  // Do an immediate update
  updatePomodoroWidget();
}

// Update Pomodoro widget based on current state
async function updatePomodoroWidget() {
  if (!isExtensionValid() || pomodoroWidgetDismissed) {
    if (pomodoroPollingInterval) {
      clearInterval(pomodoroPollingInterval);
      pomodoroPollingInterval = null;
    }
    return;
  }
  
  const [settings, pomodoroState] = await Promise.all([
    sendMessage<Settings>({ type: 'GET_SETTINGS' }),
    sendMessage<PomodoroState>({ type: 'GET_POMODORO_STATE' }),
  ]);
  
  if (!settings?.pomodoro || !pomodoroState) return;
  
  const overlayMode = settings.pomodoro.overlayMode || 'never';
  
  // Determine if widget should be shown
  const shouldShow = 
    overlayMode === 'always' || 
    (overlayMode === 'whenActive' && pomodoroState.phase !== 'idle');
  
  if (!shouldShow) {
    removePomodoroWidget();
    return;
  }
  
  // Create or update widget
  if (!pomodoroWidget) {
    createPomodoroWidget(pomodoroState, settings.pomodoro);
  } else {
    updatePomodoroWidgetContent(pomodoroState, settings.pomodoro);
  }
}

// Create the Pomodoro timer widget
function createPomodoroWidget(state: PomodoroState, settings: PomodoroSettings) {
  if (pomodoroWidget) return;
  
  const hideLabel = t('timeLimitWidget.hideWidget');
  
  pomodoroWidget = document.createElement('div');
  pomodoroWidget.id = 'focus-flow-pomodoro-widget';
  pomodoroWidget.innerHTML = `
    <style>
      #focus-flow-pomodoro-widget {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: linear-gradient(135deg, #1a1f2e 0%, #0f1419 100%);
        border: 2px solid #2d3548;
        border-radius: 16px;
        padding: 12px 16px;
        z-index: 2147483646;
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: move;
        user-select: none;
        animation: pomodoroSlideIn 0.3s ease-out;
        min-width: 180px;
      }
      
      @keyframes pomodoroSlideIn {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      #focus-flow-pomodoro-widget.work {
        border-color: #00d4aa;
      }
      
      #focus-flow-pomodoro-widget.short-break {
        border-color: #0984e3;
      }
      
      #focus-flow-pomodoro-widget.long-break {
        border-color: #feca57;
      }
      
      #focus-flow-pomodoro-widget.idle {
        border-color: #5c6a7a;
      }
      
      .pomodoro-widget-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        background: rgba(0, 212, 170, 0.15);
        flex-shrink: 0;
      }
      
      #focus-flow-pomodoro-widget.work .pomodoro-widget-icon {
        background: rgba(0, 212, 170, 0.15);
      }
      
      #focus-flow-pomodoro-widget.short-break .pomodoro-widget-icon {
        background: rgba(9, 132, 227, 0.15);
      }
      
      #focus-flow-pomodoro-widget.long-break .pomodoro-widget-icon {
        background: rgba(254, 202, 87, 0.15);
      }
      
      .pomodoro-widget-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
      }
      
      .pomodoro-widget-phase {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
      }
      
      #focus-flow-pomodoro-widget.work .pomodoro-widget-phase {
        color: #00d4aa;
      }
      
      #focus-flow-pomodoro-widget.short-break .pomodoro-widget-phase {
        color: #0984e3;
      }
      
      #focus-flow-pomodoro-widget.long-break .pomodoro-widget-phase {
        color: #feca57;
      }
      
      #focus-flow-pomodoro-widget.idle .pomodoro-widget-phase {
        color: #8b99a8;
      }
      
      .pomodoro-widget-time {
        font-size: 22px;
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
        color: #e7edf4;
        line-height: 1;
      }
      
      .pomodoro-widget-session {
        font-size: 10px;
        color: #5c6a7a;
      }
      
      .pomodoro-widget-close {
        background: none;
        border: none;
        color: #5c6a7a;
        cursor: pointer;
        padding: 4px;
        font-size: 14px;
        line-height: 1;
        transition: color 0.2s;
        flex-shrink: 0;
      }
      
      .pomodoro-widget-close:hover {
        color: #e7edf4;
      }
    </style>
    
    <div class="pomodoro-widget-icon" id="pomodoro-widget-icon">🍅</div>
    <div class="pomodoro-widget-info">
      <span class="pomodoro-widget-phase" id="pomodoro-widget-phase"></span>
      <span class="pomodoro-widget-time" id="pomodoro-widget-time"></span>
      <span class="pomodoro-widget-session" id="pomodoro-widget-session"></span>
    </div>
    <button class="pomodoro-widget-close" id="pomodoro-widget-close" title="${hideLabel}">×</button>
  `;
  
  document.body.appendChild(pomodoroWidget);
  
  // Close button
  const closeBtn = pomodoroWidget.querySelector('#pomodoro-widget-close');
  closeBtn?.addEventListener('click', () => {
    pomodoroWidgetDismissed = true;
    removePomodoroWidget();
  });
  
  // Make draggable
  makeDraggable(pomodoroWidget);
  
  // Initial update
  updatePomodoroWidgetContent(state, settings);
}

// Update the Pomodoro widget content
function updatePomodoroWidgetContent(state: PomodoroState, settings: PomodoroSettings) {
  if (!pomodoroWidget) return;
  
  const phaseEl = pomodoroWidget.querySelector('#pomodoro-widget-phase') as HTMLElement;
  const timeEl = pomodoroWidget.querySelector('#pomodoro-widget-time') as HTMLElement;
  const sessionEl = pomodoroWidget.querySelector('#pomodoro-widget-session') as HTMLElement;
  const iconEl = pomodoroWidget.querySelector('#pomodoro-widget-icon') as HTMLElement;
  
  if (!phaseEl || !timeEl || !sessionEl || !iconEl) return;
  
  // Update phase class
  pomodoroWidget.classList.remove('work', 'short-break', 'long-break', 'idle');
  pomodoroWidget.classList.add(state.phase);
  
  // Update phase text
  let phaseText = '';
  let icon = '🍅';
  switch (state.phase) {
    case 'work':
      phaseText = t('pomodoro.focusTime');
      icon = '🍅';
      break;
    case 'short-break':
      phaseText = t('pomodoro.shortBreak');
      icon = '☕';
      break;
    case 'long-break':
      phaseText = t('pomodoro.longBreak');
      icon = '🌴';
      break;
    case 'idle':
      phaseText = t('pomodoro.readyToFocus');
      icon = '🍅';
      break;
  }
  
  phaseEl.textContent = phaseText;
  iconEl.textContent = icon;
  
  // Update time display
  const displayTime = state.phase === 'idle' 
    ? formatTime(settings.workDurationMinutes * 60)
    : formatTime(state.timeRemainingSeconds);
  timeEl.textContent = displayTime;
  
  // Update session count
  sessionEl.textContent = `${t('pomodoro.session')} ${state.sessionsCompleted + 1}`;
}

// Remove the Pomodoro widget
function removePomodoroWidget() {
  if (pomodoroWidget) {
    pomodoroWidget.remove();
    pomodoroWidget = null;
  }
}

// Media monitoring state
let mediaMonitorInterval: number | null = null;
let mediaObserver: MutationObserver | null = null;

// Pause all media on the page (videos and audio)
function pauseAllMedia() {
  // Pause all video elements
  document.querySelectorAll('video').forEach(video => {
    try {
      video.pause();
      video.muted = true;
      // Remove autoplay to prevent restart
      video.autoplay = false;
      // Clear the source temporarily to force stop (for stubborn players)
      if (video.src && !video.dataset.focusFlowPaused) {
        video.dataset.focusFlowPaused = 'true';
      }
    } catch (e) {
      // Ignore errors
    }
  });
  
  // Pause all audio elements
  document.querySelectorAll('audio').forEach(audio => {
    try {
      audio.pause();
      audio.muted = true;
      audio.autoplay = false;
    } catch (e) {
      // Ignore errors
    }
  });
  
  // Also try to pause media in iframes (same-origin only)
  document.querySelectorAll('iframe').forEach(iframe => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.querySelectorAll('video').forEach((video) => {
          (video as HTMLVideoElement).pause();
          (video as HTMLVideoElement).muted = true;
        });
        iframeDoc.querySelectorAll('audio').forEach((audio) => {
          (audio as HTMLAudioElement).pause();
          (audio as HTMLAudioElement).muted = true;
        });
      }
    } catch (e) {
      // Cross-origin iframe, can't access
    }
  });
}

// Start continuous media monitoring while friction overlay is active
function startMediaMonitoring() {
  // Clear any existing monitoring
  stopMediaMonitoring();
  
  // Pause immediately
  pauseAllMedia();
  
  // Keep checking every 100ms for new or restarted media
  mediaMonitorInterval = window.setInterval(() => {
    pauseAllMedia();
  }, 100);
  
  // Also watch for new elements being added to the DOM
  mediaObserver = new MutationObserver((mutations) => {
    let shouldPause = false;
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement) {
          if (node.tagName === 'VIDEO' || node.tagName === 'AUDIO' || 
              node.querySelector('video, audio')) {
            shouldPause = true;
            break;
          }
        }
      }
      if (shouldPause) break;
    }
    if (shouldPause) {
      pauseAllMedia();
    }
  });
  
  mediaObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Stop media monitoring when friction overlay is removed
function stopMediaMonitoring() {
  if (mediaMonitorInterval) {
    clearInterval(mediaMonitorInterval);
    mediaMonitorInterval = null;
  }
  if (mediaObserver) {
    mediaObserver.disconnect();
    mediaObserver = null;
  }
}

// Show friction overlay
function showFrictionOverlay() {
  if (document.getElementById('focus-flow-friction-overlay')) return;
  
  // Start continuous media monitoring to prevent background audio/video
  startMediaMonitoring();
  
  const waitTitle = t('frictionOverlay.wait');
  const typePhraseLabel = t('frictionOverlay.typePhrase');
  const continueBtn = t('frictionOverlay.continue');
  const returnBtn = t('frictionOverlay.returnToSafety');
  const explanation = t('frictionOverlay.explanation');
  const openSettings = t('frictionOverlay.openSettings');
  
  const overlay = document.createElement('div');
  overlay.id = 'focus-flow-friction-overlay';
  overlay.innerHTML = `
    <style>
      #focus-flow-friction-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(15, 20, 25, 0.98);
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #e7edf4;
      }
      
      .friction-content {
        text-align: center;
        max-width: 500px;
        padding: 40px;
        animation: frictionFadeIn 0.3s ease-out;
      }
      
      @keyframes frictionFadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .friction-icon { font-size: 64px; margin-top: 16px; margin-bottom: 16px; }
      
      .friction-explanation {
        font-size: 15px;
        color: #8b99a8;
        margin-bottom: 8px;
        line-height: 1.5;
      }
      
      .friction-settings-link {
        font-size: 13px;
        color: #00d4aa;
        background: rgba(0, 212, 170, 0.1);
        border: 1px solid rgba(0, 212, 170, 0.3);
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 6px;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 24px;
      }
      
      .friction-settings-link:hover {
        background: rgba(0, 212, 170, 0.2);
        border-color: rgba(0, 212, 170, 0.5);
      }
      .friction-title { font-size: 28px; font-weight: 600; margin-bottom: 16px; color: #00d4aa; }
      .friction-message { font-size: 18px; color: #8b99a8; margin-bottom: 32px; line-height: 1.6; }
      .friction-timer { font-size: 48px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: #00d4aa; margin-bottom: 24px; }
      .friction-phrase-container { margin-top: 24px; }
      .friction-phrase-label { font-size: 14px; color: #8b99a8; margin-bottom: 8px; }
      .friction-phrase-target { font-size: 18px; font-family: 'JetBrains Mono', monospace; color: #feca57; margin-bottom: 16px; padding: 12px 20px; background: rgba(254, 202, 87, 0.1); border-radius: 8px; display: inline-block; }
      .friction-input { width: 100%; padding: 14px 20px; font-size: 16px; font-family: 'JetBrains Mono', monospace; background: #1a1f2e; border: 2px solid #2d3548; border-radius: 8px; color: #e7edf4; outline: none; transition: border-color 0.2s; }
      .friction-input:focus { border-color: #00d4aa; }
      .friction-input.error { border-color: #ff6b6b; animation: shake 0.3s ease-in-out; }
      @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      .friction-buttons { display: flex; gap: 16px; justify-content: center; margin-top: 24px; }
      .friction-btn { padding: 12px 28px; font-size: 16px; font-weight: 500; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
      .friction-btn-primary { background: #00d4aa; color: #0f1419; }
      .friction-btn-primary:hover:not(:disabled) { background: #00b894; transform: translateY(-2px); }
      .friction-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
      .friction-btn-secondary { background: #2d3548; color: #e7edf4; }
      .friction-btn-secondary:hover { background: #3d4558; }
      .friction-progress { width: 200px; height: 6px; background: #2d3548; border-radius: 3px; overflow: hidden; margin: 0 auto 24px; }
      .friction-progress-bar { height: 100%; background: linear-gradient(90deg, #00d4aa, #0984e3); transition: width 0.1s linear; }
    </style>
    
    <div class="friction-content">
      <p class="friction-explanation">${explanation}</p>
      <button class="friction-settings-link" id="friction-settings-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        ${openSettings}
      </button>
      <div class="friction-icon">⏳</div>
      <h1 class="friction-title" id="friction-title">${waitTitle}</h1>
      <p class="friction-message" id="friction-message"></p>
      
      <div class="friction-timer" id="friction-timer">10</div>
      <div class="friction-progress">
        <div class="friction-progress-bar" id="friction-progress"></div>
      </div>
      
      <div class="friction-phrase-container" id="phrase-container" style="display: none;">
        <p class="friction-phrase-label">${typePhraseLabel}</p>
        <div class="friction-phrase-target" id="phrase-target"></div>
        <input type="text" class="friction-input" id="phrase-input" placeholder="..." autocomplete="off" />
      </div>
      
      <div class="friction-buttons">
        <button class="friction-btn friction-btn-secondary" id="go-back-btn">${returnBtn}</button>
        <button class="friction-btn friction-btn-primary" id="continue-btn" disabled>${continueBtn}</button>
      </div>
    </div>
  `;
  
  // Append to body or documentElement
  const parent = document.body || document.documentElement;
  parent.appendChild(overlay);
  
  // Add settings button click handler
  const settingsBtn = overlay.querySelector('#friction-settings-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      // Pass the current site so it can be highlighted in the options page
      const currentSite = window.location.hostname;
      chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS', payload: { tab: 'blocked', site: currentSite } });
    });
  }
  
  initFrictionLogic(overlay);
}

// Initialize friction logic
async function initFrictionLogic(overlay: HTMLElement) {
  const settings = await sendMessage<{ friction: { delaySeconds: number; requirePhrase: boolean; phrase: string } }>({
    type: 'GET_SETTINGS',
    payload: null,
  });
  
  const delaySeconds = settings?.friction?.delaySeconds || 10;
  const requirePhrase = settings?.friction?.requirePhrase ?? true;
  const phrase = settings?.friction?.phrase || 'I want to procrastinate';
  
  const titleEl = overlay.querySelector('#friction-title') as HTMLElement;
  const timerEl = overlay.querySelector('#friction-timer') as HTMLElement;
  const progressEl = overlay.querySelector('#friction-progress') as HTMLElement;
  const phraseContainer = overlay.querySelector('#phrase-container') as HTMLElement;
  const phraseTarget = overlay.querySelector('#phrase-target') as HTMLElement;
  const phraseInput = overlay.querySelector('#phrase-input') as HTMLInputElement;
  const continueBtn = overlay.querySelector('#continue-btn') as HTMLButtonElement;
  const goBackBtn = overlay.querySelector('#go-back-btn') as HTMLButtonElement;
  
  let timeRemaining = delaySeconds;
  
  const updateTimer = () => {
    if (!overlay.isConnected) return;
    
    timerEl.textContent = timeRemaining.toString();
    const progress = ((delaySeconds - timeRemaining) / delaySeconds) * 100;
    progressEl.style.width = `${progress}%`;
    
    if (timeRemaining > 0) {
      timeRemaining--;
      setTimeout(updateTimer, 1000);
    } else {
      timerEl.textContent = '✓';
      timerEl.style.color = '#00d4aa';
      titleEl.textContent = t('frictionOverlay.almostThere');
      
      if (requirePhrase) {
        phraseContainer.style.display = 'block';
        phraseTarget.textContent = phrase;
        phraseInput.focus();
      } else {
        continueBtn.disabled = false;
      }
    }
  };
  
  updateTimer();
  
  if (requirePhrase) {
    phraseInput.addEventListener('input', () => {
      if (phraseInput.value.toLowerCase() === phrase.toLowerCase()) {
        continueBtn.disabled = false;
        phraseInput.classList.remove('error');
      } else {
        continueBtn.disabled = true;
      }
    });
    
    phraseInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !continueBtn.disabled) {
        completeFriction();
      }
    });
  }
  
  goBackBtn.addEventListener('click', () => {
    stopMediaMonitoring();
    window.history.back();
  });
  
  continueBtn.addEventListener('click', () => {
    if (!continueBtn.disabled) {
      completeFriction();
    }
  });
  
  async function completeFriction() {
    const domain = extractDomain(window.location.href);
    
    await sendMessage({
      type: 'FRICTION_COMPLETED',
      payload: { domain },
    });
    
    isFrictionActive = false;
    bypassedDomain = domain; // Track that we bypassed friction for this domain
    stopMediaMonitoring();
    overlay.remove();
    
    // Now initialize content filters if needed
    const settings = await sendMessage<Settings>({
      type: 'GET_SETTINGS',
    });
    
    if (settings?.contentFilters) {
      initFilters(settings.contentFilters, window.location.href);
    }
  }
}

// Time tracking
function startTimeTracking() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
  
  heartbeatInterval = window.setInterval(() => {
    if (!isExtensionValid()) {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      return;
    }
    
    // Count time if the page is visible on screen
    if (document.visibilityState === 'visible') {
      sendHeartbeat();
    }
  }, HEARTBEAT_INTERVAL);
}

function sendHeartbeat() {
  if (isFrictionActive || isBlocked) return;
  
  const domain = extractDomain(window.location.href);
  if (!domain) return;
  
  sendMessage({
    type: 'HEARTBEAT',
    payload: { 
      domain, 
      seconds: HEARTBEAT_INTERVAL / 1000 
    },
  });
}

function handleVisibilityChange() {
  // Re-check blocking status when tab becomes visible again
  // (in case settings changed while tab was hidden)
  if (document.visibilityState === 'visible' && !isBlocked && !isFrictionActive) {
    // Could add re-check logic here if needed
  }
}

// Clear bypass when page is unloaded (closed or navigated away)
function handlePageHide(event: PageTransitionEvent) {
  // Only clear bypass if not being cached (actual navigation/close)
  if (!event.persisted && bypassedDomain) {
    clearBypass();
  }
}

function clearBypass() {
  if (!bypassedDomain || !isExtensionValid()) return;
  
  // Use sendBeacon-style approach for reliability during page unload
  // sendMessage may not complete during unload, so we try both
  try {
    sendMessage({
      type: 'CLEAR_BYPASS',
      payload: { domain: bypassedDomain },
    });
  } catch {
    // Ignore errors during unload
  }
  
  bypassedDomain = null;
}

// Start the content script
init();
