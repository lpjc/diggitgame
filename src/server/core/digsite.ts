import { redis } from '@devvit/web/server';
import { DigSiteData, CommunityStats, ArtifactData } from '../../shared/types/game';

const DIGSITE_PREFIX = 'digsite:';
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
