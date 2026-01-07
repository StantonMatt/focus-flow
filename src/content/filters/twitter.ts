// Twitter/X Content Filters
// - For You tab hiding (force Following)
// - Explore/Trending hiding

import { registerFilter, injectCSS, removeCSS, createDOMObserver, type ContentFilter } from './index';

// ============================================
// Twitter For You Filter (Force Following)
// ============================================

const TWITTER_FORYOU_CSS = `
  /* Hide "For you" tab content when selected */
  div[data-testid="primaryColumn"] nav[aria-label="Home timeline"] a[href="/home"][aria-selected="true"]:has(span:not(:contains("Following"))) ~ div {
    display: none !important;
  }
  
  /* Make "For you" tab less prominent */
  nav[role="tablist"] a[href="/home"]:first-child {
    opacity: 0.3 !important;
  }
  
  /* Auto-hide the For You timeline content */
  div[data-testid="primaryColumn"] section[aria-labelledby="accessible-list-0"] {
    /* This targets timeline sections - we use JS to hide For You */
  }
  
  /* Hide "Show more" recommendations */
  div[data-testid="primaryColumn"] aside[aria-label="Who to follow"] {
    display: none !important;
  }
  
  /* Hide promoted tweets */
  div[data-testid="placementTracking"] {
    display: none !important;
  }
  
  /* Hide "Posts for you" section in notifications */
  div[aria-label="Timeline: Notifications"] div:has(> span:contains("Posts for you")) {
    display: none !important;
  }
`;

let forYouObserver: MutationObserver | null = null;

function clickFollowingTab(): void {
  // Find the Following tab and click it
  const tabs = document.querySelectorAll('nav[role="tablist"] a[role="tab"]');
  
  for (const tab of tabs) {
    const text = tab.textContent?.toLowerCase() || '';
    if (text.includes('following')) {
      (tab as HTMLElement).click();
      break;
    }
  }
}

const twitterForYouFilter: ContentFilter = {
  platform: 'Twitter/X',
  filterName: 'For You',
  filterKey: 'twitterForYou',
  
  matches: (url: string) => url.includes('twitter.com') || url.includes('x.com'),
  
  init: () => {
    injectCSS('focus-flow-twitter-foryou', TWITTER_FORYOU_CSS);
    
    // Try to click Following tab immediately and on navigation
    setTimeout(clickFollowingTab, 500);
    setTimeout(clickFollowingTab, 1500);
    
    // Watch for tab changes
    forYouObserver = createDOMObserver(() => {
      // Check if For You is active and switch to Following
      const activeTab = document.querySelector('nav[role="tablist"] a[role="tab"][aria-selected="true"]');
      if (activeTab) {
        const text = activeTab.textContent?.toLowerCase() || '';
        if (text.includes('for you')) {
          clickFollowingTab();
        }
      }
    });
  },
  
  cleanup: () => {
    removeCSS('focus-flow-twitter-foryou');
    if (forYouObserver) {
      forYouObserver.disconnect();
      forYouObserver = null;
    }
  },
};

// ============================================
// Twitter Explore/Trending Filter
// ============================================

const TWITTER_EXPLORE_CSS = `
  /* Hide Explore link in sidebar */
  nav[aria-label="Primary"] a[href="/explore"] {
    display: none !important;
  }
  
  /* Hide Search/Explore in mobile nav */
  a[aria-label="Search and explore"] {
    display: none !important;
  }
  
  /* Hide Trending section in right sidebar */
  aside[aria-label="What's happening"] {
    display: none !important;
  }
  
  /* Hide "Trends for you" section */
  section[aria-labelledby*="accessible-list"]:has(h2:contains("Trends")) {
    display: none !important;
  }
  
  /* Hide trending topics in search */
  div[data-testid="sidebarColumn"] section:has(h2:contains("Trends")) {
    display: none !important;
  }
  
  /* Hide "What's happening" section */
  div[data-testid="sidebarColumn"] section[aria-label="What's happening"] {
    display: none !important;
  }
  
  /* Hide trending in the right rail */
  div[data-testid="trend"] {
    display: none !important;
  }
`;

const twitterExploreFilter: ContentFilter = {
  platform: 'Twitter/X',
  filterName: 'Explore & Trending',
  filterKey: 'twitterExplore',
  
  matches: (url: string) => url.includes('twitter.com') || url.includes('x.com'),
  
  init: () => {
    injectCSS('focus-flow-twitter-explore', TWITTER_EXPLORE_CSS);
    
    // Redirect if on Explore page
    if (window.location.pathname.startsWith('/explore')) {
      window.location.replace('https://' + window.location.hostname + '/home');
    }
  },
  
  cleanup: () => {
    removeCSS('focus-flow-twitter-explore');
  },
};

// ============================================
// Register all Twitter filters
// ============================================

export const twitterFilters = [
  twitterForYouFilter,
  twitterExploreFilter,
];

twitterFilters.forEach(registerFilter);

