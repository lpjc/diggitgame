## Diggit Game

**Subreddit Excavator** - An interactive archaeology game built on Reddit's Devvit platform where players uncover forgotten Reddit artifacts (historical posts) buried in dig sites representing different subreddits. Using tactile excavation tools, players carefully dig through layered dirt to discover posts from Reddit's history, with each discovery adding to their personal museum collection.

### What is Diggit Game?

Diggit Game is a mobile-first archaeology experience that transforms Reddit's history into an engaging excavation game. The game features two distinct post types that work together to create a complete gameplay loop:

**Dig Site Posts (Type A)**: Active gameplay where you excavate historical Reddit posts
- Each dig site represents a specific subreddit (e.g., r/aww, r/denmark)
- Canvas-based 2D top-down view of a dig area with layered dirt (100x100 grid, depth 0-60)
- Three excavation tools: Detector (locate artifacts), Shovel (fast digging with risk), and Brush (safe, careful removal)
- Randomized biomes (grass, rock, sand, swamp) themed to match the target subreddit's colors
- Community stats showing total artifacts found and broken by all players at this dig site
- 5% chance to discover subreddit relics that unlock new dig sites
- Immediate gameplay - the game starts automatically when you open the post

**Museum Posts (Type B)**: Your personal collection and progression hub
- Displays all artifacts you've discovered across all dig sites
- Shows your personal stats: total artifacts found, broken, and subreddits unlocked
- Grid layout of collected posts with thumbnails and discovery dates
- Broken artifacts appear as cracked silhouettes
- Subreddit relics displayed as glowing icons on pedestals
- Tap relics to create new dig sites for those subreddits

The game uses intelligent routing to automatically detect which post type you're viewing. When you open any Diggit Game post, a polished loading screen with an animated blue spinner appears while the app fetches the post type from the server, then seamlessly loads either the dig site excavation game or your personal museum.

### What Makes This Game Innovative?

1. **Reddit History as Gameplay**: Transforms Reddit's vast archive into discoverable artifacts, giving new life to forgotten posts (6+ months old with engagement). Every artifact is real Reddit content with actual titles, authors, thumbnails, and post dates.

2. **Immediate Gameplay**: The game starts automatically when you open a dig site post. You're instantly dropped into the excavation scene with tools ready to use - no duplicate splash screens or menus.

3. **Tactile Tool System**: Three distinct excavation tools with realistic mechanics:
   - **Detector (📡)**: Tap and hold to scan for artifacts. Get proximity feedback with color-coded expanding circles (red=far, orange=closer, yellow=near, green=very close) and pitch-varying beep sounds (200Hz-800Hz) that guide you to the buried treasure
   - **Shovel (⛏️)**: Fast digging (removes 10 depth units in 15px radius) with 500ms cooldown. Hitting artifacts shows a red crack warning (X pattern), and hitting the same spot twice breaks them permanently
   - **Brush (🖌️)**: Slow, safe removal (1 depth unit/second in 8px radius) that can't damage artifacts. Creates dust particle effects that float upward and provides light haptic feedback (10ms vibration on supported devices)

4. **Dynamic Subreddit Theming**: Each dig site automatically adapts to its target subreddit's visual identity (primary colors, icons, biome type), making every excavation feel unique and connected to that community

5. **Risk-Reward Mechanics**: Players must balance speed (shovel) vs safety (brush), with the detector helping locate artifacts. Breaking artifacts increments your "broken" counter and adds broken pieces to your museum, adding consequence to careless digging

6. **Canvas-Based Rendering**: Real-time 2D dirt layer system with depth-based color darkening (darker = deeper), where each cell has a depth value (0-60). Includes random pebbles for visual variety and biome-specific border decorations

7. **Progressive Artifact Uncovering**: Artifacts become visible when you dig within 8 layers of their depth, fading from dark silhouette (0% uncovered) to full clarity (100% uncovered), with a golden glow effect and shadow blur at 70%+ discovery

8. **Community-Driven Exploration**: Discovering subreddit relics (5% chance) unlocks new dig sites, encouraging players to explore diverse Reddit communities organically. Claiming a relic automatically posts a comment announcing your discovery

9. **Dual Post Architecture**: Dig sites (Type A) for gameplay and museums (Type B) for collection create a natural progression loop - play → discover → collect → unlock → play new sites

10. **Mobile-First Touch Controls**: Optimized for 1-2 minute play sessions on mobile with thumb-friendly tool buttons (64x64px) in a floating dock at the bottom (black background with 70% opacity, rounded full design), responsive touch handling, and haptic feedback

11. **Persistent Progression**: All discoveries saved to your personal museum via Redis, community stats tracked per dig site, and unlocked subreddits persist across sessions. Artifacts are cached per session (1-hour TTL) to prevent them from changing mid-excavation

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

1. **Find a Dig Site Post**: Look for Diggit Game posts in your Reddit feed - they'll show the target subreddit (e.g., "🏜️ Dig Site: r/aww") with community stats
2. **Click the Post**: Click on the post to open it in Reddit - you'll see the splash screen with the dig site information
3. **Click "Start Digging"**: Click the button on the splash screen to open the webview
4. **Loading Screen**: You'll see a polished loading screen with an animated blue spinner and "Loading game..." text while the dig site initializes
5. **Instant Gameplay**: The game starts automatically! You're immediately dropped into the excavation scene with your tools ready

#### Excavation Gameplay (Dig Site Posts)

**Understanding the Dig Scene:**

The game displays a top-down 2D view of a 100x100 cell dig area rendered on an HTML5 canvas:
- **Layered Dirt**: Each cell has a depth value from 0 (fully excavated) to 60 (untouched)
- **Biome Border**: Decorative border around the dig area themed to the target subreddit (grass/rock/sand/swamp) with subreddit-specific colors
- **Hidden Artifact**: A historical Reddit post (or rare subreddit relic) buried at random position and depth (40-60 units)
- **Visual Depth**: Deeper dirt appears darker with cooler hues to simulate depth (up to 40% darker at max depth)
- **Pebbles & Particles**: Random decorative elements add visual variety to the dig scene

**Using the Three Tools:**

The tool dock appears at the bottom center of the screen in a floating black bar (70% opacity, rounded full design) with three circular buttons (64x64px each). The active tool is highlighted with an orange background, scale effect (110%), and orange shadow glow.

1. **Detector Tool (📡 Locate Artifacts)**:
   - **How to Use**: Tap the detector button to select it, then tap and hold anywhere on the dig area to scan
   - **Proximity Feedback**: The detector pings every ~1 second with expanding circle animations and beep sounds:
     - 🔴 **Red/Low Pitch (200Hz)**: Very far from artifact (50+ cells away)
     - 🟠 **Orange/Medium Pitch (400Hz)**: Far from artifact (30-50 cells)
     - 🟡 **Yellow/Higher Pitch (600Hz)**: Close to artifact (15-30 cells)
     - 🟢 **Green/High Pitch (800Hz)**: Very close to artifact (5-15 cells)
   - **Visual Effect**: Three expanding circles appear at your cursor/finger position with the proximity color
   - **Strategy**: Scan the area systematically to triangulate the artifact's location before digging

2. **Shovel Tool (⛏️ Fast Digging)**:
   - **How to Use**: Tap the shovel button to select it, then tap anywhere on the dig area to remove dirt
   - **Dig Power**: Removes 10 depth units in a 15-pixel radius
   - **Cooldown**: 500ms between digs (prevents spam clicking)
   - **Visual Effect**: Brown circular patch appears where you dig
   - **Risk**: If you hit an artifact, you'll see red crack lines (X pattern) as a warning
   - **Breaking Artifacts**: Hitting the same artifact location twice **breaks it permanently** and triggers the discovery modal showing it as broken (💔 emoji)
   - **Strategy**: Use for quick excavation in safe areas, but switch to brush near artifacts

3. **Brush Tool (🖌️ Safe Excavation)**:
   - **How to Use**: Tap the brush button to select it, then tap and hold while swiping across the dig area
   - **Gentle Removal**: Removes 1 depth unit per second in an 8-pixel radius
   - **No Cooldown**: Continuous use while holding
   - **Safe**: Cannot damage or break artifacts - perfect for careful uncovering
   - **Visual Feedback**: 
     - Dust particle effects (small beige dots with 30% spawn chance) float upward from the brush area
     - Semi-transparent brushing trail (rgba(200, 180, 150, 0.3)) follows your movement
   - **Haptic Feedback**: Light vibration (10ms) on mobile devices if supported
   - **Strategy**: Use near artifacts to safely expose them without risk

**Discovering Artifacts:**

4. **Artifact Uncovering**:
   - Artifacts become visible when you dig within 8 layers of their depth
   - They fade from dark silhouette (0% uncovered) to full clarity (100% uncovered)
   - At 70%+ uncovered, the artifact glows with a golden outline (rgba(255, 215, 0)) and shadow blur effect (15px)
   - Discovery modal triggers automatically when approximately 70% of the artifact's surface is exposed
   - Artifacts show an icon: 📜 for posts, 🏛️ for subreddit relics

5. **Discovery Modal**:
   - **For Post Artifacts (95% chance)**:
     - Animated modal with gradient background (amber-50 to orange-50) and scale-in animation
     - 🎉 emoji and "Discovery!" heading for intact artifacts
     - 💔 emoji and "Artifact Broken!" heading if broken with shovel
     - Shows post title, thumbnail (if available), subreddit, author, and date
     - Displays text snippet if available (up to 200 characters, line-clamp-3)
     - "Add to Museum" button (orange-500) saves it to your personal collection via API call
     - After adding: "Find More Digs" (blue-500, reloads page) and "View Your Museum" (purple-500) buttons appear
   - **For Subreddit Relics (5% chance)**:
     - Animated modal with gradient background (purple-50 to pink-50)
     - Pulsing 🏛️ emoji and "Subreddit Relic Discovered!" heading
     - Shows subreddit icon (if available), name, and description
     - "Claim Relic" button (purple-500) unlocks that subreddit for future dig sites
     - Automatically posts a comment on the dig site announcing your discovery
     - After claiming: "Explore New Site" (blue-500) and "View Your Museum" (purple-500) buttons appear

6. **Community Stats**:
   - Each dig site tracks total artifacts found and broken by all players
   - Your actions update these community counters via `/api/stats/update` endpoint
   - Stats are stored in Redis and persist across all players

#### Museum Gameplay (Museum Posts)

**Viewing Your Collection:**

1. **Personal Museum**: Each player can create one museum post showing their complete collection
2. **Stats Summary**: Displays your total artifacts found, broken, and subreddits unlocked at the top
3. **Artifact Grid**: 
   - Collected posts shown with thumbnails, subreddit, and discovery date in a responsive grid layout
   - Tap any artifact to view the original Reddit post details
   - Broken artifacts appear as cracked silhouettes or dust piles
4. **Relic Pedestals**:
   - Unlocked subreddits displayed as glowing icons on pedestals
   - Tap a relic to create a new dig site post for that subreddit
5. **Progression Tracking**: See your complete excavation history and unlocked communities

**Current Implementation Status**: The Museum UI (Type B) is designed but not yet fully implemented. The backend API endpoints (`/api/museum/:userId`, `/api/museum/create`, `/api/museum/add-artifact`) are ready and functional.

#### Pro Tips

- **Start with the Detector**: Always scan the area first to locate the artifact before digging - this saves time and prevents accidental breaks
- **Shovel for Speed**: Use the shovel to quickly remove dirt far from the artifact (when detector shows red/orange circles)
- **Switch to Brush Near Artifacts**: Once you're close (green/yellow detector readings), switch to the brush for safe excavation
- **Watch the Uncovering**: The artifact silhouette appears when you're within 8 layers - dig carefully around it to maximize uncovered percentage
- **Avoid Double-Hitting**: If you see red crack lines (X pattern), you've hit the artifact once - don't hit that spot again or it will break!
- **Collect Relics**: The 5% relic chance unlocks new subreddits to explore - these are rare and valuable
- **Build Your Museum**: Every discovery adds to your permanent collection stored in Redis

#### Important Notes

- **Immediate Gameplay**: After clicking the splash screen button, you're dropped straight into the excavation scene - no duplicate splash or menus
- **Mobile Optimized**: Designed for 1-2 minute play sessions on mobile with thumb-friendly tool buttons (64x64px) in a floating dock at the bottom
- **Persistent Progress**: All discoveries saved to your museum via Redis, accessible anytime
- **Per-Session Artifacts**: Each dig site has a unique artifact cached for 1 hour - it won't change mid-excavation but will be different on your next visit
- **Community Experience**: Dig site stats show collective player progress across all players
- **Real Reddit Content**: Every artifact is a real historical post from Reddit's archives (6+ months old with 10+ score)
- **Touch Controls**: Optimized for touch input with pointer events (pointerdown, pointermove, pointerup)
- **Canvas Rendering**: Uses HTML5 Canvas with 2D context for smooth real-time rendering
- **Responsive Design**: Canvas automatically scales to fit your screen with proper device pixel ratio handling

### For Moderators

#### Installing the App

1. Navigate to your subreddit's mod tools
2. Install Diggit Game from the Devvit app directory (or deploy it using `npm run deploy`)
3. The app will automatically create an initial Type A post on installation via the `onAppInstall` trigger

#### Creating Game Posts

1. **Open Mod Menu**: Access your subreddit's moderator menu (three dots menu on desktop, or mod tools on mobile)
2. **Choose Game Mode**:
   - Select **"Create PostA"** for the classic minimalist experience with clean white background
   - Select **"Create PostB"** for the advanced visual experience with gradient background and hot posts preview
3. **Automatic Post Creation**: The app creates the post with the appropriate splash screen configuration:
   - Type A: "Welcome to Type A!" with "Launch Type A" button
   - Type B: "Welcome to Type B!" with "Launch Type B" button
4. **Automatic Redirect**: You'll be automatically redirected to the newly created post
5. **Post Configuration**: Each post is created with:
   - Custom splash screen with app icon and background
   - Post type stored in Redis for routing
   - Initial counter value set to 0

#### Managing Multiple Posts

- Create as many game posts as you want (both Type A and Type B)
- Each post maintains its own independent counter state in Redis (key: `count` per post context)
- Players can interact with multiple posts simultaneously without conflicts
- Use different post types to offer variety to your community:
  - Type A for quick, casual interactions
  - Type B for users who want more community context
- Monitor community engagement through the shared counter values

### Game Modes Explained

#### Type A - Classic Mode

**Visual Style:**

- Clean white background for distraction-free gameplay
- Reddit orange (#d93900) circular buttons with hover effects (#c03300)
- Minimalist design with subtle shadows
- Regular post height (fits naturally in feed)
- Blue badge in top-right corner displaying "Type A (typeA)"
- Snoo mascot image at the top

**Features:**

- Large circular counter buttons (56px × 56px) with `-` and `+` symbols
- Counter display in the center (1.8em font size) showing current value
- Reddit username greeting: "Hey [username] 👋"
- Descriptive text: "This is Type A Post - Classic game mode"
- Subreddit information card with white background and shadow:
  - Subreddit name (e.g., "r/diggitgame_dev")
  - Subscriber count
  - Your personal karma score
- Footer with quick links to Devvit resources (Docs, r/Devvit, Discord)
- Loading state shows "..." in counter during API calls
- Buttons disabled during loading to prevent double-clicks

**Technical Details:**

- Entry point: `typeA.html`
- Splash screen: "Welcome to Type A!" with "Launch Type A" button
- Post type identifier: `typeA` stored in Redis

**Best For:** Quick interactions, casual gameplay, users who prefer simplicity and clean design

#### Type B - Advanced Mode

**Visual Style:**

- Beautiful gradient background (from-purple-50 to-blue-50)
- Purple-themed buttons (#7c3aed) with hover effects (#6d28d9)
- Frosted glass UI cards with backdrop blur and transparency (bg-white/80)
- Tall post height for more immersive experience
- Purple badge in top-right corner displaying "Type B (typeB)"
- Snoo mascot image at the top

**Features:**

- All Type A features PLUS:
- Enhanced "Community Data" card with frosted glass effect:
  - Subreddit name and subscriber count
  - Your karma score
  - **Top 3 hot posts** from the community (titles truncated to 40 characters with "...")
  - Purple color scheme throughout (text-purple-900, text-purple-700, text-purple-600)
- Enhanced visual polish with rounded corners, shadows, and transparency
- Purple-themed greeting: "Welcome [username]! 🎮"
- Descriptive text: "This is Type B Post - Advanced game mode"

**Technical Details:**

- Entry point: `typeB.html`
- Splash screen: "Welcome to Type B!" with "Launch Type B" button
- Post type identifier: `typeB` stored in Redis

**Best For:** Users who want more context, community engagement, richer visual experience, and enhanced aesthetics

#### Unified Entry Point

Both modes are served from a single `index.html` file that uses React-based routing:

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
│   ├── typeA/           # Classic mode game
│   │   ├── index.html   # Type A specific entry (for Vite build)
│   │   ├── main.tsx     # Type A React initialization
│   │   └── App.tsx      # Type A game component
│   ├── typeB/           # Advanced mode game
│   │   ├── index.html   # Type B specific entry (for Vite build)
│   │   ├── main.tsx     # Type B React initialization
│   │   └── App.tsx      # Type B game component
│   ├── shared/          # Shared client code
│   │   ├── components/  # Reusable React components
│   │   │   └── UserActionDialog.tsx  # User consent dialog
│   │   └── utils/       # API utilities and helpers
│   │       └── api.ts   # fetchAPI helper with error handling
│   ├── hooks/           # Custom React hooks
│   │   └── useCounter.ts  # Counter state management hook
│   ├── public/          # Static assets
│   │   └── snoo.png     # Reddit mascot image
│   ├── vite.config.ts   # Vite build configuration
│   └── tsconfig.json    # TypeScript configuration
├── server/
│   ├── index.ts         # Express server with API endpoints
│   ├── core/            # Business logic modules
│   │   ├── post.ts      # Post creation logic (createPostA, createPostB)
│   │   ├── data.ts      # Reddit data fetching (getDataFeed)
│   │   └── userActions.ts  # User post/comment creation
│   ├── vite.config.ts   # Server build configuration
│   └── tsconfig.json    # TypeScript configuration
└── shared/
    └── types/           # Shared TypeScript types
        └── api.ts       # API request/response types
```

## Key Features

### Multi-Post Type System

- **Two Distinct Post Types**: Type A (classic) and Type B (advanced) with separate visual themes
- **Unified Entry Point**: Single `index.html` with React-based routing (`AppRouter` component)
- **Dynamic Post Type Detection**: Fetches post type from `/api/init` and renders appropriate component
- **Independent React Applications**: Each type has its own `App.tsx` with unique styling and features
- **Vite Multi-Entry Build**: Generates `typeA.html` and `typeB.html` in `dist/client` for separate builds
- **Shared Components**: Reusable components in `src/client/shared/` (UserActionDialog, API utilities)
- **Custom Hooks**: `useCounter` hook manages counter state and API calls for both types
- **Fallback Handling**: Defaults to Type A if API call fails

### Centralized API Layer (Express Server)

- **`GET /api/init`**: Initialize game state, fetch user data, and determine post type
  - Returns: `{ type: 'init', postId: string, postType: 'typeA' | 'typeB', count: number, username: string }`
  - Fetches counter value from Redis key `count`
  - Fetches post type from Redis key `post:{postId}:type`
  - Gets current Reddit username via `reddit.getCurrentUsername()`
- **`POST /api/increment`**: Increment counter value by 1
  - Returns: `{ type: 'increment', postId: string, count: number }`
  - Uses Redis `incrBy('count', 1)` for atomic increment
- **`POST /api/decrement`**: Decrement counter value by 1
  - Returns: `{ type: 'decrement', postId: string, count: number }`
  - Uses Redis `incrBy('count', -1)` for atomic decrement
- **`GET /api/data-feed`**: Fetch Reddit community data (subreddit info, hot posts, user karma)
  - Returns: `{ posts: PostSummary[], subredditInfo: SubredditInfo, userData?: UserData }`
  - Fetches hot posts, subreddit info, and user data in parallel using `Promise.all`
- **`POST /api/create-user-post`**: Create posts on user's behalf (requires consent)
  - Body: `{ action: 'create-post', data: { title, content, subredditName }, consent: boolean }`
  - Uses `runAs: 'USER'` for user-generated content
- **`POST /api/create-user-comment`**: Create comments on user's behalf (requires consent)
  - Body: `{ action: 'create-comment', data: { postId, text }, consent: boolean }`
  - Uses `runAs: 'USER'` for user-generated content

### Internal Endpoints (Mod Tools)

- **`POST /internal/on-app-install`**: Automatically creates initial Type A post on app installation
- **`POST /internal/menu/create-post-a`**: Creates Type A post from mod menu, returns navigation URL
- **`POST /internal/menu/create-post-b`**: Creates Type B post from mod menu, returns navigation URL

### Reddit Integration

- **Real-Time Subreddit Statistics**: Subscriber count, subreddit name, description via `reddit.getSubredditInfoByName()`
- **User Profile Data**: Current username via `reddit.getCurrentUsername()`, karma score, account creation date
- **Hot Posts Feed**: Top 10 hot posts from the community via `reddit.getHotPosts()` (Type B displays top 3)
- **User Action Capabilities**: Infrastructure for creating posts/comments with consent flows via UserActionDialog
- **Automatic Authentication**: Devvit middleware handles Reddit authentication automatically
- **Context-Aware**: Server has access to `context.postId` and `context.subredditName` for all requests

### State Management

- **Redis-Backed Storage**: Counter values stored per-post with key `count` (scoped to post context)
- **Post Type Tracking**: Post types stored in Redis with key `post:{postId}:type` (values: 'typeA' or 'typeB')
- **React Hooks**: `useCounter` hook manages local state and API synchronization
  - Fetches initial data on mount via `/api/init`
  - Provides `increment` and `decrement` callbacks
  - Manages loading states during API calls
  - Disables buttons during loading to prevent race conditions
- **Automatic Persistence**: All counter changes immediately saved to Redis via atomic operations
- **Loading States**: UI reflects loading status during API calls (shows "..." in counter, disables buttons)
- **Error Handling**: Graceful fallbacks if API calls fail, with console error logging

## Cursor Integration

This template comes with a pre-configured cursor environment. To get started, [download cursor](https://www.cursor.com/downloads) and enable the `devvit-mcp` when prompted.

## Contributing

This project demonstrates advanced Devvit patterns including:

- Multiple post type architecture
- Centralized data access with Reddit API
- User action capabilities
- Type-safe client-server communication
- Mobile-first responsive design

Feel free to use this as a foundation for your own multi-mode Reddit games!
