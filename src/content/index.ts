import type { CheckBlockedResponse, Message } from '../shared/types';
import { extractDomain, formatDuration } from '../shared/utils';
import { HEARTBEAT_INTERVAL } from '../shared/constants';
import { getTranslator } from '../shared/i18n';
import { initYouTubeShortsBlocking, isYouTube } from './youtube';

// Track state
let isInitialized = false;
let heartbeatInterval: number | null = null;
let isFrictionActive = false;
let isBlocked = false;
let timeLimitWidget: HTMLElement | null = null;
let timeLimitRemaining = 0;

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
  
  // Initialize YouTube Shorts blocking if on YouTube (only if not blocked)
  if (!isBlocked && !isFrictionActive && isYouTube()) {
    initYouTubeShortsBlocking();
  }
  
  // Start time tracking
  startTimeTracking();
  
  // Listen for visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);
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

// Show friction overlay
function showFrictionOverlay() {
  if (document.getElementById('focus-flow-friction-overlay')) return;
  
  const waitTitle = t('frictionOverlay.wait');
  const typePhraseLabel = t('frictionOverlay.typePhrase');
  const continueBtn = t('frictionOverlay.continue');
  const returnBtn = t('frictionOverlay.returnToSafety');
  
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
      
      .friction-icon { font-size: 64px; margin-bottom: 24px; }
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
    overlay.remove();
    
    // Now initialize YouTube shorts blocking if needed
    if (isYouTube()) {
      initYouTubeShortsBlocking();
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

// Start the content script
init();
