import { context, reddit, redis } from '@devvit/web/server';

export const createPostA = async (targetSubreddit: string = 'AskReddit') => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  console.log(`Creating PostA with target subreddit: r/${targetSubreddit}`);

  // Initialize stats
  const tempPostId = `temp_${Date.now()}`;
  await redis.set(
    `digsite:${tempPostId}:stats`,
    JSON.stringify({
      artifactsFound: 0,
      artifactsBroken: 0,
    })
  );

  const post = (await reddit.submitCustomPost({
    entrypoint: 'typeA',
    splash: {
      appDisplayName: 'Subreddit Excavator',
      heading: `🏜️ Dig Site: r/${targetSubreddit}`,
      description: `Excavate historical posts from this subreddit\n\n✅ Found: 0  💔 Broken: 0`,
      buttonLabel: 'Start Digging ⛏️',
      backgroundUri: 'default-splash.png',
      appIconUri: 'default-icon.png',
    },
    postData: {
      postType: 'typeA',
      targetSubreddit,
      initialState: {
        gameState: 'initial',
        score: 0,
      },
    },
    subredditName: subredditName,
    title: `🏜️ Dig Site: r/${targetSubreddit}`,
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

  console.log(`Creating PostB (Museum) for user: ${username}`);
  const post = (await reddit.submitCustomPost({
    entrypoint: 'typeB',
    splash: {
      appDisplayName: 'Artifact Museum',
      heading: `🏛️ ${username}'s Museum`,
      description: `View your collection of discovered artifacts\n\n✅ Found: 0  💔 Broken: 0`,
      buttonLabel: 'Enter Museum 🏛️',
      backgroundUri: 'default-splash.png',
      appIconUri: 'default-icon.png',
    },
    postData: {
      postType: 'typeB',
      userId: username,
      initialState: {
        gameState: 'initial',
        score: 0,
      },
    },
    subredditName: subredditName,
    title: `🏛️ ${username}'s Artifact Museum`,
  } as any)) as any;
  console.log('PostB created:', post.id);

  // Store post type in Redis for later retrieval
  await redis.set(`post:${post.id}:type`, 'typeB');

  return post;
};

// Legacy function for backward compatibility
export const createPost = createPostA;
