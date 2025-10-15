import express from 'express';
import {
  InitResponse,
  IncrementResponse,
  DecrementResponse,
  UserActionRequest,
  UserActionResponse,
} from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPost, createPostA, createPostB } from './core/post';
import { getDataFeed } from './core/data';
import { createUserPost, createUserComment } from './core/userActions';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const [count, username] = await Promise.all([
        redis.get('count'),
        reddit.getCurrentUsername(),
      ]);

      // Try to get postType from Redis, default to typeA
      const postTypeKey = `post:${postId}:type`;
      const postType = (await redis.get(postTypeKey)) || 'typeA';

      res.json({
        type: 'init',
        postId: postId,
        postType: postType as 'typeA' | 'typeB',
        count: count ? parseInt(count) : 0,
        username: username ?? 'anonymous',
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<{ postId: string }, IncrementResponse | { status: string; message: string }, unknown>(
  '/api/increment',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', 1),
      postId,
      type: 'increment',
    });
  }
);

router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', -1),
      postId,
      type: 'decrement',
    });
  }
);

router.get('/api/data-feed', async (_req, res): Promise<void> => {
  try {
    const dataFeed = await getDataFeed();
    res.json(dataFeed);
  } catch (error) {
    console.error('Error in /api/data-feed:', error);
    let errorMessage = 'Failed to fetch data feed';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(500).json({
      status: 'error',
      message: errorMessage,
    });
  }
});

router.post<unknown, UserActionResponse, UserActionRequest>(
  '/api/create-user-post',
  async (req, res): Promise<void> => {
    try {
      const { action, data, consent } = req.body;

      if (!consent) {
        res.status(400).json({
          success: false,
          error: 'User consent is required to create a post',
        });
        return;
      }

      if (action !== 'create-post') {
        res.status(400).json({
          success: false,
          error: 'Invalid action type',
        });
        return;
      }

      const post = await createUserPost(data as any);
      res.json({
        success: true,
        id: post.id,
      });
    } catch (error) {
      console.error('Error creating user post:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create post',
      });
    }
  }
);

router.post<unknown, UserActionResponse, UserActionRequest>(
  '/api/create-user-comment',
  async (req, res): Promise<void> => {
    try {
      const { action, data, consent } = req.body;

      if (!consent) {
        res.status(400).json({
          success: false,
          error: 'User consent is required to create a comment',
        });
        return;
      }

      if (action !== 'create-comment') {
        res.status(400).json({
          success: false,
          error: 'Invalid action type',
        });
        return;
      }

      const comment = await createUserComment(data as any);
      res.json({
        success: true,
        id: comment.id,
      });
    } catch (error) {
      console.error('Error creating user comment:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create comment',
      });
    }
  }
);

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/create-post-a', async (_req, res): Promise<void> => {
  try {
    const post = await createPostA();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating PostA: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create PostA',
    });
  }
});

router.post('/internal/menu/create-post-b', async (_req, res): Promise<void> => {
  try {
    const post = await createPostB();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating PostB: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create PostB',
    });
  }
});

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);
