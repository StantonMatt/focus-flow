import type { Settings, FrictionSettings, PomodoroSettings, BlockedSite, Schedule, SiteCategory, ContentFilters } from './types';

// Default friction settings
export const DEFAULT_FRICTION: FrictionSettings = {
  delaySeconds: 10,
  requirePhrase: true,
  phrase: 'I want to procrastinate',
  bypassDurationMinutes: 15,
};

// Default Pomodoro settings
export const DEFAULT_POMODORO: PomodoroSettings = {
  workDurationMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartWork: false,
  blockDuringWork: true,
  notificationsEnabled: true,
};

// Helper to create a site entry
const createSite = (id: string, pattern: string, mode: 'block' | 'friction' | 'time-limit' = 'friction', dailyLimitMinutes?: number): BlockedSite => ({
  id,
  pattern,
  mode,
  enabled: true,
  dailyLimitMinutes,
});

// Default site categories with preset sites
export const DEFAULT_CATEGORIES: SiteCategory[] = [
  {
    id: 'social-media',
    name: 'Social Media',
    nameKey: 'categories.socialMedia',
    icon: '📱',
    enabled: false, // Users opt-in
    isCustom: false,
    sites: [
      createSite('facebook', 'facebook.com', 'friction'),
      createSite('twitter', 'twitter.com', 'friction'),
      createSite('x', 'x.com', 'friction'),
      createSite('instagram', 'instagram.com', 'friction'),
      createSite('tiktok', 'tiktok.com', 'block'),
      createSite('snapchat', 'snapchat.com', 'friction'),
      createSite('linkedin', 'linkedin.com', 'friction'),
      createSite('reddit', 'reddit.com', 'time-limit', 30),
      createSite('threads', 'threads.net', 'friction'),
    ],
  },
  {
    id: 'video-streaming',
    name: 'Video Streaming',
    nameKey: 'categories.videoStreaming',
    icon: '📺',
    enabled: false,
    isCustom: false,
    sites: [
      createSite('youtube', 'youtube.com', 'time-limit', 60),
      createSite('netflix', 'netflix.com', 'friction'),
      createSite('twitch', 'twitch.tv', 'friction'),
      createSite('hulu', 'hulu.com', 'friction'),
      createSite('disneyplus', 'disneyplus.com', 'friction'),
      createSite('primevideo', 'primevideo.com', 'friction'),
      createSite('hbomax', 'max.com', 'friction'),
    ],
  },
  {
    id: 'news-media',
    name: 'News & Media',
    nameKey: 'categories.newsMedia',
    icon: '📰',
    enabled: false,
    isCustom: false,
    sites: [
      createSite('cnn', 'cnn.com', 'friction'),
      createSite('foxnews', 'foxnews.com', 'friction'),
      createSite('bbc', 'bbc.com', 'friction'),
      createSite('nytimes', 'nytimes.com', 'friction'),
      createSite('washingtonpost', 'washingtonpost.com', 'friction'),
      createSite('theguardian', 'theguardian.com', 'friction'),
    ],
  },
  {
    id: 'gaming',
    name: 'Gaming',
    nameKey: 'categories.gaming',
    icon: '🎮',
    enabled: false,
    isCustom: false,
    sites: [
      createSite('steam', 'store.steampowered.com', 'friction'),
      createSite('epicgames', 'epicgames.com', 'friction'),
      createSite('roblox', 'roblox.com', 'block'),
      createSite('itch', 'itch.io', 'friction'),
      createSite('gog', 'gog.com', 'friction'),
    ],
  },
  {
    id: 'adult-content',
    name: 'Adult Content',
    nameKey: 'categories.adultContent',
    icon: '🔞',
    enabled: false,
    isCustom: false,
    sites: [
      // Major sites
      createSite('ph', 'pornhub.com', 'block'),
      createSite('xv', 'xvideos.com', 'block'),
      createSite('xnxx', 'xnxx.com', 'block'),
      createSite('xh', 'xhamster.com', 'block'),
      createSite('of', 'onlyfans.com', 'block'),
      createSite('redtube', 'redtube.com', 'block'),
      createSite('youporn', 'youporn.com', 'block'),
      createSite('tube8', 'tube8.com', 'block'),
      createSite('spankbang', 'spankbang.com', 'block'),
      createSite('eporner', 'eporner.com', 'block'),
      createSite('tnaflix', 'tnaflix.com', 'block'),
      createSite('pornone', 'pornone.com', 'block'),
      createSite('thumbzilla', 'thumbzilla.com', 'block'),
      createSite('xtube', 'xtube.com', 'block'),
      createSite('beeg', 'beeg.com', 'block'),
      createSite('porntrex', 'porntrex.com', 'block'),
      createSite('hqporner', 'hqporner.com', 'block'),
      createSite('daftsex', 'daftsex.com', 'block'),
      createSite('drtuber', 'drtuber.com', 'block'),
      createSite('txxx', 'txxx.com', 'block'),
      createSite('porn300', 'porn300.com', 'block'),
      createSite('porngo', 'porngo.com', 'block'),
      createSite('4tube', '4tube.com', 'block'),
      createSite('porndig', 'porndig.com', 'block'),
      createSite('vporn', 'vporn.com', 'block'),
      createSite('fuq', 'fuq.com', 'block'),
      createSite('sunporno', 'sunporno.com', 'block'),
      createSite('tubegalore', 'tubegalore.com', 'block'),
      createSite('anyporn', 'anyporn.com', 'block'),
      createSite('gotporn', 'gotporn.com', 'block'),
      // Image/forum sites
      createSite('reddit-nsfw', 'reddit.com/r/nsfw', 'block'),
      createSite('reddit-gonewild', 'reddit.com/r/gonewild', 'block'),
      createSite('imgur-nsfw', 'imgur.com/r/nsfw', 'block'),
      // Cam sites
      createSite('chaturbate', 'chaturbate.com', 'block'),
      createSite('stripchat', 'stripchat.com', 'block'),
      createSite('bongacams', 'bongacams.com', 'block'),
      createSite('cam4', 'cam4.com', 'block'),
      createSite('camsoda', 'camsoda.com', 'block'),
      createSite('myfreecams', 'myfreecams.com', 'block'),
      createSite('livejasmin', 'livejasmin.com', 'block'),
      createSite('flirt4free', 'flirt4free.com', 'block'),
      createSite('streamate', 'streamate.com', 'block'),
      // Hentai/animated
      createSite('hentaihaven', 'hentaihaven.xxx', 'block'),
      createSite('hanime', 'hanime.tv', 'block'),
      createSite('nhentai', 'nhentai.net', 'block'),
      createSite('rule34', 'rule34.xxx', 'block'),
      createSite('e621', 'e621.net', 'block'),
      createSite('gelbooru', 'gelbooru.com', 'block'),
      createSite('danbooru', 'danbooru.donmai.us', 'block'),
      // Erotic stories/literature
      createSite('literotica', 'literotica.com', 'block'),
      createSite('sexstories', 'sexstories.com', 'block'),
      // Dating/hookup apps
      createSite('tinder', 'tinder.com', 'block'),
      createSite('grindr', 'grindr.com', 'block'),
      createSite('ashleymadison', 'ashleymadison.com', 'block'),
      createSite('adultfriendfinder', 'adultfriendfinder.com', 'block'),
      createSite('fling', 'fling.com', 'block'),
    ],
  },
];

// Default schedules (empty - user creates their own with localized names)
export const DEFAULT_SCHEDULES: Schedule[] = [];

// Default content filters (all disabled except YouTube Shorts which was previously enabled by default)
export const DEFAULT_CONTENT_FILTERS: ContentFilters = {
  // YouTube
  youtubeShorts: true,  // Enabled by default (was blockYouTubeShorts)
  youtubeRecommendations: false,
  youtubeComments: false,
  // Instagram
  instagramReels: false,
  instagramStories: false,
  // Facebook
  facebookReels: false,
  facebookStories: false,
  // Twitter/X
  twitterForYou: false,
  twitterExplore: false,
  // Reddit
  redditPopular: false,
  redditComments: false,
  // Other platforms
  tiktokForYou: false,
  twitchRecommended: false,
  linkedinFeed: false,
  snapchatStories: false,
};

// Default settings
export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  siteCategories: DEFAULT_CATEGORIES,
  contentFilters: DEFAULT_CONTENT_FILTERS,
  schedules: DEFAULT_SCHEDULES,
  friction: DEFAULT_FRICTION,
  pomodoro: DEFAULT_POMODORO,
  language: 'auto',
};

// Storage keys
export const STORAGE_KEYS = {
  SETTINGS: 'settings',
  TIME_STATS: 'timeStats',
  POMODORO_STATE: 'pomodoroState',
  ACTIVE_BYPASSES: 'activeBypasses',
  ONBOARDING_COMPLETE: 'onboardingComplete',
} as const;

// Heartbeat interval in milliseconds (5 seconds)
export const HEARTBEAT_INTERVAL = 5000;

// Alarm names
export const ALARMS = {
  POMODORO_TICK: 'pomodoro-tick',
  CLEANUP_BYPASSES: 'cleanup-bypasses',
  DAILY_RESET: 'daily-reset',
} as const;

