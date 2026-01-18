import type { Settings, FrictionSettings, PomodoroSettings, BlockedSite, Schedule, SiteCategory, ContentFilters } from './types';

// Default friction settings
export const DEFAULT_FRICTION: FrictionSettings = {
  delaySeconds: 10,
  requirePhrase: true,
  phrase: 'I want to procrastinate',
  bypassDurationMinutes: 15,
  bypassLimited: false, // By default, bypass lasts until tab closes
};

// Default Pomodoro settings
export const DEFAULT_POMODORO: PomodoroSettings = {
  workDurationMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: true,  // Auto-start breaks by default
  autoStartWork: true,    // Auto-start work by default
  blockDuringWork: true,
  notificationsEnabled: true,
  overlayMode: 'never',   // Don't show floating widget by default
};

// Helper to create a site entry
const createSite = (
  id: string, 
  pattern: string, 
  mode: 'block' | 'friction' | 'time-limit' = 'friction', 
  dailyLimitMinutes?: number,
  hidden?: boolean
): BlockedSite => ({
  id,
  pattern,
  mode,
  enabled: true,
  dailyLimitMinutes,
  hidden,
});

// Helper for hidden adult content sites
const createHiddenSite = (id: string, pattern: string): BlockedSite => 
  createSite(id, pattern, 'block', undefined, true);

// Default site categories with preset sites
export const DEFAULT_CATEGORIES: SiteCategory[] = [
  {
    id: 'social-media',
    name: 'Social Media',
    nameKey: 'categories.socialMedia',
    icon: '📱',
    enabled: true, // Enabled by default
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
      createSite('pinterest', 'pinterest.com', 'friction'),
      createSite('tumblr', 'tumblr.com', 'friction'),
      createSite('discord', 'discord.com', 'friction'),
      createSite('mastodon', 'mastodon.social', 'friction'),
      createSite('bluesky', 'bsky.app', 'friction'),
      createSite('whatsapp', 'web.whatsapp.com', 'friction'),
      createSite('telegram', 'web.telegram.org', 'friction'),
      createSite('bereal', 'bereal.com', 'friction'),
      createSite('wechat', 'wechat.com', 'friction'),
      createSite('vk', 'vk.com', 'friction'),
    ],
  },
  {
    id: 'video-streaming',
    name: 'Video Streaming',
    nameKey: 'categories.videoStreaming',
    icon: '📺',
    enabled: true, // Enabled by default
    isCustom: false,
    sites: [
      createSite('youtube', 'youtube.com', 'friction'),
      createSite('netflix', 'netflix.com', 'friction'),
      createSite('twitch', 'twitch.tv', 'friction'),
      createSite('hulu', 'hulu.com', 'friction'),
      createSite('disneyplus', 'disneyplus.com', 'friction'),
      createSite('primevideo', 'primevideo.com', 'friction'),
      createSite('hbomax', 'max.com', 'friction'),
      createSite('crunchyroll', 'crunchyroll.com', 'friction'),
      createSite('peacock', 'peacocktv.com', 'friction'),
      createSite('paramountplus', 'paramountplus.com', 'friction'),
      createSite('appletv', 'tv.apple.com', 'friction'),
      createSite('vimeo', 'vimeo.com', 'friction'),
      createSite('dailymotion', 'dailymotion.com', 'friction'),
      createSite('plutotv', 'pluto.tv', 'friction'),
      createSite('tubi', 'tubitv.com', 'friction'),
      createSite('roku', 'therokuchannel.roku.com', 'friction'),
    ],
  },
  {
    id: 'gaming',
    name: 'Gaming',
    nameKey: 'categories.gaming',
    icon: '🎮',
    enabled: true, // Enabled by default
    isCustom: false,
    sites: [
      createSite('steam', 'store.steampowered.com', 'friction'),
      createSite('epicgames', 'epicgames.com', 'friction'),
      createSite('roblox', 'roblox.com', 'block'),
      createSite('itch', 'itch.io', 'friction'),
      createSite('gog', 'gog.com', 'friction'),
      createSite('xbox', 'xbox.com', 'friction'),
      createSite('playstation', 'playstation.com', 'friction'),
      createSite('nintendo', 'nintendo.com', 'friction'),
      createSite('ea', 'ea.com', 'friction'),
      createSite('ubisoft', 'ubisoft.com', 'friction'),
      createSite('blizzard', 'blizzard.com', 'friction'),
      createSite('riotgames', 'riotgames.com', 'friction'),
      createSite('chess', 'chess.com', 'time-limit', 30),
      createSite('lichess', 'lichess.org', 'time-limit', 30),
      createSite('poki', 'poki.com', 'block'),
      createSite('crazygames', 'crazygames.com', 'block'),
      createSite('miniclip', 'miniclip.com', 'block'),
      createSite('newgrounds', 'newgrounds.com', 'friction'),
      createSite('kongregate', 'kongregate.com', 'friction'),
    ],
  },
  {
    id: 'adult-content',
    name: 'Adult Content',
    nameKey: 'categories.adultContent',
    icon: '🔞',
    enabled: true, // Enabled by default
    isCustom: false,
    sites: [
      // All default adult content sites are hidden for privacy
      // Users can add their own sites which will be visible
      createHiddenSite('ph', 'pornhub.com'),
      createHiddenSite('xv', 'xvideos.com'),
      createHiddenSite('xnxx', 'xnxx.com'),
      createHiddenSite('xh', 'xhamster.com'),
      createHiddenSite('of', 'onlyfans.com'),
      createHiddenSite('redtube', 'redtube.com'),
      createHiddenSite('youporn', 'youporn.com'),
      createHiddenSite('tube8', 'tube8.com'),
      createHiddenSite('spankbang', 'spankbang.com'),
      createHiddenSite('eporner', 'eporner.com'),
      createHiddenSite('tnaflix', 'tnaflix.com'),
      createHiddenSite('pornone', 'pornone.com'),
      createHiddenSite('thumbzilla', 'thumbzilla.com'),
      createHiddenSite('xtube', 'xtube.com'),
      createHiddenSite('beeg', 'beeg.com'),
      createHiddenSite('porntrex', 'porntrex.com'),
      createHiddenSite('hqporner', 'hqporner.com'),
      createHiddenSite('daftsex', 'daftsex.com'),
      createHiddenSite('drtuber', 'drtuber.com'),
      createHiddenSite('txxx', 'txxx.com'),
      createHiddenSite('porn300', 'porn300.com'),
      createHiddenSite('porngo', 'porngo.com'),
      createHiddenSite('4tube', '4tube.com'),
      createHiddenSite('porndig', 'porndig.com'),
      createHiddenSite('vporn', 'vporn.com'),
      createHiddenSite('fuq', 'fuq.com'),
      createHiddenSite('sunporno', 'sunporno.com'),
      createHiddenSite('tubegalore', 'tubegalore.com'),
      createHiddenSite('anyporn', 'anyporn.com'),
      createHiddenSite('gotporn', 'gotporn.com'),
      // Image/forum sites
      createHiddenSite('reddit-nsfw', 'reddit.com/r/nsfw'),
      createHiddenSite('reddit-gonewild', 'reddit.com/r/gonewild'),
      createHiddenSite('imgur-nsfw', 'imgur.com/r/nsfw'),
      // Cam sites
      createHiddenSite('chaturbate', 'chaturbate.com'),
      createHiddenSite('stripchat', 'stripchat.com'),
      createHiddenSite('bongacams', 'bongacams.com'),
      createHiddenSite('cam4', 'cam4.com'),
      createHiddenSite('camsoda', 'camsoda.com'),
      createHiddenSite('myfreecams', 'myfreecams.com'),
      createHiddenSite('livejasmin', 'livejasmin.com'),
      createHiddenSite('flirt4free', 'flirt4free.com'),
      createHiddenSite('streamate', 'streamate.com'),
      // Hentai/animated
      createHiddenSite('hentaihaven', 'hentaihaven.xxx'),
      createHiddenSite('hanime', 'hanime.tv'),
      createHiddenSite('nhentai', 'nhentai.net'),
      createHiddenSite('rule34', 'rule34.xxx'),
      createHiddenSite('e621', 'e621.net'),
      createHiddenSite('gelbooru', 'gelbooru.com'),
      createHiddenSite('danbooru', 'danbooru.donmai.us'),
      // Erotic stories/literature
      createHiddenSite('literotica', 'literotica.com'),
      createHiddenSite('sexstories', 'sexstories.com'),
      // Dating/hookup apps
      createHiddenSite('tinder', 'tinder.com'),
      createHiddenSite('grindr', 'grindr.com'),
      createHiddenSite('ashleymadison', 'ashleymadison.com'),
      createHiddenSite('adultfriendfinder', 'adultfriendfinder.com'),
      createHiddenSite('fling', 'fling.com'),
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
      createSite('reuters', 'reuters.com', 'friction'),
      createSite('apnews', 'apnews.com', 'friction'),
      createSite('msnbc', 'msnbc.com', 'friction'),
      createSite('nbcnews', 'nbcnews.com', 'friction'),
      createSite('abcnews', 'abcnews.go.com', 'friction'),
      createSite('cbsnews', 'cbsnews.com', 'friction'),
      createSite('bloomberg', 'bloomberg.com', 'friction'),
      createSite('wsj', 'wsj.com', 'friction'),
      createSite('usatoday', 'usatoday.com', 'friction'),
      createSite('npr', 'npr.org', 'friction'),
      createSite('dailymail', 'dailymail.co.uk', 'friction'),
      createSite('huffpost', 'huffpost.com', 'friction'),
      createSite('vice', 'vice.com', 'friction'),
      createSite('buzzfeed', 'buzzfeed.com', 'friction'),
    ],
  },
  {
    id: 'search-engines',
    name: 'Search Engines',
    nameKey: 'categories.searchEngines',
    icon: '🔍',
    enabled: false,
    isCustom: false,
    sites: [
      createSite('google', 'google.com', 'friction'),
      createSite('bing', 'bing.com', 'friction'),
      createSite('duckduckgo', 'duckduckgo.com', 'friction'),
      createSite('yahoo', 'yahoo.com', 'friction'),
      createSite('baidu', 'baidu.com', 'friction'),
      createSite('yandex', 'yandex.com', 'friction'),
      createSite('ecosia', 'ecosia.org', 'friction'),
      createSite('startpage', 'startpage.com', 'friction'),
      createSite('brave-search', 'search.brave.com', 'friction'),
    ],
  },
  {
    id: 'ai',
    name: 'AI',
    nameKey: 'categories.ai',
    icon: '🤖',
    enabled: false,
    isCustom: false,
    sites: [
      createSite('openai', 'openai.com', 'friction'),
      createSite('chatgpt', 'chatgpt.com', 'friction'),
      createSite('claude', 'claude.ai', 'friction'),
      createSite('anthropic', 'anthropic.com', 'friction'),
      createSite('gemini', 'gemini.google.com', 'friction'),
      createSite('perplexity', 'perplexity.ai', 'friction'),
      createSite('copilot', 'copilot.microsoft.com', 'friction'),
      createSite('poe', 'poe.com', 'friction'),
      createSite('t3chat', 't3.chat', 'friction'),
      createSite('character-ai', 'character.ai', 'friction'),
      createSite('midjourney', 'midjourney.com', 'friction'),
      createSite('huggingface', 'huggingface.co', 'friction'),
      createSite('replicate', 'replicate.com', 'friction'),
      createSite('stability-ai', 'stability.ai', 'friction'),
      createSite('you', 'you.com', 'friction'),
      createSite('deepl', 'deepl.com', 'friction'),
      createSite('runway', 'runwayml.com', 'friction'),
      createSite('leonardo', 'leonardo.ai', 'friction'),
      createSite('writesonic', 'writesonic.com', 'friction'),
      createSite('jasper', 'jasper.ai', 'friction'),
      createSite('copy-ai', 'copy.ai', 'friction'),
      createSite('grok', 'x.com/i/grok', 'friction'),
    ],
  },
];

// Default schedules - preset schedules users can enable
export const DEFAULT_SCHEDULES: Schedule[] = [
  {
    id: 'work-hours',
    name: 'Work Hours',
    nameKey: 'schedules.defaults.workHours',
    days: [1, 2, 3, 4, 5], // Monday-Friday
    startTime: '09:00',
    endTime: '17:00',
    enabled: false,
    isDefault: true,
  },
  {
    id: 'full-day-focus',
    name: 'Full Day Focus',
    nameKey: 'schedules.defaults.fullDayFocus',
    days: [0, 1, 2, 3, 4, 5, 6], // Every day
    startTime: '08:00',
    endTime: '22:00',
    enabled: false,
    isDefault: true,
  },
  {
    id: 'study-time',
    name: 'Study Time',
    nameKey: 'schedules.defaults.studyTime',
    days: [1, 2, 3, 4, 5, 6], // Monday-Saturday
    startTime: '09:00',
    endTime: '21:00',
    enabled: false,
    isDefault: true,
  },
  {
    id: 'evening-wind-down',
    name: 'Evening Wind Down',
    nameKey: 'schedules.defaults.eveningWindDown',
    days: [0, 1, 2, 3, 4, 5, 6], // Every day
    startTime: '20:00',
    endTime: '23:00',
    enabled: false,
    isDefault: true,
  },
];

// Default content filters (all disabled except YouTube Shorts which was previously enabled by default)
export const DEFAULT_CONTENT_FILTERS: ContentFilters = {
  // YouTube
  youtubeShorts: false,  // All filters off by default
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

// Idle timeout in milliseconds (5 minutes) - stop counting time after this duration of inactivity
export const IDLE_TIMEOUT = 5 * 60 * 1000;

// Alarm names
export const ALARMS = {
  POMODORO_TICK: 'pomodoro-tick',
  CLEANUP_BYPASSES: 'cleanup-bypasses',
  DAILY_RESET: 'daily-reset',
} as const;

