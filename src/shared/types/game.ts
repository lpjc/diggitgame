// Enums for game configuration
export enum BiomeType {
  GRASS = 'grass',
  ROCK = 'rock',
  SAND = 'sand',
  SWAMP = 'swamp',
}

export enum DirtMaterial {
  SOIL = 'soil',
  CLAY = 'clay',
  GRAVEL = 'gravel',
  MUD = 'mud',
}

export enum ProximityLevel {
  VERY_FAR = 'very_far', // Red
  FAR = 'far', // Orange
  CLOSE = 'close', // Yellow
  VERY_CLOSE = 'very_close', // Green
}

// Artifact types
export type ArtifactType = 'post' | 'subreddit_relic';

export type RedditPost = {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  createdAt: number;
  score: number;
  // Total number of comments at time of capture
  commentCount?: number;
  thumbnailUrl?: string | undefined;
  textSnippet?: string | undefined;
  permalink: string;
};

export type SubredditRelic = {
  subredditName: string;
  iconUrl?: string | undefined;
  primaryColor: string;
  description: string;
};

export type ArtifactData = {
  type: ArtifactType;
  position: { x: number; y: number };
  depth: number;
  width: number;
  height: number;
  post?: RedditPost;
  relic?: SubredditRelic;
};

// Trash items buried in the dig layer. Same reveal mechanics as artifacts,
// but rendered in gray and have no metadata.
export type TrashItem = {
  position: { x: number; y: number };
  depth: number;
  width: number;
  height: number;
};

export type CollectedArtifact = {
  id: string;
  type: ArtifactType;
  discoveredAt: number;
  sourceDigSite: string;
  isBroken: boolean;
  post?: RedditPost;
  relic?: SubredditRelic;
};

// Dig site data
export type DirtLayer = {
  cells: number[][]; // 2D grid of depth values (0-60)
  width: number;
  height: number;
};

export type CommunityStats = {
  artifactsFound: number;
  artifactsBroken: number;
};

export type DigSiteData = {
  postId: string;
  targetSubreddit: string;
  biome: BiomeType;
  dirtMaterials: DirtMaterial[];
  borderColor: string;
  artifact: ArtifactData;
  communityStats: CommunityStats;
  subredditIconUrl?: string | undefined;
  // Depth system fields
  depthLevel?: DepthLevel;
  nextDepth?: DepthLevel | null;
  depthProgress?: { found: number; threshold: number | null };
};

// Player/Museum data
export type PlayerStats = {
  userId: string;
  artifactsFound: number;
  artifactsBroken: number;
  collectedArtifacts: CollectedArtifact[];
  unlockedSubreddits: string[];
};

// Game state
export type GamePhase = 'splash' | 'playing' | 'discovered' | 'museum_preview';

export type GameState = {
  phase: GamePhase;
  dirtLayer: DirtLayer;
  artifact: ArtifactData;
  trashItems: TrashItem[];
  uncoveredPercentage: number;
  isDamaged: boolean;
  isBroken: boolean;
  activeTool: 'detector' | 'shovel' | 'brush' | null;
};

// Depth system
export type DepthLevel = 'surface' | 'shallow' | 'deep' | 'deepest';
