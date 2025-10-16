import { RedditPost, SubredditRelic } from './game';

// Centralized artifact stored once in the database
export interface CentralizedArtifact {
  artifactId: string;
  type: 'post' | 'subreddit_relic';
  subredditOfOrigin: string;
  foundByCount: number;
  firstDiscoveredAt: number;
  redditPost?: RedditPost;
  subredditRelic?: SubredditRelic;
}

// Player's reference to an artifact
export interface PlayerArtifactReference {
  artifactId: string;
  userId: string;
  collectedAt: number;
  isBroken: boolean;
  sourceDigSite: string;
}

// Player's full collection
export interface PlayerArtifactCollection {
  userId: string;
  artifacts: PlayerArtifactReference[];
}

// Artifact with player-specific data (for museum display)
export interface ArtifactWithPlayerData extends CentralizedArtifact {
  collectedAt: number;
  isBroken: boolean;
  sourceDigSite: string;
}

// Museum data response
export interface MuseumData {
  userId: string;
  artifacts: ArtifactWithPlayerData[];
  stats: {
    totalFound: number;
    totalBroken: number;
    uniqueSubreddits: number;
  };
}

// Rarity tiers
export type RarityTier = 'unique' | 'ultra_rare' | 'rare' | 'uncommon' | 'common';

// API request/response types
export interface SaveArtifactRequest {
  userId: string;
  artifactData: {
    type: 'post' | 'subreddit_relic';
    redditData?: RedditPost;
    relicData?: SubredditRelic;
  };
  sourceDigSite: string;
  isBroken: boolean;
}

export interface SaveArtifactResponse {
  success: boolean;
  artifactId: string;
  foundByCount: number;
  rarityTier: RarityTier;
}

export interface GetMuseumResponse {
  userId: string;
  artifacts: ArtifactWithPlayerData[];
  stats: {
    totalFound: number;
    totalBroken: number;
    uniqueSubreddits: number;
  };
}
