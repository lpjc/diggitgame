import { redis } from '@devvit/web/server';
import {
  PlayerArtifactCollection,
  PlayerArtifactReference,
} from '../../shared/types/artifact';

const PLAYER_ARTIFACTS_PREFIX = 'player:';
const PLAYER_ARTIFACTS_SUFFIX = ':artifacts';

/**
 * Get player's artifact collection
 */
export async function getPlayerCollection(userId: string): Promise<PlayerArtifactCollection> {
  const key = `${PLAYER_ARTIFACTS_PREFIX}${userId}${PLAYER_ARTIFACTS_SUFFIX}`;
  const data = await redis.get(key);

  if (data) {
    return JSON.parse(data);
  }

  // Initialize new collection
  return {
    userId,
    artifacts: [],
  };
}

/**
 * Add artifact reference to player's collection
 */
export async function addPlayerReference(
  userId: string,
  reference: PlayerArtifactReference
): Promise<void> {
  const collection = await getPlayerCollection(userId);
  collection.artifacts.push(reference);

  const key = `${PLAYER_ARTIFACTS_PREFIX}${userId}${PLAYER_ARTIFACTS_SUFFIX}`;
  await redis.set(key, JSON.stringify(collection));
}

/**
 * Update existing player reference
 */
export async function updatePlayerReference(
  userId: string,
  artifactId: string,
  updates: Partial<PlayerArtifactReference>
): Promise<void> {
  const collection = await getPlayerCollection(userId);
  const refIndex = collection.artifacts.findIndex((ref) => ref.artifactId === artifactId);

  if (refIndex === -1) {
    throw new Error(`Reference not found for artifact ${artifactId}`);
  }

  collection.artifacts[refIndex] = {
    ...collection.artifacts[refIndex],
    ...updates,
  };

  const key = `${PLAYER_ARTIFACTS_PREFIX}${userId}${PLAYER_ARTIFACTS_SUFFIX}`;
  await redis.set(key, JSON.stringify(collection));
}

/**
 * Check if player has collected an artifact
 */
export async function hasPlayerCollectedArtifact(
  userId: string,
  artifactId: string
): Promise<boolean> {
  const collection = await getPlayerCollection(userId);
  return collection.artifacts.some((ref) => ref.artifactId === artifactId);
}
