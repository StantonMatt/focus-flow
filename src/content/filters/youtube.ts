// YouTube Content Filters
// - Shorts blocking (migrated from youtube.ts)
// - Recommendations hiding
// - Comments hiding

import { registerFilter, injectCSS, removeCSS, createDOMObserver, type ContentFilter } from './index';

// ============================================
// YouTube Shorts Filter
// ============================================

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

let shortsObserver: MutationObserver | null = null;

function isYouTubeShorts(): boolean {
  return window.location.pathname.startsWith('/shorts');
}

function redirectShortsToVideo(): void {
  if (!isYouTubeShorts()) return;
  
  const pathParts = window.location.pathname.split('/');
  const shortsIndex = pathParts.indexOf('shorts');
  
  if (shortsIndex !== -1 && pathParts[shortsIndex + 1]) {
    const videoId = pathParts[shortsIndex + 1];
    window.location.replace(`https://www.youtube.com/watch?v=${videoId}`);
  }
}

function convertShortsLinks(): void {
  const shortsLinks = document.querySelectorAll('a[href*="/shorts/"]');
  
  shortsLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href.includes('/shorts/')) {
      const match = href.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        link.setAttribute('href', `/watch?v=${match[1]}`);
      }
    }
  });
}

const youtubeShortsFilter: ContentFilter = {
  platform: 'YouTube',
  filterName: 'Shorts',
  filterKey: 'youtubeShorts',
  
  matches: (url: string) => url.includes('youtube.com'),
  
  init: () => {
    injectCSS('focus-flow-youtube-shorts', YOUTUBE_SHORTS_CSS);
    
    if (isYouTubeShorts()) {
      redirectShortsToVideo();
      return;
    }
    
    convertShortsLinks();
    
    shortsObserver = createDOMObserver(() => {
      convertShortsLinks();
    });
  },
  
  cleanup: () => {
    removeCSS('focus-flow-youtube-shorts');
    if (shortsObserver) {
      shortsObserver.disconnect();
      shortsObserver = null;
    }
  },
};

// ============================================
// YouTube Recommendations Filter
// ============================================

const YOUTUBE_RECOMMENDATIONS_CSS = `
  /* Hide homepage recommendations (main content) */
  ytd-browse[page-subtype="home"] #contents.ytd-rich-grid-renderer {
    display: none !important;
  }
  
  /* Hide homepage feed */
  ytd-browse[page-subtype="home"] ytd-rich-grid-renderer {
    display: none !important;
  }
  
  /* Show a message instead */
  ytd-browse[page-subtype="home"]::before {
    content: "Recommendations hidden by Focus Flow";
    display: block;
    text-align: center;
    padding: 100px 20px;
    font-size: 18px;
    color: #888;
  }
  
  /* Hide sidebar recommendations on watch page */
  #related.ytd-watch-flexy {
    display: none !important;
  }
  
  /* Hide end screen recommendations */
  .ytp-endscreen-content {
    display: none !important;
  }
  
  /* Hide autoplay on/off toggle area - the whole section */
  .ytp-autonav-endscreen-upnext-container {
    display: none !important;
  }
  
  /* Hide "Up next" section */
  ytd-compact-autoplay-renderer {
    display: none !important;
  }
  
  /* Hide chips/filters bar on homepage */
  ytd-browse[page-subtype="home"] ytd-feed-filter-chip-bar-renderer {
    display: none !important;
  }
  
  /* Make watch page full width without sidebar */
  #primary.ytd-watch-flexy {
    max-width: 100% !important;
  }
  
  ytd-watch-flexy:not([theater]):not([fullscreen]) #primary.ytd-watch-flexy {
    max-width: 1280px !important;
    margin: 0 auto !important;
  }
`;

const youtubeRecommendationsFilter: ContentFilter = {
  platform: 'YouTube',
  filterName: 'Recommendations',
  filterKey: 'youtubeRecommendations',
  
  matches: (url: string) => url.includes('youtube.com'),
  
  init: () => {
    injectCSS('focus-flow-youtube-recommendations', YOUTUBE_RECOMMENDATIONS_CSS);
  },
  
  cleanup: () => {
    removeCSS('focus-flow-youtube-recommendations');
  },
};

// ============================================
// YouTube Comments Filter
// ============================================

const YOUTUBE_COMMENTS_CSS = `
  /* Hide comments section on watch page */
  #comments.ytd-watch-flexy {
    display: none !important;
  }
  
  ytd-comments#comments {
    display: none !important;
  }
  
  /* Hide comments on Shorts */
  ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-comments-section"] {
    display: none !important;
  }
  
  /* Hide comment count in engagement bar */
  ytd-menu-renderer yt-formatted-string[id="text"]:has-text("comment") {
    display: none !important;
  }
`;

const youtubeCommentsFilter: ContentFilter = {
  platform: 'YouTube',
  filterName: 'Comments',
  filterKey: 'youtubeComments',
  
  matches: (url: string) => url.includes('youtube.com'),
  
  init: () => {
    injectCSS('focus-flow-youtube-comments', YOUTUBE_COMMENTS_CSS);
  },
  
  cleanup: () => {
    removeCSS('focus-flow-youtube-comments');
  },
};

// ============================================
// Register all YouTube filters
// ============================================

export const youtubeFilters = [
  youtubeShortsFilter,
  youtubeRecommendationsFilter,
  youtubeCommentsFilter,
];

// Register filters
youtubeFilters.forEach(registerFilter);

