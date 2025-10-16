import {
  generateArtifactId,
  getArtifactById,
  createCentralizedArtifact,
  incrementFoundByCount,
} from './artifact-db';
import { addPlayerReference } from './player-references';
import { updateCommunityStats } from './digsite';
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

  // 3. If not exists, create new artifact record
  if (!artifact) {
    artifact = await createCentralizedArtifact(artifactId, artifactData);
  }

  // 4. Increment foundByCount
  const newFoundByCount = await incrementFoundByCount(artifactId);

  // 5. Create player reference
  await addPlayerReference(userId, {
    artifactId,
    userId,
    collectedAt: Date.now(),
    isBroken,
    sourceDigSite,
  });

  // 6. Update stats
  await updateCommunityStats(sourceDigSite, isBroken ? 'broken' : 'found');
  await updatePlayerStatsCounters(userId, isBroken ? 'broken' : 'found');

  // 7. Calculate rarity tier
  const rarityTier = getRarityTier(newFoundByCount);

  return {
    success: true,
    artifactId,
    foundByCount: newFoundByCount,
    rarityTier,
  };
}
