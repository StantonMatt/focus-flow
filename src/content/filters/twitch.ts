// Twitch Content Filters
// - Recommended streams/channels hiding

import { registerFilter, injectCSS, removeCSS, type ContentFilter } from './index';

// ============================================
// Twitch Recommended Filter
// ============================================

const TWITCH_RECOMMENDED_CSS = `
  /* Hide recommended channels in left sidebar */
  div[data-a-target="recommended-channels"] {
    display: none !important;
  }
  
  /* Hide "Recommended Channels" section header */
  p:has(+ div[data-a-target="recommended-channels"]) {
    display: none !important;
  }
  
  /* Hide featured/promoted content on homepage */
  div[data-a-target="carousel"] {
    display: none !important;
  }
  
  /* Hide "Live channels we think you'll like" */
  div[data-a-target="live-channel-recommendations"] {
    display: none !important;
  }
  
  /* Hide category recommendations */
  div[data-a-target="game-recommendations"] {
    display: none !important;
  }
  
  /* Hide "Recommended" section on browse page */
  section[aria-label="Recommended"] {
    display: none !important;
  }
  
  /* Hide clips recommendations */
  section[aria-label="Recommended Clips"] {
    display: none !important;
  }
  
  /* Hide front page content sections (keeps followed only) */
  .front-page-carousel {
    display: none !important;
  }
  
  /* Hide "Because you watched" sections */
  section:has(h2:contains("Because you watched")) {
    display: none !important;
  }
  
  /* Hide "Categories we think you'll like" */
  section:has(h2:contains("Categories we think")) {
    display: none !important;
  }
  
  /* Hide autoplay next stream recommendations */
  div[data-a-target="player-overlay-autoplay"] {
    display: none !important;
  }
  
  /* Hide chat recommendations/suggestions */
  div[data-a-target="chat-recommendations"] {
    display: none !important;
  }
`;

const twitchRecommendedFilter: ContentFilter = {
  platform: 'Twitch',
  filterName: 'Recommended',
  filterKey: 'twitchRecommended',
  
  matches: (url: string) => url.includes('twitch.tv'),
  
  init: () => {
    injectCSS('focus-flow-twitch-recommended', TWITCH_RECOMMENDED_CSS);
  },
  
  cleanup: () => {
    removeCSS('focus-flow-twitch-recommended');
  },
};

// ============================================
// Register all Twitch filters
// ============================================

export const twitchFilters = [
  twitchRecommendedFilter,
];

twitchFilters.forEach(registerFilter);

