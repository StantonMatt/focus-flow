// Instagram Content Filters
// - Reels blocking
// - Stories hiding

import { registerFilter, injectCSS, removeCSS, createDOMObserver, type ContentFilter } from './index';

// ============================================
// Instagram Reels Filter
// ============================================

const INSTAGRAM_REELS_CSS = `
  /* Hide Reels tab in bottom navigation */
  a[href="/reels/"] {
    display: none !important;
  }
  
  /* Hide Reels tab in side navigation */
  a[href="/reels/"]:has(svg) {
    display: none !important;
  }
  
  /* Hide Reels in explore page */
  article[role="presentation"]:has(a[href*="/reel/"]) {
    display: none !important;
  }
  
  /* Hide Reels icon/link in navigation */
  nav a[href="/reels/"] {
    display: none !important;
  }
  
  /* Hide Reels in feed - video posts with Reels styling */
  article:has(a[href*="/reel/"]) {
    display: none !important;
  }
  
  /* Hide suggested Reels section */
  div[role="presentation"]:has(a[href*="/reel/"]) {
    display: none !important;
  }
  
  /* Hide Reels in the grid profile view */
  a[href*="/reel/"] {
    display: none !important;
  }
`;

let reelsObserver: MutationObserver | null = null;

const instagramReelsFilter: ContentFilter = {
  platform: 'Instagram',
  filterName: 'Reels',
  filterKey: 'instagramReels',
  
  matches: (url: string) => url.includes('instagram.com'),
  
  init: () => {
    injectCSS('focus-flow-instagram-reels', INSTAGRAM_REELS_CSS);
    
    // Redirect if on Reels page
    if (window.location.pathname.startsWith('/reels')) {
      window.location.replace('https://www.instagram.com/');
      return;
    }
    
    // Watch for dynamically loaded reels
    reelsObserver = createDOMObserver(() => {
      // Could add additional dynamic handling here
    });
  },
  
  cleanup: () => {
    removeCSS('focus-flow-instagram-reels');
    if (reelsObserver) {
      reelsObserver.disconnect();
      reelsObserver = null;
    }
  },
};

// ============================================
// Instagram Stories Filter
// ============================================

const INSTAGRAM_STORIES_CSS = `
  /* Hide Stories bar at top of feed */
  section > div:has(canvas) {
    display: none !important;
  }
  
  /* Hide Stories tray/carousel */
  div[role="menu"]:has(canvas) {
    display: none !important;
  }
  
  /* Alternative Stories container selector */
  div[style*="scroll"]:has([aria-label*="Story"]) {
    display: none !important;
  }
  
  /* Hide Stories in the main section */
  section > main > div > div:first-child:has(canvas):has(img[alt*="profile"]) {
    display: none !important;
  }
  
  /* Hide the stories section container at the top */
  section[class*="x1xmf6yo"] > div:first-child {
    display: none !important;
  }
`;

const instagramStoriesFilter: ContentFilter = {
  platform: 'Instagram',
  filterName: 'Stories',
  filterKey: 'instagramStories',
  
  matches: (url: string) => url.includes('instagram.com'),
  
  init: () => {
    injectCSS('focus-flow-instagram-stories', INSTAGRAM_STORIES_CSS);
    
    // Redirect if viewing a story
    if (window.location.pathname.startsWith('/stories/')) {
      window.location.replace('https://www.instagram.com/');
    }
  },
  
  cleanup: () => {
    removeCSS('focus-flow-instagram-stories');
  },
};

// ============================================
// Register all Instagram filters
// ============================================

export const instagramFilters = [
  instagramReelsFilter,
  instagramStoriesFilter,
];

instagramFilters.forEach(registerFilter);

