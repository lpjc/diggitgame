# Requirements Document

## Introduction

"Subreddit Excavator" is an interactive archaeology game built on Reddit's Devvit platform where players uncover forgotten Reddit "artifacts"(represented by old posts) buried in dig sites (represented by a subreddit). Each Reddit post represents a dig site for a specific subreddit (e.g., r/aww, r/denmark), displaying community stats to entice players. Clicking "Enter Digsite" opens a full-screen webview with immediate top-down 2D gameplay where players use three tactile tools—a detector, shovel, and brush—to carefully excavate historical posts. The game creates a 1-2 minute engaging experience optimized for mobile-first Reddit browsing.

## Requirements

### Requirement 1: Reddit Post Card Display

**User Story:** As a Reddit user scrolling through my feed, I want to see an engaging post card that shows which subreddit this dig site explores and community stats, so that I'm enticed to click and play.

#### Acceptance Criteria

1. WHEN a dig site post appears in the Reddit feed THEN the system SHALL display the target subreddit name (e.g., "Dig Site: r/aww" or "Excavate r/denmark") 
2. WHEN the post card renders THEN the system SHALL display community statistics showing total "Artifacts Found" at this dig site across all players
3. WHEN the post card renders THEN the system SHALL display community statistics showing total "Artifacts Broken" at this dig site across all players
4. WHEN the post card is displayed THEN the system SHALL show an "Enter Digsite" button prominently
5. WHEN a player clicks "Enter Digsite" THEN the system SHALL open the webview with immediate gameplay
6. WHEN the post card renders THEN the system SHALL apply visual theming using the target subreddit's icon or key colors

### Requirement 2: Webview Initialization and Core Excavation Scene

**User Story:** As a player, I want to immediately see the dig scene when I open the webview, so that I can start playing without delays or extra screens.

#### Acceptance Criteria

1. WHEN the webview opens THEN the system SHALL immediately display a top-down 2D view of the dig area without any intermediate screens
2. WHEN the dig scene loads THEN the system SHALL display layered dirt composed of 3-5 randomized materials (clay, loam, sand, rock)
3. WHEN the dig scene renders THEN the system SHALL apply a biome-themed border around the dig area (grass/rock/sand/swamp) colored based on the target subreddit key colors
4. WHEN a player digs THEN the system SHALL darken the exposed surface and apply cooler hues to simulate depth
5. WHEN the dig scene renders THEN the system SHALL randomly embed pebbles and particles to add visual variety
6. WHEN an artifact is buried (by the system) THEN the system SHALL place it at a random depth between 40-60 units

### Requirement 3: Tool Dock Interface

**User Story:** As a player, I want to see three tool buttons immediately available, so that I can start excavating right away.

#### Acceptance Criteria

1. WHEN the webview loads THEN the system SHALL display a bottom UI dock with three tool buttons: Detector, Shovel, and Brush
2. WHEN the tool dock renders THEN the system SHALL position buttons to be thumb-friendly for mobile users
3. WHEN a tool is selected THEN the system SHALL provide visual feedback indicating which tool is active (active tool is outlined in the selection bar)
4. WHEN a player removes dirt above the artifact, and is only 8 to 0 layers above it, THEN the system SHALL gradually reveal the buried artifact from silhouette to full clarity
5. WHEN the webview opens THEN the system SHALL NOT display any overview, stats, or intermediate screens before gameplay

### Requirement 4: Detector Tool Functionality

**User Story:** As a player, I want to use a detector to locate buried artifacts, so that I can find them without randomly digging.

#### Acceptance Criteria

1. WHEN a player taps and holds the detector button THEN the system SHALL display the detector icon above the player's finger
2. WHEN the detector is active THEN the system SHALL emit a ping every ~1 second
3. WHEN a ping occurs THEN the system SHALL flash a color based on proximity to the artifact's nearest edge (red=far, orange=closer, yellow=near, green=very close)
4. WHEN a ping occurs THEN the system SHALL play a beep sound with pitch matching the proximity level
5. WHEN the player releases the detector button THEN the system SHALL deactivate the detector

### Requirement 5: Shovel Tool Functionality

**User Story:** As a player, I want to use a shovel to quickly remove dirt, so that I can excavate efficiently while accepting the risk of breaking artifacts.

#### Acceptance Criteria

1. WHEN a player taps a spot with the shovel THEN the system SHALL remove a circular patch of dirt (~10 depth units)
2. WHEN a player uses the shovel THEN the system SHALL enforce a half-second cooldown between digs
3. WHEN a shovel dig overlaps an artifact THEN the system SHALL display a crack warning flash
4. WHEN a shovel hits the same artifact location twice THEN the system SHALL break the artifact permanently
5. WHEN an artifact is broken THEN the system SHALL increment the player's "Artifacts Broken" counter and update the post's community stats

### Requirement 6: Brush Tool Functionality

**User Story:** As a player, I want to use a brush to safely remove dirt near artifacts, so that I can carefully uncover them without risk of damage.

#### Acceptance Criteria

1. WHEN a player holds and swipes with the brush THEN the system SHALL remove dirt at 1 depth unit per second in a small area
2. WHEN the brush is used THEN the system SHALL have no cooldown between uses
3. WHEN the brush touches an artifact THEN the system SHALL NOT damage or break the artifact
4. WHEN the brush is active THEN the system SHALL play a soft brushing sound
5. WHEN the brush is used THEN the system SHALL display dust puff visual effects and provide faint haptic feedback

### Requirement 7: Artifact Discovery and Display

**User Story:** As a player, I want to see a celebration when I uncover an artifact, so that I feel rewarded and can view the discovered Reddit post.

#### Acceptance Criteria

1. WHEN approximately 70% of an artifact's surface is uncovered THEN the system SHALL outline it with a soft glow and play a rumble or sparkle effect
2. WHEN an artifact is discovered THEN the system SHALL display an overlay showing "You found [Post Title] from [Date] in r/[Subreddit]!"
3. WHEN the discovery overlay appears THEN the system SHALL display the post's thumbnail or text snippet
4. WHEN the discovery overlay is shown THEN the system SHALL provide an "Add to Museum" button
5. WHEN the player adds an artifact to the museum THEN the system SHALL update the post's community "Artifacts Found" counter
6. WHEN an artifact is displayed THEN the system SHALL show real Reddit data including post title, subreddit, thumbnail/snippet, and date posted
7. WHEN the player adds an artifact to the museum THEN the system SHALL display "Find More Digs" and "View Your Museum" buttons

### Requirement 8: Subreddit Relic Discovery

**User Story:** As a player, I want to occasionally discover new subreddits as special artifacts, so that I can unlock new dig sites and share discoveries with the community.

#### Acceptance Criteria

1. WHEN an artifact is generated THEN the system SHALL have a 5% chance of creating a subreddit relic instead of a post
2. WHEN a subreddit relic is uncovered THEN the system SHALL display a glowing subreddit icon with text "You discovered a new site! Unlock r/[SubredditName] for excavation."
3. WHEN a player claims a subreddit relic THEN the system SHALL add that subreddit as a new dig site option
4. WHEN a subreddit relic is claimed THEN the system SHALL automatically post a comment on the original dig site post stating "I discovered a digsite at r/[Subreddit], go check it out!"
5. WHEN a subreddit relic is added to the museum THEN the system SHALL display it as a glowing icon on a pedestal

### Requirement 9: Personal Museum Hub

**User Story:** As a player, I want to view all my collected artifacts in a personal museum, so that I can review my discoveries and access new dig sites.

#### Acceptance Criteria

1. WHEN a player accesses their museum THEN the system SHALL display a personalized rendering visible only to that player
2. WHEN the museum loads THEN the system SHALL display collected artifacts in a grid or shelf layout
3. WHEN an artifact tile is displayed THEN the system SHALL show the post thumbnail, subreddit, and discovery date
4. WHEN a broken artifact is displayed THEN the system SHALL render it as a cracked silhouette or dust pile
5. WHEN a subreddit relic is displayed THEN the system SHALL show it as a glowing icon on a pedestal
6. WHEN a player taps an artifact THEN the system SHALL reopen and display the original post card
7. WHEN a player taps a subreddit relic THEN the system SHALL generate a new dig site post in that subreddit

### Requirement 10: Dig Site Randomization and Progression

**User Story:** As a player, I want each dig site to be unique and varied, so that the game remains engaging across multiple play sessions.

#### Acceptance Criteria

1. WHEN a new dig site post is created THEN the system SHALL associate it with a specific target subreddit (e.g., r/aww, r/denmark)
2. WHEN the webview loads THEN the system SHALL randomize the biome border (grass/rock/sand/swamp) based on the target subreddit theme
3. WHEN the webview loads THEN the system SHALL randomize the dirt textures (3-5 materials)
4. WHEN an artifact is generated THEN the system SHALL select a buried post from the target subreddit's Reddit history
5. WHEN selecting artifacts THEN the system SHALL favor historically interesting, diverse, and aged posts from the target subreddit
6. WHEN artifacts are collected THEN the system SHALL track themed sets (e.g., "Ancient r/AskReddit Era 2015", "Forgotten Memes of r/funny")

### Requirement 11: Mobile-First Touch Controls

**User Story:** As a mobile Reddit user, I want intuitive touch controls optimized for my device, so that I can play comfortably on my phone.

#### Acceptance Criteria

1. WHEN the webview renders on mobile THEN the system SHALL display thumb-friendly tool buttons in the bottom UI dock
2. WHEN a player uses touch gestures THEN the system SHALL respond to tap, hold, and swipe inputs
3. WHEN the detector is active THEN the system SHALL position the detector icon just above the player's finger for visibility
4. WHEN touch input is detected THEN the system SHALL provide immediate visual and haptic feedback
5. WHEN the game is played THEN the system SHALL optimize for 1-2 minute play sessions suitable for mobile browsing

### Requirement 12: Visual and Audio Polish

**User Story:** As a player, I want polished visual effects and audio feedback, so that the excavation experience feels satisfying and immersive.

#### Acceptance Criteria

1. WHEN tools are used THEN the system SHALL provide responsive haptic feedback
2. WHEN the detector pings THEN the system SHALL play layered audio cues with varying pitch
3. WHEN the brush is used THEN the system SHALL play soft brushing sounds
4. WHEN an artifact is discovered THEN the system SHALL play a cinematic reveal sequence with glow effects and rumble
5. WHEN the dig scene is active THEN the system SHALL display ambient visual effects (dust motes, depth shading)
6. WHEN dirt is removed THEN the system SHALL use smooth mask-based reveals for artifact uncovering
