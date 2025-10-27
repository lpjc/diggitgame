import {
  generateArtifactId,
  getArtifactById,
  createCentralizedArtifact,
  incrementFoundByCount,
} from './artifact-db';
import { addPlayerReference, hasPlayerCollectedArtifact } from './player-references';
import { updateCommunityStats, checkAndUnlockNextDepth } from './digsite';
import { updatePlayerStatsCounters } from './museum';
import {
  SaveArtifactRequest,
  SaveArtifactResponse,
  RarityTier,
} from '../../shared/types/artifact';

/**
 * Calculate rarity tier based on foundByCount
 */
export function getRarityTier(foundByCount: number): RarityTier {
  if (foundByCount === 1) return 'unique';
  if (foundByCount < 5) return 'ultra_rare';
  if (foundByCount <= 20) return 'rare';
  if (foundByCount <= 100) return 'uncommon';
  return 'common';
}

/**
 * Process artifact discovery and save to museum
 */
export async function saveDiscoveredArtifact(
  request: SaveArtifactRequest
): Promise<SaveArtifactResponse> {
  const { userId, artifactData, sourceDigSite, isBroken } = request;

  // 1. Generate artifact ID
  const artifactId = generateArtifactId(artifactData);

  // 2. Check if artifact exists in centralized DB
  let artifact = await getArtifactById(artifactId);

  // 3. If not exists, create new artifact record with first discoverer
  if (!artifact) {
    artifact = await createCentralizedArtifact(artifactId, artifactData, userId);
  }

  if (isBroken) {
    // Broken artifacts: don't add to collection, just increment broken counter
    await incrementBrokenCounter(userId);
    await updateCommunityStats(sourceDigSite, 'broken');
    await updatePlayerStatsCounters(userId, 'broken');

    return {
      success: true,
      artifactId,
      foundByCount: artifact.foundByCount,
      rarityTier: getRarityTier(artifact.foundByCount),
    };
  }

  // 4. Increment foundByCount (only for intact artifacts)
  // Idempotency: if this user already saved this artifact, don't increment any counters again
  const alreadyCollected = await hasPlayerCollectedArtifact(userId, artifactId);
  let newFoundByCount = artifact.foundByCount;
  if (!alreadyCollected) {
    newFoundByCount = await incrementFoundByCount(artifactId);
  }

  // 5. Create player reference (only for intact artifacts); skip if already exists
  if (!alreadyCollected) {
    await addPlayerReference(userId, {
      artifactId,
      userId,
      collectedAt: Date.now(),
      isBroken: false,
      sourceDigSite,
    });
  }

  // 6. Update community stats for every intact claim (progress is community-driven)
  await updateCommunityStats(sourceDigSite, 'found');
  // Update player stats only once per unique artifact
  if (!alreadyCollected) {
    await updatePlayerStatsCounters(userId, 'found');
  }
  // Depth progression: check unlock after any found event
  await checkAndUnlockNextDepth(sourceDigSite);

  // 7. Calculate rarity tier
  const rarityTier = getRarityTier(newFoundByCount);

  return {
    success: true,
    artifactId,
    foundByCount: newFoundByCount,
    rarityTier,
  };
}

/**
 * Increment broken artifacts counter for a player
 */
async function incrementBrokenCounter(userId: string): Promise<void> {
  const { redis } = await import('@devvit/web/server');
  const key = `player:${userId}:broken_count`;
  const current = await redis.get(key);
  const count = current ? parseInt(current) : 0;
  await redis.set(key, (count + 1).toString());
}

/**
 * Get broken artifacts count for a player
 */
export async function getBrokenCount(userId: string): Promise<number> {
  const { redis } = await import('@devvit/web/server');
  const key = `player:${userId}:broken_count`;
  const count = await redis.get(key);
  return count ? parseInt(count) : 0;
}
