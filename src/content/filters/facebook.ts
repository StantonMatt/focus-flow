// Facebook Content Filters
// - Reels/Watch blocking
// - Stories hiding

import { registerFilter, injectCSS, removeCSS, type ContentFilter } from './index';

// ============================================
// Facebook Reels/Watch Filter
// ============================================

const FACEBOOK_REELS_CSS = `
  /* Hide Watch tab in navigation */
  a[href="/watch/"],
  a[href="/watch"] {
    display: none !important;
  }
  
  /* Hide Reels tab */
  a[href="/reel/"],
  a[href*="/reels/"] {
    display: none !important;
  }
  
  /* Hide Watch icon in navigation bar */
  div[role="navigation"] a[aria-label="Watch"] {
    display: none !important;
  }
  
  /* Hide Video/Reels in left sidebar */
  div[role="navigation"] a[href*="/watch"] {
    display: none !important;
  }
  
  /* Hide Reels in feed */
  div[data-pagelet="FeedUnit"]:has(a[href*="/reel/"]) {
    display: none !important;
  }
  
  /* Hide Watch videos in feed */
  div[data-pagelet="FeedUnit"]:has(a[href*="/watch/"]) {
    display: none !important;
  }
  
  /* Hide Reels section */
  div[aria-label="Reels"] {
    display: none !important;
  }
  
  /* Hide "Reels and short videos" section */
  div[role="main"] div:has(> span:contains("Reels")) {
    display: none !important;
  }
  
  /* Hide video suggestions */
  div[data-pagelet="RightRail"] div:has(a[href*="/watch/"]) {
    display: none !important;
  }
`;

const facebookReelsFilter: ContentFilter = {
  platform: 'Facebook',
  filterName: 'Reels & Watch',
  filterKey: 'facebookReels',
  
  matches: (url: string) => url.includes('facebook.com'),
  
  init: () => {
    injectCSS('focus-flow-facebook-reels', FACEBOOK_REELS_CSS);
    
    // Redirect if on Watch or Reels page
    if (window.location.pathname.startsWith('/watch') || 
        window.location.pathname.startsWith('/reel')) {
      window.location.replace('https://www.facebook.com/');
    }
  },
  
  cleanup: () => {
    removeCSS('focus-flow-facebook-reels');
  },
};

// ============================================
// Facebook Stories Filter
// ============================================

const FACEBOOK_STORIES_CSS = `
  /* Hide Stories section at top of feed */
  div[aria-label="Stories"] {
    display: none !important;
  }
  
  /* Hide Stories carousel */
  div[data-pagelet="Stories"] {
    display: none !important;
  }
  
  /* Hide Stories in left sidebar */
  a[href="/stories/"] {
    display: none !important;
  }
  
  /* Hide "Create Story" card */
  div[aria-label="Create a story"] {
    display: none !important;
  }
  
  /* Hide Stories section container */
  div[role="main"] > div > div:has(div[aria-label="Stories"]) {
    display: none !important;
  }
`;

const facebookStoriesFilter: ContentFilter = {
  platform: 'Facebook',
  filterName: 'Stories',
  filterKey: 'facebookStories',
  
  matches: (url: string) => url.includes('facebook.com'),
  
  init: () => {
    injectCSS('focus-flow-facebook-stories', FACEBOOK_STORIES_CSS);
    
    // Redirect if viewing stories
    if (window.location.pathname.startsWith('/stories/')) {
      window.location.replace('https://www.facebook.com/');
    }
  },
  
  cleanup: () => {
    removeCSS('focus-flow-facebook-stories');
  },
};

// ============================================
// Register all Facebook filters
// ============================================

export const facebookFilters = [
  facebookReelsFilter,
  facebookStoriesFilter,
];

facebookFilters.forEach(registerFilter);

