// Domain categorization for statistics
// This maps popular domains to categories for better stats grouping
// These are NOT blocked by default - just used for categorization

export interface StatsCategory {
  id: string;
  nameKey: string; // i18n key
  icon: string;
  domains: string[];
}

export const STATS_CATEGORIES: StatsCategory[] = [
  {
    id: 'social-media',
    nameKey: 'statsCategories.socialMedia',
    icon: '💬',
    domains: [
      // Major platforms
      'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'linkedin.com',
      'tiktok.com', 'snapchat.com', 'pinterest.com', 'tumblr.com', 'reddit.com',
      'threads.net', 'mastodon.social', 'bsky.app', 'bluesky.app',
      // Regional
      'weibo.com', 'weixin.qq.com', 'wechat.com', 'vk.com', 'ok.ru',
      'qzone.qq.com', 'line.me', 'kakaotalk.com',
      // Professional/Niche
      'quora.com', 'meetup.com', 'nextdoor.com', 'clubhouse.com',
      'discord.com', 'discordapp.com', 'slack.com',
      // Dating
      'tinder.com', 'bumble.com', 'hinge.co', 'match.com', 'okcupid.com',
      'plenty​offish.com', 'badoo.com', 'grindr.com',
    ]
  },
  {
    id: 'video-streaming',
    nameKey: 'statsCategories.videoStreaming',
    icon: '📺',
    domains: [
      // Major platforms
      'youtube.com', 'youtu.be', 'netflix.com', 'hulu.com', 'disneyplus.com',
      'disney.com', 'hbomax.com', 'max.com', 'primevideo.com', 'amazon.com/video',
      'peacocktv.com', 'paramountplus.com', 'appletv.com', 'tv.apple.com',
      // Live streaming
      'twitch.tv', 'kick.com', 'dlive.tv', 'trovo.live',
      // Regional
      'bilibili.com', 'iqiyi.com', 'youku.com', 'tudou.com', 'v.qq.com',
      'viki.com', 'crunchyroll.com', 'funimation.com', 'hidive.com',
      // Other
      'dailymotion.com', 'vimeo.com', 'rumble.com', 'bitchute.com',
      'odysee.com', 'pluto.tv', 'tubi.tv', 'roku.com', 'vudu.com',
      'curiositystream.com', 'mubi.com', 'criterion.com', 'shudder.com',
    ]
  },
  {
    id: 'music-audio',
    nameKey: 'statsCategories.musicAudio',
    icon: '🎵',
    domains: [
      'spotify.com', 'open.spotify.com', 'music.apple.com', 'itunes.apple.com',
      'music.youtube.com', 'soundcloud.com', 'pandora.com', 'tidal.com',
      'deezer.com', 'music.amazon.com', 'bandcamp.com', 'audiomack.com',
      'mixcloud.com', 'last.fm', 'genius.com', 'shazam.com',
      'audible.com', 'podcasts.apple.com', 'pocketcasts.com', 'overcast.fm',
      'castbox.fm', 'stitcher.com', 'iheart.com', 'tunein.com',
      'music.163.com', 'y.qq.com', 'kugou.com', 'kuwo.cn',
    ]
  },
  {
    id: 'news-media',
    nameKey: 'statsCategories.newsMedia',
    icon: '📰',
    domains: [
      // US News
      'cnn.com', 'foxnews.com', 'msnbc.com', 'nytimes.com', 'washingtonpost.com',
      'wsj.com', 'usatoday.com', 'nbcnews.com', 'abcnews.go.com', 'cbsnews.com',
      'apnews.com', 'reuters.com', 'bloomberg.com', 'politico.com', 'thehill.com',
      'huffpost.com', 'vox.com', 'axios.com', 'thedailybeast.com', 'slate.com',
      'theatlantic.com', 'newyorker.com', 'time.com', 'newsweek.com',
      'npr.org', 'pbs.org', 'bbc.com', 'bbc.co.uk',
      // Tech news
      'theverge.com', 'techcrunch.com', 'wired.com', 'arstechnica.com',
      'engadget.com', 'gizmodo.com', 'cnet.com', 'zdnet.com', 'tomshardware.com',
      '9to5mac.com', '9to5google.com', 'macrumors.com', 'androidcentral.com',
      'theinformation.com', 'protocol.com', 'semafor.com',
      // Business
      'businessinsider.com', 'forbes.com', 'fortune.com', 'cnbc.com',
      'marketwatch.com', 'ft.com', 'economist.com', 'barrons.com',
      // International
      'theguardian.com', 'telegraph.co.uk', 'independent.co.uk', 'dailymail.co.uk',
      'mirror.co.uk', 'sky.com', 'aljazeera.com', 'dw.com', 'france24.com',
      'rt.com', 'scmp.com', 'japantimes.co.jp', 'straitstimes.com',
      // Aggregators
      'news.google.com', 'news.yahoo.com', 'msn.com', 'flipboard.com',
      'feedly.com', 'inoreader.com', 'newsbreak.com', 'smartnews.com',
    ]
  },
  {
    id: 'gaming',
    nameKey: 'statsCategories.gaming',
    icon: '🎮',
    domains: [
      // Platforms
      'store.steampowered.com', 'steampowered.com', 'steamcommunity.com',
      'epicgames.com', 'gog.com', 'origin.com', 'ea.com', 'ubisoft.com',
      'battle.net', 'blizzard.com', 'riotgames.com', 'leagueoflegends.com',
      'xbox.com', 'playstation.com', 'nintendo.com', 'itch.io',
      // Game-specific
      'minecraft.net', 'roblox.com', 'fortnite.com', 'pubg.com',
      'worldofwarcraft.com', 'finalfantasyxiv.com', 'guildwars2.com',
      'pathofexile.com', 'warframe.com', 'runescape.com', 'dota2.com',
      'counterstrike.net', 'valorant.com', 'apexlegends.com', 'callofduty.com',
      'fifa.com', 'nba2k.com', 'rockstargames.com', 'gta.com',
      // Info & Community
      'ign.com', 'gamespot.com', 'kotaku.com', 'polygon.com', 'pcgamer.com',
      'eurogamer.net', 'gameinformer.com', 'destructoid.com', 'escapistmagazine.com',
      'gamefaqs.gamespot.com', 'howlongtobeat.com', 'metacritic.com',
      'nexusmods.com', 'moddb.com', 'curseforge.com',
      // Browser games
      'poki.com', 'miniclip.com', 'kongregate.com', 'newgrounds.com',
      'addictinggames.com', 'coolmathgames.com', 'crazygames.com',
      'iogames.space', 'krunker.io', 'slither.io', 'agar.io',
    ]
  },
  {
    id: 'search-engines',
    nameKey: 'statsCategories.searchEngines',
    icon: '🔍',
    domains: [
      'google.com', 'google.co.uk', 'google.ca', 'google.com.au', 'google.de',
      'google.fr', 'google.es', 'google.it', 'google.co.jp', 'google.com.br',
      'bing.com', 'duckduckgo.com', 'yahoo.com', 'search.yahoo.com',
      'baidu.com', 'yandex.com', 'yandex.ru', 'ecosia.org', 'startpage.com',
      'qwant.com', 'brave.com/search', 'search.brave.com', 'neeva.com',
      'wolframalpha.com', 'ask.com', 'dogpile.com', 'aol.com',
      'perplexity.ai', 'you.com', 'phind.com', 'kagi.com',
    ]
  },
  {
    id: 'ai-tools',
    nameKey: 'statsCategories.aiTools',
    icon: '🤖',
    domains: [
      // Chatbots & Assistants
      'chat.openai.com', 'openai.com', 'chatgpt.com',
      'claude.ai', 'anthropic.com',
      'gemini.google.com', 'bard.google.com',
      'copilot.microsoft.com', 'bing.com/chat',
      'poe.com', 'character.ai', 'replika.ai', 'pi.ai',
      'huggingface.co', 'cohere.ai', 'together.ai',
      // Image generation
      'midjourney.com', 'leonardo.ai', 'playground.ai',
      'dreamstudio.ai', 'stability.ai', 'runwayml.com',
      'dall-e.com', 'ideogram.ai', 'nightcafe.studio',
      'lexica.art', 'civitai.com', 'tensor.art',
      // Coding
      'github.com/copilot', 'replit.com', 'cursor.sh', 'codeium.com',
      'tabnine.com', 'sourcegraph.com', 'v0.dev', 'bolt.new',
      // Other AI tools
      'notion.so/ai', 'jasper.ai', 'copy.ai', 'writesonic.com',
      'grammarly.com', 'quillbot.com', 'wordtune.com',
      'descript.com', 'elevenlabs.io', 'murf.ai', 'play.ht',
      'synthesia.io', 'heygen.com', 'd-id.com', 'lumen5.com',
      'remove.bg', 'cleanup.pictures', 'photoroom.com',
    ]
  },
  {
    id: 'shopping',
    nameKey: 'statsCategories.shopping',
    icon: '🛒',
    domains: [
      // Major retailers
      'amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.ca', 'amazon.co.jp',
      'ebay.com', 'walmart.com', 'target.com', 'bestbuy.com', 'costco.com',
      'homedepot.com', 'lowes.com', 'wayfair.com', 'ikea.com', 'overstock.com',
      // Fashion
      'nike.com', 'adidas.com', 'zara.com', 'hm.com', 'uniqlo.com',
      'nordstrom.com', 'macys.com', 'kohls.com', 'gap.com', 'oldnavy.com',
      'asos.com', 'shein.com', 'fashionnova.com', 'revolve.com', 'ssense.com',
      'zappos.com', 'footlocker.com', 'finish line.com',
      // Marketplaces
      'etsy.com', 'mercari.com', 'poshmark.com', 'depop.com', 'grailed.com',
      'stockx.com', 'goat.com', 'offerup.com', 'craigslist.org', 'facebook.com/marketplace',
      // Groceries
      'instacart.com', 'shipt.com', 'freshdirect.com', 'peapod.com',
      'wholefoodsmarket.com', 'kroger.com', 'safeway.com', 'publix.com',
      // International
      'alibaba.com', 'aliexpress.com', 'taobao.com', 'jd.com', 'pinduoduo.com',
      'rakuten.com', 'zalando.com', 'asos.com', 'boohoo.com',
      // Deals & coupons
      'slickdeals.net', 'retailmenot.com', 'honey.com', 'rakuten.com',
      'dealnews.com', 'camelcamelcamel.com', 'keepa.com',
    ]
  },
  {
    id: 'email',
    nameKey: 'statsCategories.email',
    icon: '📧',
    domains: [
      'mail.google.com', 'gmail.com', 'outlook.com', 'outlook.live.com',
      'mail.yahoo.com', 'yahoo.com/mail', 'protonmail.com', 'proton.me',
      'icloud.com', 'mail.aol.com', 'zoho.com/mail', 'fastmail.com',
      'tutanota.com', 'hey.com', 'mail.com', 'gmx.com', 'yandex.mail',
      'mailfence.com', 'runbox.com', 'posteo.de', 'mailbox.org',
      'superhuman.com', 'spark.mail', 'newton.co',
      // Temp mail
      'tempmail.com', 'guerrillamail.com', '10minutemail.com',
    ]
  },
  {
    id: 'productivity',
    nameKey: 'statsCategories.productivity',
    icon: '✅',
    domains: [
      // Notes & docs
      'notion.so', 'evernote.com', 'onenote.com', 'bear.app', 'obsidian.md',
      'roamresearch.com', 'logseq.com', 'remnote.com', 'craft.do', 'coda.io',
      'slite.com', 'nuclino.com', 'slab.com', 'gitbook.com',
      // Office suites
      'docs.google.com', 'sheets.google.com', 'slides.google.com', 'drive.google.com',
      'office.com', 'office365.com', 'microsoft365.com', 'sharepoint.com',
      'onedrive.com', 'dropbox.com', 'box.com', 'icloud.com/pages',
      // Tasks & projects
      'todoist.com', 'ticktick.com', 'any.do', 'things.app', 'omnifocus.com',
      'asana.com', 'trello.com', 'monday.com', 'clickup.com', 'basecamp.com',
      'wrike.com', 'smartsheet.com', 'teamwork.com', 'airtable.com',
      'linear.app', 'height.app', 'shortcut.com', 'productboard.com',
      // Calendar
      'calendar.google.com', 'outlook.com/calendar', 'calendly.com', 'cal.com',
      'doodle.com', 'whentowork.com', 'acuityscheduling.com',
      // Time tracking
      'toggl.com', 'clockify.me', 'harvest.co', 'rescuetime.com',
      // Whiteboard & diagrams
      'miro.com', 'figma.com/figjam', 'mural.co', 'lucid.app', 'whimsical.com',
      'excalidraw.com', 'draw.io', 'diagrams.net', 'mindmeister.com',
    ]
  },
  {
    id: 'development',
    nameKey: 'statsCategories.development',
    icon: '💻',
    domains: [
      // Code hosting
      'github.com', 'gitlab.com', 'bitbucket.org', 'sourceforge.net',
      'codeberg.org', 'sr.ht', 'launchpad.net',
      // Dev tools
      'stackoverflow.com', 'stackexchange.com', 'dev.to', 'hashnode.com',
      'medium.com', 'hackernoon.com', 'freecodecamp.org', 'css-tricks.com',
      'smashingmagazine.com', 'alistapart.com', 'scotch.io',
      // Documentation
      'developer.mozilla.org', 'mdn.io', 'w3schools.com', 'devdocs.io',
      'readthedocs.io', 'docs.rs', 'pkg.go.dev', 'pypi.org', 'npmjs.com',
      'rubygems.org', 'crates.io', 'packagist.org', 'nuget.org',
      // Cloud platforms
      'console.aws.amazon.com', 'aws.amazon.com', 'cloud.google.com',
      'portal.azure.com', 'azure.microsoft.com', 'digitalocean.com',
      'heroku.com', 'vercel.com', 'netlify.com', 'render.com', 'railway.app',
      'fly.io', 'cloudflare.com', 'workers.cloudflare.com',
      // Databases
      'mongodb.com', 'cloud.mongodb.com', 'supabase.com', 'firebase.google.com',
      'planetscale.com', 'neon.tech', 'fauna.com', 'redis.com', 'cockroachlabs.com',
      // APIs & testing
      'postman.com', 'insomnia.rest', 'swagger.io', 'rapidapi.com',
      'twilio.com', 'stripe.com/docs', 'plaid.com',
      // CI/CD
      'circleci.com', 'travis-ci.com', 'jenkins.io', 'teamcity.com',
      'buildkite.com', 'semaphoreci.com', 'codefresh.io',
      // IDEs online
      'codepen.io', 'codesandbox.io', 'stackblitz.com', 'jsfiddle.net',
      'glitch.com', 'replit.com', 'gitpod.io', 'codespaces.github.com',
    ]
  },
  {
    id: 'education',
    nameKey: 'statsCategories.education',
    icon: '📚',
    domains: [
      // Online courses
      'coursera.org', 'udemy.com', 'edx.org', 'udacity.com', 'skillshare.com',
      'linkedin.com/learning', 'pluralsight.com', 'codecademy.com', 'datacamp.com',
      'treehouse.com', 'egghead.io', 'frontendmasters.com', 'laracasts.com',
      'masterclass.com', 'brilliant.org', 'khanacademy.org',
      // Language learning
      'duolingo.com', 'babbel.com', 'rosettastone.com', 'busuu.com',
      'italki.com', 'preply.com', 'lingoda.com', 'hellotalk.com',
      // Academic
      'scholar.google.com', 'jstor.org', 'academia.edu', 'researchgate.net',
      'arxiv.org', 'pubmed.ncbi.nlm.nih.gov', 'sciencedirect.com',
      'nature.com', 'springer.com', 'wiley.com', 'ieee.org',
      // Universities (generic patterns)
      'canvas.com', 'blackboard.com', 'moodle.org', 'd2l.com',
      // Kids & tutoring
      'ixl.com', 'chegg.com', 'quizlet.com', 'brainly.com', 'photomath.com',
      'mathway.com', 'sparknotes.com', 'cliffsnotes.com', 'shmoop.com',
    ]
  },
  {
    id: 'finance',
    nameKey: 'statsCategories.finance',
    icon: '💰',
    domains: [
      // Banking
      'chase.com', 'bankofamerica.com', 'wellsfargo.com', 'citi.com',
      'usbank.com', 'capitalone.com', 'discover.com', 'ally.com',
      'marcus.com', 'sofi.com', 'chime.com', 'varo.com',
      // Investing
      'robinhood.com', 'webull.com', 'schwab.com', 'fidelity.com',
      'tdameritrade.com', 'etrade.com', 'merrilledge.com', 'vanguard.com',
      'interactivebrokers.com', 'tastytrade.com', 'public.com', 'acorns.com',
      // Crypto
      'coinbase.com', 'binance.com', 'kraken.com', 'gemini.com',
      'crypto.com', 'ftx.com', 'kucoin.com', 'bitstamp.com',
      'blockchain.com', 'metamask.io', 'phantom.app', 'uniswap.org',
      'opensea.io', 'etherscan.io', 'coingecko.com', 'coinmarketcap.com',
      // Personal finance
      'mint.com', 'personalcapital.com', 'ynab.com', 'copilot.money',
      'nerdwallet.com', 'bankrate.com', 'creditkarma.com', 'experian.com',
      // Payments
      'paypal.com', 'venmo.com', 'cash.app', 'zelle.com', 'wise.com',
      // Tax
      'turbotax.com', 'hrblock.com', 'taxact.com', 'freetaxusa.com',
    ]
  },
  {
    id: 'communication',
    nameKey: 'statsCategories.communication',
    icon: '💬',
    domains: [
      // Video calls
      'zoom.us', 'meet.google.com', 'teams.microsoft.com', 'webex.com',
      'gotomeeting.com', 'whereby.com', 'around.co', 'gather.town',
      'loom.com', 'mmhmm.app', 'riverside.fm', 'streamyard.com',
      // Messaging
      'web.whatsapp.com', 'whatsapp.com', 'telegram.org', 'web.telegram.org',
      'signal.org', 'messenger.com', 'messages.google.com',
      'viber.com', 'imo.im', 'wire.com',
      // Team chat
      'slack.com', 'discord.com', 'teams.microsoft.com',
      'twist.com', 'flock.com', 'chanty.com', 'rocket.chat',
    ]
  },
  {
    id: 'reference',
    nameKey: 'statsCategories.reference',
    icon: '📖',
    domains: [
      'wikipedia.org', 'en.wikipedia.org', 'wiktionary.org', 'wikimedia.org',
      'britannica.com', 'merriam-webster.com', 'dictionary.com', 'thesaurus.com',
      'urbandictionary.com', 'etymonline.com',
      'imdb.com', 'rottentomatoes.com', 'letterboxd.com', 'tvtropes.org',
      'goodreads.com', 'librarything.com', 'storygraph.com',
      'allmusic.com', 'discogs.com', 'rateyourmusic.com', 'setlist.fm',
      'crunchbase.com', 'glassdoor.com', 'indeed.com', 'linkedin.com/company',
      'yellowpages.com', 'yelp.com', 'tripadvisor.com',
      'snopes.com', 'factcheck.org', 'politifact.com',
    ]
  },
  {
    id: 'forums-communities',
    nameKey: 'statsCategories.forumsCommunities',
    icon: '👥',
    domains: [
      'reddit.com', 'old.reddit.com', 'new.reddit.com',
      'news.ycombinator.com', 'lobste.rs', 'tildes.net',
      'discourse.org', 'phpbb.com', 'vbulletin.com',
      '4chan.org', '4channel.org', '8kun.top',
      'forums.macrumors.com', 'xda-developers.com', 'androidforums.com',
      'avsforum.com', 'headfi.org', 'gearspace.com',
      'sbnation.com', 'fandom.com', 'wikia.com',
      'disqus.com', 'mumsnet.com', 'babycenter.com',
    ]
  },
  {
    id: 'sports',
    nameKey: 'statsCategories.sports',
    icon: '⚽',
    domains: [
      'espn.com', 'espn.go.com', 'sports.yahoo.com', 'bleacherreport.com',
      'cbssports.com', 'foxsports.com', 'nbcsports.com', 'theathletic.com',
      'nba.com', 'nfl.com', 'mlb.com', 'nhl.com', 'mls.com', 'wnba.com',
      'premierleague.com', 'laliga.com', 'bundesliga.com', 'seriea.com',
      'uefa.com', 'fifa.com', 'skysports.com', 'bbc.com/sport',
      'flashscore.com', 'sofascore.com', 'livescore.com',
      'draftkings.com', 'fanduel.com', 'betmgm.com', 'caesars.com/sportsbook',
      'strava.com', 'mapmyrun.com', 'runkeeper.com', 'nike.com/running',
      'fantasy.espn.com', 'fantasy.nfl.com', 'rotowire.com', 'fantasypros.com',
    ]
  },
  {
    id: 'health-fitness',
    nameKey: 'statsCategories.healthFitness',
    icon: '💪',
    domains: [
      // Fitness
      'myfitnesspal.com', 'fitbit.com', 'garmin.com/connect', 'connect.garmin.com',
      'whoop.com', 'oura.com', 'apple.com/fitness',
      'peloton.com', 'onepeloton.com', 'beachbodyondemand.com',
      'fitnessblender.com', 'darebee.com', 'jefit.com', 'strong.app',
      // Health info
      'webmd.com', 'healthline.com', 'mayoclinic.org', 'nih.gov',
      'clevelandclinic.org', 'hopkinsmedicine.org', 'medlineplus.gov',
      'drugs.com', 'rxlist.com', 'goodrx.com',
      // Mental health
      'headspace.com', 'calm.com', 'betterhelp.com', 'talkspace.com',
      'cerebral.com', 'mindbloom.com', 'noom.com',
      // Nutrition
      'cronometer.com', 'loseit.com', 'calorieking.com', 'nutritionix.com',
      'eatthismuch.com', 'fooducate.com',
    ]
  },
  {
    id: 'travel',
    nameKey: 'statsCategories.travel',
    icon: '✈️',
    domains: [
      // Booking
      'booking.com', 'expedia.com', 'hotels.com', 'kayak.com', 'trivago.com',
      'priceline.com', 'hotwire.com', 'orbitz.com', 'travelocity.com',
      'airbnb.com', 'vrbo.com', 'homeaway.com', 'hostelworld.com',
      // Airlines
      'google.com/flights', 'skyscanner.com', 'momondo.com', 'kiwi.com',
      'united.com', 'aa.com', 'delta.com', 'southwest.com', 'jetblue.com',
      'spirit.com', 'frontier.com', 'alaskaair.com',
      'britishairways.com', 'lufthansa.com', 'airfrance.com', 'emirates.com',
      // Reviews & guides
      'tripadvisor.com', 'lonelyplanet.com', 'fodors.com', 'frommers.com',
      'atlasobscura.com', 'roadtrippers.com', 'rome2rio.com',
      // Maps
      'maps.google.com', 'google.com/maps', 'waze.com', 'mapquest.com',
      'openstreetmap.org', 'citymapper.com', 'moovitapp.com',
      // Car rental
      'enterprise.com', 'hertz.com', 'avis.com', 'budget.com', 'national.com',
      'turo.com', 'getaround.com',
    ]
  },
  {
    id: 'food-recipes',
    nameKey: 'statsCategories.foodRecipes',
    icon: '🍳',
    domains: [
      // Delivery
      'doordash.com', 'ubereats.com', 'grubhub.com', 'postmates.com',
      'seamless.com', 'caviar.com', 'deliveroo.com', 'justeat.com',
      // Recipes
      'allrecipes.com', 'foodnetwork.com', 'epicurious.com', 'bonappetit.com',
      'seriouseats.com', 'food52.com', 'tasty.co', 'delish.com',
      'budgetbytes.com', 'skinnytaste.com', 'halfbakedharvest.com',
      'minimalistbaker.com', 'cookieandkate.com', 'loveandlemons.com',
      'simplyrecipes.com', 'thekitchn.com', 'smittenkitchen.com',
      // Restaurant reviews
      'yelp.com', 'opentable.com', 'resy.com', 'tock.com',
      'infatuation.com', 'eater.com', 'zagat.com',
    ]
  },
  {
    id: 'cloud-storage',
    nameKey: 'statsCategories.cloudStorage',
    icon: '☁️',
    domains: [
      'drive.google.com', 'dropbox.com', 'onedrive.com', 'onedrive.live.com',
      'icloud.com', 'box.com', 'mega.nz', 'mediafire.com',
      'wetransfer.com', 'sendspace.com', 'pcloud.com', 'sync.com',
      'backblaze.com', 'idrive.com', 'carbonite.com', 'crashplan.com',
      'spideroak.com', 'tresorit.com', 'icedrive.net',
    ]
  },
  {
    id: 'design',
    nameKey: 'statsCategories.design',
    icon: '🎨',
    domains: [
      // Design tools
      'figma.com', 'sketch.com', 'adobe.com', 'canva.com', 'framer.com',
      'invisionapp.com', 'zeplin.io', 'abstract.com', 'marvel.app',
      // Photo editing
      'photopea.com', 'pixlr.com', 'fotor.com', 'befunky.com',
      'lightroom.adobe.com', 'photos.google.com',
      // Stock & inspiration
      'dribbble.com', 'behance.net', 'awwwards.com', 'siteinspire.com',
      'unsplash.com', 'pexels.com', 'pixabay.com', 'shutterstock.com',
      'gettyimages.com', 'istockphoto.com', 'adobe.com/stock',
      // Fonts & icons
      'fonts.google.com', 'fontawesome.com', 'flaticon.com', 'iconfinder.com',
      'thenounproject.com', 'iconscout.com', 'heroicons.com',
      // 3D & motion
      'blender.org', 'sketchfab.com', 'turbosquid.com', 'cgtrader.com',
      'lottiefiles.com', 'rive.app',
    ]
  },
  {
    id: 'entertainment',
    nameKey: 'statsCategories.entertainment',
    icon: '🎭',
    domains: [
      // Humor & viral
      '9gag.com', 'imgur.com', 'giphy.com', 'tenor.com', 'knowyourmeme.com',
      'boredpanda.com', 'buzzfeed.com', 'cheezburger.com', 'thechive.com',
      // Comics & webnovels
      'webtoons.com', 'tapas.io', 'comixology.com', 'marvel.com',
      'dc.com', 'mangadex.org', 'mangaplus.shueisha.co.jp',
      'royalroad.com', 'wattpad.com', 'webnovel.com', 'scribblehub.com',
      // Celebs & pop culture
      'tmz.com', 'eonline.com', 'people.com', 'usmagazine.com',
      'variety.com', 'hollywoodreporter.com', 'deadline.com',
      // Events
      'ticketmaster.com', 'stubhub.com', 'seatgeek.com', 'vividseats.com',
      'eventbrite.com', 'meetup.com', 'bandsintown.com', 'songkick.com',
    ]
  },
  {
    id: 'jobs-careers',
    nameKey: 'statsCategories.jobsCareers',
    icon: '💼',
    domains: [
      'linkedin.com/jobs', 'indeed.com', 'glassdoor.com', 'monster.com',
      'careerbuilder.com', 'ziprecruiter.com', 'dice.com', 'ladders.com',
      'simplyhired.com', 'snagajob.com', 'flexjobs.com', 'remote.co',
      'weworkremotely.com', 'remoteok.com', 'angel.co', 'wellfound.com',
      'hired.com', 'triplebyte.com', 'otta.com', 'levels.fyi',
      'builtin.com', 'themuse.com', 'idealist.org', 'usajobs.gov',
      'upwork.com', 'fiverr.com', 'toptal.com', 'freelancer.com',
    ]
  },
  {
    id: 'real-estate',
    nameKey: 'statsCategories.realEstate',
    icon: '🏠',
    domains: [
      'zillow.com', 'redfin.com', 'realtor.com', 'trulia.com',
      'apartments.com', 'rent.com', 'hotpads.com', 'zumper.com',
      'streeteasy.com', 'compass.com', 'opendoor.com', 'offerpad.com',
      'loopnet.com', 'costar.com', 'commercialcafe.com',
      'rightmove.co.uk', 'zoopla.co.uk',
    ]
  },
  {
    id: 'government',
    nameKey: 'statsCategories.government',
    icon: '🏛️',
    domains: [
      'usa.gov', 'irs.gov', 'ssa.gov', 'medicare.gov', 'healthcare.gov',
      'dmv.org', 'uscis.gov', 'travel.state.gov', 'usps.com',
      'whitehouse.gov', 'congress.gov', 'senate.gov', 'house.gov',
      'supremecourt.gov', 'courts.gov', 'justice.gov', 'fbi.gov',
      'cdc.gov', 'fda.gov', 'epa.gov', 'fema.gov', 'nasa.gov',
      'gov.uk', 'canada.ca', 'service-public.fr', 'bundesregierung.de',
    ]
  },
];

// Build a fast lookup map from domain to category
let domainToCategoryMap: Map<string, StatsCategory> | null = null;

function buildDomainMap(): Map<string, StatsCategory> {
  if (domainToCategoryMap) return domainToCategoryMap;
  
  domainToCategoryMap = new Map();
  for (const category of STATS_CATEGORIES) {
    for (const domain of category.domains) {
      const normalized = domain.replace(/^www\./, '').toLowerCase();
      domainToCategoryMap.set(normalized, category);
    }
  }
  return domainToCategoryMap;
}

// Get category for a domain using the stats categories
export function getStatsCategoryForDomain(domain: string): StatsCategory | null {
  const map = buildDomainMap();
  const normalized = domain.replace(/^www\./, '').toLowerCase();
  
  // Direct match
  if (map.has(normalized)) {
    return map.get(normalized)!;
  }
  
  // Try removing subdomains progressively
  const parts = normalized.split('.');
  for (let i = 1; i < parts.length - 1; i++) {
    const partial = parts.slice(i).join('.');
    if (map.has(partial)) {
      return map.get(partial)!;
    }
  }
  
  return null;
}
