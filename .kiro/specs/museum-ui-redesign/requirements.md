# Requirements Document

## Introduction

The Museum UI Redesign feature transforms the museum experience from a simple grid view into an engaging, collection-style interface. This redesign introduces a compact masonry layout with a scrolling background of artifact thumbnails, sticky navigation controls, and enhanced discovery tracking that celebrates players who find artifacts first. The feature builds on the existing artifact persistence system to create a more immersive and visually appealing museum experience.

## Requirements

### Requirement 1: Collection Header Banner

**User Story:** As a player, I want to see a personalized collection banner at the top of my museum, so that I feel ownership and pride in my artifact collection.

#### Acceptance Criteria

1. WHEN the museum loads THEN the system SHALL display a sticky header banner at the top of the viewport
2. WHEN the header banner is displayed THEN the system SHALL show "The u/[username] Collection" as the main heading
3. WHEN the user scrolls down THEN the system SHALL keep the header banner visible at the top (sticky positioning)
4. WHEN the header banner is displayed THEN the system SHALL use an elegant, museum-style design aesthetic
5. WHEN the header banner is displayed THEN the system SHALL include decorative elements that evoke a collection or gallery theme

### Requirement 2: Compact Masonry Grid Layout

**User Story:** As a player, I want to view my artifacts in a compact, visually interesting grid layout, so that I can see more of my collection at once and enjoy the visual variety.

#### Acceptance Criteria

1. WHEN the museum displays artifacts THEN the system SHALL render them in a masonry-style grid layout
2. WHEN an artifact has a thumbnail image THEN the system SHALL display it in a 2x2 grid cell (larger size)
3. WHEN an artifact does not have a thumbnail image THEN the system SHALL display it in a 1x2 grid cell (smaller, vertical size)
4. WHEN displaying non-image artifacts THEN the system SHALL add gaps between pairs of non-image posts to maintain visual balance
5. WHEN the grid is rendered THEN the system SHALL be responsive and adjust column count based on viewport width
6. WHEN artifacts are displayed THEN the system SHALL show the thumbnail (if available), post title, upvote count, comment count, and post date
7. WHEN artifacts are displayed THEN the system SHALL use a layout similar to Reddit's post format
8. WHEN artifacts are displayed THEN the system SHALL show a rarity badge pinned to the post card
9. WHEN artifacts are displayed THEN the system SHALL show a subreddit badge pinned to the post card
10. WHEN the post date is displayed THEN the system SHALL calculate and show the date in BRR/ARR format (Before/After Reddit Redesign, relative to April 1, 2018)
11. WHEN calculating BRR/ARR dates THEN the system SHALL use fractional notation (¼, ½, ¾) for quarters of a year
12. WHEN the grid loads THEN the system SHALL implement lazy loading to load artifacts as the user scrolls

### Requirement 3: Scrolling Background Grid

**User Story:** As a player, I want to see a scrolling background of my artifact thumbnails, so that the museum feels dynamic and showcases my entire collection.

#### Acceptance Criteria

1. WHEN the museum loads THEN the system SHALL display a horizontally scrolling background grid of artifact thumbnails
2. WHEN the background grid is displayed THEN the system SHALL show small thumbnail images of all collected artifacts
3. WHEN the background grid scrolls THEN the system SHALL implement lazy loading for thumbnail images
4. WHEN the background grid is displayed THEN the system SHALL use a subtle, semi-transparent overlay so it doesn't distract from the main content
5. WHEN the control banner is displayed THEN the system SHALL provide a toggle button to enable/disable auto-scrolling
6. WHEN auto-scroll is enabled THEN the system SHALL scroll the background horizontally at a slow, continuous pace
7. WHEN auto-scroll is disabled THEN the system SHALL allow manual scrolling only
8. WHEN the background grid reaches the end THEN the system SHALL loop back to the beginning seamlessly

### Requirement 4: Artifact Detail Overlay

**User Story:** As a player, I want to click on any artifact to view its full details in an overlay, so that I can learn more about my discoveries without leaving the museum view.

#### Acceptance Criteria

1. WHEN a player clicks an artifact thumbnail THEN the system SHALL open a modal overlay showing full artifact details
2. WHEN the overlay is displayed THEN the system SHALL show the artifact's full-size thumbnail or icon
3. WHEN the overlay is displayed THEN the system SHALL show the post title, subreddit, original post date, and permalink
4. WHEN the overlay is displayed THEN the system SHALL show when the player discovered it (collectedAt)
5. WHEN the overlay is displayed THEN the system SHALL show the rarity tier and found-by count
6. WHEN the overlay is displayed THEN the system SHALL show who discovered the artifact first (firstDiscoveredBy)
7. WHEN the overlay is displayed THEN the system SHALL show a special badge if the current player was the first discoverer
8. WHEN the overlay displays the post date THEN the system SHALL show both the BRR/ARR format and the actual age in years and months (e.g., "2¼ BRR (5 years, 3 months old)")
9. WHEN the overlay is open THEN the system SHALL provide a close button (X) to return to the grid view
10. WHEN the overlay is open THEN the system SHALL allow clicking outside the modal to close it
11. WHEN the overlay is open THEN the system SHALL dim the background content

### Requirement 5: Sticky Floating Control Banner

**User Story:** As a player, I want quick access to sorting controls and statistics while browsing my museum, so that I can organize my collection without scrolling back to the top.

#### Acceptance Criteria

1. WHEN the museum loads THEN the system SHALL display a sticky floating control banner below the header
2. WHEN the control banner is displayed THEN the system SHALL show sorting buttons (Date, Rarity, Subreddit)
3. WHEN a player clicks a sort button THEN the system SHALL reorder the artifact grid accordingly
4. WHEN a sort option is active THEN the system SHALL highlight that button to indicate the current sort
5. WHEN the control banner is displayed THEN the system SHALL show key statistics in a compact format
6. WHEN statistics are displayed THEN the system SHALL show total artifacts found
7. WHEN statistics are displayed THEN the system SHALL show unique subreddits explored
8. WHEN statistics are displayed THEN the system SHALL show first discoveries count
9. WHEN statistics are displayed THEN the system SHALL show broken artifacts count (artifacts destroyed are NOT added to collection, only counted)
10. WHEN the control banner is displayed THEN the system SHALL show an auto-scroll toggle button for the background grid
11. WHEN the user scrolls THEN the system SHALL keep the control banner visible (sticky positioning)

### Requirement 6: First Discovery Tracking

**User Story:** As a player, I want to see who discovered each artifact first and track my own first discoveries, so that I can feel pride in being the first to find rare artifacts.

#### Acceptance Criteria

1. WHEN an artifact is discovered for the first time THEN the system SHALL record the discovering player's username in the artifact's `firstDiscoveredBy` field
2. WHEN an artifact is displayed in the overlay THEN the system SHALL show "First discovered by u/[username]"
3. WHEN the current player was the first to discover an artifact THEN the system SHALL display a special "First Discovery" badge pinned to the artifact tile
4. WHEN the current player was the first to discover an artifact THEN the system SHALL display a prominent "You discovered this first!" message in the overlay
5. WHEN the museum stats are displayed THEN the system SHALL show a "First Discoveries" count
6. WHEN calculating first discoveries THEN the system SHALL count artifacts where the player's username matches the `firstDiscoveredBy` field
7. WHEN an artifact is broken THEN the system SHALL NOT add it to the player's collection
8. WHEN an artifact is broken THEN the system SHALL increment the player's "Broken Artifacts" counter
9. WHEN an artifact is broken THEN the system SHALL NOT record the player as having discovered it

### Requirement 7: Enhanced Rarity Display

**User Story:** As a player, I want to quickly identify rare artifacts in my collection, so that I can appreciate my most valuable discoveries.

#### Acceptance Criteria

1. WHEN an artifact is displayed in the grid THEN the system SHALL show a small rarity indicator badge
2. WHEN an artifact is displayed in the overlay THEN the system SHALL show the full rarity information
3. WHEN rarity is displayed THEN the system SHALL use color-coded badges (gold for unique, purple for ultra rare, blue for rare, green for uncommon, gray for common)
4. WHEN an artifact has foundByCount of 1 THEN the system SHALL display "⭐ Unique Discovery"
5. WHEN an artifact has foundByCount < 5 THEN the system SHALL display "💎 Ultra Rare"
6. WHEN an artifact has foundByCount between 5-20 THEN the system SHALL display "🔷 Rare"
7. WHEN an artifact has foundByCount between 21-100 THEN the system SHALL display "🔹 Uncommon"
8. WHEN an artifact has foundByCount > 100 THEN the system SHALL display "⚪ Common"
9. WHEN sorting by rarity THEN the system SHALL prioritize artifacts with lower foundByCount values first

### Requirement 8: Broken Artifacts Counter

**User Story:** As a player, I want to see how many artifacts I've broken, so that I'm aware of my mistakes and can try to be more careful.

#### Acceptance Criteria

1. WHEN the museum stats are displayed THEN the system SHALL show a "Broken Artifacts" counter
2. WHEN an artifact is broken during excavation THEN the system SHALL increment the player's broken artifacts counter
3. WHEN an artifact is broken THEN the system SHALL NOT add it to the player's museum collection
4. WHEN an artifact is broken THEN the system SHALL NOT display it in the museum grid
5. WHEN the broken artifacts counter is displayed THEN the system SHALL show only the count, not the actual broken artifacts

### Requirement 9: Performance and Lazy Loading

**User Story:** As a system, I want to load artifacts efficiently as the player scrolls, so that the museum remains responsive even with large collections.

#### Acceptance Criteria

1. WHEN the museum loads THEN the system SHALL initially load only the first 20-30 artifacts
2. WHEN the player scrolls near the bottom of the grid THEN the system SHALL load the next batch of artifacts
3. WHEN the background grid scrolls THEN the system SHALL lazy-load thumbnail images as they come into view
4. WHEN images are loading THEN the system SHALL display placeholder elements to prevent layout shift
5. WHEN the museum has 100+ artifacts THEN the system SHALL maintain smooth scrolling performance
6. WHEN artifact data is fetched THEN the system SHALL include all necessary data (artifact details, player reference data) in a single query
7. WHEN the player switches sort order THEN the system SHALL re-fetch artifacts with the new sort applied

### Requirement 10: BRR/ARR Date Format

**User Story:** As a player, I want to see post dates in a fun "Before/After Reddit Redesign" format, so that I can appreciate the historical context of my artifacts.

#### Acceptance Criteria

1. WHEN a post date is displayed THEN the system SHALL calculate the time relative to April 1, 2018 (Reddit Redesign date)
2. WHEN a post is from before April 1, 2018 THEN the system SHALL display it as "X BRR" (Before Reddit Redesign)
3. WHEN a post is from after April 1, 2018 THEN the system SHALL display it as "X ARR" (After Reddit Redesign)
4. WHEN calculating the year value THEN the system SHALL use fractional notation for quarters: ¼ for 0.25-0.5 years, ½ for 0.5-0.75 years, ¾ for 0.75-1.0 years
5. WHEN a post is from April 1, 2019 THEN the system SHALL display "1 ARR"
6. WHEN a post is from January 1, 2016 THEN the system SHALL display "2¼ BRR"
7. WHEN a post is from December 31, 2017 THEN the system SHALL display "¼ BRR"
8. WHEN the detailed overlay is displayed THEN the system SHALL show both the BRR/ARR format and the actual age (e.g., "2¼ BRR (5 years, 3 months old)")

### Requirement 11: Responsive Design

**User Story:** As a player, I want the museum to work well on both desktop and mobile devices, so that I can enjoy my collection on any device.

#### Acceptance Criteria

1. WHEN the museum is viewed on mobile THEN the system SHALL adjust the grid to show fewer columns
2. WHEN the museum is viewed on mobile THEN the system SHALL maintain the sticky header and control banner
3. WHEN the overlay is opened on mobile THEN the system SHALL display it full-screen for better readability
4. WHEN the museum is viewed on desktop THEN the system SHALL show more columns in the grid (4-6 columns)
5. WHEN the museum is viewed on tablet THEN the system SHALL show a medium number of columns (3-4 columns)
6. WHEN touch gestures are available THEN the system SHALL support swipe-to-close on the overlay modal
7. WHEN the background grid auto-scroll is enabled THEN the system SHALL scroll at a slow pace suitable for viewing
