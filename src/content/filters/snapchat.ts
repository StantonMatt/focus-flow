// Snapchat Content Filters
// - Stories/Spotlight hiding (web version)

import { registerFilter, injectCSS, removeCSS, type ContentFilter } from './index';

// ============================================
// Snapchat Stories/Spotlight Filter
// ============================================

const SNAPCHAT_STORIES_CSS = `
  /* Hide Spotlight tab/section */
  a[href*="/spotlight"] {
    display: none !important;
  }
  
  /* Hide Discover section */
  a[href*="/discover"] {
    display: none !important;
  }
  
  /* Hide Stories carousel */
  div[class*="stories"] {
    display: none !important;
  }
  
  /* Hide Spotlight content */
  div[class*="spotlight"] {
    display: none !important;
  }
  
  /* Hide publisher stories */
  div[class*="publisher"] {
    display: none !important;
  }
  
  /* Hide For You section */
  section:has(h2:contains("For You")) {
    display: none !important;
  }
  
  /* Hide trending content */
  section:has(h2:contains("Trending")) {
    display: none !important;
  }
`;

const snapchatStoriesFilter: ContentFilter = {
  platform: 'Snapchat',
  filterName: 'Stories & Spotlight',
  filterKey: 'snapchatStories',
  
  matches: (url: string) => url.includes('snapchat.com'),
  
  init: () => {
    injectCSS('focus-flow-snapchat-stories', SNAPCHAT_STORIES_CSS);
    
    // Redirect if on Spotlight or Discover
    const path = window.location.pathname;
    if (path.startsWith('/spotlight') || path.startsWith('/discover')) {
      window.location.replace('https://www.snapchat.com/');
    }
  },
  
  cleanup: () => {
    removeCSS('focus-flow-snapchat-stories');
  },
};

// ============================================
// Register all Snapchat filters
// ============================================

export const snapchatFilters = [
  snapchatStoriesFilter,
];

snapchatFilters.forEach(registerFilter);

