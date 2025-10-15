# Design Document

## Overview

Subreddit Excavator is a mobile-first archaeology game built on Devvit Web that transforms Reddit's history into an interactive excavation experience. The game uses two distinct post types: **TypeA (Dig Site Posts)** for gameplay and **TypeB (Museum Posts)** for personal collections. Each post displays a splash screen entry point within the webview that transitions to either the excavation game or museum gallery. Players use touch-based tools to uncover historical posts from specific subreddits, creating a tactile, rewarding experience optimized for 1-2 minute play sessions.

## Architecture

### High-Level System Architecture

```mermaid
graph TB
    subgraph "Reddit Feed"
        TypeAPost[TypeA: Dig Site Post]
        TypeBPost[TypeB: Museum Post]
    end
    
    subgraph "Devvit Server"
        API[Express API Endpoints]
        Redis[(Redis Storage)]
        RedditAPI[Reddit API Client]
    end
    
    subgraph "TypeA Webview (Excavation Game)"
        SplashA[Splash Screen A]
        GameEngine[Game Engine]
        DigScene[Dig Scene Renderer]
        ToolSystem[Tool System]
        ArtifactSystem[Artifact System]
    end
    
    subgraph "TypeB Webview (Museum)"
        SplashB[Splash Screen B]
        MuseumUI[Museum UI]
        ArtifactGallery[Artifact Gallery]
    end
    
    TypeAPost -->|Opens Webview| SplashA
    TypeBPost -->|Opens Webview| SplashB
    
    SplashA -->|Click "Enter Digsite"| GameEngine
    SplashB -->|Click "View Museum"| MuseumUI
    
    GameEngine <-->|API Calls| API
    MuseumUI <-->|API Calls| API
    API <--> Redis
    API <--> RedditAPI
    
    GameEngine --> DigScene
    GameEngine --> ToolSystem
    GameEngine --> ArtifactSystem
    MuseumUI --> ArtifactGallery
```

### Post Type Architecture

**TypeA: Dig Site Post (Dynamic, Gameplay-Focused)**
- Any subreddit can be the target of excavation
- Themed based on target subreddit (colors, biome)
- Shows community stats (artifacts found/broken at this site)
- Splash screen displays: target subreddit, stats, "Enter Digsite" button
- Opens webview with canvas-based excavation game
- Multiple TypeA posts can exist for different subreddits

**TypeB: Museum Post (Personal, Collection-Focused)**
- One per player (personal museum)
- Shows player's discovered artifacts and progression
- Splash screen displays: player stats, highlights, "View Museum" button
- Opens webview with artifact gallery and collection management
- Persistent across all dig sites

**Webview Architecture (React + Canvas)**
- Splash screen serves as entry point within webview
- Full-screen immersive experience after splash transition
- Canvas-based 2D rendering for dig scene (TypeA)
- React components for UI overlays and museum (TypeB)
- Real-time interaction with touch events
- Communicates with server via REST API

## Components and Interfaces

### 1. Splash Screen Components (React)

**TypeA Splash Screen (Dig Site Entry)**

**Purpose:** Entry point that entices players to start excavation

**Structure:**
```typescript
interface DigSitePostData {
  postType: 'typeA';
  postId: string;
  targetSubreddit: string;        // e.g., "aww", "denmark"
  artifactsFound: number;          // Community total
  artifactsBroken: number;         // Community total
  subredditTheme: {
    primaryColor: string;          // Extracted from subreddit
    iconUrl?: string;
    biomeType: 'grass' | 'rock' | 'sand' | 'swamp';
  };
}
```

**Rendering Logic:**
- Fetch `DigSitePostData` from server API using post ID
- Display target subreddit name prominently with theming
- Show community stats in readable format ("X artifacts found, Y broken")
- Render "Enter Digsite" button that transitions to game
- Apply subreddit-based visual theming (colors, biome preview)

**TypeB Splash Screen (Museum Entry)**

**Purpose:** Entry point to player's personal collection

**Structure:**
```typescript
interface MuseumPostData {
  postType: 'typeB';
  postId: string;
  userId: string;
  playerStats: {
    totalArtifactsFound: number;
    totalArtifactsBroken: number;
    unlockedSubreddits: number;
    recentDiscoveries: ArtifactPreview[];
  };
}
```

**Rendering Logic:**
- Fetch `MuseumPostData` from server API using user ID
- Display player's total stats and highlights
- Show preview of 3-5 recent discoveries
- Render "View Museum" button that transitions to museum
- Display progression indicators (themed sets completed, etc.)

### 2. Game Engine (TypeA Webview Core)

**Purpose:** Orchestrates all gameplay systems and manages game state

**State Management:**
```typescript
interface GameState {
  phase: 'splash' | 'playing' | 'discovered' | 'museum_preview';
  postType: 'typeA';
  digSite: DigSiteData;
  artifact: ArtifactData;
  dirtLayers: DirtLayer[][];      // 2D grid of depth values
  activeTool: 'detector' | 'shovel' | 'brush' | null;
  playerStats: PlayerStats;
}

interface DigSiteData {
  postId: string;
  targetSubreddit: string;
  biome: 'grass' | 'rock' | 'sand' | 'swamp';
  dirtMaterials: DirtMaterial[];  // 3-5 randomized materials
  borderColor: string;
  communityStats: {
    artifactsFound: number;
    artifactsBroken: number;
  };
}

interface ArtifactData {
  type: 'post' | 'subreddit_relic';
  position: { x: number; y: number };
  depth: number;                   // 40-60 units
  size: { width: number; height: number };
  uncoveredPercentage: number;
  isBroken: boolean;
  redditData?: RedditPost;
  relicData?: SubredditRelic;
}

interface PlayerStats {
  artifactsFound: number;
  artifactsBroken: number;
  collectedArtifacts: CollectedArtifact[];
  unlockedSubreddits: string[];
}
```

**Initialization Flow:**
1. Webview loads with splash screen showing post data
2. User clicks "Enter Digsite" button
3. Fetch dig site configuration from `/api/digsite/:postId`
4. Generate randomized dirt layers and artifact placement
5. Initialize canvas renderer and tool system
6. Transition from 'splash' to 'playing' phase

### 3. Dig Scene Renderer (Canvas)

**Purpose:** Renders the top-down 2D excavation area with layered dirt

**Rendering Architecture:**
```typescript
class DigSceneRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dirtTextures: Map<DirtMaterial, ImageData>;
  private particleSystem: ParticleSystem;
  
  render(gameState: GameState): void {
    this.clearCanvas();
    this.renderBiomeBorder(gameState.digSite.biome);
    this.renderDirtLayers(gameState.dirtLayers);
    this.renderArtifactSilhouette(gameState.artifact);
    this.renderParticles();
  }
  
  renderDirtLayers(layers: DirtLayer[][]): void {
    // Composite multiple dirt materials
    // Apply depth-based color darkening
    // Blend exposed vs unexposed areas
  }
  
  renderArtifactSilhouette(artifact: ArtifactData): void {
    // Only render if uncoveredPercentage > 0
    // Fade from silhouette (0%) to full clarity (100%)
    // Apply glow effect when uncoveredPercentage >= 70%
  }
}
```

**Dirt Layer System:**
- 2D grid (e.g., 100x100 cells) where each cell has a depth value (0-60)
- Depth 0 = fully excavated, Depth 60 = untouched
- Artifact occupies specific cells at depth 40-60
- Visual rendering composites 3-5 dirt textures based on depth
- Depth > 30: darker, cooler hues
- Random pebbles/fossils embedded at initialization

**Biome Border:**
- Static decorative border around dig area
- Texture based on biome type (grass/rock/sand/swamp)
- Colored using subreddit's primary color

### 4. Tool System

**Purpose:** Handles tool selection and interaction logic

**Tool Interface:**
```typescript
interface Tool {
  type: 'detector' | 'shovel' | 'brush';
  onActivate(position: Point): void;
  onUpdate(position: Point, deltaTime: number): void;
  onDeactivate(): void;
}
```

**Detector Tool:**
```typescript
class DetectorTool implements Tool {
  private pingInterval: number = 1000; // ms
  private lastPingTime: number = 0;
  
  onUpdate(position: Point, deltaTime: number): void {
    this.lastPingTime += deltaTime;
    
    if (this.lastPingTime >= this.pingInterval) {
      const distance = this.calculateDistanceToArtifact(position);
      const proximity = this.getProximityLevel(distance);
      
      this.renderDetectorIcon(position);
      this.playPingEffect(proximity);
      
      this.lastPingTime = 0;
    }
  }
  
  private getProximityLevel(distance: number): ProximityLevel {
    if (distance > 50) return 'far';      // Red
    if (distance > 30) return 'closer';   // Orange
    if (distance > 15) return 'near';     // Yellow
    return 'very_close';                  // Green
  }
  
  private playPingEffect(proximity: ProximityLevel): void {
    // Flash color on canvas
    // Play beep sound with pitch based on proximity
  }
}
```

**Shovel Tool:**
```typescript
class ShovelTool implements Tool {
  private cooldown: number = 500; // ms
  private lastDigTime: number = 0;
  private digRadius: number = 15; // pixels
  private digDepth: number = 10;  // depth units
  
  onActivate(position: Point): void {
    const now = Date.now();
    if (now - this.lastDigTime < this.cooldown) return;
    
    const affectedCells = this.getCellsInRadius(position, this.digRadius);
    const hitArtifact = this.checkArtifactCollision(affectedCells);
    
    if (hitArtifact) {
      if (hitArtifact.alreadyDamaged) {
        this.breakArtifact();
      } else {
        this.showCrackWarning(position);
        hitArtifact.alreadyDamaged = true;
      }
    } else {
      this.removeDirt(affectedCells, this.digDepth);
    }
    
    this.lastDigTime = now;
  }
}
```

**Brush Tool:**
```typescript
class BrushTool implements Tool {
  private brushRadius: number = 8;  // pixels
  private brushRate: number = 1;    // depth units per second
  
  onUpdate(position: Point, deltaTime: number): void {
    const affectedCells = this.getCellsInRadius(position, this.brushRadius);
    const depthToRemove = this.brushRate * (deltaTime / 1000);
    
    this.removeDirt(affectedCells, depthToRemove);
    this.playBrushSound();
    this.renderDustParticles(position);
    this.triggerHapticFeedback('light');
  }
}
```

### 5. Artifact System

**Purpose:** Manages artifact generation, uncovering logic, and discovery events

**Artifact Generation:**
```typescript
class ArtifactGenerator {
  async generateArtifact(targetSubreddit: string): Promise<ArtifactData> {
    const isRelic = Math.random() < 0.05; // 5% chance
    
    if (isRelic) {
      return this.generateSubredditRelic();
    } else {
      return this.generatePostArtifact(targetSubreddit);
    }
  }
  
  private async generatePostArtifact(subreddit: string): Promise<ArtifactData> {
    // Fetch historical post from Reddit API via server
    const post = await this.fetchHistoricalPost(subreddit);
    
    return {
      type: 'post',
      position: this.randomPosition(),
      depth: this.randomDepth(40, 60),
      size: { width: 80, height: 60 },
      uncoveredPercentage: 0,
      isBroken: false,
      redditData: post
    };
  }
  
  private async fetchHistoricalPost(subreddit: string): Promise<RedditPost> {
    // Call Reddit API via server endpoint
    // Filter for posts older than 6 months
    // Prioritize posts with engagement (upvotes, comments)
    // Return random selection from top results
  }
}
```

**Uncovering Logic:**
```typescript
class ArtifactUncoveringSystem {
  updateUncoveredPercentage(artifact: ArtifactData, dirtLayers: DirtLayer[][]): number {
    const artifactCells = this.getArtifactCells(artifact);
    let uncoveredCells = 0;
    
    for (const cell of artifactCells) {
      const depth = dirtLayers[cell.x][cell.y].depth;
      
      // Cell is "uncovered" if depth is within 8 units of artifact
      if (depth <= artifact.depth + 8) {
        uncoveredCells++;
      }
    }
    
    return (uncoveredCells / artifactCells.length) * 100;
  }
  
  checkDiscoveryThreshold(artifact: ArtifactData): boolean {
    return artifact.uncoveredPercentage >= 70;
  }
}
```

### 6. UI Layer (React Components)

**Purpose:** Renders overlays, modals, and interactive UI elements

**Tool Dock Component:**
```tsx
interface ToolDockProps {
  activeTool: Tool | null;
  onToolSelect: (tool: 'detector' | 'shovel' | 'brush') => void;
}

const ToolDock: React.FC<ToolDockProps> = ({ activeTool, onToolSelect }) => {
  return (
    <div className="tool-dock">
      <button 
        className={activeTool === 'detector' ? 'active' : ''}
        onClick={() => onToolSelect('detector')}
      >
        🧭 Detector
      </button>
      <button 
        className={activeTool === 'shovel' ? 'active' : ''}
        onClick={() => onToolSelect('shovel')}
      >
        🪓 Shovel
      </button>
      <button 
        className={activeTool === 'brush' ? 'active' : ''}
        onClick={() => onToolSelect('brush')}
      >
        🖌️ Brush
      </button>
    </div>
  );
};
```

**Discovery Modal Component:**
```tsx
interface DiscoveryModalProps {
  artifact: ArtifactData;
  onAddToMuseum: () => void;
}

const DiscoveryModal: React.FC<DiscoveryModalProps> = ({ artifact, onAddToMuseum }) => {
  if (artifact.type === 'post') {
    return (
      <div className="discovery-modal">
        <h2>You found an artifact!</h2>
        <div className="artifact-preview">
          <img src={artifact.redditData.thumbnail} />
          <h3>{artifact.redditData.title}</h3>
          <p>from r/{artifact.redditData.subreddit} • {artifact.redditData.date}</p>
        </div>
        <button onClick={onAddToMuseum}>Add to Museum</button>
      </div>
    );
  } else {
    return (
      <div className="discovery-modal relic">
        <h2>You discovered a new site!</h2>
        <div className="relic-preview">
          <img src={artifact.relicData.iconUrl} className="glow" />
          <h3>Unlock r/{artifact.relicData.subredditName}</h3>
        </div>
        <button onClick={onAddToMuseum}>Claim Relic</button>
      </div>
    );
  }
};
```

**Museum Component (TypeB):**
```tsx
interface MuseumProps {
  playerStats: PlayerStats;
  onArtifactClick: (artifact: CollectedArtifact) => void;
  onRelicClick: (subreddit: string) => void;
}

const Museum: React.FC<MuseumProps> = ({ playerStats, onArtifactClick, onRelicClick }) => {
  return (
    <div className="museum">
      <h1>Your Museum</h1>
      <div className="stats-summary">
        <p>Artifacts Found: {playerStats.artifactsFound}</p>
        <p>Artifacts Broken: {playerStats.artifactsBroken}</p>
        <p>Unlocked Subreddits: {playerStats.unlockedSubreddits.length}</p>
      </div>
      <div className="artifact-grid">
        {playerStats.collectedArtifacts.map(artifact => (
          <ArtifactTile 
            key={artifact.id}
            artifact={artifact}
            onClick={() => onArtifactClick(artifact)}
          />
        ))}
        {playerStats.unlockedSubreddits.map(subreddit => (
          <RelicTile
            key={subreddit}
            subreddit={subreddit}
            onClick={() => onRelicClick(subreddit)}
          />
        ))}
      </div>
    </div>
  );
};
```

## Data Models

### Redis Storage Schema

**TypeA: Dig Site Post Data**
```
Key: post:typeA:{postId}
Value: {
  postType: 'typeA',
  targetSubreddit: string,
  artifactsFound: number,
  artifactsBroken: number,
  createdAt: timestamp,
  createdBy: userId
}
```

**TypeB: Museum Post Data**
```
Key: post:typeB:{userId}
Value: {
  postType: 'typeB',
  postId: string,
  userId: string,
  createdAt: timestamp
}
```

**Player Museum Data:**
```
Key: player:{userId}:museum
Value: {
  artifactsFound: number,
  artifactsBroken: number,
  collectedArtifacts: [
    {
      id: string,
      type: 'post' | 'relic',
      redditData: {...},
      discoveredAt: timestamp,
      isBroken: boolean,
      sourceDigSite: postId
    }
  ],
  unlockedSubreddits: string[]
}
```

**Artifact Cache:**
```
Key: artifact:{postId}:{sessionId}
Value: {
  type: 'post' | 'relic',
  redditData: {...},
  position: {x, y},
  depth: number
}
TTL: 1 hour (ephemeral per session)
```

### API Response Types

```typescript
// TypeA: Dig Site APIs
interface GetDigSiteResponse {
  postType: 'typeA';
  targetSubreddit: string;
  biome: BiomeType;
  dirtMaterials: DirtMaterial[];
  borderColor: string;
  artifact: ArtifactData;
  communityStats: {
    artifactsFound: number;
    artifactsBroken: number;
  };
}

interface CreateDigSiteRequest {
  targetSubreddit: string;
}

interface CreateDigSiteResponse {
  postType: 'typeA';
  postId: string;
  postUrl: string;
}

// TypeB: Museum APIs
interface GetMuseumResponse {
  postType: 'typeB';
  userId: string;
  playerStats: PlayerStats;
}

interface CreateMuseumRequest {
  userId: string;
}

interface CreateMuseumResponse {
  postType: 'typeB';
  postId: string;
  postUrl: string;
}

// Shared APIs
interface UpdateStatsRequest {
  postId: string;
  userId: string;
  action: 'found' | 'broken';
}

interface UpdateStatsResponse {
  success: boolean;
  newCommunityStats: {
    artifactsFound: number;
    artifactsBroken: number;
  };
  newPlayerStats: {
    artifactsFound: number;
    artifactsBroken: number;
  };
}
```

## Error Handling

### Client-Side Errors

**Network Failures:**
- Retry API calls up to 3 times with exponential backoff
- Display user-friendly error message: "Connection lost. Retrying..."
- Cache game state locally to prevent progress loss

**Canvas Rendering Errors:**
- Fallback to simplified rendering if WebGL unavailable
- Log errors to console for debugging
- Display message: "Graphics issue detected. Try refreshing."

**Touch Input Issues:**
- Validate touch coordinates are within canvas bounds
- Ignore rapid-fire inputs (debounce)
- Provide visual feedback for all valid touches

### Server-Side Errors

**Reddit API Failures:**
- Cache historical posts in Redis for 24 hours
- Fallback to cached posts if API unavailable
- Return generic error if no cached data: `{ error: 'Unable to fetch artifact' }`

**Redis Connection Errors:**
- Retry connection with exponential backoff
- Return HTTP 503 if Redis unavailable after retries
- Log errors for monitoring

**Invalid Requests:**
- Validate all request parameters
- Return HTTP 400 with descriptive error message
- Example: `{ error: 'Invalid postId format' }`

## Testing Strategy

### Unit Tests

**Tool System Tests:**
- Test detector proximity calculations
- Test shovel cooldown enforcement
- Test brush dirt removal rate
- Test artifact collision detection

**Artifact System Tests:**
- Test uncovering percentage calculation
- Test discovery threshold detection
- Test artifact generation (post vs relic probability)

**Rendering Tests:**
- Test dirt layer depth calculations
- Test artifact silhouette fade logic
- Test biome border color application

### Integration Tests

**API Endpoint Tests:**
- Test `/api/digsite/:postId` returns valid TypeA data
- Test `/api/museum/:userId` returns valid TypeB data
- Test `/api/stats/update` increments counters correctly
- Test `/api/digsite/create` creates new TypeA post
- Test `/api/museum/create` creates new TypeB post

**Redis Integration Tests:**
- Test data persistence and retrieval for both post types
- Test TTL expiration for artifact cache
- Test concurrent updates to community stats

### Manual Testing Checklist

**Mobile Touch Testing:**
- Test on iOS Safari and Android Chrome
- Verify tool selection with thumb
- Test detector hold-and-drag
- Test shovel tap responsiveness
- Test brush swipe smoothness

**Gameplay Flow Testing:**
- Complete full excavation from start to discovery
- Test breaking an artifact with shovel
- Test discovering a subreddit relic
- Test museum navigation and artifact viewing
- Test transitioning from TypeA to TypeB posts

**Performance Testing:**
- Measure frame rate during active digging
- Test with 100+ collected artifacts in museum
- Verify 1-2 minute average play session time

## Technical Decisions and Rationales

### Two Post Types Architecture

**Decision:** Use TypeA for dig sites and TypeB for museums

**Rationale:**
- Clear separation of concerns (gameplay vs collection)
- TypeA posts can be created for any subreddit (scalable)
- TypeB posts are personal and persistent (one per player)
- Both use same webview infrastructure with different entry points
- Allows community-driven dig site creation while maintaining personal progression

### Splash Screen as Entry Point

**Decision:** Use splash screen within webview as entry point

**Rationale:**
- Provides context before gameplay (target subreddit, stats)
- Single button click to enter game (low friction)
- Aligns with Devvit Web architecture (no separate Blocks)
- Allows for visual theming and engagement before gameplay
- Consistent pattern for both TypeA and TypeB posts

### Canvas vs DOM Rendering

**Decision:** Use HTML5 Canvas for dig scene rendering (TypeA only)

**Rationale:**
- Better performance for real-time dirt manipulation
- Easier to implement layered depth effects
- Smoother particle systems and visual effects
- Mobile browsers handle canvas touch events well
- TypeB museum uses React components (no canvas needed)

### Artifact Placement Algorithm

**Decision:** Random position and depth (40-60 units) per session

**Rationale:**
- Ensures replayability (same post, different location)
- Depth range balances challenge (not too shallow/deep)
- Random placement prevents memorization exploits

### Community Stats vs Personal Stats

**Decision:** Display community stats on TypeA splash, personal stats on TypeB splash

**Rationale:**
- Community stats create social proof and engagement
- Personal stats provide individual progression tracking
- Separation prevents information overload
- Clear distinction between post types

### Subreddit Relic Rarity

**Decision:** 5% chance for relic instead of post

**Rationale:**
- Rare enough to feel special when discovered
- Common enough that players encounter them regularly
- Drives exploration of new subreddits organically

### Session-Based Artifact Caching

**Decision:** Cache artifact data per session with 1-hour TTL

**Rationale:**
- Prevents artifact from changing mid-excavation
- TTL ensures fresh content on return visits
- Reduces Reddit API calls for same post

### One Museum Per Player

**Decision:** Each player has exactly one TypeB museum post

**Rationale:**
- Centralized collection management
- Easy to find and share personal museum
- Prevents clutter from multiple museum posts
- Clear progression tracking in one location
- Can be pinned or bookmarked by player
