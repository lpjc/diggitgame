// Job: Create Type A and Type B posts; configure splash and seed per-post data; mirror dynamic stats to post text fallback when possible
import { context, reddit, redis } from '@devvit/web/server';
import { getRandomSubreddit } from './subreddit-picker';
// import { getCommunityStats } from './digsite';

export const createPostA = async (targetSubreddit?: string, depthLevel: 'surface' | 'shallow' | 'deep' | 'deepest' = 'surface') => {
  // If no target subreddit provided, pick one dynamically
  if (!targetSubreddit) {
    targetSubreddit = await getRandomSubreddit(0.6); // 60% weight to user's known subreddits
  }
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  console.log(`Creating PostA with target subreddit: r/${targetSubreddit}`);

  // Fetch subreddit icon
  let appIconUri = 'default-icon.png';
  try {
    const subredditInfo = await reddit.getSubredditInfoByName(targetSubreddit);
    if (subredditInfo.id) {
      const styles = await reddit.getSubredditStyles(subredditInfo.id);
      if (styles.icon) {
        appIconUri = styles.icon;
        console.log(`Using subreddit icon: ${appIconUri}`);
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch icon for r/${targetSubreddit}, using default:`, error);
  }

  // Initialize stats
  const tempPostId = `temp_${Date.now()}`;
  await redis.set(
    `digsite:${tempPostId}:stats`,
    JSON.stringify({
      artifactsFound: 0,
      artifactsBroken: 0,
    })
  );

  // Randomly select one of the available digsite backgrounds
  const backgroundOptions = ['desert-digsite.png', 'jungle-digsite.png', 'mountain-digsite.png'];
  const backgroundUri = backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)];

  const depthToAge = (d: typeof depthLevel) => {
    if (d === 'surface') return '0-3y';
    if (d === 'shallow') return '3-6y';
    if (d === 'deep') return '6-9y';
    return '9+y';
  };

  const post = (await reddit.submitCustomPost({
    entrypoint: 'typeA',
    splash: {
      appDisplayName: 'Diggit',
      heading: `r/${targetSubreddit} \n Dig Site Discovered! `,
      description: `\n ⛏\uFE0E Depth: ${depthLevel} \n \u26B1\uFE0E Artifact Age: ${depthToAge(depthLevel)}`,
      buttonLabel: 'Excavate!',
      backgroundUri,
      appIconUri,
    },
    postData: { 
      postType: 'typeA',
      targetSubreddit,
      communityStats: {
        artifactsFound: 0,
        artifactsBroken: 0,
      },
      initialState: {
        gameState: 'initial',
        score: 0,
      },
      lastUpdatedAt: Date.now(),
    },
    subredditName: subredditName,
    title: `Dig Site: r/${targetSubreddit}`,
  } as any)) as any;
  console.log('PostA created:', post.id);

  // After creation, mirror latest community stats into the post's text fallback
  try {
    const fallbackText = `Dig Site Discovered!\n\n- Depth level: ${depthLevel.toUpperCase()}\n- Artifact age: ${depthToAge(depthLevel)}`;
    if (typeof post.setTextFallback === 'function') {
      await post.setTextFallback({ text: fallbackText });
    }
  } catch (fallbackErr) {
    console.warn('Failed to set text fallback with community stats:', fallbackErr);
  }

  // Store post type and target subreddit in Redis
  await redis.set(`post:${post.id}:type`, 'typeA');
  await redis.set(`digsite:${post.id}:target`, targetSubreddit);
  await redis.set(
    `digsite:${post.id}:stats`,
    JSON.stringify({
      artifactsFound: 0,
      artifactsBroken: 0,
    })
  );

  return post;
};

export const createPostB = async (userId?: string) => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  const username = userId || (await reddit.getCurrentUsername()) || 'anonymous';

  console.log(`Creating PostB (Museum)`);
  const post = (await reddit.submitCustomPost({
    entrypoint: 'typeB',
    splash: {
      appDisplayName: `Your Museum`,
      heading: `Your Museum`,
      description: `Your Unique Collection of discovered artifacts \n\n \u26B1\uFE0E`,
      buttonLabel: 'Enter Museum',
      backgroundUri: 'museum-post-background.png',
      appIconUri: 'museum-icon.png',
    },
    postData: {
      postType: 'typeB',
      creatorUserId: username,
      viewingUser: null,
      viewingTotals: {
        totalFound: 0,
        totalBroken: 0,
      },
      initialState: {
        gameState: 'initial',
        score: 0,
      },
      lastUpdatedAt: Date.now(),
    },
    subredditName: subredditName,
    title: `Your Museum`,
  } as any)) as any;
  console.log('PostB created:', post.id);

  // Store post type in Redis for later retrieval
  await redis.set(`post:${post.id}:type`, 'typeB');

  return post;
};

// Legacy function for backward compatibility
export const createPost = createPostA;
