import { redis, reddit, context } from '@devvit/web/server';
import { DigSiteData, CommunityStats, ArtifactData, DepthLevel } from '../../shared/types/game';
import { createPostA } from './post';

const DIGSITE_PREFIX = 'digsite:';
const DIGSITE_INDEX_PREFIX = 'digsite:index:'; // digsite:index:r:{subreddit}:depth:{depth} -> postId
const ARTIFACT_CACHE_PREFIX = 'artifact:cache:';
const ARTIFACT_CACHE_TTL = 3600; // 1 hour in seconds

/**
 * Store dig site data in Redis
 */
export async function storeDigSiteData(postId: string, data: DigSiteData): Promise<void> {
  const key = `${DIGSITE_PREFIX}${postId}`;
  await redis.set(key, JSON.stringify(data));
}

/**
 * Retrieve dig site data from Redis
 */
export async function getDigSiteData(postId: string): Promise<DigSiteData | null> {
  const key = `${DIGSITE_PREFIX}${postId}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Update community stats for a dig site
 */
export async function updateCommunityStats(
  postId: string,
  action: 'found' | 'broken'
): Promise<CommunityStats> {
  const key = `${DIGSITE_PREFIX}${postId}:stats`;
  const statsData = await redis.get(key);
  
  let stats: CommunityStats = statsData
    ? JSON.parse(statsData)
    : { artifactsFound: 0, artifactsBroken: 0 };

  if (action === 'found') {
    stats.artifactsFound++;
  } else if (action === 'broken') {
    stats.artifactsBroken++;
  }

  await redis.set(key, JSON.stringify(stats));
  return stats;
}

/**
 * Get community stats for a dig site
 */
export async function getCommunityStats(postId: string): Promise<CommunityStats> {
  const key = `${DIGSITE_PREFIX}${postId}:stats`;
  const statsData = await redis.get(key);
  
  return statsData
    ? JSON.parse(statsData)
    : { artifactsFound: 0, artifactsBroken: 0 };
}

/**
 * Cache artifact data for a session (1 hour TTL)
 */
export async function cacheArtifact(
  sessionId: string,
  artifact: ArtifactData
): Promise<void> {
  const key = `${ARTIFACT_CACHE_PREFIX}${sessionId}`;
  await redis.set(key, JSON.stringify(artifact), { expiration: new Date(Date.now() + ARTIFACT_CACHE_TTL * 1000) });
}

/**
 * Retrieve cached artifact data
 */
export async function getCachedArtifact(sessionId: string): Promise<ArtifactData | null> {
  const key = `${ARTIFACT_CACHE_PREFIX}${sessionId}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Get target subreddit for a dig site
 */
export async function getTargetSubreddit(postId: string): Promise<string | null> {
  const key = `${DIGSITE_PREFIX}${postId}:target`;
  const result = await redis.get(key);
  return result || null;
}

/**
 * Store target subreddit for a dig site
 */
export async function storeTargetSubreddit(postId: string, subreddit: string): Promise<void> {
  const key = `${DIGSITE_PREFIX}${postId}:target`;
  await redis.set(key, subreddit);
}

// Depth helpers
export function getDepthIndex(depth: DepthLevel): number {
  switch (depth) {
    case 'surface': return 0;
    case 'shallow': return 1;
    case 'deep': return 2;
    case 'deepest': return 3;
    default: return 0;
  }
}

export function getNextDepth(depth: DepthLevel): DepthLevel | null {
  if (depth === 'surface') return 'shallow';
  if (depth === 'shallow') return 'deep';
  if (depth === 'deep') return 'deepest';
  return null;
}

export function getThreshold(depth: DepthLevel): number | null {
  if (depth === 'surface') return 50;
  if (depth === 'shallow') return 500;
  if (depth === 'deep') return 5000;
  return null; // deepest
}

export async function getDepthForPost(postId: string): Promise<DepthLevel | null> {
  const key = `${DIGSITE_PREFIX}${postId}:meta`;
  const data = await redis.get(key);
  if (!data) return null;
  try {
    const meta = JSON.parse(data);
    return (meta.depthLevel as DepthLevel) || 'surface';
  } catch {
    return null;
  }
}

export async function setPostMeta(postId: string, meta: { targetSubreddit: string; depthLevel: DepthLevel; createdAt: number }): Promise<void> {
  const key = `${DIGSITE_PREFIX}${postId}:meta`;
  await redis.set(key, JSON.stringify(meta));
}

export async function getOrCreateDigSiteForSubredditDepth(subreddit: string, depth: DepthLevel): Promise<{ postId: string; created: boolean }> {
  const indexKey = `${DIGSITE_INDEX_PREFIX}r:${subreddit.toLowerCase()}:depth:${depth}`;
  const existing = await redis.get(indexKey);
  if (existing) return { postId: existing, created: false };

  // Create a new TypeA post (uses current subreddit context for where the post is created)
  const post = await createPostA(undefined, depth);
  // Map to target subreddit and meta
  await redis.set(`${DIGSITE_PREFIX}${post.id}:target`, subreddit);
  await redis.set(
    `${DIGSITE_PREFIX}${post.id}:stats`,
    JSON.stringify({ artifactsFound: 0, artifactsBroken: 0 })
  );
  await setPostMeta(post.id, { targetSubreddit: subreddit, depthLevel: depth, createdAt: Date.now() });
  await redis.set(indexKey, post.id);
  return { postId: post.id, created: true };
}

export async function checkAndUnlockNextDepth(postId: string): Promise<void> {
  try {
    const [metaRaw, statsRaw] = await Promise.all([
      redis.get(`${DIGSITE_PREFIX}${postId}:meta`),
      redis.get(`${DIGSITE_PREFIX}${postId}:stats`),
    ]);
    if (!metaRaw || !statsRaw) return;
    const meta = JSON.parse(metaRaw) as { targetSubreddit: string; depthLevel: DepthLevel };
    const stats = JSON.parse(statsRaw) as CommunityStats;
    const threshold = getThreshold(meta.depthLevel);
    const next = getNextDepth(meta.depthLevel);
    if (!next || threshold == null) return;
    if (stats.artifactsFound < threshold) return;

    // If next depth already exists, do nothing
    const indexKey = `${DIGSITE_INDEX_PREFIX}r:${meta.targetSubreddit.toLowerCase()}:depth:${next}`;
    const exists = await redis.get(indexKey);
    if (exists) return;

    const { postId: newPostId } = await getOrCreateDigSiteForSubredditDepth(meta.targetSubreddit, next);

    // Optional: comment on current post as APP
    try {
      const post = await reddit.getPostById(postId as any);
      const link = `https://reddit.com/r/${context.subredditName}/comments/${newPostId}`;
      if (typeof (post as any).submitComment === 'function') {
        await (post as any).submitComment({ text: `⛏️ Depth unlocked: ${next}! Join the next dig: ${link}` });
      }
    } catch {}
  } catch (e) {
    console.warn('checkAndUnlockNextDepth failed', e);
  }
}
