# Multiple Post Types Implementation - What Worked and What Didn't

## Problem Statement
We needed to create two different post types (PostA and PostB) that each open their own distinct webview with different UI/UX.

## What DIDN'T Work ❌

### Approach 1: Multiple Entrypoints in devvit.json
**What we tried:**
```json
{
  "post": {
    "entrypoints": {
      "typeA": { "entry": "typeA.html" },
      "typeB": { "entry": "typeB.html" }
    }
  }
}
```

**With post creation:**
```typescript
await reddit.submitCustomPost({
  entrypoint: 'typeA', // or 'typeB'
  splash: { ... },
  postData: { ... }
});
```

**Why it failed:**
- Devvit 0.12.1 does NOT respect the `entrypoint` property in `submitCustomPost`
- Even though posts were created with different entrypoints, the webview ALWAYS loaded the "default" entrypoint
- The documentation suggests this should work, but it doesn't in practice (as of v0.12.1)
- Both PostA and PostB would load typeA.html regardless of the entrypoint specified

**Symptoms:**
- Console showed "🔵 TYPE A APP LOADED" for both post types
- The API correctly returned different postTypes, but the wrong JavaScript bundle was loaded
- Browser showed the post was created correctly (different titles, splash screens), but webview was always the same

## What DID Work ✅

### Approach 2: Single Entrypoint with Dynamic App Loading

**Architecture:**
1. **Single HTML entrypoint** (`index.html`) that loads a router component
2. **Router component** fetches the postType from the server API
3. **Conditional rendering** based on postType to load the correct React app

**Implementation:**

#### 1. devvit.json - Single Default Entrypoint
```json
{
  "post": {
    "dir": "dist/client",
    "entrypoints": {
      "default": {
        "entry": "index.html",
        "height": "tall"
      }
    }
  }
}
```

#### 2. Client Router (src/client/main.tsx)
```typescript
const AppRouter = () => {
  const [postType, setPostType] = useState<'typeA' | 'typeB' | null>(null);

  useEffect(() => {
    fetch('/api/init')
      .then((res) => res.json())
      .then((data) => {
        console.log('Post type from API:', data.postType);
        setPostType(data.postType);
      })
      .catch((err) => {
        console.error('Failed to fetch post type:', err);
        setPostType('typeA'); // Default fallback
      });
  }, []);

  if (!postType) {
    return <div>Loading...</div>;
  }

  // Dynamically load the correct app based on postType
  return postType === 'typeB' ? <TypeBApp /> : <TypeAApp />;
};
```

#### 3. Server - Store Post Type in postData
```typescript
export const createPostA = async () => {
  const post = await reddit.submitCustomPost({
    splash: { ... },
    postData: {
      postType: 'typeA',  // ← This is what the router reads
      initialState: { ... }
    },
    subredditName: subredditName,
    title: 'Type A Game Post',
  });
  
  // Also store in Redis for backup
  await redis.set(`post:${post.id}:type`, 'typeA');
  return post;
};
```

#### 4. API Endpoint - Return Post Type
```typescript
router.get('/api/init', async (_req, res) => {
  const { postId } = context;
  
  // Try to get postType from Redis
  const postTypeKey = `post:${postId}:type`;
  const postType = (await redis.get(postTypeKey)) || 'typeA';
  
  res.json({
    type: 'init',
    postId: postId,
    postType: postType as 'typeA' | 'typeB',  // ← Router uses this
    count: count ? parseInt(count) : 0,
    username: username ?? 'anonymous',
  });
});
```

#### 5. Vite Config - Single Entry Build
```typescript
export default defineConfig({
  plugins: [react(), tailwind()],
  build: {
    outDir: '../../dist/client',
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
        sourcemapFileNames: '[name].js.map',
      },
    },
  },
});
```

**Why it works:**
- ✅ Single webview entry point that Devvit can reliably load
- ✅ Post type is determined at runtime by fetching from the API
- ✅ Both TypeA and TypeB apps are bundled into the same JavaScript file
- ✅ React conditionally renders the correct app based on API response
- ✅ No reliance on Devvit's `entrypoint` property which doesn't work

**Trade-offs:**
- **Pro:** Works reliably with current Devvit version
- **Pro:** Simple to understand and debug
- **Pro:** All code is in one bundle (easier deployment)
- **Con:** Slightly larger bundle size (includes both apps)
- **Con:** Small loading delay while fetching postType from API
- **Con:** Not using Devvit's intended multiple entrypoint feature

## Key Learnings

1. **Devvit's `entrypoint` property is not functional** in v0.12.1, despite what the documentation suggests
2. **The "default" entrypoint is always used** regardless of what you specify in `submitCustomPost`
3. **Client-side routing is the reliable solution** for multiple post types
4. **Store post type in both postData and Redis** for redundancy
5. **Always test in the actual playtest environment** - local builds don't reveal webview loading issues

## File Structure

```
src/client/
├── index.html          # Single entry point
├── main.tsx            # Router that loads correct app
├── typeA/
│   └── App.tsx         # Type A React app
├── typeB/
│   └── App.tsx         # Type B React app
└── shared/
    ├── components/     # Shared components
    └── utils/          # Shared utilities (API client, etc.)

src/server/
├── index.ts            # Express server with /api/init endpoint
└── core/
    ├── post.ts         # createPostA() and createPostB()
    └── data.ts         # Data feed logic
```

## Testing

To verify it works:
1. Run `npm run dev`
2. Create PostA via mod menu → Should see "🔵 TYPE A APP LOADED" in console
3. Create PostB via mod menu → Should see "🟣 TYPE B APP LOADED" in console
4. PostA shows: Blue badge, white background, "Classic game mode"
5. PostB shows: Purple badge, gradient background, "Advanced game mode"

## Future Considerations

If Devvit fixes the `entrypoint` property in future versions, we could:
1. Revert to multiple HTML entrypoints (typeA.html, typeB.html)
2. Remove the router component
3. Have smaller, separate bundles for each post type

But for now, the single-entrypoint-with-router approach is the most reliable solution.
