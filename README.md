## Diggit Game

A dual-mode interactive counter game built on Reddit's Devvit platform, featuring two distinct gameplay experiences with real-time Reddit integration and community data visualization.

### What is Diggit Game?

Diggit Game is a multi-post-type Devvit application that showcases the power of Reddit's developer platform through two unique game modes. At its core, it's an interactive counter where players can increment and decrement a shared value, but it goes beyond simple counting by integrating live Reddit community data and user information.

The game uses intelligent routing to automatically detect which post type you're viewing and render the appropriate experience - all from a single unified codebase. When you click the splash screen on any Diggit Game post, the app displays a polished loading screen with an animated spinner while it fetches your post type from the server, then instantly loads the correct game mode.

**Type A (Classic Mode)**: A clean, minimalist counter experience featuring:

- Reddit orange-themed circular buttons with smooth hover effects
- Clean white background for distraction-free gameplay
- Your Reddit username displayed prominently with a friendly greeting
- Real-time subreddit information card showing community name, subscriber count, and your personal karma
- Regular post height for standard feed integration
- Simple, intuitive interface perfect for quick interactions

**Type B (Advanced Mode)**: An enhanced visual experience with:

- Beautiful purple-to-blue gradient background creating an immersive atmosphere
- Purple-themed circular buttons matching the gradient aesthetic
- All Type A features plus hot post previews from the community
- Top 3 trending posts displayed in an elegant frosted glass card with backdrop blur effects
- Enhanced visual polish with shadows and transparency
- Tall post height for more immersive gameplay
- Perfect for users who want more context about the community

Both modes share the same counter state per post (stored in Redis), meaning the count persists across sessions and is shared by all players viewing that specific post. The counter updates in real-time as you click, with loading states preventing double-clicks.

### What Makes This Game Innovative?

1. **Intelligent Multi-Post Architecture**: Demonstrates advanced Devvit capabilities with a unified entry point that dynamically routes to different game modes based on post type, eliminating code duplication while maintaining distinct experiences

2. **Polished Loading Experience**: Features a custom loading screen with animated spinner and gradient background that provides visual feedback while the game initializes, creating a professional first impression

3. **Centralized Data Layer**: Unified Express server with RESTful API endpoints (`/api/init`, `/api/increment`, `/api/decrement`, `/api/data-feed`) that provide both game modes with consistent access to Reddit data

4. **User Action Capabilities**: Built-in infrastructure for players to create posts and comments on their own behalf with proper consent flows (via UserActionDialog component), enabling future social features

5. **Live Reddit Integration**: Real-time display of subreddit statistics, user karma, and hot posts fetched directly from Reddit's API through the server layer - no external API calls needed

6. **Mobile-First Design**: Responsive layouts with touch-optimized circular buttons, designed for Reddit's mobile-first user base with proper viewport settings preventing zoom

7. **Persistent State Management**: Counter values stored per-post in Redis, maintaining game state across sessions and users - your progress is never lost

8. **Type-Safe Architecture**: End-to-end TypeScript with shared types between client and server, ensuring API contract consistency and catching errors at compile time

9. **Seamless User Experience**: Single HTML entry point with React-based routing eliminates loading delays between post types, providing instant gameplay after initial load

### Technology Stack

- [Devvit](https://developers.reddit.com/): Reddit's developer platform for building immersive apps
- [Vite](https://vite.dev/): Multi-entry build system for separate game modes
- [React](https://react.dev/): UI framework with hooks for state management
- [Express](https://expressjs.com/): Backend API server with Reddit integration
- [Tailwind](https://tailwindcss.com/): Utility-first CSS for responsive styling
- [TypeScript](https://www.typescriptlang.org/): End-to-end type safety across client and server

## How to Play

### For Players

#### Getting Started

1. **Find a Game Post**: Look for Diggit Game posts in your Reddit feed - they'll appear as either "Type A Game Post" or "Type B Game Post"
2. **Launch the Game**: Click the splash screen button (e.g., "Launch Type A" or "Launch Type B") to open the full-screen webview
3. **Loading Screen**: You'll see a polished loading screen with an animated blue spinner and "Loading game..." text while the app initializes
4. **Automatic Detection**: The game automatically detects which post type you're viewing and loads the appropriate experience
5. **Wait for Initialization**: The app fetches your Reddit username, current counter value, and community data (usually takes 1-2 seconds)

#### Playing the Game

**Basic Counter Mechanics:**

1. **Increment the Counter**:
   - Tap or click the `+` button (large circular button on the right side)
   - The counter increases by 1
   - The new value is immediately saved to Redis and persists across sessions
   - Button is disabled during the API call to prevent double-clicks
2. **Decrement the Counter**:

   - Tap or click the `-` button (large circular button on the left side)
   - The counter decreases by 1
   - The new value is immediately saved to Redis
   - Button is disabled during the API call to prevent double-clicks

3. **Watch the Counter**:
   - The current count is displayed prominently in the center between the two buttons
   - When loading, the counter shows "..." to indicate an API call is in progress
   - The counter updates instantly when the server responds

**Viewing Your Profile and Community Data:**

4. **See Your Reddit Identity**:

   - Your Reddit username appears at the top of the screen once loaded
   - **Type A**: Displays "Hey [username] 👋" in a friendly greeting
   - **Type B**: Displays "Welcome [username]! 🎮" with a gaming theme

5. **Explore Community Information**:

   - **Type A**: A clean white card shows:
     - Subreddit name (e.g., "r/diggitgame_dev")
     - Total subscriber count
     - Your personal karma score
   - **Type B**: An enhanced frosted glass card shows:
     - Subreddit name and subscriber count
     - Your personal karma score
     - **Top 3 hot posts** from the community with truncated titles (first 40 characters)
     - Beautiful purple gradient theme with backdrop blur effects

6. **Navigate to Reddit Resources**:
   - Footer links are available at the bottom of the screen:
     - **Docs**: Opens Devvit documentation in a new tab
     - **r/Devvit**: Opens the Devvit subreddit community
     - **Discord**: Opens the Devvit Discord server invite

**Visual Differences Between Modes:**

- **Type A (Classic)**:

  - White background for clean, distraction-free gameplay
  - Reddit orange buttons (#d93900) with hover effects
  - Simple card design with subtle shadows
  - Regular post height fits naturally in your feed
  - Blue badge in top-right corner shows "Type A"

- **Type B (Advanced)**:
  - Purple-to-blue gradient background (from-purple-50 to-blue-50)
  - Purple buttons (#7c3aed) matching the theme
  - Frosted glass card with backdrop blur and transparency
  - Tall post height for more immersive experience
  - Purple badge in top-right corner shows "Type B"

#### Important Notes

- **Shared Counter**: The counter value is shared across ALL players viewing the same post - it's a community counter, not personal
- **Persistent State**: Your progress is automatically saved to Redis - you can close the app and return anytime without losing the count
- **Per-Post State**: Each game post has its own independent counter (Type A Post #1 and Type B Post #1 have completely separate counters)
- **Loading States**: Buttons are disabled while API calls are in progress to prevent race conditions - you'll see "..." in the counter display
- **Mobile Optimized**: The game works perfectly on mobile devices with touch-friendly circular buttons and proper viewport settings
- **Real-Time Data**: Community stats and hot posts are fetched fresh each time you open the game

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
