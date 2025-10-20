import express from 'express';
import {
  InitResponse,
  IncrementResponse,
  DecrementResponse,
  UserActionRequest,
  UserActionResponse,
} from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPostA, createPostB } from './core/post';
import { getRecommendedSubreddits } from './core/subreddit-picker';
import { getDataFeed } from './core/data';
import { createUserPost, createUserComment } from './core/userActions';
import { getDigSiteData, getCommunityStats, updateCommunityStats } from './core/digsite';
import { fetchHistoricalPost, getSubredditTheme } from './core/reddit';
import { getPlayerStats, addArtifactToMuseum, unlockSubreddit } from './core/museum';
import { BiomeType, DirtMaterial, ArtifactData, CollectedArtifact } from '../shared/types/game';
import { saveDiscoveredArtifact } from './core/artifact-discovery';
import { getPlayerMuseum, sortArtifacts, filterArtifacts } from './core/museum-data';
import { getArtifactById } from './core/artifact-db';
import { SaveArtifactRequest } from '../shared/types/artifact';

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

// Dig site endpoints
router.get('/api/digsite/:postId', async (req, res): Promise<void> => {
  try {
    const { postId } = req.params;

    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    // Check if dig site data already exists
    let digSiteData = await getDigSiteData(postId);

    if (!digSiteData) {
      // Get the target subreddit from Redis (set during post creation)
      const storedTarget = await redis.get(`digsite:${postId}:target`);
      const targetSubreddit = storedTarget || 'AskReddit'; // Fallback
      console.log(`Generating dig site for r/${targetSubreddit}`);
      
      const theme = await getSubredditTheme(targetSubreddit);
      
      // Generate random biome
      const biomes = [BiomeType.GRASS, BiomeType.ROCK, BiomeType.SAND, BiomeType.SWAMP];
      const biome = biomes[Math.floor(Math.random() * biomes.length)]!;
      
      // Generate random dirt materials (2-3 types)
      const allMaterials = [DirtMaterial.SOIL, DirtMaterial.CLAY, DirtMaterial.GRAVEL, DirtMaterial.MUD];
      const numMaterials = 2 + Math.floor(Math.random() * 2);
      const dirtMaterials: DirtMaterial[] = [];
      for (let i = 0; i < numMaterials; i++) {
        const material = allMaterials[Math.floor(Math.random() * allMaterials.length)]!;
        if (!dirtMaterials.includes(material)) {
          dirtMaterials.push(material);
        }
      }
      
      // Generate artifact (5% chance for relic, 95% for post)
      const isRelic = Math.random() < 0.05;
      let artifact: ArtifactData;
      
      if (isRelic) {
        artifact = {
          type: 'subreddit_relic',
          position: {
            x: 30 + Math.floor(Math.random() * 40),
            y: 30 + Math.floor(Math.random() * 40),
          },
          depth: 40 + Math.floor(Math.random() * 20),
          width: 20,
          height: 20,
          relic: theme,
        };
      } else {
        const post = await fetchHistoricalPost(targetSubreddit);
        if (!post) {
          // Fallback if no post found
          res.status(500).json({
            status: 'error',
            message: 'Failed to fetch historical post for dig site',
          });
          return;
        }
        artifact = {
          type: 'post',
          position: {
            x: 30 + Math.floor(Math.random() * 40),
            y: 30 + Math.floor(Math.random() * 40),
          },
          depth: 40 + Math.floor(Math.random() * 20),
          width: 25,
          height: 15,
          post,
        };
      }
      
      const communityStats = await getCommunityStats(postId);
      
      digSiteData = {
        postId,
        targetSubreddit,
        biome,
        dirtMaterials,
        borderColor: theme.primaryColor,
        artifact,
        communityStats,
        ...(theme.iconUrl && { subredditIconUrl: theme.iconUrl }),
      };
    }

    res.json(digSiteData);
  } catch (error) {
    console.error('Error in /api/digsite/:postId:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to fetch dig site data',
    });
  }
});

router.post('/api/digsite/create', async (req, res): Promise<void> => {
  try {
    const { targetSubreddit } = req.body;

    if (!targetSubreddit) {
      res.status(400).json({
        status: 'error',
        message: 'targetSubreddit is required',
      });
      return;
    }

    // Create a new TypeA post for this dig site
    const post = await createPostA();
    
    // Store the target subreddit for this post
    await redis.set(`digsite:${post.id}:target`, targetSubreddit);
    
    // Initialize community stats
    await redis.set(`digsite:${post.id}:stats`, JSON.stringify({
      artifactsFound: 0,
      artifactsBroken: 0,
    }));

    res.json({
      success: true,
      postId: post.id,
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error('Error creating dig site:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to create dig site',
    });
  }
});

router.post('/api/stats/update', async (req, res): Promise<void> => {
  try {
    const { postId, action } = req.body;
    const username = await reddit.getCurrentUsername();

    if (!postId || !action) {
      res.status(400).json({
        status: 'error',
        message: 'postId and action are required',
      });
      return;
    }

    if (action !== 'found' && action !== 'broken') {
      res.status(400).json({
        status: 'error',
        message: 'action must be "found" or "broken"',
      });
      return;
    }

    // Update community stats (Redis)
    const communityStats = await updateCommunityStats(postId, action);
    
    // Also update postData with latest community stats
    try {
      const post = await reddit.getPostById(postId);
      const existing = (context.postId === postId && (context.postData as any)) || {};
      await post.setPostData({
        ...existing,
        communityStats,
        lastUpdatedAt: Date.now(),
      });
    } catch (pdErr) {
      console.warn('Failed to update postData for stats:', pdErr);
      // non-fatal
    }
    
    // Update player stats
    const userId = username || 'anonymous';
    const playerStats = await getPlayerStats(userId);

    res.json({
      success: true,
      communityStats,
      playerStats: {
        artifactsFound: playerStats.artifactsFound,
        artifactsBroken: playerStats.artifactsBroken,
      },
    });
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to update stats',
    });
  }
});

// Update viewer info on a post (e.g., Type B splash shows current viewing user)
router.post('/api/postdata/update-viewer', async (req, res): Promise<void> => {
  try {
    const { postId } = req.body as { postId?: string };
    const viewingUser = (await reddit.getCurrentUsername()) || 'anonymous';

    if (!postId) {
      res.status(400).json({ status: 'error', message: 'postId is required' });
      return;
    }

    // Pull viewer totals from museum service
    const { getPlayerMuseum } = await import('./core/museum-data');
    const museum = await getPlayerMuseum(viewingUser);

    // Update postData
    const post = await reddit.getPostById(postId);
    const existing = (context.postId === postId && (context.postData as any)) || {} as any;

    await post.setPostData({
      ...existing,
      viewingUser,
      viewingTotals: {
        totalFound: museum.stats.totalFound,
        totalBroken: museum.stats.totalBroken,
      },
      lastUpdatedAt: Date.now(),
    });

    res.json({
      success: true,
      viewingUser,
      viewingTotals: museum.stats,
    });
  } catch (error) {
    console.error('Error updating viewer postData:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to update viewer postData',
    });
  }
});

// Artifact persistence endpoints
router.post('/api/artifact/save', async (req, res): Promise<void> => {
  try {
    const username = await reddit.getCurrentUsername();
    const userId = username || 'anonymous';
    
    const saveRequest: SaveArtifactRequest = {
      userId,
      artifactData: req.body.artifactData,
      sourceDigSite: req.body.sourceDigSite,
      isBroken: req.body.isBroken || false,
    };

    if (!saveRequest.artifactData || !saveRequest.sourceDigSite) {
      res.status(400).json({
        status: 'error',
        message: 'artifactData and sourceDigSite are required',
      });
      return;
    }

    const result = await saveDiscoveredArtifact(saveRequest);
    res.json(result);
  } catch (error) {
    console.error('Error saving artifact:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to save artifact',
    });
  }
});

router.get('/api/artifact/:artifactId', async (req, res): Promise<void> => {
  try {
    const { artifactId } = req.params;

    if (!artifactId) {
      res.status(400).json({
        status: 'error',
        message: 'artifactId is required',
      });
      return;
    }

    const artifact = await getArtifactById(artifactId);
    
    if (!artifact) {
      res.status(404).json({
        status: 'error',
        message: 'Artifact not found',
      });
      return;
    }

    res.json(artifact);
  } catch (error) {
    console.error('Error fetching artifact:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to fetch artifact',
    });
  }
});

// Museum endpoints (updated to use new artifact persistence system)
router.get('/api/museum/:userId', async (req, res): Promise<void> => {
  try {
    const { userId } = req.params;
    const sortBy = (req.query.sortBy as 'date' | 'rarity' | 'subreddit') || 'date';
    const includeBroken = req.query.includeBroken !== 'false';

    if (!userId) {
      res.status(400).json({
        status: 'error',
        message: 'userId is required',
      });
      return;
    }

    // Get museum data with full artifact details
    const museumData = await getPlayerMuseum(userId);
    
    // Filter artifacts
    let artifacts = filterArtifacts(museumData.artifacts, includeBroken);
    
    // Sort artifacts
    artifacts = sortArtifacts(artifacts, sortBy);

    res.json({
      userId: museumData.userId,
      artifacts,
      stats: museumData.stats,
    });
  } catch (error) {
    console.error('Error fetching museum data:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to fetch museum data',
    });
  }
});

router.post('/api/museum/create', async (_req, res): Promise<void> => {
  try {
    const username = await reddit.getCurrentUsername();
    const userId = username || 'anonymous';

    // Create a new TypeB post for this museum
    const post = await createPostB();
    
    // Initialize player stats if they don't exist
    await getPlayerStats(userId);

    res.json({
      success: true,
      postId: post.id,
      userId,
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error('Error creating museum:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to create museum',
    });
  }
});

router.post('/api/museum/add-artifact', async (req, res): Promise<void> => {
  try {
    const { artifactData, sourceDigSite, isBroken } = req.body;
    const username = await reddit.getCurrentUsername();
    const userId = username || 'anonymous';

    if (!artifactData || !sourceDigSite) {
      res.status(400).json({
        status: 'error',
        message: 'artifactData and sourceDigSite are required',
      });
      return;
    }

    const collectedArtifact: CollectedArtifact = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: artifactData.type,
      discoveredAt: Date.now(),
      sourceDigSite,
      isBroken: isBroken || false,
      post: artifactData.post,
      relic: artifactData.relic,
    };

    const updatedStats = await addArtifactToMuseum(userId, collectedArtifact);
    
    // If it's a subreddit relic, unlock the subreddit
    if (artifactData.type === 'subreddit_relic' && artifactData.relic) {
      await unlockSubreddit(userId, artifactData.relic.subredditName);
    }

    res.json({
      success: true,
      museum: updatedStats,
    });
  } catch (error) {
    console.error('Error adding artifact to museum:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to add artifact',
    });
  }
});

// Relic discovery endpoint
router.post('/api/relic/claim', async (req, res): Promise<void> => {
  try {
    const { subredditName, sourcePostId } = req.body;
    const username = await reddit.getCurrentUsername();
    const userId = username || 'anonymous';

    if (!subredditName || !sourcePostId) {
      res.status(400).json({
        status: 'error',
        message: 'subredditName and sourcePostId are required',
      });
      return;
    }

    // Unlock the subreddit for the player
    await unlockSubreddit(userId, subredditName);
    
    // Post a comment on the source dig site announcing the discovery
    try {
      await reddit.submitComment({
        id: sourcePostId,
        text: `🎉 ${username || 'A player'} discovered the r/${subredditName} relic! A new dig site has been unlocked!`,
      });
    } catch (commentError) {
      console.error('Failed to post discovery comment:', commentError);
      // Continue even if comment fails
    }
    
    // Create a new dig site post for the discovered subreddit
    const newDigSite = await createPostA();
    await redis.set(`digsite:${newDigSite.id}:target`, subredditName);
    await redis.set(`digsite:${newDigSite.id}:stats`, JSON.stringify({
      artifactsFound: 0,
      artifactsBroken: 0,
    }));

    res.json({
      success: true,
      newDigSiteId: newDigSite.id,
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${newDigSite.id}`,
    });
  } catch (error) {
    console.error('Error claiming relic:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to claim relic',
    });
  }
});

// Get recommended subreddits for the player
router.get('/api/recommended-subreddits', async (req, res): Promise<void> => {
  try {
    const count = parseInt(req.query.count as string) || 5;
    const weight = parseFloat(req.query.weight as string) || 0.6;
    
    const subreddits = await getRecommendedSubreddits(count, weight);
    
    res.json({
      success: true,
      subreddits,
    });
  } catch (error) {
    console.error('Error getting recommended subreddits:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to get recommendations',
    });
  }
});

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    // Create a default dig site with dynamic subreddit selection on install
    const post = await createPostA();

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
    // Use dynamic subreddit selection for the legacy menu action
    const post = await createPostA();

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

router.post('/internal/menu/create-post-a', async (req, res): Promise<void> => {
  try {
    // Allow specifying target subreddit, or use dynamic selection
    const targetSubreddit = (req.body as any)?.targetSubreddit;
    const post = await createPostA(targetSubreddit);

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
