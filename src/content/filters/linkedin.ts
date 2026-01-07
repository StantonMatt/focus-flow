// LinkedIn Content Filters
// - Feed hiding (focus on messages/network only)

import { registerFilter, injectCSS, removeCSS, type ContentFilter } from './index';

// ============================================
// LinkedIn Feed Filter
// ============================================

const LINKEDIN_FEED_CSS = `
  /* Hide the main feed */
  main.scaffold-layout__main {
    display: none !important;
  }
  
  /* Hide news/trending section on right */
  aside.scaffold-layout__aside {
    display: none !important;
  }
  
  /* Show a focus message instead of feed */
  div.scaffold-layout__content::before {
    content: "Feed hidden by Focus Flow - Focus on direct connections";
    display: block;
    text-align: center;
    padding: 100px 20px;
    font-size: 18px;
    color: #888;
    background: #f3f2ef;
    margin: 20px;
    border-radius: 8px;
  }
  
  /* Hide feed posts */
  div.feed-shared-update-v2 {
    display: none !important;
  }
  
  /* Hide "People you may know" section */
  section.artdeco-card:has(h2:contains("People you may know")) {
    display: none !important;
  }
  
  /* Hide "LinkedIn News" */
  section:has(h2:contains("LinkedIn News")) {
    display: none !important;
  }
  
  /* Hide promoted posts */
  div[data-ad-banner] {
    display: none !important;
  }
  
  /* Hide trending hashtags */
  section:has(h2:contains("Today's news and views")) {
    display: none !important;
  }
  
  /* Hide suggested connections carousel */
  div.pv-profile-sticky-header-v2__actions-wrapper {
    display: none !important;
  }
`;

const linkedinFeedFilter: ContentFilter = {
  platform: 'LinkedIn',
  filterName: 'Feed',
  filterKey: 'linkedinFeed',
  
  matches: (url: string) => url.includes('linkedin.com'),
  
  init: () => {
    // Only apply on feed pages, not on messaging, jobs, etc.
    const path = window.location.pathname;
    if (path === '/' || path === '/feed/' || path === '/feed') {
      injectCSS('focus-flow-linkedin-feed', LINKEDIN_FEED_CSS);
    }
  },
  
  cleanup: () => {
    removeCSS('focus-flow-linkedin-feed');
  },
};

// ============================================
// Register all LinkedIn filters
// ============================================

export const linkedinFilters = [
  linkedinFeedFilter,
];

linkedinFilters.forEach(registerFilter);

