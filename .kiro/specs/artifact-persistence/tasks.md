# Implementation Plan

- [x] 1. Define shared types for artifact persistence system


  - Create TypeScript interfaces in `src/shared/types/artifact.ts` for CentralizedArtifact, PlayerArtifactReference, PlayerArtifactCollection, ArtifactWithPlayerData, MuseumData, RarityTier
  - Define SaveArtifactRequest, SaveArtifactResponse, GetMuseumResponse types
  - Export all types for use in client and server
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_





- [ ] 2. Implement centralized artifact database operations
- [ ] 2.1 Create artifact database helper functions in `src/server/core/artifact-db.ts`
  - Implement `generateArtifactId()` function to create unique IDs from Reddit post ID or subreddit name
  - Implement `getArtifactById()` function to retrieve artifact from Redis

  - Implement `createCentralizedArtifact()` function to store new artifact in Redis
  - Implement `incrementFoundByCount()` function with atomic increment logic
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_





- [ ] 2.2 Implement artifact existence checking
  - Create `artifactExists()` function to check if artifact is already in database
  - Handle both post and relic artifact types


  - _Requirements: 1.1, 1.2, 3.1, 3.2_





- [ ] 3. Implement player reference system
- [ ] 3.1 Create player reference helper functions in `src/server/core/player-references.ts`
  - Implement `getPlayerCollection()` function to fetch player's artifact references from Redis
  - Implement `addPlayerReference()` function to add new artifact reference to player's collection
  - Implement `updatePlayerReference()` function to modify existing reference
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_


- [ ] 3.2 Implement player stats tracking
  - Create functions to increment player's artifactsFound and artifactsBroken counters




  - Update existing `museum.ts` functions to work with new reference system
  - _Requirements: 2.7, 3.6, 3.7_

- [ ] 4. Implement artifact discovery service
- [ ] 4.1 Create artifact discovery service in `src/server/core/artifact-discovery.ts`
  - Implement `saveDiscoveredArtifact()` function that orchestrates the full save flow

  - Check if artifact exists, create if needed, increment foundByCount
  - Create player reference with collectedAt, isBroken, sourceDigSite
  - Update dig site stats and player stats
  - Return SaveArtifactResponse with artifactId, foundByCount, rarityTier
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_


- [ ] 4.2 Implement rarity calculation
  - Create `getRarityTier()` function that calculates tier based on foundByCount
  - Implement thresholds: unique (1), ultra_rare (<5), rare (5-20), uncommon (21-100), common (>100)


  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ] 5. Implement museum data service
- [ ] 5.1 Create museum data service in `src/server/core/museum-data.ts`
  - Implement `getPlayerMuseum()` function that fetches references and joins with artifact data
  - Fetch player's artifact references from Redis

  - Batch fetch full artifact details for each reference
  - Combine artifact data with player-specific metadata (collectedAt, isBroken, sourceDigSite)
  - Calculate summary stats (totalFound, totalBroken, uniqueSubreddits)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [ ] 5.2 Implement artifact sorting
  - Create `sortArtifacts()` function with support for 'date', 'rarity', 'subreddit' sorting
  - Sort by collectedAt (descending) for date

  - Sort by foundByCount (ascending) for rarity
  - Sort by subredditOfOrigin (alphabetical) for subreddit
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.7_

- [ ] 5.3 Implement artifact filtering
  - Add filtering logic to exclude broken artifacts when requested




  - Support includeBroken parameter in museum queries
  - _Requirements: 5.5, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 6. Create API endpoint for saving artifacts

  - Implement POST `/api/artifact/save` endpoint in `src/server/index.ts`
  - Accept SaveArtifactRequest with userId, artifactData, sourceDigSite, isBroken
  - Call `saveDiscoveredArtifact()` from artifact discovery service
  - Return SaveArtifactResponse with success, artifactId, foundByCount, rarityTier
  - Handle errors and return appropriate HTTP status codes
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_


- [ ] 7. Create API endpoint for fetching museum
  - Implement GET `/api/museum/:userId` endpoint in `src/server/index.ts`
  - Accept query parameters: sortBy ('date' | 'rarity' | 'subreddit'), includeBroken (boolean)
  - Call `getPlayerMuseum()` from museum data service




  - Apply sorting and filtering based on query parameters
  - Return GetMuseumResponse with userId, artifacts, stats
  - Handle errors and return appropriate HTTP status codes
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 8. Create API endpoint for fetching single artifact
  - Implement GET `/api/artifact/:artifactId` endpoint in `src/server/index.ts`

  - Fetch artifact details from centralized database
  - Return full CentralizedArtifact data
  - Handle errors for missing artifacts
  - _Requirements: 4.4, 4.5, 4.6_

- [x] 9. Integrate artifact saving into TypeA excavation game




- [ ] 9.1 Update DiscoveryModal component in `src/client/typeA/components/DiscoveryModal.tsx`
  - Add `isBroken` prop to indicate if artifact was broken
  - Update button text: "Add to Museum" for intact, "Add to Trash" for broken
  - Pass isBroken to onAddToMuseum callback
  - _Requirements: 3.4, 3.5, 6.3, 6.4, 6.5_

- [x] 9.2 Implement artifact save handler in TypeA App

  - Create `handleAddToMuseum()` function in `src/client/typeA/App.tsx`
  - Call POST `/api/artifact/save` with userId, artifactData, sourceDigSite, isBroken
  - Show rarity notification after successful save (display rarityTier and foundByCount)
  - Update local stats display
  - Handle errors with user-friendly messages

  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 7.1, 7.2_

- [ ] 9.3 Update artifact breaking logic
  - Ensure broken artifacts still trigger discovery modal
  - Pass isBroken: true when artifact is broken by shovel


  - Update stats correctly for broken artifacts
  - _Requirements: 3.5, 3.6, 3.7_

- [ ] 10. Build Museum component for TypeB
- [ ] 10.1 Create Museum component in `src/client/typeB/components/Museum.tsx`
  - Fetch museum data from GET `/api/museum/:userId` on mount


  - Display stats summary: totalFound, uniqueSubreddits, totalBroken (trash can)
  - Implement sort controls: buttons for Date, Rarity, Subreddit
  - Update sortBy state and refetch data when sort option changes
  - Display loading state while fetching
  - Handle errors with error message display
  - _Requirements: 4.1, 4.2, 5.1, 5.2, 5.3, 5.4, 5.6, 6.1, 6.2_

- [ ] 10.2 Implement trash can toggle
  - Add clickable trash can stat that toggles showBroken state
  - When showBroken is true, fetch museum with includeBroken=true and display only broken artifacts
  - When showBroken is false, display only intact artifacts
  - Provide visual indication of active view
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_




- [ ] 11. Create ArtifactTile component
- [ ] 11.1 Build ArtifactTile component in `src/client/typeB/components/ArtifactTile.tsx`
  - Display post thumbnail (if available), title, subreddit
  - Display collectedAt date ("Found: MM/DD/YYYY")
  - Calculate and display rarity tier badge with color coding
  - Display foundByCount ("Found by X players")
  - Apply rarity-based styling (unique, ultra_rare, rare, uncommon, common)
  - Handle click to show artifact details modal
  - _Requirements: 4.3, 4.4, 4.5, 4.6, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 11.2 Implement broken artifact visual treatment
  - Apply cracked or faded styling when artifact.isBroken is true
  - Show "Broken" badge or icon
  - Maintain readability of artifact details
  - _Requirements: 4.7, 6.4, 6.5_

- [ ] 11.3 Implement subreddit relic tile variant
  - Display subreddit icon with glowing effect
  - Show subreddit name and description
  - Display rarity information
  - Apply pedestal visual effect
  - _Requirements: 4.8_

- [ ] 12. Create ArtifactGrid component
  - Build ArtifactGrid component in `src/client/typeB/components/ArtifactGrid.tsx`
  - Display artifacts in responsive grid layout (2-3 columns on mobile, 4-6 on desktop)
  - Render ArtifactTile for each artifact
  - Handle empty state ("No artifacts yet")
  - Optimize for scrolling performance with large collections
  - _Requirements: 4.1, 4.2, 5.5_

- [ ] 13. Create BrokenArtifactsView component
  - Build BrokenArtifactsView component in `src/client/typeB/components/BrokenArtifactsView.tsx`
  - Display broken artifacts in grid layout
  - Show message explaining broken artifacts ("Artifacts you broke during excavation")
  - Render ArtifactTile with broken styling for each artifact
  - Handle empty state ("No broken artifacts")
  - _Requirements: 6.3, 6.4, 6.5, 6.6_

- [ ] 14. Implement rarity notification system
  - Create RarityNotification component in `src/client/typeA/components/RarityNotification.tsx`
  - Display rarity tier with appropriate styling and animation
  - Show foundByCount message ("You're the 5th player to find this!")
  - Auto-dismiss after 3-5 seconds
  - Special animation for "Unique Discovery" (foundByCount === 1)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 15. Update TypeB App.tsx to use Museum component
  - Replace placeholder TypeB content with Museum component
  - Pass userId from context or API
  - Remove old counter demo code
  - Ensure proper loading and error states
  - _Requirements: 4.1, 4.2, 5.6_

- [ ] 16. Implement error handling and edge cases
  - Handle concurrent foundByCount updates with retry logic
  - Handle missing artifact data gracefully (log and skip)
  - Validate artifact data before saving
  - Handle Redis connection errors with user-friendly messages
  - Add error boundaries for React components
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 17. Optimize performance for large collections
  - Implement pagination for museums with 100+ artifacts
  - Add lazy loading for artifact images
  - Optimize Redis queries with batch fetching
  - Cache frequently accessed artifacts
  - Add loading skeletons for better UX
  - _Requirements: 8.5, 8.6, 8.7_

- [ ] 18. Add CSS styling for museum components
  - Style Museum component with responsive layout
  - Style ArtifactTile with rarity-based color schemes
  - Style trash can toggle with hover effects
  - Style sort controls with active state indicators
  - Style broken artifact visual treatment
  - Ensure mobile-first responsive design
  - _Requirements: 4.7, 5.1, 5.2, 5.3, 6.1, 6.2, 7.1, 7.2, 7.3, 7.4, 7.5_
