# Requirements Document

## Introduction

This feature introduces two critical systems that transform the game into a progressive, community-driven experience:

1. **Depth Progression System**: Each subreddit dig site has multiple depth levels (Surface → Shallow → Deep → Deepest) that unlock as the community collectively finds artifacts. Deeper levels contain progressively older Reddit posts, creating a journey through Reddit's history.

2. **Enhanced Discovery UX Flow**: A polished reveal and claim flow for artifacts and subreddit tokens, with distinct visual treatments, smooth animations, and clear user actions that guide players from discovery to collection.

These systems work together to create a sense of community achievement, progressive difficulty, and rewarding discovery moments.

## Requirements

### Requirement 1: Depth Progression System - Core Mechanics

**User Story:** As a player, I want to work with the community to unlock deeper levels of dig sites so that we can discover progressively older and rarer Reddit content.

#### Acceptance Criteria

1. WHEN a dig site is first created THEN the system SHALL initialize it at "Depth: Surface"

2. WHEN displaying a dig site post title THEN it SHALL include the depth level in the format: "Dig Site: r/[subreddit] - Depth: [level]"
   - Surface level: "Dig Site: r/[subreddit] - Depth: Surface"
   - Subsequent levels: "Dig Site: r/[subreddit] - Depth: Shallow", "Deep", "Deepest"

3. WHEN a dig site is created THEN the system SHALL only allow it to be opened once per subreddit
   - Each subreddit can only have one active dig site chain
   - Attempting to create a duplicate SHALL fail with an appropriate message

4. WHEN the system tracks depth progression THEN it SHALL use the following unlock thresholds:
   - Surface → Shallow: 50 artifacts found
   - Shallow → Deep: 500 artifacts found
   - Deep → Deepest: 5000 artifacts found
   - Deepest: No further progression (final level)

5. WHEN a player finds an artifact at any depth THEN the system SHALL increment the community artifact counter for that specific depth level

6. WHEN the artifact threshold for a depth is reached THEN the system SHALL:
   - Mark the current depth post as "Completed"
   - Create a new post for the next depth level
   - Reset the artifact counter to 0 for the new depth
   - Link the new depth post to the previous depth in the chain

7. WHEN a depth level is completed THEN the post SHALL remain playable but display a "✅ Completed" badge

### Requirement 2: Depth Progression - Time-Based Artifact Fetching

**User Story:** As a player, I want deeper dig sites to contain older Reddit posts so that I feel like I'm excavating deeper into Reddit's history.

#### Acceptance Criteria

1. WHEN fetching posts for "Surface" depth THEN the system SHALL query posts from 0-3 years old

2. WHEN fetching posts for "Shallow" depth THEN the system SHALL query posts from 3-6 years old

3. WHEN fetching posts for "Deep" depth THEN the system SHALL query posts from 6-9 years old

4. WHEN fetching posts for "Deepest" depth THEN the system SHALL query posts from 9+ years old

5. WHEN generating a dig site THEN the system SHALL:
   - Use the Reddit API's time filtering capabilities
   - Calculate timestamps for the appropriate date range based on depth
   - Only select posts that fall within the depth's time range

6. WHEN no posts are available in the target time range THEN the system SHALL fall back to the next oldest available posts

### Requirement 3: Depth Progression - Visual Progress Indicator

**User Story:** As a player, I want to see how close we are to unlocking the next depth so that I feel motivated to keep digging.

#### Acceptance Criteria

1. WHEN playing a dig site THEN the system SHALL display a progress bar overlay in the bottom-left corner of the screen

2. WHEN displaying the progress indicator THEN it SHALL show:
   - Text: "Artifacts until next depth"
   - Progress bar showing current/total (e.g., "25/50")
   - Visual progress bar fill percentage

3. WHEN the depth is "Deepest" THEN the progress indicator SHALL display "Max Depth Reached" instead of a progress bar

4. WHEN the progress bar updates THEN it SHALL animate smoothly to the new value

5. WHEN the threshold is reached THEN the progress bar SHALL show "100%" and display a "Depth Unlocked!" message

6. WHEN viewing a completed depth post THEN the progress indicator SHALL show "✅ Completed - Next depth available"

### Requirement 4: Depth Progression - Post Linking and Navigation

**User Story:** As a player, I want to easily navigate between depth levels of the same subreddit so that I can see the progression.

#### Acceptance Criteria

1. WHEN a new depth is unlocked THEN the system SHALL post a comment on all previous depth posts with the message:
   - "🎉 New depth unlocked! Depth [X] for r/[subreddit] is now available [LINK]"

2. WHEN viewing a completed depth post THEN the splash screen SHALL include a link to the next depth level

3. WHEN the system creates a new depth post THEN it SHALL store metadata linking it to:
   - The previous depth post ID
   - The original "Surface" post ID
   - The subreddit name
   - The current depth level

4. WHEN displaying the dig site splash screen THEN it SHALL show:
   - Current depth level
   - Artifacts found at this depth / threshold for next depth
   - Link to previous depth (if not Surface)
   - Link to next depth (if completed and next exists)

### Requirement 5: Enhanced Discovery Flow - Broken Artifact

**User Story:** As a player, when I break an artifact with the shovel, I want clear feedback so that I understand what happened.

#### Acceptance Criteria

1. WHEN a player breaks an artifact THEN the system SHALL immediately display a modal overlay

2. WHEN displaying the broken artifact modal THEN it SHALL show:
   - Icon: 💔
   - Heading: "Your shovel broke the artifact!"
   - Button: "Try Again" (reloads the page to start a new dig)

3. WHEN the player clicks "Try Again" THEN the system SHALL reload the page to generate a new dig site

4. WHEN an artifact is broken THEN it SHALL NOT be added to the player's museum

5. WHEN an artifact is broken THEN the system SHALL still increment the community "broken" counter for that dig site

### Requirement 6: Enhanced Discovery Flow - Artifact Found (Post)

**User Story:** As a player, when I successfully uncover an artifact, I want a satisfying reveal experience that builds anticipation before showing me what I found.

#### Acceptance Criteria

1. WHEN a player reaches 95% artifact reveal THEN the system SHALL:
   - Dim the background with a semi-transparent overlay
   - Wait 1-2 seconds before showing the reveal UI
   - Display a golden nugget/artifact icon in the center (no animation initially)

2. WHEN the golden nugget appears THEN it SHALL display the message:
   - "Click to reveal a historical artifact from r/[subreddit]"

3. WHEN the player clicks/taps the golden nugget THEN the system SHALL:
   - Animate the nugget (scale up slightly, then fade out)
   - Reveal the full artifact card with the Reddit post details

4. WHEN displaying the artifact card THEN it SHALL use the same design as the museum's ArtifactCard component:
   - Subreddit icon and name
   - Post title
   - Author and date
   - Score and comment count
   - Text snippet (if available)
   - Thumbnail (if available)

5. WHEN the artifact card is displayed THEN it SHALL show two buttons:
   - Primary: "Claim!" (orange/gold styling)
   - Secondary: None initially

6. WHEN the player clicks "Claim!" THEN the system SHALL:
   - Show a loading state on the button
   - Call the artifact save API
   - Update community stats
   - Swap the button to show two new options:
     - "Go to Museum" (purple styling)
     - "Find more artifacts!" (blue styling)

7. WHEN the player clicks "Go to Museum" THEN the system SHALL navigate to the player's museum post

8. WHEN the player clicks "Find more artifacts!" THEN the system SHALL reload the page to start a new dig

### Requirement 7: Enhanced Discovery Flow - Subreddit Token Found

**User Story:** As a player, when I find a rare subreddit token, I want a special reveal experience that makes it feel epic and different from regular artifacts.

#### Acceptance Criteria

1. WHEN a subreddit token is spawned THEN it SHALL be rendered with a diamond-blue-turquoise color instead of gold
   - This applies to the in-game buried object color
   - This creates visual distinction before reveal

2. WHEN a player reaches 95% reveal of a subreddit token THEN the system SHALL:
   - Dim the background with a semi-transparent overlay
   - Wait 1-2 seconds before showing the reveal UI
   - Display a diamond-blue-turquoise gem/crystal icon in the center

3. WHEN the gem appears THEN it SHALL display the message:
   - "Click to reveal a rare treasure map!"

4. WHEN the player clicks/taps the gem THEN the system SHALL:
   - Animate the gem (rainbow shimmer effect, scale up, fade out)
   - Reveal a subreddit selection UI

5. WHEN displaying the subreddit selection UI THEN it SHALL show:
   - Heading: "🗺️ Treasure Map Found!"
   - Description: "Choose a new subreddit to excavate"
   - Three subreddit options displayed as cards with:
     - Subreddit icon
     - Subreddit name (r/[name])
     - Brief description
     - "Select" button

6. WHEN selecting available subreddits THEN the system SHALL:
   - First check the player's recent activity for relevant subreddits
   - Filter to only show subreddits that haven't been discovered yet
   - If fewer than 3 relevant subreddits exist, fill remaining slots with random available subreddits

7. WHEN the player selects a subreddit THEN the system SHALL display a confirmation:
   - "Open new dig site for r/[subreddit]?"
   - Button: "Open new dig site!"

8. WHEN the player clicks "Open new dig site!" THEN the system SHALL:
   - Create a new "Surface" depth post for the selected subreddit
   - Mark the player as the discoverer of that subreddit
   - Post a comment on the current dig site post: "I found a treasure map to the ancient ruins of r/[newly found subreddit], come explore with me here [link to new post]"
   - Navigate the player to the new dig site post

9. WHEN a subreddit token is found THEN it SHALL NOT be added to the player's museum (the new dig site is the reward)

10. WHEN a subreddit token is found THEN it SHALL increment the community "found" counter for that dig site

### Requirement 8: Enhanced Discovery Flow - Visual Differentiation

**User Story:** As a player, I want to immediately recognize what type of item I found based on its appearance so that I can anticipate the reward.

#### Acceptance Criteria

1. WHEN rendering a buried artifact (post) in the dig layer THEN it SHALL use a golden/amber color scheme

2. WHEN rendering a buried subreddit token in the dig layer THEN it SHALL use a diamond-blue-turquoise color scheme

3. WHEN revealing an artifact (post) THEN the reveal icon SHALL be a golden nugget or artifact symbol (🏺)

4. WHEN revealing a subreddit token THEN the reveal icon SHALL be a diamond-blue gem or crystal symbol (💎)

5. WHEN the reveal animation plays THEN it SHALL use color-appropriate effects:
   - Artifacts: Golden shimmer and glow
   - Subreddit tokens: Rainbow/prismatic shimmer and glow

### Requirement 9: Subreddit Discovery and Ownership

**User Story:** As a player who discovers a new subreddit, I want to be recognized as the discoverer so that I get credit for expanding the game world.

#### Acceptance Criteria

1. WHEN a player uses a treasure map to create a new dig site THEN the system SHALL store the player's username as the discoverer

2. WHEN displaying a dig site post title THEN it SHALL include the discoverer's name:
   - Format: "u/[username]'s r/[subreddit] Dig Site - Depth: [level]"
   - Example: "u/alice's r/gaming Dig Site - Depth: Surface"

3. WHEN a new depth is created for a subreddit THEN the system SHALL preserve the original discoverer's name across all depth levels

4. WHEN a subreddit is discovered THEN it SHALL be marked as unavailable in the global subreddit pool

5. WHEN generating treasure map options THEN the system SHALL only show subreddits that have not been discovered yet

### Requirement 10: Splash Screen Updates for Depth System

**User Story:** As a player, I want to see the current depth and progress information on the dig site splash screen so that I know what to expect before entering.

#### Acceptance Criteria

1. WHEN viewing a dig site splash screen THEN it SHALL display:
   - Heading: "u/[discoverer]'s r/[subreddit] Dig Site - Depth: [level]"
   - Description including:
     - "⛏️ Artifacts found here: [count]"
     - "Progress to next depth: [current]/[threshold]" (or "✅ Completed" if done)
     - "📅 Excavating posts from [year range]" (e.g., "2018-2021")

2. WHEN a depth is completed THEN the splash SHALL show:
   - "✅ This depth is completed!"
   - Link/button to the next depth level

3. WHEN viewing the "Deepest" level THEN the splash SHALL show:
   - "🏆 Maximum depth reached!"
   - "⛏️ Artifacts found here: [count]"

4. WHEN the splash screen updates THEN it SHALL reflect real-time community progress (updated when stats change)

### Requirement 11: Data Persistence and State Management

**User Story:** As the system, I need to reliably track depth progression, artifact counts, and subreddit discovery state so that the game functions correctly.

#### Acceptance Criteria

1. WHEN a dig site is created THEN the system SHALL store in Redis:
   - `digsite:[postId]:depth` → current depth level (0=Surface, 1=Shallow, 2=Deep, 3=Deepest)
   - `digsite:[postId]:artifacts_found` → count of artifacts found at this depth
   - `digsite:[postId]:subreddit` → target subreddit name
   - `digsite:[postId]:discoverer` → username of the player who discovered this subreddit
   - `digsite:[postId]:previous_depth` → post ID of the previous depth (if not Surface)
   - `digsite:[postId]:next_depth` → post ID of the next depth (if unlocked)

2. WHEN tracking global subreddit discovery THEN the system SHALL maintain:
   - `discovered_subreddits` → Set of all subreddit names that have been discovered
   - `subreddit:[name]:surface_post_id` → post ID of the Surface depth for this subreddit

3. WHEN a player discovers a subreddit THEN the system SHALL:
   - Add the subreddit to the `discovered_subreddits` set
   - Store the mapping from subreddit name to Surface post ID
   - Store the discoverer's username

4. WHEN checking if a subreddit is available THEN the system SHALL query the `discovered_subreddits` set

5. WHEN an artifact is found THEN the system SHALL atomically increment the artifact counter for that depth

6. WHEN a depth threshold is reached THEN the system SHALL use Redis transactions to ensure only one "next depth" post is created

### Requirement 12: Artifact Spawning Adjustments

**User Story:** As a player, I want a balanced chance of finding artifacts and subreddit tokens so that the game feels rewarding but not overwhelming.

#### Acceptance Criteria

1. WHEN generating a dig site THEN the system SHALL determine the artifact type:
   - 98% chance: Regular artifact (Reddit post)
   - 2% chance: Subreddit token (treasure map)

2. WHEN a subreddit token is selected THEN the system SHALL verify that undiscovered subreddits exist
   - IF no undiscovered subreddits remain THEN spawn a regular artifact instead

3. WHEN spawning a subreddit token THEN the system SHALL render it with the diamond-blue-turquoise color in the dig layer

4. WHEN spawning a regular artifact THEN the system SHALL render it with the golden/amber color in the dig layer

### Requirement 13: Error Handling and Edge Cases

**User Story:** As the system, I need to handle edge cases gracefully so that players have a smooth experience.

#### Acceptance Criteria

1. WHEN attempting to create a dig site for an already-discovered subreddit THEN the system SHALL return an error message: "This subreddit has already been discovered!"

2. WHEN no posts exist in the target time range for a depth THEN the system SHALL fall back to the closest available posts and log a warning

3. WHEN a player tries to claim a subreddit token but all subreddits are discovered THEN the system SHALL show a message: "All subreddits have been discovered! This is a rare collector's item." and add it to the museum as a special artifact

4. WHEN a depth unlock fails (e.g., due to concurrent requests) THEN the system SHALL retry once and log the error if it fails again

5. WHEN the Reddit API fails to fetch posts THEN the system SHALL show a user-friendly error message and allow the player to retry

6. WHEN navigating to a non-existent depth post THEN the system SHALL redirect to the Surface depth for that subreddit

### Requirement 14: Performance and Optimization

**User Story:** As a player, I want the game to load quickly and run smoothly even as the community progresses through many depths.

#### Acceptance Criteria

1. WHEN fetching dig site data THEN the system SHALL cache the result for 5 minutes to reduce Reddit API calls

2. WHEN updating artifact counts THEN the system SHALL use Redis atomic operations to prevent race conditions

3. WHEN rendering the progress bar THEN it SHALL update at most once per second to avoid excessive re-renders

4. WHEN loading the subreddit selection UI THEN it SHALL pre-fetch subreddit icons and descriptions in parallel

5. WHEN creating a new depth post THEN the system SHALL do so asynchronously and not block the player's current session
