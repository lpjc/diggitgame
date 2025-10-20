import { context, reddit, redis } from '@devvit/web/server';
import { getRandomSubreddit } from './subreddit-picker';

export const createPostA = async (targetSubreddit?: string) => {
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

  const post = (await reddit.submitCustomPost({
    entrypoint: 'typeA',
    splash: {
      appDisplayName: 'Diggit',
      heading: `r/${targetSubreddit} \n Dig Site Discovered! `,
      description: `\n \u26B1\uFE0E Artifacts found here: 0 \n ☓\uFE0E Broken by a shovel: 0`,
      buttonLabel: '⛏\uFE0E Excavate!',
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
  const snoovatarUrl = username ? await reddit.getSnoovatarUrl(username) : 'museum-icon.png';

  console.log(`Creating PostB (Museum) for user: ${username}`);
  const post = (await reddit.submitCustomPost({
    entrypoint: 'typeB',
    splash: {
      appDisplayName: `The u/${username} Collection`,
      heading: `u/${username}'s Museum`,
      description: `Your collection of discovered artifacts\n\n \u26B1\uFE0E Found in total: 0`,
      buttonLabel: 'Enter Museum',
      backgroundUri: 'museum-post-background.png',
      appIconUri: snoovatarUrl,
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
    title: `${username}'s Artifact Museum`,
  } as any)) as any;
  console.log('PostB created:', post.id);

  // Store post type in Redis for later retrieval
  await redis.set(`post:${post.id}:type`, 'typeB');

  return post;
};

// Legacy function for backward compatibility
export const createPost = createPostA;
