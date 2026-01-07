// Reddit Content Filters
// - Popular/All hiding (encourage subreddits only)
// - Comments hiding

import { registerFilter, injectCSS, removeCSS, type ContentFilter } from './index';

// ============================================
// Reddit Popular/All Filter
// ============================================

const REDDIT_POPULAR_CSS = `
  /* Hide Popular tab in navigation */
  a[href="/r/popular/"],
  a[href="/r/popular"] {
    display: none !important;
  }
  
  /* Hide All tab in navigation */
  a[href="/r/all/"],
  a[href="/r/all"] {
    display: none !important;
  }
  
  /* Old Reddit: Hide Popular link */
  .tabmenu a[href*="r/popular"] {
    display: none !important;
  }
  
  /* Old Reddit: Hide All link */
  .tabmenu a[href*="r/all"] {
    display: none !important;
  }
  
  /* Hide Popular in left sidebar */
  faceplate-tracker[source="popular"] {
    display: none !important;
  }
  
  /* Hide All in left sidebar */
  faceplate-tracker[source="all"] {
    display: none !important;
  }
  
  /* Hide Popular/All in the feeds section */
  li:has(a[href="/r/popular/"]),
  li:has(a[href="/r/all/"]) {
    display: none !important;
  }
  
  /* Hide "Popular" section header if it exists */
  h3:contains("Popular") {
    display: none !important;
  }
`;

const redditPopularFilter: ContentFilter = {
  platform: 'Reddit',
  filterName: 'Popular & All',
  filterKey: 'redditPopular',
  
  matches: (url: string) => url.includes('reddit.com'),
  
  init: () => {
    injectCSS('focus-flow-reddit-popular', REDDIT_POPULAR_CSS);
    
    // Redirect if on Popular or All
    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/r/popular') || path.startsWith('/r/all')) {
      window.location.replace('https://www.reddit.com/');
    }
  },
  
  cleanup: () => {
    removeCSS('focus-flow-reddit-popular');
  },
};

// ============================================
// Reddit Comments Filter
// ============================================

const REDDIT_COMMENTS_CSS = `
  /* New Reddit: Hide comments section */
  shreddit-comment-tree {
    display: none !important;
  }
  
  /* Hide comment sort options */
  shreddit-sort-dropdown[slot="comment-sort"] {
    display: none !important;
  }
  
  /* Hide "add a comment" input */
  shreddit-composer {
    display: none !important;
  }
  
  /* Old Reddit: Hide comments */
  .commentarea {
    display: none !important;
  }
  
  /* Hide comments count in post */
  a[data-click-id="comments"]::after {
    content: " (hidden)" !important;
  }
  
  /* Show message instead */
  shreddit-comment-tree::before {
    content: "Comments hidden by Focus Flow";
    display: block;
    text-align: center;
    padding: 40px 20px;
    color: #888;
    font-size: 14px;
  }
  
  /* New Reddit: Alternative comment container */
  div[slot="comments"] {
    display: none !important;
  }
  
  /* Hide load more comments button */
  button[id*="comment-load"] {
    display: none !important;
  }
`;

const redditCommentsFilter: ContentFilter = {
  platform: 'Reddit',
  filterName: 'Comments',
  filterKey: 'redditComments',
  
  matches: (url: string) => url.includes('reddit.com'),
  
  init: () => {
    injectCSS('focus-flow-reddit-comments', REDDIT_COMMENTS_CSS);
  },
  
  cleanup: () => {
    removeCSS('focus-flow-reddit-comments');
  },
};

// ============================================
// Register all Reddit filters
// ============================================

export const redditFilters = [
  redditPopularFilter,
  redditCommentsFilter,
];

redditFilters.forEach(registerFilter);

