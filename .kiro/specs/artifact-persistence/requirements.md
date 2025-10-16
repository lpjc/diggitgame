# Requirements Document

## Introduction

The Artifact Persistence & Museum Enhancement feature establishes a centralized artifact database system where artifacts are stored once and referenced by multiple players. This system enables efficient storage, rarity tracking, and rich museum experiences where players can view their collected artifacts with sorting options and rarity statistics. The feature integrates with the existing excavation game (TypeA posts) to save discovered artifacts and displays them in personal museums (TypeB posts).

## Requirements

### Requirement 1: Centralized Artifact Database

**User Story:** As a system, I want to store each unique artifact once in a centralized database, so that multiple players can reference the same artifact without data duplication.

#### Acceptance Criteria

1. WHEN an artifact is discovered for the first time THEN the system SHALL create a new artifact record in the centralized artifact database with a unique artifact ID
2. WHEN an artifact already exists in the database THEN the system SHALL NOT create a duplicate record
3. WHEN an artifact is stored THEN the system SHALL include the artifact type ('post' or 'subreddit_relic')
4. WHEN a post artifact is stored THEN the system SHALL include Reddit post data (id, title, author, subreddit, createdAt, score, permalink, thumbnailUrl, textSnippet)
5. WHEN a subreddit relic is stored THEN the system SHALL include subreddit data (subredditName, iconUrl, primaryColor, description)
6. WHEN an artifact is stored THEN the system SHALL include a `firstDoundByCount` field so everyone can see the first payer to discover this artifact
7. WHEN an artifact is stored THEN the system SHALL include a `firstDiscoveredAt` timestamp
8. WHEN an artifact is stored THEN the system SHALL include a `subredditOfOrigin` field indicating which subreddit the artifact came from

### Requirement 2: Player Artifact References

**User Story:** As a player, I want my museum to store references to artifacts I've collected, so that my collection is efficiently managed without duplicating artifact data.

#### Acceptance Criteria

1. WHEN a player collects an artifact THEN the system SHALL store a reference record linking the player to the artifact ID
2. WHEN a player reference is created THEN the system SHALL include the artifact ID
3. WHEN a player reference is created THEN the system SHALL include the player's user ID
4. WHEN a player reference is created THEN the system SHALL include a `collectedAt` timestamp indicating when the player found this artifact
5. WHEN a player reference is created THEN the system SHALL include an `isBroken` boolean indicating if the player broke this artifact
6. WHEN a player reference is created THEN the system SHALL include the `sourceDigSite` post ID where the artifact was discovered
7. WHEN a player collects an artifact THEN the system SHALL increment the artifact's `foundByCount` in the centralized database

### Requirement 3: Artifact Discovery Integration

**User Story:** As a player, I want artifacts I discover during excavation to be automatically saved to my museum, so that I can view my collection later.

#### Acceptance Criteria

1. WHEN a player successfully uncovers an artifact (70%+ uncovered) THEN the system SHALL check if the artifact exists in the centralized database
2. WHEN the artifact does not exist in the database THEN the system SHALL create a new artifact record
3. WHEN the artifact exists in the database THEN the system SHALL retrieve the existing artifact ID
4. WHEN a player clicks "Add to Museum" THEN the system SHALL create a player reference linking the player to the artifact
5. WHEN a player breaks an artifact with the shovel THEN the system SHALL still save the artifact reference with `isBroken: true`
6. WHEN an artifact is saved THEN the system SHALL update the dig site's community stats (artifactsFound or artifactsBroken)
7. WHEN an artifact is saved THEN the system SHALL update the player's personal stats (artifactsFound or artifactsBroken)

### Requirement 4: Museum Display with Artifact Details

**User Story:** As a player, I want to view all my collected artifacts in my museum with detailed information, so that I can appreciate my discoveries and see how rare they are.

#### Acceptance Criteria

1. WHEN a player opens their museum THEN the system SHALL fetch all artifact references for that player
2. WHEN artifact references are fetched THEN the system SHALL join with the centralized artifact database to retrieve full artifact details
3. WHEN an artifact is displayed THEN the system SHALL show the post title, thumbnail, subreddit, and original post date
4. WHEN an artifact is displayed THEN the system SHALL show the date the player discovered it (`collectedAt`)
5. WHEN an artifact is displayed THEN the system SHALL show the rarity statistic (`foundByCount` - how many other players have this artifact)
6. WHEN an artifact is displayed THEN the system SHALL show the subreddit of origin
7. WHEN a broken artifact is displayed THEN the system SHALL render it with a cracked or faded visual treatment
8. WHEN a subreddit relic is displayed THEN the system SHALL show it with a glowing pedestal effect

### Requirement 5: Museum Sorting and Filtering

**User Story:** As a player, I want to sort my museum collection by different criteria, so that I can organize and view my artifacts in meaningful ways.

#### Acceptance Criteria

1. WHEN the museum loads THEN the system SHALL provide a sorting option for "Date Found" (most recent first)
2. WHEN the museum loads THEN the system SHALL provide a sorting option for "Rarity" (lowest `foundByCount` first)
3. WHEN the museum loads THEN the system SHALL provide a sorting option for "Subreddit" (alphabetical by subreddit name)
4. WHEN a player selects a sort option THEN the system SHALL reorder the artifact grid accordingly
5. WHEN the museum displays artifacts THEN the system SHALL show both intact and broken artifacts in the same view
6. WHEN the museum loads THEN the system SHALL display a summary showing total artifacts found, total broken, and total unique subreddits

### Requirement 6: Trash Can Display for Broken Artifacts

**User Story:** As a player, I want to see a count of artifacts I've broken, so that I'm aware of my excavation mistakes without cluttering my museum with broken items.

#### Acceptance Criteria

1. WHEN the museum loads THEN the system SHALL display a "trash can" or "broken artifacts" counter
2. WHEN the trash can is displayed THEN the system SHALL show the total number of artifacts the player has broken
3. WHEN a player clicks the trash can THEN the system SHALL display a list or grid of broken artifacts
4. WHEN broken artifacts are displayed THEN the system SHALL show them with cracked/faded visuals
5. WHEN broken artifacts are displayed THEN the system SHALL still show the artifact details (title, subreddit, rarity)
6. WHEN the trash can view is open THEN the system SHALL provide a way to return to the main museum view

### Requirement 7: Rarity Calculation and Display

**User Story:** As a player, I want to see how rare my artifacts are compared to other players, so that I feel a sense of accomplishment for finding uncommon items.

#### Acceptance Criteria

1. WHEN an artifact's rarity is displayed THEN the system SHALL show the `foundByCount` value (e.g., "Found by 3 players")
2. WHEN an artifact has `foundByCount` of 1 THEN the system SHALL display a special "Unique Discovery" badge
3. WHEN an artifact has `foundByCount` < 5 THEN the system SHALL display it as "Ultra Rare"
4. WHEN an artifact has `foundByCount` between 5-20 THEN the system SHALL display it as "Rare"
5. WHEN an artifact has `foundByCount` between 21-100 THEN the system SHALL display it as "Uncommon"
6. WHEN an artifact has `foundByCount` > 100 THEN the system SHALL display it as "Common"
7. WHEN sorting by rarity THEN the system SHALL prioritize artifacts with lower `foundByCount` values first

### Requirement 8: Data Consistency and Performance

**User Story:** As a system, I want to maintain data consistency and performance when managing artifacts across many players, so that the game scales efficiently.

#### Acceptance Criteria

1. WHEN multiple players discover the same artifact simultaneously THEN the system SHALL handle concurrent updates to `foundByCount` without data loss
2. WHEN a player's museum is loaded THEN the system SHALL fetch artifact data efficiently using batch queries
3. WHEN an artifact is created THEN the system SHALL use the Reddit post ID or subreddit name as part of the unique identifier to prevent duplicates
4. WHEN artifact data is fetched THEN the system SHALL cache frequently accessed artifacts to reduce database load
5. WHEN a player has collected 100+ artifacts THEN the system SHALL paginate the museum display for performance
6. WHEN artifact references are stored THEN the system SHALL index by player ID for fast retrieval
7. WHEN artifacts are stored THEN the system SHALL index by subreddit for efficient filtering
