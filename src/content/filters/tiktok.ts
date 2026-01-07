// TikTok Content Filters
// - For You feed hiding (encourage Following only)

import { registerFilter, injectCSS, removeCSS, createDOMObserver, type ContentFilter } from './index';

// ============================================
// TikTok For You Filter
// ============================================

const TIKTOK_FORYOU_CSS = `
  /* Hide For You tab - try to make Following the default */
  div[data-e2e="nav-foryou"] {
    opacity: 0.3 !important;
  }
  
  /* Hide For You content when active */
  div[data-e2e="recommend-list-item-container"] {
    /* Will use JS to switch tabs */
  }
  
  /* Hide suggested users/content */
  div[data-e2e="suggest-accounts"] {
    display: none !important;
  }
  
  /* Hide "You may like" recommendations */
  div:has(> span:contains("You may like")) {
    display: none !important;
  }
  
  /* Hide Discover page recommendations */
  div[data-e2e="discover-item"] {
    display: none !important;
  }
`;

let tiktokObserver: MutationObserver | null = null;

function clickFollowingTab(): void {
  // Try to find and click the Following tab
  const followingTab = document.querySelector('div[data-e2e="nav-following"]') ||
                       document.querySelector('a[href*="/following"]');
  
  if (followingTab) {
    (followingTab as HTMLElement).click();
  }
}

const tiktokForYouFilter: ContentFilter = {
  platform: 'TikTok',
  filterName: 'For You',
  filterKey: 'tiktokForYou',
  
  matches: (url: string) => url.includes('tiktok.com'),
  
  init: () => {
    injectCSS('focus-flow-tiktok-foryou', TIKTOK_FORYOU_CSS);
    
    // Redirect to Following if on For You page
    if (window.location.pathname === '/' || window.location.pathname === '/foryou') {
      setTimeout(clickFollowingTab, 500);
      setTimeout(clickFollowingTab, 1500);
    }
    
    // Watch for navigation changes
    tiktokObserver = createDOMObserver(() => {
      // If on For You, try to switch
      if (window.location.pathname === '/' || window.location.pathname === '/foryou') {
        clickFollowingTab();
      }
    });
  },
  
  cleanup: () => {
    removeCSS('focus-flow-tiktok-foryou');
    if (tiktokObserver) {
      tiktokObserver.disconnect();
      tiktokObserver = null;
    }
  },
};

// ============================================
// Register all TikTok filters
// ============================================

export const tiktokFilters = [
  tiktokForYouFilter,
];

tiktokFilters.forEach(registerFilter);

