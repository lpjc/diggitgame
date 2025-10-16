import { getPlayerCollection } from './player-references';
import { getArtifactById } from './artifact-db';
import {
  MuseumData,
  ArtifactWithPlayerData,
} from '../../shared/types/artifact';

/**
 * Get player's full museum collection with artifact details
 */
export async function getPlayerMuseum(userId: string): Promise<MuseumData> {
  // 1. Fetch player's artifact references
  const collection = await getPlayerCollection(userId);

  // 2. Fetch full artifact details for each reference
  const artifactsWithDetails = await Promise.all(
    collection.artifacts.map(async (ref) => {
      try {
        const artifact = await getArtifactById(ref.artifactId);
        if (!artifact) {
          console.error(`Missing artifact: ${ref.artifactId} for user ${userId}`);
          return null;
        }
        return {
          ...artifact,
          collectedAt: ref.collectedAt,
          isBroken: ref.isBroken,
          sourceDigSite: ref.sourceDigSite,
        } as ArtifactWithPlayerData;
      } catch (error) {
        console.error(`Error fetching artifact ${ref.artifactId}:`, error);
        return null;
      }
    })
  );

  // Filter out null values and broken artifacts (broken artifacts shouldn't be in collection)
  const validArtifacts = artifactsWithDetails.filter(
    (a): a is ArtifactWithPlayerData => a !== null && !a.isBroken
  );

  // Get broken count from separate counter
  const { getBrokenCount } = await import('./artifact-discovery');
  const brokenCount = await getBrokenCount(userId);

  // Calculate first discoveries
  const firstDiscoveries = validArtifacts.filter(
    (a) => a.firstDiscoveredBy === userId
  ).length;

  // 3. Calculate summary stats
  const stats = {
    totalFound: validArtifacts.length,
    totalBroken: brokenCount,
    uniqueSubreddits: new Set(validArtifacts.map((a) => a.subredditOfOrigin)).size,
    firstDiscoveries,
  };

  return {
    userId,
    artifacts: validArtifacts,
    stats,
  };
}

/**
 * Sort artifacts by specified criteria
 */
export function sortArtifacts(
  artifacts: ArtifactWithPlayerData[],
  sortBy: 'date' | 'rarity' | 'subreddit'
): ArtifactWithPlayerData[] {
  const sorted = [...artifacts];

  switch (sortBy) {
    case 'date':
      return sorted.sort((a, b) => b.collectedAt - a.collectedAt);

    case 'rarity':
      return sorted.sort((a, b) => a.foundByCount - b.foundByCount);

    case 'subreddit':
      return sorted.sort((a, b) => a.subredditOfOrigin.localeCompare(b.subredditOfOrigin));

    default:
      return sorted;
  }
}

/**
 * Filter artifacts by broken status
 */
export function filterArtifacts(
  artifacts: ArtifactWithPlayerData[],
  includeBroken: boolean
): ArtifactWithPlayerData[] {
  if (includeBroken) {
    return artifacts;
  }
  return artifacts.filter((a) => !a.isBroken);
}
