---
inclusion: always
---

# Reddit Devvit Platform Understanding

## What Developers Are Building

Developers are building interactive apps and games that run inside Reddit posts using standard web technologies. These apps appear in a webview within posts and can be played by Reddit users directly on the platform.

## CRITICAL: Understanding the Devvit Splash Screen

**The Devvit splash screen IS the Reddit post itself - it is NOT part of your webview/React app.**

### How It Works:

1. **User browses Reddit** → Sees your post with the splash screen (heading, description, button)
2. **User clicks the button** → Opens the webview with your React/client app
3. **Your React app loads** → Should go DIRECTLY to the main experience

### Common Mistake to Avoid:

❌ **WRONG**: Creating a duplicate "splash screen" in your React app that shows the same info as the Devvit splash
- This creates a confusing double-splash experience
- Users already saw the post info on Reddit before clicking

✅ **CORRECT**: Your React app should start immediately with the main experience
- No duplicate splash screens
- The Devvit splash (configured in `submitCustomPost`) is the ONLY splash users see
- Your React app is what loads AFTER they click the button on that splash

### Example:

```typescript
// In server/core/post.ts - This creates the Reddit post with splash
await reddit.submitCustomPost({
  splash: {
    heading: '🏜️ Dig Site: r/AskReddit',  // Users see this ON REDDIT
    description: 'Excavate historical posts',
    buttonLabel: 'Start Digging ⛏️',
  },
  // ...
});

// In client/App.tsx - This loads AFTER clicking the button
export const App = () => {
  // ❌ DON'T create another splash screen here
  // ✅ DO load the game/app directly
  return <GameCanvas />;
};
```

## Project Structure

All Devvit Web projects follow this structure:

```
src/
├── client/     # Frontend code (HTML/CSS/JS, React, Vue, etc.)
├── server/     # Backend API endpoints (Express, Koa, etc.)
└── shared/     # Shared types and interfaces
devvit.json     # Devvit configuration file
package.json    # npm scripts and dependencies
```

### Client Folder (`src/client/`)

- Contains all frontend code that runs in the webview
- Can use any web framework (React, Vue, Angular, Three.js, Phaser)
- Makes API calls to server endpoints using standard `fetch`
- Cannot make API calls to externally hosted servers, only to the server app included in this monorepo
- Displays inside Reddit posts for users to interact with

### Server Folder (`src/server/`)

- Contains backend API endpoints
- Uses Node.js server frameworks (Express, Koa, etc.)
- All endpoints MUST start with `/api/` (e.g., `/api/get-score`, `/api/save-game`)
- Access to Devvit capabilities: Redis, Reddit API, fetch
- Authentication handled automatically by Devvit middleware

### Shared Folder (`src/shared/`)

- Types, interfaces, and classes used by both client and server
- Ensures type safety across the application

### Configuration (`devvit.json`)

- Defines app metadata, permissions, and capabilities
- Post configuration and Node.js server settings
- Do not modify unless explicitly needed by the developer
- Do not modify the app name. This will be created with the app set up and should not be modified

## Development Workflow

### How Developers Test

1. Run `npm run dev` in project directory
2. Devvit automatically creates a test subreddit (e.g., `r/my-app_dev`)
3. Provides a playtest URL (e.g., `https://www.reddit.com/r/my-app_dev?playtest=my-app`)
4. Developer opens URL in browser to test the app
5. **Create a post** using the moderator menu (three dots on the subreddit)
6. **The post shows the Devvit splash screen** with your configured heading, description, and button
7. **Click the button** to open the webview and test your React app

### Important Testing Notes

- Backend calls only work through Devvit's playtest environment
- Cannot test backend functionality purely locally
- Must use `npm run dev` and the provided URL for full testing

### Custom Subreddit Testing

Developers can specify a preferred test subreddit in `package.json`:

```json
"scripts": {
  "dev:devvit": "devvit playtest r/MY_PREFERRED_SUBREDDIT"
}
```

## Platform Capabilities

### What's Available

- **@devvit/client SDK**: Client-side capabilities
- **@devvit/server SDK**: Server-side capabilities (Redis, Reddit API)
- **Standard web technologies**: HTML, CSS, JavaScript
- **Web frameworks**: React, Vue, Angular, Three.js, Phaser, etc.
- **Node.js server frameworks**: Express, Koa, etc.
- **Reddit hosting**: Apps hosted on Reddit's infrastructure

### Client-Server Communication

- **Old way**: postMessage (deprecated)
- **New way**: Define `/api/` endpoints and use `fetch` from client

## Platform Limitations

### Technical Constraints

- **Serverless endpoints**: Server runs only long enough to execute endpoint and return response
- **No long-running connections**: Streaming, websockets not supported
- **No fs or native packages**: Cannot use filesystem or external native dependencies
- **No external client requests**: Client can only call app's own webview domain (server can make external requests)
- **Single request/response**: No streaming or chunked responses
- **Long-polling**: Supported if under max request time

### Size and Time Limits

- **Max request time**: 30 seconds
- **Max payload size**: 4MB
- **Max response size**: 10MB
- **Content types**: HTML/CSS/JS only

## Deployment

### Launch Process

1. Developer runs `npm run launch`
2. App uploaded to Reddit for review
3. Review required for subreddits with >200 members
4. Email notification sent when approved

### Critical Requirements

- **Node.js version**: 22.2.0 or higher
- **Project name**: Cannot be changed after creation (required for deployment)
- **File structure**: Must maintain standard Devvit folder structure

## What AI Should Build

### Typical Use Cases

- Interactive games (clicker, puzzle, multiplayer)
- Leaderboards with Reddit user integration
- Real-time features using server endpoints
- Data persistence using Redis
- Reddit-specific features using Reddit API

### Implementation Pattern

1. **Client code** in `src/client/` for UI and user interaction
2. **Server endpoints** in `src/server/` starting with `/api/`
3. **Shared types** in `src/shared/` for type safety
4. **Fetch calls** from client to server endpoints
5. **Reddit integration** through server-side SDK

### What NOT to Build

- External API calls from client (use server endpoints instead)
- Long-running server processes or streaming
- Features requiring filesystem access
- Native dependencies or external packages like ffmpeg
- Standalone apps (must run within Reddit posts)

## Authentication

- All Devvit users are authenticated through Reddit
- Authentication handled automatically by Devvit middleware
- No need to implement custom authentication
- Access user context through Devvit server SDK
