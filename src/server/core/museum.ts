import { redis } from '@devvit/web/server';
import { PlayerStats, CollectedArtifact } from '../../shared/types/game';

const MUSEUM_PREFIX = 'museum:';

/**
 * Get player's museum data
 */
export async function getPlayerStats(userId: string): Promise<PlayerStats> {
  const key = `${MUSEUM_PREFIX}${userId}`;
  const data = await redis.get(key);

  if (data) {
    return JSON.parse(data);
  }

  // Initialize new player stats
  return {
    userId,
    artifactsFound: 0,
    artifactsBroken: 0,
    collectedArtifacts: [],
    unlockedSubreddits: [],
  };
}

/**
 * Store player's museum data
 */
export async function storePlayerStats(stats: PlayerStats): Promise<void> {
  const key = `${MUSEUM_PREFIX}${stats.userId}`;
  await redis.set(key, JSON.stringify(stats));
}

/**
 * Add artifact to player's collection
 */
export async function addArtifactToMuseum(
  userId: string,
  artifact: CollectedArtifact
): Promise<PlayerStats> {
  const stats = await getPlayerStats(userId);

  stats.collectedArtifacts.push(artifact);

  if (artifact.isBroken) {
    stats.artifactsBroken++;
  } else {
    stats.artifactsFound++;
  }

  await storePlayerStats(stats);
  return stats;
}

/**
 * Unlock a subreddit for a player
 */
export async function unlockSubreddit(userId: string, subredditName: string): Promise<PlayerStats> {
  const stats = await getPlayerStats(userId);

  if (!stats.unlockedSubreddits.includes(subredditName)) {
    stats.unlockedSubreddits.push(subredditName);
    await storePlayerStats(stats);
  }

  return stats;
}

/**
 * Check if player has unlocked a subreddit
 */
export async function hasUnlockedSubreddit(
  userId: string,
  subredditName: string
): Promise<boolean> {
  const stats = await getPlayerStats(userId);
  return stats.unlockedSubreddits.includes(subredditName);
}

/**
 * Get all collected artifacts for a player
 */
export async function getCollectedArtifacts(userId: string): Promise<CollectedArtifact[]> {
  const stats = await getPlayerStats(userId);
  return stats.collectedArtifacts;
}

/**
 * Get unlocked subreddits for a player
 */
export async function getUnlockedSubreddits(userId: string): Promise<string[]> {
  const stats = await getPlayerStats(userId);
  return stats.unlockedSubreddits;
}
