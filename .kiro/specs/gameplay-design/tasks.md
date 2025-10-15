# Implementation Plan

## Phase 1: Data Models and API Foundation

- [x] 1. Define shared types for excavation game

  - Create TypeScript interfaces for DigSiteData, ArtifactData, DirtLayer, PlayerStats in `src/shared/types/game.ts`
  - Define RedditPost, SubredditRelic, CollectedArtifact types
  - Define BiomeType, DirtMaterial, ProximityLevel enums
  - _Requirements: 2.2, 2.3, 7.6, 8.2, 9.1_

- [x] 2. Implement Redis storage schema for dig sites and museums

  - Create helper functions in `src/server/core/digsite.ts` for storing/retrieving TypeA dig site data (targetSubreddit, artifactsFound, artifactsBroken)
  - Create helper functions in `src/server/core/museum.ts` for storing/retrieving TypeB museum data (collectedArtifacts, unlockedSubreddits)
  - Implement artifact cache with TTL (1 hour) for session-based artifact data
  - _Requirements: 1.2, 1.3, 7.5, 9.1_

- [x] 3. Create Reddit API integration for historical posts

  - Implement `fetchHistoricalPost()` function in `src/server/core/reddit.ts` to fetch old posts from target subreddit
  - Filter posts older than 6 months with engagement metrics
  - Implement subreddit theme extraction (primary color, icon URL)
  - Add caching layer (24 hours) for fetched posts
  - _Requirements: 7.6, 10.4, 10.5_

## Phase 2: Server API Endpoints

- [x] 4. Implement TypeA dig site API endpoints

- [x] 4.1 Create GET `/api/digsite/:postId` endpoint

  - Return DigSiteData with targetSubreddit, biome, dirtMaterials, borderColor, artifact, communityStats
  - Generate randomized biome and dirt materials based on subreddit theme
  - Generate or retrieve cached artifact for the session
  - _Requirements: 2.2, 2.3, 10.2, 10.3, 10.4_

- [x] 4.2 Create POST `/api/digsite/create` endpoint

  - Accept targetSubreddit parameter
  - Create new TypeA post with dig site configuration
  - Initialize community stats (artifactsFound: 0, artifactsBroken: 0)
  - Store post metadata in Redis
  - _Requirements: 1.1, 10.1_

- [x] 4.3 Create POST `/api/stats/update` endpoint

  - Accept postId, userId, action ('found' or 'broken')
  - Increment community stats for the dig site
  - Update player's museum stats
  - Return updated stats for both community and player
  - _Requirements: 1.2, 1.3, 5.5, 7.5_

- [x] 5. Implement TypeB museum API endpoints

- [x] 5.1 Create GET `/api/museum/:userId` endpoint

  - Return PlayerStats with artifactsFound, artifactsBroken, collectedArtifacts, unlockedSubreddits
  - Format artifact data for gallery display
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 5.2 Create POST `/api/museum/create` endpoint

  - Accept userId parameter
  - Create new TypeB post for player's museum
  - Initialize empty collection in Redis
  - _Requirements: 9.1_

- [x] 5.3 Create POST `/api/museum/add-artifact` endpoint

  - Accept userId, artifactData, sourceDigSite
  - Add artifact to player's collection
  - Handle subreddit relic unlocking
  - Return updated museum data
  - _Requirements: 7.4, 8.3, 9.2_

- [x] 6. Implement subreddit relic discovery endpoint

- [x] 6.1 Create POST `/api/relic/claim` endpoint

  - Accept userId, subredditName, sourcePostId
  - Add subreddit to player's unlocked list
  - Post comment on source dig site announcing discovery
  - Create new TypeA dig site post for the discovered subreddit
  - _Requirements: 8.3, 8.4_

## Phase 3: TypeA Client - Excavation Game Core

- [x] 7. Set up canvas-based game engine

  - Create `src/client/typeA/game/GameEngine.ts` class with state management
  - Implement game phases: 'splash', 'playing', 'discovered', 'museum_preview'
  - Set up canvas initialization and resize handling
  - Create game loop with requestAnimationFrame
  - _Requirements: 2.1, 2.2_

- [x] 8. Implement dig scene renderer

- [x] 8.1 Create DigSceneRenderer class in `src/client/typeA/game/DigSceneRenderer.ts`

  - Implement 2D grid system (100x100 cells) with depth values (0-60)
  - Create dirt layer rendering with composite textures
  - Implement depth-based color darkening (cooler hues for deeper layers)
  - Add random pebbles and particles at initialization
  - _Requirements: 2.2, 2.3, 2.5_

- [x] 8.2 Implement biome border rendering

  - Create border textures for grass/rock/sand/swamp biomes
  - Apply subreddit primary color to border
  - Render decorative border around dig area
  - _Requirements: 2.3, 10.2_

- [x] 8.3 Implement artifact silhouette rendering

  - Render artifact silhouette when uncoveredPercentage > 0
  - Fade from silhouette (0%) to full clarity (100%)
  - Apply glow effect when uncoveredPercentage >= 70%
  - _Requirements: 3.4, 7.1_

- [x] 9. Implement tool system

- [x] 9.1 Create base Tool interface and ToolManager in `src/client/typeA/game/tools/`

  - Define Tool interface with onActivate, onUpdate, onDeactivate methods
  - Create ToolManager to handle tool selection and lifecycle
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 9.2 Implement DetectorTool class

  - Handle tap-and-hold activation with detector icon rendering
  - Implement ping system (every ~1 second)
  - Calculate distance to artifact's nearest edge
  - Display color flash based on proximity (red/orange/yellow/green)
  - Play beep sound with pitch matching proximity
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9.3 Implement ShovelTool class

  - Handle tap activation with circular dirt removal (~10 depth units, 15px radius)
  - Enforce 500ms cooldown between digs
  - Detect artifact collision and show crack warning on first hit
  - Break artifact on second hit to same location
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 9.4 Implement BrushTool class

  - Handle hold-and-swipe with continuous dirt removal (1 depth unit/second, 8px radius)
  - No cooldown between uses
  - Safe artifact interaction (no damage)
  - Play brushing sound and render dust particles
  - Trigger light haptic feedback
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 10. Implement artifact system

- [x] 10.1 Create ArtifactGenerator class in `src/client/typeA/game/ArtifactSystem.ts`

  - Generate artifact with 5% chance for subreddit relic vs 95% post artifact
  - Fetch historical post data from server API
  - Randomize position and depth (40-60 units)
  - _Requirements: 7.6, 8.1, 10.4_

- [x] 10.2 Implement artifact uncovering logic

  - Calculate uncoveredPercentage based on dirt depth in artifact cells
  - Cell is "uncovered" if depth <= artifact.depth + 8
  - Trigger discovery when uncoveredPercentage >= 70%
  - _Requirements: 3.4, 7.1_

- [x] 10.3 Implement artifact breaking logic

  - Track damage state per artifact
  - Mark artifact as broken on second shovel hit
  - Render broken artifact as cracked silhouette
  - _Requirements: 5.4, 5.5, 9.4_

## Phase 4: TypeA Client - UI Components

- [x] 11. Create tool dock component

  - Build ToolDock React component in `src/client/typeA/components/ToolDock.tsx`
  - Display three tool buttons: Detector, Shovel, Brush
  - Position buttons for thumb-friendly mobile access
  - Highlight active tool with visual feedback
  - _Requirements: 3.1, 3.2, 3.3, 11.1, 11.2_

- [x] 12. Create discovery modal component

- [x] 12.1 Build DiscoveryModal for post artifacts

  - Display "You found [Post Title] from [Date] in r/[Subreddit]!"
  - Show post thumbnail or text snippet
  - Render "Add to Museum" button
  - Display "Find More Digs" and "View Your Museum" buttons after adding
  - _Requirements: 7.2, 7.3, 7.4, 7.6, 7.7_

- [x] 12.2 Build DiscoveryModal for subreddit relics

  - Display "You discovered a new site! Unlock r/[SubredditName]"
  - Show glowing subreddit icon
  - Render "Claim Relic" button
  - _Requirements: 8.2, 8.3_

- [x] 13. Implement splash screen for TypeA

  - Update TypeA App.tsx to show splash screen initially
  - Display target subreddit name with theming
  - Show community stats (artifacts found/broken)
  - Render "Enter Digsite" button
  - Transition to game on button click
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_


## Phase 5: TypeB Client - Museum Gallery

- [ ] 14. Create museum gallery UI
- [ ] 14.1 Build Museum component in `src/client/typeB/components/Museum.tsx`

  - Display player stats summary (total artifacts found/broken, unlocked subreddits)
  - Render artifact grid/shelf layout
  - _Requirements: 9.1, 9.2_

- [ ] 14.2 Create ArtifactTile component

  - Display post thumbnail, subreddit, discovery date
  - Render broken artifacts as cracked silhouette or dust pile
  - Handle tap to reopen original post card
  - _Requirements: 9.3, 9.4, 9.6_

- [ ] 14.3 Create RelicTile component

  - Display subreddit icon on glowing pedestal
  - Handle tap to generate new dig site post in that subreddit
  - _Requirements: 9.5, 9.7_

- [ ] 15. Implement splash screen for TypeB
  - Update TypeB App.tsx to show splash screen initially
  - Display player stats and highlights
  - Show preview of 3-5 recent discoveries
  - Render "View Museum" button
  - Transition to museum on button click
  - _Requirements: 9.1_

## Phase 6: Visual and Audio Polish

- [ ] 16. Implement visual effects system

  - Create ParticleSystem class in `src/client/typeA/game/effects/ParticleSystem.ts`
  - Implement dust particles for brush tool
  - Add depth shading effects for exposed dirt
  - Create glow and rumble effects for artifact discovery
  - _Requirements: 2.4, 6.5, 7.1, 12.4, 12.5_

- [ ] 17. Implement audio system

  - Create AudioManager class in `src/client/typeA/game/audio/AudioManager.ts`
  - Add detector ping sounds with varying pitch
  - Add brush sound effects
  - Add discovery celebration sound
  - _Requirements: 4.4, 6.4, 12.2_

- [ ] 18. Implement haptic feedback
  - Add haptic feedback utility in `src/client/shared/utils/haptics.ts`
  - Trigger light haptic on brush use
  - Trigger medium haptic on shovel dig
  - Trigger strong haptic on artifact discovery
  - _Requirements: 6.5, 12.1_

## Phase 7: Integration and Optimization

- [ ] 19. Integrate game with TypeA post flow

  - Connect splash screen to game engine initialization
  - Wire discovery modal to museum API calls
  - Implement navigation between dig sites and museum
  - Handle post creation for discovered subreddit relics
  - _Requirements: 1.5, 7.7, 8.4, 9.7_

- [ ] 20. Optimize for mobile performance

  - Implement touch event handling for all tools
  - Optimize canvas rendering for mobile devices
  - Test and adjust tool button sizes for thumb access
  - Ensure 1-2 minute play session pacing
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 21. Update post creation functions

  - Modify `createPostA()` in `src/server/core/post.ts` to accept targetSubreddit parameter
  - Update splash screen configuration for dig sites
  - Update splash screen configuration for museums
  - Add moderator menu actions for creating dig sites with subreddit selection
  - _Requirements: 1.1, 1.6, 10.1_

- [ ] 22. Implement error handling and fallbacks
  - Add retry logic for Reddit API failures with cached fallback
  - Handle canvas rendering errors with simplified fallback
  - Validate touch input coordinates
  - Add user-friendly error messages
  - _Requirements: All requirements (error handling)_
