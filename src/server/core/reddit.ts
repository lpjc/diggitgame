import { reddit, redis } from '@devvit/web/server';
import { RedditPost, SubredditRelic } from '../../shared/types/game';

const POST_CACHE_PREFIX = 'reddit:post:cache:';
const SUBREDDIT_CACHE_PREFIX = 'reddit:subreddit:cache:';
const CACHE_TTL = 86400; // 24 hours in seconds
const SIX_MONTHS_AGO = Date.now() - 6 * 30 * 24 * 60 * 60 * 1000;

/**
 * Fetch a random historical post from a subreddit
 * Posts must be older than 6 months and have engagement
 */
export async function fetchHistoricalPost(subredditName: string): Promise<RedditPost | null> {
  try {
    // Check cache first
    const cacheKey = `${POST_CACHE_PREFIX}${subredditName}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Fetch top posts from the subreddit
    const posts = await reddit.getTopPosts({
      subredditName,
      timeframe: 'all',
      limit: 100,
    }).all();

    // Filter posts older than 6 months with engagement
    const eligiblePosts = posts.filter((post) => {
      const postAge = post.createdAt.getTime();
      return postAge < SIX_MONTHS_AGO && post.score > 10;
    });

    if (eligiblePosts.length === 0) {
      console.warn(`No eligible historical posts found in r/${subredditName}`);
      return null;
    }

    // Select a random post
    const randomPost = eligiblePosts[Math.floor(Math.random() * eligiblePosts.length)];

    const thumbnailUrl = randomPost!.thumbnail?.url;
    const textSnippet = randomPost!.body?.substring(0, 200);
    
    const redditPost: RedditPost = {
      id: randomPost!.id,
      title: randomPost!.title,
      author: randomPost!.authorName || 'unknown',
      subreddit: subredditName,
      createdAt: randomPost!.createdAt.getTime(),
      score: randomPost!.score,
      ...(thumbnailUrl && { thumbnailUrl }),
      ...(textSnippet && { textSnippet }),
      permalink: randomPost!.permalink,
    };

    // Cache the result
    await redis.set(cacheKey, JSON.stringify(redditPost), {
      expiration: new Date(Date.now() + CACHE_TTL * 1000),
    });

    return redditPost;
  } catch (error) {
    console.error(`Error fetching historical post from r/${subredditName}:`, error);
    return null;
  }
}

/**
 * Extract subreddit theme information
 */
export async function getSubredditTheme(subredditName: string): Promise<SubredditRelic> {
  try {
    // Check cache first
    const cacheKey = `${SUBREDDIT_CACHE_PREFIX}${subredditName}`;
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Fetch subreddit info
    const subreddit = await reddit.getSubredditInfoByName(subredditName);

    const theme: SubredditRelic = {
      subredditName,
      iconUrl: (subreddit as any).icon || undefined,
      primaryColor: (subreddit as any).primaryColor || '#FF4500', // Default Reddit orange
      description: typeof subreddit.description === 'string' ? subreddit.description : `The ${subredditName} community`,
    };

    // Cache the result
    await redis.set(cacheKey, JSON.stringify(theme), {
      expiration: new Date(Date.now() + CACHE_TTL * 1000),
    });

    return theme;
  } catch (error) {
    console.error(`Error fetching subreddit theme for r/${subredditName}:`, error);
    
    // Return fallback theme
    return {
      subredditName,
      primaryColor: '#FF4500',
      description: `The ${subredditName} community`,
    };
  }
}

/**
 * Get subreddit icon URL
 */
export async function getSubredditIcon(subredditName: string): Promise<string | undefined> {
  try {
    const theme = await getSubredditTheme(subredditName);
    return theme.iconUrl;
  } catch (error) {
    console.error(`Error fetching subreddit icon for r/${subredditName}:`, error);
    return undefined;
  }
}

/**
 * Invalidate cache for a subreddit (useful for testing)
 */
export async function invalidateSubredditCache(subredditName: string): Promise<void> {
  await redis.del(`${POST_CACHE_PREFIX}${subredditName}`);
  await redis.del(`${SUBREDDIT_CACHE_PREFIX}${subredditName}`);
}
