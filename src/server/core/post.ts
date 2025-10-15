import { context, reddit, redis } from '@devvit/web/server';

export const createPostA = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  console.log('Creating PostA with entrypoint: typeA');
  const post = (await reddit.submitCustomPost({
    entrypoint: 'typeA',
    splash: {
      appDisplayName: 'Game Type A',
      heading: 'Welcome to Type A!',
      description: 'Experience the classic game mode',
      buttonLabel: 'Launch Type A',
      backgroundUri: 'default-splash.png',
      appIconUri: 'default-icon.png',
    },
    postData: {
      postType: 'typeA',
      initialState: {
        gameState: 'initial',
        score: 0,
      },
    },
    subredditName: subredditName,
    title: 'Type A Game Post',
  } as any)) as any;
  console.log('PostA created:', post.id);

  // Store post type in Redis for later retrieval
  await redis.set(`post:${post.id}:type`, 'typeA');

  return post;
};

export const createPostB = async () => {
  const { subredditName } = context;
  if (!subredditName) {
    throw new Error('subredditName is required');
  }

  console.log('Creating PostB with entrypoint: typeB');
  const post = (await reddit.submitCustomPost({
    entrypoint: 'typeB',
    splash: {
      appDisplayName: 'Game Type B',
      heading: 'Welcome to Type B!',
      description: 'Experience the advanced game mode',
      buttonLabel: 'Launch Type B',
      backgroundUri: 'default-splash.png',
      appIconUri: 'default-icon.png',
    },
    postData: {
      postType: 'typeB',
      initialState: {
        gameState: 'initial',
        score: 0,
      },
    },
    subredditName: subredditName,
    title: 'Type B Game Post',
  } as any)) as any;
  console.log('PostB created:', post.id);

  // Store post type in Redis for later retrieval
  await redis.set(`post:${post.id}:type`, 'typeB');

  return post;
};

// Legacy function for backward compatibility
export const createPost = createPostA;
