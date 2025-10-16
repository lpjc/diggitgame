import { redis } from '@devvit/web/server';
import { CentralizedArtifact } from '../../shared/types/artifact';
import { RedditPost, SubredditRelic } from '../../shared/types/game';

const ARTIFACT_PREFIX = 'artifact:';

/**
 * Generate unique artifact ID from Reddit post ID or subreddit name
 */
export function generateArtifactId(artifactData: {
  type: 'post' | 'subreddit_relic';
  redditData?: RedditPost;
  relicData?: SubredditRelic;
}): string {
  if (artifactData.type === 'post' && artifactData.redditData) {
    return `post_${artifactData.redditData.id}`;
  } else if (artifactData.type === 'subreddit_relic' && artifactData.relicData) {
    return `relic_${artifactData.relicData.subredditName}`;
  }
  throw new Error('Invalid artifact data for ID generation');
}

/**
 * Retrieve artifact from centralized database
 */
export async function getArtifactById(artifactId: string): Promise<CentralizedArtifact | null> {
  const key = `${ARTIFACT_PREFIX}${artifactId}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

/**
 * Create new artifact in centralized database
 */
export async function createCentralizedArtifact(
  artifactId: string,
  artifactData: {
    type: 'post' | 'subreddit_relic';
    redditData?: RedditPost;
    relicData?: SubredditRelic;
  }
): Promise<CentralizedArtifact> {
  const artifact: CentralizedArtifact = {
    artifactId,
    type: artifactData.type,
    subredditOfOrigin:
      artifactData.type === 'post' && artifactData.redditData
        ? artifactData.redditData.subreddit
        : artifactData.relicData?.subredditName || 'unknown',
    foundByCount: 0,
    firstDiscoveredAt: Date.now(),
  };

  if (artifactData.type === 'post' && artifactData.redditData) {
    artifact.redditPost = artifactData.redditData;
  } else if (artifactData.type === 'subreddit_relic' && artifactData.relicData) {
    artifact.subredditRelic = artifactData.relicData;
  }

  const key = `${ARTIFACT_PREFIX}${artifactId}`;
  await redis.set(key, JSON.stringify(artifact));
  
  return artifact;
}

/**
 * Increment foundByCount atomically
 */
export async function incrementFoundByCount(artifactId: string): Promise<number> {
  const artifact = await getArtifactById(artifactId);
  if (!artifact) {
    throw new Error(`Artifact not found: ${artifactId}`);
  }

  artifact.foundByCount++;
  const key = `${ARTIFACT_PREFIX}${artifactId}`;
  await redis.set(key, JSON.stringify(artifact));
  
  return artifact.foundByCount;
}

/**
 * Check if artifact exists in database
 */
export async function artifactExists(artifactId: string): Promise<boolean> {
  const artifact = await getArtifactById(artifactId);
  return artifact !== null;
}
