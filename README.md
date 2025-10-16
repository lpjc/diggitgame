## Diggit Game

**Subreddit Excavator** - An interactive archaeology game built on Reddit's Devvit platform where players uncover forgotten Reddit artifacts (historical posts) buried in dig sites representing different subreddits. Using tactile excavation tools, players carefully dig through layered dirt to discover posts from Reddit's history, with each discovery adding to their personal museum collection.

### What is Diggit Game?

Diggit Game is a mobile-first archaeology experience that transforms Reddit's history into an engaging excavation game. The game features two distinct post types that work together to create a complete gameplay loop:

**Note:** This game is currently in active development. The Dig Site gameplay (Type A) is fully implemented and playable, while the Museum interface (Type B) is designed but still being built.

**Dig Site Posts (Type A)**: Active gameplay where you excavate historical Reddit posts ✅ **FULLY PLAYABLE**
- Each dig site represents a specific subreddit (e.g., r/aww, r/denmark)
- Canvas-based 2D top-down view of a dig area with dynamic grid sizing (adapts to screen size)
- Three excavation tools with distinct mechanics:
  - **Detector (📡)**: Tap to scan - get proximity feedback with color-coded expanding circles and pitch-varying beeps
  - **Shovel (⛏️)**: Tap to dig fast - removes 10 depth units but can break artifacts if you hit them twice
  - **Brush (🖌️)**: Hold and swipe to dig safely - removes 1 depth unit/second with dust particles and haptic feedback
- Randomized biomes (grass, rock, sand, swamp) themed to match the target subreddit's colors
- Community stats showing total artifacts found and broken by all players at this dig site
- 5% chance to discover subreddit relics that unlock new dig sites
- Immediate gameplay - the game starts automatically when you open the post (no duplicate splash screens)
- Real-time artifact uncovering with golden glow effect at 70%+ discovery
- Celebration animation when artifact is fully revealed (95%+ uncovered)

**Museum Posts (Type B)**: Your personal collection and progression hub 🚧 **IN DEVELOPMENT**
- Horizontally scrolling 3-row gallery layout optimized for mobile viewing
- Compact artifact cards (192px wide) showing thumbnails, titles, and metadata
- BRR/ARR date format (Before/After Reddit Redesign - April 1, 2018) with fractional notation (¼, ½, ¾)
- Rarity badges color-coded by how many players found each artifact (unique, ultra rare, rare, uncommon, common)
- First discovery tracking - special badges for artifacts you discovered before anyone else
- Sticky control banner with sorting options (date, rarity, subreddit) and auto-scroll toggle
- Personal stats: total artifacts found, unique subreddits explored, first discoveries, broken artifacts
- Tap any artifact to view full details in an overlay modal
- Broken artifacts are counted but not displayed in the collection (encourages careful excavation)

The game uses intelligent routing to automatically detect which post type you're viewing. When you open any Diggit Game post, a polished loading screen with an animated blue spinner appears while the app fetches the post type from the server, then seamlessly loads either the dig site excavation game or your personal museum.

### What Makes This Game Innovative?

1. **Reddit History as Gameplay**: Transforms Reddit's vast archive into discoverable artifacts, giving new life to forgotten posts (6+ months old with 10+ score). Every artifact is real Reddit content with actual titles, authors, thumbnails, and post dates fetched from the Reddit API.

2. **Immediate Gameplay**: The game starts automatically when you open a dig site post. You're instantly dropped into the excavation scene with tools ready to use - no duplicate splash screens or menus. This follows Devvit best practices where the splash screen IS the Reddit post itself.

3. **Tactile Tool System**: Three distinct excavation tools with realistic mechanics and visual/audio feedback:
   - **Detector (📡)**: Tap and hold to scan for artifacts. Get proximity feedback with color-coded expanding circles (red=far, orange=closer, yellow=near, green=very close) and pitch-varying beep sounds (200Hz-800Hz) that guide you to the buried treasure
   - **Shovel (⛏️)**: Fast digging (removes 10 depth units in 15px radius) with 500ms cooldown. Hitting artifacts shows a red crack warning (X pattern), and hitting the same spot twice breaks them permanently
   - **Brush (🖌️)**: Slow, safe removal (1 depth unit/second in 8px radius) that can't damage artifacts. Creates dust particle effects that float upward and provides light haptic feedback (10ms vibration on supported devices)

4. **Dynamic Subreddit Theming**: Each dig site automatically adapts to its target subreddit's visual identity (primary colors, icons, biome type), making every excavation feel unique and connected to that community

5. **Risk-Reward Mechanics**: Players must balance speed (shovel) vs safety (brush), with the detector helping locate artifacts. Breaking artifacts increments your "broken" counter, adding consequence to careless digging. The shovel gives a warning crack on first hit, then breaks the artifact on the second hit to the same location.

6. **Canvas-Based Rendering with Dynamic Sizing**: Real-time 2D dirt layer system that adapts to your screen size with square pixels (16px CSS per grid cell). Uses an offscreen buffer for seamless rendering without seams, with depth-based color darkening (darker = deeper). Includes random pebbles for visual variety and biome-specific border decorations.

7. **Progressive Artifact Uncovering**: Artifacts become visible when you dig within 8 layers of their depth, rendered as golden circles that reveal cell-by-cell. At 70%+ uncovered, a floating message appears ("It's beautiful, keep going!"). At 95%+ uncovered, a celebration animation triggers with pulsing light rays and a golden glow before the discovery modal appears.

8. **Community-Driven Exploration**: Discovering subreddit relics (5% chance) unlocks new dig sites, encouraging players to explore diverse Reddit communities organically. Claiming a relic automatically posts a comment announcing your discovery

9. **Dual Post Architecture**: Dig sites (Type A) for gameplay and museums (Type B) for collection create a natural progression loop - play → discover → collect → unlock → play new sites

10. **Mobile-First Touch Controls**: Optimized for 1-2 minute play sessions on mobile with compact tool buttons (48x48px) in a vertical floating dock at the bottom-right (black background with 60% opacity, rounded-xl design). Uses pointer events (pointerdown, pointermove, pointerup) for responsive touch handling and haptic feedback on brush use.

11. **Persistent Progression**: All discoveries saved to your personal museum via Redis using a centralized artifact database (stores each unique artifact once) and player reference system (links players to their collected artifacts). Community stats tracked per dig site, and unlocked subreddits persist across sessions. Artifacts are cached per session (1-hour TTL) to prevent them from changing mid-excavation.

12. **BRR/ARR Dating System**: Museum displays artifact dates in a fun "Before/After Reddit Redesign" format relative to April 1, 2018, with fractional notation (¼, ½, ¾) for quarters of a year. Example: "2¼ BRR" means 2.25 years before the Reddit redesign.

13. **Rarity Tracking**: Each artifact tracks how many players have found it globally, creating rarity tiers (unique, ultra rare, rare, uncommon, common) with color-coded badges. First discoverers get special recognition with animated badges.

14. **Horizontally Scrolling Museum**: Museum uses a unique 3-row horizontal scrolling layout optimized for mobile, with compact artifact cards that show thumbnails, titles, and metadata. Auto-scroll feature available for passive browsing.

### Technology Stack

- [Devvit](https://developers.reddit.com/): Reddit's developer platform for building immersive apps
- [Vite](https://vite.dev/): Build system for client and server bundles
- [React](https://react.dev/): UI framework with hooks for state management
- [Express](https://expressjs.com/): Backend API server with Reddit integration
- [Tailwind](https://tailwindcss.com/): Utility-first CSS for responsive styling
- [TypeScript](https://www.typescriptlang.org/): End-to-end type safety across client and server

## How to Play

### For Players

#### Getting Started

1. **Find a Dig Site Post**: Look for Diggit Game posts in your Reddit feed - they'll show the target subreddit (e.g., "🏜️ Dig Site: r/aww") with community stats on the splash screen
2. **Click "Start Digging"**: Click the button on the Reddit post's splash screen to open the webview
3. **Brief Loading**: You'll see a polished loading screen with an animated blue spinner and "Loading game..." text for 1-2 seconds while the dig site initializes
4. **Instant Gameplay**: The game starts automatically! You're immediately dropped into the excavation scene with your tools ready - no duplicate splash screens or menus

#### Excavation Gameplay (Dig Site Posts)

**Understanding the Dig Scene:**

The game displays a top-down 2D view of a dynamically-sized dig area rendered on an HTML5 canvas:
- **Adaptive Grid**: Grid size adapts to your screen (typically 10-150 cells wide/tall) with square 16px CSS pixels
- **Layered Dirt**: Each cell has a depth value from 0 (fully excavated) to 60 (untouched surface)
- **Biome Border**: Decorative border around the dig area themed to the target subreddit (grass/rock/sand/swamp) with subreddit-specific colors
- **Hidden Artifact**: A historical Reddit post (or rare subreddit relic) buried at random position and depth (layer 40-60 from surface)
- **Visual Depth**: Deeper dirt appears darker with cooler hues to simulate depth (up to 85% darker at deepest layers using a steep curve)
- **Pebbles & Particles**: Random decorative elements add visual variety to the dig scene
- **Portrait Layout**: Dig area maintains a 9:16 aspect ratio (portrait) and centers on your screen, snapped to pixel boundaries for crisp rendering

**Using the Three Tools:**

The tool dock appears at the bottom-right of the screen in a vertical floating bar (black with 60% opacity, rounded-xl design) with three square buttons (48x48px each). The active tool is highlighted with an orange background, scale effect (110%), and orange shadow glow.

1. **Detector Tool (📡 Locate Artifacts)**:
   - **How to Use**: Tap the detector button to select it, then tap anywhere on the dig area to scan (no need to hold)
   - **Proximity Feedback**: The detector pings immediately with expanding circle animations and beep sounds based on distance to the artifact's circular boundary:
     - 🔴 **Red/Low Pitch (200Hz)**: Very far from artifact (6+ cells from boundary)
     - 🟠 **Orange/Medium Pitch (400Hz)**: Far from artifact (3-6 cells from boundary)
     - 🟡 **Yellow/Higher Pitch (600Hz)**: Close to artifact (1-3 cells from boundary)
     - 🟢 **Green/High Pitch (800Hz)**: Very close to artifact (less than 1 cell from boundary)
   - **Visual Effect**: Three expanding circles appear at your tap position with the proximity color, with 80ms delays between them
   - **Strategy**: Tap multiple locations to triangulate the artifact's position before digging. The detector calculates distance to the artifact's circular boundary, not its center.

2. **Shovel Tool (⛏️ Fast Digging)**:
   - **How to Use**: Tap the shovel button to select it, then tap anywhere on the dig area to remove dirt
   - **Dig Power**: Removes 10 depth units in a radius scaled to your grid (typically 2+ cells wide)
   - **Cooldown**: 250ms between digs (fast cadence for better feel)
   - **Visual Effect**: Expanding ring animation and brown impact particles burst outward from the dig point
   - **Three-Strike System**: The artifact has 3 "lives" shared across its entire surface:
     - **First hit**: Floating text "Careful! Shovel hits too hard!" with red particles and cell flash
     - **Second hit**: Floating text "Stop! it's cracking!" with more intense red particles
     - **Third hit**: **Breaks the artifact permanently** and triggers the discovery modal showing it as broken (💔 emoji)
   - **Strategy**: Use for quick excavation in safe areas, but switch to brush near artifacts. The damage is cumulative across the entire artifact, not per-location.

3. **Brush Tool (🖌️ Safe Excavation)**:
   - **How to Use**: Tap the brush button to select it, then tap and hold while swiping across the dig area
   - **Gentle Removal**: Removes 1 depth unit per frame in a radius scaled to your grid (typically 1.25 cells wide)
   - **No Cooldown**: Continuous use while holding and moving
   - **Safe**: Cannot damage or break artifacts - perfect for careful uncovering
   - **Visual Feedback**: 
     - Dust particle effects (small beige dots with 30% spawn chance) float upward and fade out over 500-1000ms
     - Semi-transparent brushing trail (rgba(200, 180, 150, 0.3)) follows your movement with line rendering
   - **Haptic Feedback**: Light vibration (10ms) on mobile devices if supported via navigator.vibrate
   - **Strategy**: Use near artifacts to safely expose them without risk. The brush is slower but guarantees no damage.

**Discovering Artifacts:**

4. **Artifact Uncovering**:
   - Artifacts are rendered as circular shapes in the grid (radius = min(width, height) / 2)
   - They become visible when you dig cells to a depth at or below the artifact's depth value
   - Revealed cells are filled with golden color (#FFD700) with a subtle outline for crispness
   - At 70%+ uncovered, a floating message appears: "It's beautiful, keep going!" (fades in/out over 3.2 seconds)
   - At 95%+ uncovered, a celebration animation triggers:
     - Dimmed background (rgba(0,0,0,0.45))
     - Pulsing golden glow (220px radial gradient) with scale animation
     - Expanding golden ring (260px) with fade-out animation
     - Artifact icon (📜 or 🏛️) scales up to 125% with smooth cubic-bezier easing
     - "Add to your Museum" button appears at bottom with golden gradient background
   - Discovery modal triggers when you click the "Add to your Museum" button

5. **Discovery Modal** (triggered by clicking "Add to your Museum" during celebration):
   - **For Post Artifacts (95% chance)**:
     - Animated modal with gradient background (amber-50 to orange-50) and scale-in animation
     - 🎉 emoji (text-6xl) and "Discovery!" heading for intact artifacts
     - 💔 emoji and "Artifact Broken!" heading if broken with shovel (with explanation text)
     - Shows post thumbnail (if available, 64x64px rounded), title (font-semibold, line-clamp-2), subreddit, author, and date
     - Displays text snippet if available (text-xs, line-clamp-3)
     - "Add to Museum" button (orange-500) saves it to your personal collection via POST /api/artifact/save
     - After adding: "Find More Digs" (blue-500, reloads page) and "View Your Museum" (purple-500) buttons appear
   - **For Subreddit Relics (5% chance)**:
     - Animated modal with gradient background (purple-50 to pink-50)
     - Pulsing 🏛️ emoji (animate-pulse) and "Subreddit Relic Discovered!" heading
     - Shows subreddit icon (if available, 64x64px rounded-full), name, and description
     - "Claim Relic" button (purple-500) unlocks that subreddit for future dig sites
     - After claiming: "Explore New Site" (blue-500) and "View Your Museum" (purple-500) buttons appear
   - Modal uses fixed positioning with backdrop blur (backdrop-blur-sm) and black overlay (bg-black/80)

6. **Community Stats**:
   - Each dig site tracks total artifacts found and broken by all players
   - Your actions update these community counters via `/api/stats/update` endpoint
   - Stats are stored in Redis and persist across all players

#### Museum Gameplay (Museum Posts) 🚧 **IN DEVELOPMENT**

**Viewing Your Collection:**

The Museum uses a unique horizontally scrolling 3-row layout optimized for mobile viewing:

1. **Collection Header** (sticky at top):
   - Displays "The u/{username} Collection" in amber/orange gradient
   - Stays visible while scrolling

2. **Control Banner** (sticky below header):
   - **Stats Row**: Shows 4 compact badges:
     - ✅ Found (total intact artifacts)
     - 🗺️ Subs (unique subreddits explored)
     - ⭐ First (artifacts you discovered before anyone else)
     - 💔 Broken (artifacts destroyed during excavation)
   - **Controls Row**: Sorting buttons and auto-scroll toggle:
     - 📅 Date (most recent first)
     - 💎 Rarity (lowest foundByCount first)
     - 📂 Sub (alphabetical by subreddit)
     - 🔄 Scroll (enables/disables auto-scroll)

3. **Horizontally Scrolling Gallery** (3 rows):
   - Artifacts split into 3 horizontal rows that scroll left-to-right
   - Each artifact card is 192px wide with:
     - Thumbnail or placeholder (96px tall)
     - Title (text-xs, line-clamp-2)
     - Subreddit badge (blue text)
     - Score (⬆️ with K/M formatting) and BRR/ARR date
     - Rarity badge (color-coded: gold/purple/blue/green/gray)
     - First discovery badge (🏆 animated pulse) if applicable
   - Lazy loading: Initially loads 30 artifacts, loads 30 more when scrolling near the end
   - Auto-scroll feature: Slowly scrolls the top row when enabled

4. **Artifact Detail Overlay** (tap any card):
   - Full-screen modal with white background
   - Shows full-size thumbnail, complete title, and metadata grid:
     - Subreddit, Posted date (BRR/ARR + actual age), Score, Rarity
     - Found By count, First Discovered By username
   - "You discovered this first!" banner if applicable (amber gradient)
   - Collection info: when you collected it, source dig site
   - "View on Reddit →" button (orange-500) opens original post

5. **BRR/ARR Dating System**:
   - Dates shown relative to April 1, 2018 (Reddit Redesign)
   - Uses fractional notation: ¼, ½, ¾ for quarters of a year
   - Example: "2¼ BRR" = 2.25 years before redesign
   - Detail view shows both BRR/ARR and actual age (e.g., "5 years, 3 months old")

**Current Implementation Status**: The Museum UI components are built and styled, but the full integration with the artifact persistence system is still in progress. The backend API endpoints are ready and functional.

#### Pro Tips

- **Start with the Detector**: Always scan the area first to locate the artifact before digging - tap multiple locations to triangulate its position
- **Shovel for Speed**: Use the shovel to quickly remove dirt far from the artifact (when detector shows red/orange circles)
- **Switch to Brush Near Artifacts**: Once you're close (green/yellow detector readings), switch to the brush for safe excavation
- **Watch the Uncovering**: Golden cells appear when you dig to the artifact's depth - dig carefully around it to maximize uncovered percentage
- **Three-Strike Warning**: The artifact has 3 lives total. After the first hit, you'll see "Careful!" warning. After the second, "Stop! it's cracking!" appears. The third hit anywhere on the artifact breaks it permanently.
- **Wait for 95%**: Don't rush to click "Add to Museum" - wait until 95%+ uncovered for the full celebration animation
- **Collect Relics**: The 5% relic chance unlocks new subreddits to explore - these are rare and valuable
- **Build Your Museum**: Every discovery adds to your permanent collection stored in Redis with rarity tracking

#### Important Notes

- **Immediate Gameplay**: After clicking the splash screen button, you're dropped straight into the excavation scene - no duplicate splash or menus (follows Devvit best practices)
- **Mobile Optimized**: Designed for 1-2 minute play sessions on mobile with compact tool buttons (48x48px) in a vertical floating dock at the bottom-right
- **Persistent Progress**: All discoveries saved to your museum via Redis using a centralized artifact database and player reference system
- **Per-Session Artifacts**: Each dig site has a unique artifact cached for 1 hour - it won't change mid-excavation but will be different on your next visit
- **Community Experience**: Dig site stats show collective player progress across all players
- **Real Reddit Content**: Every artifact is a real historical post from Reddit's archives (6+ months old with 10+ score)
- **Touch Controls**: Optimized for touch input with pointer events (pointerdown, pointermove, pointerup)
- **Canvas Rendering**: Uses HTML5 Canvas with 2D context and offscreen buffer for seamless rendering without seams
- **Responsive Design**: Canvas automatically scales to fit your screen with proper device pixel ratio handling, maintaining a 9:16 portrait aspect ratio
- **Square Pixels**: Uses 16px CSS per grid cell for crisp, retro-style pixel art rendering
- **Rarity System**: Each artifact tracks how many players have found it globally, creating rarity tiers with color-coded badges
- **First Discovery Tracking**: The first player to discover each artifact gets special recognition with animated badges

### For Moderators

#### Installing the App

1. Navigate to your subreddit's mod tools
2. Install Diggit Game from the Devvit app directory (or deploy it using `npm run deploy`)
3. The app will automatically create an initial dig site post on installation via the `onAppInstall` trigger

#### Creating Dig Site Posts

1. **Open Mod Menu**: Access your subreddit's moderator menu (three dots menu on desktop, or mod tools on mobile)
2. **Select "Create Dig Site"**: Choose the dig site creation option from the mod menu
3. **Choose Target Subreddit**: The system will prompt you to select which subreddit to excavate (uses the subreddit picker system)
4. **Automatic Post Creation**: The app creates a dig site post with:
   - Splash screen showing the target subreddit (e.g., "🏜️ Dig Site: r/aww")
   - Community stats (artifacts found/broken by all players)
   - "Start Digging ⛏️" button to launch the game
   - Biome and theming based on the target subreddit's colors
5. **Automatic Redirect**: You'll be automatically redirected to the newly created post

#### Managing Multiple Dig Sites

- Create as many dig site posts as you want for different subreddits
- Each dig site maintains its own independent community stats in Redis
- Players can excavate multiple dig sites simultaneously without conflicts
- Each dig site has a unique artifact cached per session (1-hour TTL)
- Monitor community engagement through the community stats displayed on each dig site's splash screen

#### Creating Museum Posts (Coming Soon)

Museum posts (Type B) are designed but not yet fully implemented. When available, moderators will be able to:
- Create museum posts that display a player's personal collection
- Each player can have one museum post showing all their discovered artifacts
- Museums will display rarity information, first discoveries, and BRR/ARR dates

### Post Types Explained

#### Type A - Dig Site Posts (Excavation Gameplay)

**Purpose:** Active gameplay where players excavate historical Reddit posts

**Visual Style:**
- Full-screen canvas-based 2D dig scene with portrait aspect ratio (9:16)
- Biome-themed borders (grass/rock/sand/swamp) with subreddit-specific colors
- Layered dirt rendering with depth-based darkening
- Golden artifact reveals with celebration animations
- Compact vertical tool dock at bottom-right (black with 60% opacity)

**Features:**
- Three excavation tools: Detector (📡), Shovel (⛏️), Brush (🖌️)
- Real-time dirt removal with visual feedback (particles, rings, trails)
- Progressive artifact uncovering (0% to 100%)
- Discovery modal with artifact details and museum integration
- Community stats tracking (artifacts found/broken by all players)
- 5% chance for subreddit relics that unlock new dig sites

**Technical Details:**
- Entry point: Determined by `/api/init` returning `postType: 'typeA'`
- Canvas rendering with offscreen buffer for seamless dirt updates
- Dynamic grid sizing based on screen dimensions
- Pointer event handling for touch and mouse input
- Redis storage for dig site data and community stats

**Best For:** Players who want active gameplay, tactile excavation mechanics, and the thrill of discovery

#### Type B - Museum Posts (Collection Display)

**Purpose:** Personal collection hub showing all discovered artifacts

**Visual Style:**
- Horizontally scrolling 3-row gallery layout
- Compact artifact cards (192px wide) with thumbnails and metadata
- Sticky header ("The u/{username} Collection") and control banner
- Color-coded rarity badges (gold/purple/blue/green/gray)
- Frosted glass detail overlay with full artifact information

**Features:**
- BRR/ARR dating system (Before/After Reddit Redesign - April 1, 2018)
- Rarity tracking based on global foundByCount
- First discovery badges for artifacts you found before anyone else
- Sorting options: date, rarity, subreddit
- Auto-scroll feature for passive browsing
- Detailed artifact overlay with original Reddit post link

**Technical Details:**
- Entry point: Determined by `/api/init` returning `postType: 'typeB'`
- React-based UI with horizontal scrolling and lazy loading
- Centralized artifact database with player reference system
- Sticky positioning for header and controls
- Redis storage for player collections and artifact metadata

**Current Status:** 🚧 Components built and styled, full integration in progress

**Best For:** Players who want to admire their collection, track progression, and explore rarity information

#### Unified Entry Point

Both post types are served from a single `index.html` file that uses React-based routing:

1. The `AppRouter` component fetches the post type from `/api/init`
2. Based on the `postType` response (`typeA` or `typeB`), it renders the appropriate App component
3. This eliminates the need for separate HTML files while maintaining distinct experiences
4. Fallback to Type A if the API call fails

## Getting Started (For Developers)

> Make sure you have Node 22 downloaded on your machine before running!

1. Clone this repository or run `npm create devvit@latest --template=react`
2. Go through the installation wizard. You will need to create a Reddit account and connect it to Reddit developers
3. Run `npm install` to install dependencies
4. Copy the command on the success page into your terminal

## Development Commands

- `npm run dev`: Starts a development server where you can develop your application live on Reddit
- `npm run build`: Builds both client (typeA and typeB) and server projects
- `npm run deploy`: Uploads a new version of your app to Reddit
- `npm run launch`: Publishes your app for review
- `npm run login`: Logs your CLI into Reddit
- `npm run check`: Type checks, lints, and prettifies your app

## Project Architecture

```
src/
├── client/
│   ├── index.html       # Unified entry point for all post types
│   ├── main.tsx         # React initialization with AppRouter
│   ├── index.css        # Global styles (Tailwind)
│   ├── typeA/           # Dig Site (excavation game)
│   │   ├── App.tsx      # Main dig site component
│   │   ├── game/        # Game engine and systems
│   │   │   ├── GameEngine.ts        # Core game loop and state management
│   │   │   ├── DigSceneRenderer.ts  # Canvas rendering with offscreen buffer
│   │   │   ├── ArtifactSystem.ts    # Artifact uncovering logic
│   │   │   └── tools/               # Excavation tools
│   │   │       ├── Tool.ts          # Base tool interface
│   │   │       ├── ToolManager.ts   # Tool selection and coordination
│   │   │       ├── DetectorTool.ts  # Proximity detection with audio/visual feedback
│   │   │       ├── ShovelTool.ts    # Fast digging with damage system
│   │   │       └── BrushTool.ts     # Safe excavation with particles
│   │   └── components/  # React UI components
│   │       ├── ToolDock.tsx         # Vertical tool selection dock
│   │       └── DiscoveryModal.tsx   # Artifact discovery modal
│   ├── typeB/           # Museum (collection display)
│   │   ├── App.tsx      # Main museum component
│   │   ├── components/  # Museum UI components
│   │   │   ├── Museum.tsx               # Main museum container
│   │   │   ├── CollectionHeader.tsx     # Sticky header with username
│   │   │   ├── ControlBanner.tsx        # Stats and sorting controls
│   │   │   ├── ArtifactMasonryGrid.tsx  # 3-row horizontal scrolling grid
│   │   │   ├── ArtifactCard.tsx         # Compact artifact card (192px)
│   │   │   ├── ArtifactTile.tsx         # Alternative tile layout
│   │   │   ├── ArtifactDetailOverlay.tsx # Full artifact details modal
│   │   │   └── Badges.tsx               # Rarity and discovery badges
│   │   └── utils/       # Museum utilities
│   │       └── dateCalculator.ts    # BRR/ARR date formatting
│   ├── shared/          # Shared client code
│   │   ├── components/  # Reusable React components
│   │   │   └── UserActionDialog.tsx  # User consent dialog
│   │   └── utils/       # API utilities and helpers
│   │       └── api.ts   # fetchAPI helper with error handling
│   ├── vite.config.ts   # Vite build configuration
│   └── tsconfig.json    # TypeScript configuration
├── server/
│   ├── index.ts         # Express server with API endpoints
│   ├── core/            # Business logic modules
│   │   ├── post.ts      # Post creation (createDigSitePost, createMuseumPost)
│   │   ├── digsite.ts   # Dig site data management
│   │   ├── museum.ts    # Museum data management
│   │   ├── reddit.ts    # Reddit API integration (historical posts, themes)
│   │   ├── data.ts      # Reddit data fetching (getDataFeed)
│   │   ├── artifact-db.ts         # Centralized artifact database
│   │   ├── artifact-discovery.ts  # Artifact save and discovery logic
│   │   ├── museum-data.ts         # Museum queries and sorting
│   │   ├── player-references.ts   # Player artifact references
│   │   └── subreddit-picker.ts    # Subreddit selection system
│   ├── vite.config.ts   # Server build configuration
│   └── tsconfig.json    # TypeScript configuration
└── shared/
    └── types/           # Shared TypeScript types
        ├── api.ts       # API request/response types
        ├── game.ts      # Game data types (DirtLayer, ArtifactData, etc.)
        └── artifact.ts  # Artifact persistence types (CentralizedArtifact, etc.)
```

## Key Features

### Dual Post Type System

- **Two Distinct Post Types**: Type A (dig sites) and Type B (museums) with completely different gameplay
- **Unified Entry Point**: Single `index.html` with React-based routing (`AppRouter` component)
- **Dynamic Post Type Detection**: Fetches post type from `/api/init` and renders appropriate component
- **Independent React Applications**: Each type has its own `App.tsx` with unique mechanics and UI
- **Dig Site (Type A)**: Canvas-based excavation game with real-time rendering and tool system
- **Museum (Type B)**: React-based collection gallery with horizontal scrolling and rarity tracking
- **Shared Components**: Reusable components in `src/client/shared/` (UserActionDialog, API utilities)
- **Fallback Handling**: Defaults to Type A if API call fails

### Centralized API Layer (Express Server)

**Game Initialization:**
- **`GET /api/init`**: Initialize game state, fetch user data, and determine post type
  - Returns: `{ type: 'init', postId: string, postType: 'typeA' | 'typeB', username: string }`
  - Fetches post type from Redis to route to correct app
  - Gets current Reddit username via `reddit.getCurrentUsername()`

**Dig Site APIs (Type A):**
- **`GET /api/digsite/:postId`**: Fetch dig site configuration and artifact data
  - Returns: `{ postType: 'typeA', targetSubreddit, biome, dirtMaterials, borderColor, artifact, communityStats }`
  - Generates or retrieves cached artifact for the session (1-hour TTL)
  - Fetches community stats (artifacts found/broken by all players)
- **`POST /api/digsite/create`**: Create new dig site post for a target subreddit
  - Body: `{ targetSubreddit: string }`
  - Initializes community stats and stores dig site metadata in Redis
  - Returns navigation URL to the new post

**Museum APIs (Type B):**
- **`GET /api/museum/:userId`**: Fetch player's museum collection with sorting
  - Query params: `sortBy` ('date' | 'rarity' | 'subreddit'), `includeBroken` (boolean)
  - Returns: `{ userId, artifacts: ArtifactWithPlayerData[], stats: { totalFound, totalBroken, uniqueSubreddits, firstDiscoveries } }`
  - Joins player references with centralized artifact database
  - Calculates first discoveries (artifacts where player is firstDiscoveredBy)
- **`POST /api/museum/create`**: Create museum post for a player
  - Body: `{ userId: string }`
  - Initializes empty collection in Redis

**Artifact Persistence:**
- **`POST /api/artifact/save`**: Save discovered artifact to player's museum
  - Body: `{ userId, artifactData, sourceDigSite, isBroken }`
  - Creates centralized artifact if it doesn't exist (records firstDiscoveredBy)
  - Increments foundByCount for rarity tracking
  - Creates player reference linking player to artifact
  - Returns: `{ success, artifactId, foundByCount, rarityTier }`
- **`GET /api/artifact/:artifactId`**: Fetch details for a specific artifact
  - Returns full CentralizedArtifact data with global stats

**Stats Tracking:**
- **`POST /api/stats/update`**: Update community and player stats
  - Body: `{ postId, userId, action: 'found' | 'broken' }`
  - Increments community stats for the dig site
  - Updates player's museum stats

### Internal Endpoints (Mod Tools)

- **`POST /internal/on-app-install`**: Automatically creates initial dig site post on app installation
- **`POST /internal/menu/create-digsite`**: Creates dig site post from mod menu with subreddit picker
- **`POST /internal/menu/create-museum`**: Creates museum post from mod menu (coming soon)

### Reddit Integration

- **Historical Post Fetching**: Fetches posts older than 6 months with 10+ score via `reddit.getTopPosts()`
- **Subreddit Theme Extraction**: Extracts primary colors and icons via `reddit.getSubredditInfoByName()`
- **User Profile Data**: Current username via `reddit.getCurrentUsername()`
- **Post Caching**: 24-hour cache for fetched posts to reduce API calls
- **Subreddit Picker**: Interactive subreddit selection system for moderators
- **Automatic Authentication**: Devvit middleware handles Reddit authentication automatically
- **Context-Aware**: Server has access to `context.postId` and `context.subredditName` for all requests

### State Management

**Redis Storage Schema:**
- **Dig Site Data**: `digsite:{postId}` stores target subreddit, biome, community stats
- **Artifact Cache**: `artifact:cache:{sessionId}` stores artifact data with 1-hour TTL
- **Centralized Artifacts**: `artifact:{artifactId}` stores unique artifacts once with global stats
- **Player References**: `player:{userId}:artifacts` stores player's artifact collection
- **Player Stats**: `museum:{userId}` stores player's museum stats and progression
- **Broken Counter**: `player:{userId}:broken_count` tracks broken artifacts separately

**Client State Management:**
- **GameEngine**: Manages game loop, dirt layer state, artifact uncovering, and tool coordination
- **React State**: Loading states, tool selection, discovery modal visibility, celebration animations
- **Canvas Rendering**: Offscreen buffer for seamless dirt updates without seams
- **Lazy Loading**: Museum loads 30 artifacts initially, then 30 more on scroll

**Persistence:**
- **Automatic Saving**: All discoveries immediately saved to Redis via `/api/artifact/save`
- **Session Caching**: Artifacts cached per session to prevent mid-excavation changes
- **Community Stats**: Atomic increments for concurrent player updates
- **Error Handling**: Graceful fallbacks with retry logic and user-friendly messages

## Cursor Integration

This template comes with a pre-configured cursor environment. To get started, [download cursor](https://www.cursor.com/downloads) and enable the `devvit-mcp` when prompted.

## Development Status

### ✅ Fully Implemented (Type A - Dig Sites)

- Canvas-based excavation game with dynamic grid sizing
- Three excavation tools with distinct mechanics and visual feedback
- Real-time dirt removal and artifact uncovering
- Progressive artifact reveal with celebration animations
- Discovery modal with post/relic variants
- Community stats tracking
- Subreddit theming and biome generation
- Historical post fetching from Reddit API
- Artifact caching system
- Mobile-optimized touch controls

### 🚧 In Progress (Type B - Museums)

- Horizontally scrolling 3-row gallery layout ✅
- Compact artifact cards with thumbnails and metadata ✅
- BRR/ARR date formatting utility ✅
- Rarity badge components ✅
- Collection header and control banner ✅
- Artifact detail overlay ✅
- Centralized artifact database ✅
- Player reference system ✅
- First discovery tracking ✅
- Integration with artifact persistence API (in progress)
- Museum post creation flow (in progress)

### 📋 Planned Features

- Subreddit relic claiming and new dig site creation
- Museum sorting and filtering
- Auto-scroll feature for museum background
- Achievement system
- Leaderboards for first discoveries
- Custom collections/folders
- Artifact sharing
- Export collection functionality

## Contributing

This project demonstrates advanced Devvit patterns including:

- Canvas-based game rendering with offscreen buffers
- Multi-post type architecture with intelligent routing
- Centralized artifact database with player references
- Real-time touch controls and haptic feedback
- Reddit API integration for historical content
- Type-safe client-server communication
- Mobile-first responsive design
- Rarity tracking and first discovery system

Feel free to use this as a foundation for your own Reddit games!
