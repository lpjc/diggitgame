# Architecture Alignment: Multi-Post System → Subreddit Excavator Game

## Post Type Mapping

### TypeA = Dig Site Post
**Purpose:** Dynamic dig site for any subreddit

**Characteristics:**
- **Dynamic theming** based on target subreddit (colors, icons, name)
- **Canvas-based gameplay** with dig scene, tools, and artifacts
- **Subreddit-specific** - each post targets a different subreddit
- **Replayable** - same subreddit can have multiple dig site posts

**Data Structure:**
```typescript
interface DigSitePostData {
  postType: 'typeA';
  targetSubreddit: string;        // e.g., "aww", "denmark"
  biome: 'grass' | 'rock' | 'sand' | 'swamp';
  subredditTheme: {
    primaryColor: string;         // Extracted from subreddit
    iconUrl?: string;
    bannerUrl?: string;
  };
  communityStats: {
    artifactsFound: number;       // Total across all players
    artifactsBroken: number;
  };
}
```

**Webview Content:**
- Full-screen dig scene (Canvas)
- Tool dock (detector, shovel, brush)
- Discovery modal when artifact found
- Link to player's museum

**Post Creation:**
```typescript
// Moderator creates dig site for specific subreddit
await createDigSitePost('aww');  // Creates typeA post
await createDigSitePost('denmark');  // Creates another typeA post
```

---

### TypeB = Museum Post
**Purpose:** Personal museum showing player's collection

**Characteristics:**
- **Player-specific** - shows individual player's stats and artifacts
- **Collection display** - grid of discovered artifacts and relics
- **Progress tracking** - total finds, broken artifacts, unlocked subreddits
- **Interactive** - click artifacts to view details, click relics to create new dig sites

**Data Structure:**
```typescript
interface MuseumPostData {
  postType: 'typeB';
  playerId: string;               // Reddit user ID
  playerStats: {
    artifactsFound: number;       // Personal total
    artifactsBroken: number;
    totalDigSites: number;
  };
  collectedArtifacts: CollectedArtifact[];
  unlockedSubreddits: string[];   // Subreddits with discovered relics
}
```

**Webview Content:**
- Museum header with player stats
- Grid of artifact tiles (posts discovered)
- Grid of relic tiles (subreddits unlocked)
- "Create New Dig Site" button for unlocked subreddits

**Post Creation:**
```typescript
// Player creates their personal museum
await createMuseumPost(userId);  // Creates typeB post
```

---

## Architecture Benefits

### ✅ Clear Separation of Concerns
- **Dig Site (TypeA):** Gameplay, excavation, discovery
- **Museum (TypeB):** Collection, progression, meta-game

### ✅ Scalability
- **Unlimited dig sites:** Any subreddit can have a dig site post
- **One museum per player:** Personal collection that grows over time
- **Dynamic theming:** Each dig site adapts to its subreddit's branding

### ✅ Social Features
- **Community stats on dig sites:** Shows total artifacts found by all players
- **Personal stats in museum:** Shows individual player progression
- **Relic unlocking:** Discovering relics in dig sites unlocks new subreddits in museum

### ✅ Replayability
- **Multiple dig sites per subreddit:** Different artifacts each time
- **Museum grows over time:** Incentive to keep playing
- **Subreddit exploration:** Relics drive players to new communities

---

## Current Implementation Status

### ✅ Already Implemented
1. **Router system** - Loads typeA or typeB based on postType from API
2. **Post creation functions** - `createPostA()` and `createPostB()`
3. **API endpoint** - `/api/init` returns postType
4. **Redis storage** - Available for storing dig site and museum data
5. **Reddit API access** - Can fetch subreddit info and historical posts

### 🔄 Needs Renaming/Refactoring
1. Rename `createPostA()` → `createDigSitePost(subreddit)`
2. Rename `createPostB()` → `createMuseumPost(userId)`
3. Rename `typeA/App.tsx` → `digsite/DigSiteApp.tsx`
4. Rename `typeB/App.tsx` → `museum/MuseumApp.tsx`

### ➕ Needs Implementation
1. **Dig Site App:**
   - Canvas rendering for dig scene
   - Tool system (detector, shovel, brush)
   - Artifact generation and uncovering logic
   - Discovery modal
   - Subreddit theming (colors, icons)

2. **Museum App:**
   - Artifact grid display
   - Relic grid display
   - Player stats header
   - Artifact detail modal
   - "Create Dig Site" button for unlocked subreddits

3. **API Endpoints:**
   - `GET /api/digsite/:postId` - Fetch dig site data
   - `POST /api/digsite/create` - Create new dig site post
   - `GET /api/museum/:userId` - Fetch player museum data
   - `POST /api/museum/create` - Create museum post
   - `POST /api/artifact/discover` - Save discovered artifact
   - `POST /api/stats/update` - Update community/player stats

---

## File Structure Mapping

```
Current Structure              →    Game Structure
──────────────────────────────────────────────────────────
src/client/
├── main.tsx                   →    Router (typeA vs typeB)
├── typeA/                     →    digsite/
│   └── App.tsx                →    DigSiteApp.tsx (Canvas + Tools)
├── typeB/                     →    museum/
│   └── App.tsx                →    MuseumApp.tsx (Collection Grid)
└── shared/
    ├── components/            →    Shared UI components
    └── utils/                 →    API client, helpers

src/server/
├── index.ts                   →    Express server with game endpoints
├── core/
│   ├── post.ts                →    digsite.ts + museum.ts
│   ├── data.ts                →    artifact.ts + stats.ts
│   └── userActions.ts         →    Keep for user-generated posts
└── shared types               →    Game data models
```

---

## Data Flow Examples

### Creating a Dig Site Post
```
1. Moderator clicks "Create Dig Site" in mod menu
2. Server: createDigSitePost('aww')
   - Fetch subreddit theme (colors, icon)
   - Generate random biome
   - Store in Redis: digsite:{postId}
   - Create Reddit post with typeA entrypoint
3. Player clicks splash screen
4. Webview loads with postType='typeA'
5. Router loads DigSiteApp
6. DigSiteApp fetches /api/digsite/:postId
7. Canvas renders dig scene with subreddit theming
```

### Creating a Museum Post
```
1. Player clicks "View My Museum" button
2. Server: createMuseumPost(userId)
   - Fetch player stats from Redis
   - Fetch collected artifacts
   - Store in Redis: museum:{postId}
   - Create Reddit post with typeB entrypoint
3. Player clicks splash screen
4. Webview loads with postType='typeB'
5. Router loads MuseumApp
6. MuseumApp fetches /api/museum/:userId
7. React renders artifact grid and stats
```

### Discovering an Artifact
```
1. Player uncovers artifact in DigSiteApp (typeA)
2. Client: POST /api/artifact/discover
   - Body: { postId, userId, artifactData }
3. Server:
   - Save to player museum in Redis
   - Increment community stats
   - Return updated stats
4. Client shows discovery modal
5. Modal has "Add to Museum" button
6. Button links to player's museum post (typeB)
```

---

## Key Insights

### Why This Architecture Works

1. **Two distinct experiences:**
   - TypeA = Active gameplay (dig, discover, collect)
   - TypeB = Passive viewing (admire, browse, plan)

2. **Natural progression loop:**
   - Play dig sites → Discover artifacts → View in museum → Unlock new dig sites

3. **Leverages existing infrastructure:**
   - Router already handles typeA vs typeB
   - Post creation already supports both types
   - API already returns postType for routing

4. **Scalable and maintainable:**
   - Clear separation makes it easy to work on dig site vs museum independently
   - Shared components (UI, API client) reduce duplication
   - Each post type has focused responsibility

### What Makes This Better Than Original Plan

**Original plan:** TypeA and TypeB were just different biomes
**Problem:** Limited to 2 biomes, no clear purpose for each

**New plan:** TypeA = Dig Site (gameplay), TypeB = Museum (collection)
**Benefits:**
- ✅ Unlimited dig sites (any subreddit)
- ✅ Personal progression (museum)
- ✅ Clear purpose for each post type
- ✅ Natural gameplay loop
- ✅ Social features (community stats vs personal stats)

---

## Next Steps

1. **Refactor naming** to match game concepts (digsite, museum)
2. **Implement DigSiteApp** with Canvas and game logic
3. **Implement MuseumApp** with collection display
4. **Add game API endpoints** to server
5. **Test full gameplay loop** from dig site to museum
