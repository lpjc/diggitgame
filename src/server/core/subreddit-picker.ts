import { reddit, redis } from '@devvit/web/server';
import type { DepthLevel } from '../../shared/types/game';

/**
 * Default popular subreddits used when user history is scarce or by weighted choice
 */
export const DEFAULT_SUBREDDITS: string[] = [
  'reddit',
  'devvit',
  'gamesonreddit',
  'funny',
  'askreddit',
  'gaming',
  'todayilearned',
  'music',
  'aww',
  'movies',
  'memes',
  'science',
  'showerthoughts',
  'pics',
  'jokes',
  'space',
  'diy',
  'books',
  'videos',
  'mildlyinteresting',
  'food',
  'amitheasshole',
  'explainlikeimfive',
  'gadgets',
  'art',
  'sports',
  'dataisbeautiful',
  'futurology',
  'gifs',
  'upliftingnews',
  'documentaries',
  'damnthatsinteresting',
  'wallstreetbets',
  'oldschoolcool',
  'writingprompts',
  'history',
  'philosophy',
  'nosleep',
  'television',
  'listentothis',
  'nba',
  'natureisfuckinglit',
  'internetisbeautiful',
  'pcmasterrace',
  'interestingasfuck',
  'relationship_advice',
  'creepy',
  'lifehacks',
  'anime',
  'travel',
  'twoxchromosomes',
  'contagiouslaughter',
  'nfl',
  'historymemes',
  'fitness',
  'oddlysatisfying',
  'dadjokes',
  'mademesmile',
  'confession',
  'unexpected',
  'netflixbestof',
  'europe',
  'mildlyinfuriating',
  'eatcheapandhealthy',
  'chatgpt',
  'tattoos',
  'cryptocurrency',
  'adviceanimals',
  'nextfuckinglevel',
  'beamazed',
  'stocks',
  'politics',
  'cats',
  'gardening',
  'foodporn',
  'soccer',
  'minecraft',
  'funnyanimals',
  'animalsbeingderps',
  'leagueoflegends',
  'parenting',
  'facepalm',
  'rarepuppers',
  'watchpeopledieinside',
  'bitcoin',
  'whatcouldgowrong',
  'me_irl',
  'itookapicture',
  'cars',
  'therewasanattempt',
  'cozyplaces',
  'makeupaddiction',
  'askmen',
  'wtf',
  'animalsbeingbros',
  'aitah',
  'programming',
  'humansbeingbros',
  'frugal',
  'nostupidquestions',
  'blursedimages',
  'animalsbeingjerks',
  'starterpacks',
  'fauxmoi',
  'malefashionadvice',
  'apple',
  'formula1',
  'popculturechat',
  'mapporn',
  'woodworking',
  'awwducational',
  'overwatch',
  'coolguides',
  'cooking',
  'roastme',
  'nutrition',
  'dankmemes',
  'crappydesign',
  'nasa',
  'technicallythetruth',
  'femalefashionadvice',
  'anime_irl',
  'drawing',
  'travelhacks',
  'mealprepsunday',
  'fortnitebr',
  'economics',
  'askwomen',
  'photography',
  'sneakers',
  'camping',
  'youshouldknow',
  'biology',
  'unitedkingdom',
  'boardgames',
  'hiphopheads',
  'bestof',
  'battlestations',
  'onepiece',
  'shoestring',
  'streetwear',
  'outdoors',
  'survival',
  'strength_training',
  'premierleague',
  'steam',
  'entrepreneur',
  'pettyrevenge',
  'skincareaddiction',
  'daytrading',
  'kidsarefuckingstupid',
  'unpopularopinion',
  'eldenring',
  'marvelstudios',
  'bikinibottomtwitter',
  'manga',
  'psychology',
  'publicfreakout',
  'pokemon',
  'careerguidance',
  'slowcooking',
  'dating_advice',
  'programmerhumor',
  'eyebleach',
  'instant_regret',
  'homeautomation',
  'starwars',
  'solotravel',
  'hair',
  'painting',
  'blackmagicfuckery',
  'iphone',
  'cfb',
  'livestreamfail',
  'canada',
  'expectationvsreality',
  'motorcycles',
  'maliciouscompliance',
  'marvelmemes',
  'learnprogramming',
  'woahdude',
  'nonononoyes',
  'baking',
  'dnd',
  'running',
  'moviedetails',
  'mypeopleneedme',
  'loseit',
  'roadtrip',
  'comicbooks',
  'thriftstorehauls',
  'productivity',
  'idiotsincars',
  'compsci',
  'changemyview',
  'nails',
  'keto',
  'math',
  'stockmarket',
  'podcasts',
  'reactiongifs',
  'maybemaybemaybe',
  'pcgaming',
];

/**
 * Get subreddits from user's recent activity
 */
export async function getUserRecentSubreddits(
  username: string,
  limit: number = 20
): Promise<string[]> {
  try {
    const comments = await reddit
      .getCommentsByUser({
        username,
        limit,
      })
      .all();

    const unique = new Set<string>();
    for (const comment of comments) {
      const name = comment.subredditName;
      if (name && name.trim()) {
        unique.add(name.trim().toLowerCase());
      }
    }

    return Array.from(unique);
  } catch (error) {
    console.error('Error fetching user recent subreddits:', error);
    return [];
  }
}

/**
 * Get a random subreddit with weighted selection between user's activity and defaults
 * @param knownToPlayerWeight - Probability (0-1) to pick from user's list when available
 */
export async function getRandomSubreddit(
  knownToPlayerWeight: number = 0.5,
  depth?: DepthLevel
): Promise<string> {
  const clamped = Math.max(0, Math.min(1, knownToPlayerWeight));
  let userPool: string[] = [];

  try {
    const username = await reddit.getCurrentUsername();
    if (username && typeof username === 'string') {
      userPool = await getUserRecentSubreddits(username, 20);
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }

  const canUseUserPool = userPool.length >= 2;
  const useUser = canUseUserPool && Math.random() < clamped;
  let pool = useUser ? userPool : DEFAULT_SUBREDDITS;
  if (depth) {
    // Filter out subreddits that already have a dig site for this depth
    const candidates: string[] = [];
    for (const s of pool) {
      const key = `digsite:index:r:${s.toLowerCase()}:depth:${depth}`;
      const exists = await redis.get(key);
      if (!exists) candidates.push(s);
    }
    if (candidates.length) pool = candidates;
  }

  if (!pool.length) return 'askreddit'; // Ultimate fallback

  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] || 'askreddit';
}

/**
 * Get N recommended subreddits with weighted selection
 * @param count - Number of subreddits to return
 * @param knownToPlayerWeight - Probability (0-1) to favor user's activity
 */
export async function getRecommendedSubreddits(
  count: number,
  knownToPlayerWeight: number = 0.5,
  depth?: DepthLevel
): Promise<string[]> {
  const clamped = Math.max(0, Math.min(1, knownToPlayerWeight));
  let userPool: string[] = [];

  try {
    const username = await reddit.getCurrentUsername();
    if (username && typeof username === 'string') {
      const recent = await getUserRecentSubreddits(username, 20);
      userPool = Array.from(
        new Set(
          recent
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => s.toLowerCase())
        )
      );
    }
  } catch (error) {
    console.error('Error getting user pool:', error);
  }

  const results: string[] = [];
  const seen = new Set<string>();

  // Helper to draw without replacement from an array
  async function filterDepth(arr: string[]): Promise<string[]> {
    if (!depth) return arr;
    const out: string[] = [];
    for (const s of arr) {
      const key = `digsite:index:r:${s.toLowerCase()}:depth:${depth}`;
      const exists = await redis.get(key);
      if (!exists) out.push(s);
    }
    return out;
  }

  async function drawFrom(arr: string[]): Promise<string | null> {
    const filtered = await filterDepth(arr);
    const pool = filtered.filter((s) => !seen.has(s));
    if (!pool.length) return null;
    const idx = Math.floor(Math.random() * pool.length);
    const val = pool[idx];
    if (!val) return null;
    seen.add(val);
    results.push(val);
    return val;
  }

  // Try to honor the weight by alternating attempts
  while (results.length < Math.max(0, count)) {
    const targetIsUser = userPool.length >= 2 && Math.random() < clamped;
    const first = targetIsUser ? userPool : DEFAULT_SUBREDDITS;
    const second = targetIsUser ? DEFAULT_SUBREDDITS : userPool;

    if ((await drawFrom(first)) == null) {
      if ((await drawFrom(second)) == null) break; // Nowhere to draw from
    }
  }

  // If still short, top up from defaults
  let i = 0;
  while (results.length < count && i < DEFAULT_SUBREDDITS.length) {
    const s = DEFAULT_SUBREDDITS[i++];
    if (s && !seen.has(s)) {
      seen.add(s);
      results.push(s);
    }
  }

  return results;
}
