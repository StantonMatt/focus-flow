// YouTube-specific blocking for Shorts

// CSS to hide YouTube Shorts elements
const YOUTUBE_SHORTS_CSS = `
  /* Hide Shorts shelf on home page */
  ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts]) {
    display: none !important;
  }
  
  /* Hide Shorts in search results */
  ytd-reel-shelf-renderer {
    display: none !important;
  }
  
  /* Hide Shorts tab in navigation */
  ytd-guide-entry-renderer:has(a[title="Shorts"]) {
    display: none !important;
  }
  
  /* Hide Shorts in mini guide */
  ytd-mini-guide-entry-renderer:has(a[title="Shorts"]) {
    display: none !important;
  }
  
  /* Hide Shorts section in sidebar */
  ytd-guide-section-renderer:has(#guide-section-title:contains("Shorts")) {
    display: none !important;
  }
  
  /* Hide Shorts button in mobile navigation */
  ytd-pivot-bar-item-renderer:has([title="Shorts"]) {
    display: none !important;
  }
  
  /* Hide Shorts in video recommendations (sidebar on watch page) */
  ytd-compact-video-renderer:has([overlay-style="SHORTS"]) {
    display: none !important;
  }
  
  /* Hide Shorts in grid */
  ytd-grid-video-renderer:has([overlay-style="SHORTS"]) {
    display: none !important;
  }
  
  /* Hide Shorts in rich item renderer */
  ytd-rich-item-renderer:has([overlay-style="SHORTS"]) {
    display: none !important;
  }
  
  /* Hide Shorts suggestions on video page - by time status overlay */
  ytd-compact-video-renderer:has(ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"]) {
    display: none !important;
  }
  
  /* Hide Shorts section in watch page sidebar - section title */
  ytd-item-section-renderer:has(#title:contains("Shorts")) {
    display: none !important;
  }
  
  /* Hide the Shorts remixing section */
  ytd-reel-shelf-renderer {
    display: none !important;
  }
  
  /* Hide Shorts shelf in related videos */
  ytd-shelf-renderer:has([is-shorts]) {
    display: none !important;
  }
  
  /* Hide Shorts in the secondary results (right sidebar on watch page) */
  #related ytd-compact-video-renderer:has(a[href*="/shorts/"]) {
    display: none !important;
  }
  
  /* Hide any video renderer with shorts link */
  ytd-compact-video-renderer:has(a[href*="/shorts/"]) {
    display: none !important;
  }
  
  /* Hide Shorts in end screen */
  .ytp-endscreen-content .ytp-videowall-still:has(a[href*="/shorts/"]) {
    display: none !important;
  }
  
  /* Hide Shorts label/badge */
  ytd-thumbnail-overlay-time-status-renderer[overlay-style="SHORTS"] {
    display: none !important;
  }
  
  /* Hide entire video item if it links to shorts */
  ytd-video-renderer:has(a[href*="/shorts/"]) {
    display: none !important;
  }
`;

// Check if we're on YouTube
export function isYouTube(): boolean {
  return window.location.hostname.includes('youtube.com');
}

// Check if we're on a Shorts page
export function isYouTubeShorts(): boolean {
  return window.location.pathname.startsWith('/shorts');
}

// Inject CSS to hide Shorts elements
export function injectYouTubeShortsCSS(): void {
  if (!isYouTube()) return;
  
  // Check if already injected
  if (document.getElementById('focus-flow-youtube-shorts-css')) return;
  
  const style = document.createElement('style');
  style.id = 'focus-flow-youtube-shorts-css';
  style.textContent = YOUTUBE_SHORTS_CSS;
  document.head.appendChild(style);
}

// Remove the injected CSS (when extension is disabled)
export function removeYouTubeShortsCSS(): void {
  const style = document.getElementById('focus-flow-youtube-shorts-css');
  if (style) {
    style.remove();
  }
}

// Redirect Shorts to regular video
export function redirectShortsToVideo(): void {
  if (!isYouTubeShorts()) return;
  
  // Extract video ID from /shorts/VIDEO_ID
  const pathParts = window.location.pathname.split('/');
  const shortsIndex = pathParts.indexOf('shorts');
  
  if (shortsIndex !== -1 && pathParts[shortsIndex + 1]) {
    const videoId = pathParts[shortsIndex + 1];
    // Redirect to regular video page
    window.location.replace(`https://www.youtube.com/watch?v=${videoId}`);
  }
}

// Observe DOM for dynamically loaded Shorts elements
export function observeYouTubeDOM(): MutationObserver | null {
  if (!isYouTube()) return null;
  
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        // Re-check for shorts links and convert them
        convertShortsLinks();
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  
  return observer;
}

// Convert Shorts links to regular video links
function convertShortsLinks(): void {
  const shortsLinks = document.querySelectorAll('a[href*="/shorts/"]');
  
  shortsLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.includes('/shorts/')) {
      // Extract video ID
      const match = href.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        const videoId = match[1];
        link.setAttribute('href', `/watch?v=${videoId}`);
      }
    }
  });
}

// Initialize YouTube Shorts blocking
export function initYouTubeShortsBlocking(): void {
  if (!isYouTube()) return;
  
  // Inject CSS immediately
  injectYouTubeShortsCSS();
  
  // Redirect if on Shorts page
  if (isYouTubeShorts()) {
    redirectShortsToVideo();
    return;
  }
  
  // Convert existing shorts links
  convertShortsLinks();
  
  // Observe for new content
  observeYouTubeDOM();
}

// Clean up YouTube Shorts blocking
export function cleanupYouTubeShortsBlocking(): void {
  removeYouTubeShortsCSS();
}

