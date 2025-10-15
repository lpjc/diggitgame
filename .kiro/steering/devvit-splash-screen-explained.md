---
inclusion: always
---

# Devvit Splash Screen - Critical Understanding

## The Fundamental Concept

**The Devvit splash screen IS the Reddit post itself. It is NOT part of your webview application.**

## User Flow

```
1. User browses Reddit
   ↓
2. User sees POST with splash screen (heading, description, button)
   ↓
3. User clicks button on the POST
   ↓
4. Webview opens with your React/client app
   ↓
5. Your app loads and shows the main experience
```

## Where Things Live

### On Reddit (The Post)
- **Created by**: `reddit.submitCustomPost()` with `splash` configuration
- **What users see**: 
  - Heading (e.g., "🏜️ Dig Site: r/AskReddit")
  - Description (e.g., "Excavate historical posts")
  - Button (e.g., "Start Digging ⛏️")
- **When users see it**: BEFORE clicking, while browsing Reddit
- **This is the splash screen**: There should be no other splash

### In Webview (Your React App)
- **Created by**: Your `src/client/` code
- **What users see**: The actual game/app interface
- **When users see it**: AFTER clicking the button on the post
- **Should NOT duplicate**: Don't show the same heading/description again

## Common Mistake

### ❌ WRONG Pattern:

```typescript
// server/core/post.ts
await reddit.submitCustomPost({
  splash: {
    heading: 'My Game',
    description: 'Play the game',
    buttonLabel: 'Play',
  },
});

// client/App.tsx - DON'T DO THIS
export const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  
  if (showSplash) {
    return (
      <div>
        <h1>My Game</h1>  {/* ❌ Duplicate! */}
        <p>Play the game</p>  {/* ❌ Duplicate! */}
        <button onClick={() => setShowSplash(false)}>Play</button>  {/* ❌ Duplicate! */}
      </div>
    );
  }
  
  return <GameCanvas />;
};
```

**Problem**: Users see "My Game / Play the game / Play button" TWICE:
1. Once on Reddit (the post)
2. Once in the webview (your React app)

This is confusing and redundant!

### ✅ CORRECT Pattern:

```typescript
// server/core/post.ts
await reddit.submitCustomPost({
  splash: {
    heading: '🏜️ Dig Site: r/AskReddit',
    description: 'Excavate historical posts\n\n✅ Found: 0  💔 Broken: 0',
    buttonLabel: 'Start Digging ⛏️',
  },
});

// client/App.tsx - DO THIS
export const App = () => {
  // Load data, then go straight to the game
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadGameData().then(() => setLoading(false));
  }, []);
  
  if (loading) {
    return <LoadingSpinner />;  // ✅ Brief loading only
  }
  
  return <GameCanvas />;  // ✅ Straight to the game!
};
```

**Why this works**: 
- Users already saw the splash on Reddit
- They clicked "Start Digging ⛏️" to get here
- They expect to see the game immediately
- No duplicate information

## When to Show Info in React App

You CAN show information in your React app, but it should be:

### ✅ NEW information (not on the splash):
- Game instructions/tutorial
- Current game state
- User stats
- Settings

### ❌ DUPLICATE information (already on splash):
- The same heading
- The same description
- Another "start" button

## Real Example from This Project

### The Post (Splash Screen):
```typescript
splash: {
  heading: '🏜️ Dig Site: r/AskReddit',
  description: 'Excavate historical posts\n\n✅ Found: 0  💔 Broken: 0',
  buttonLabel: 'Start Digging ⛏️',
}
```

Users see this on Reddit. When they click "Start Digging ⛏️", the webview opens.

### The React App:
```typescript
// Shows brief loading, then straight to game canvas with tools
return (
  <div>
    <canvas ref={canvasRef} />
    <ToolDock activeTool={activeTool} onToolSelect={handleToolSelect} />
  </div>
);
```

No duplicate splash! Users go straight from clicking the button to playing the game.

## Key Takeaway

**If users already saw it on the Reddit post, don't show it again in your React app.**

The splash screen is the post. Your app is what happens after they click.
