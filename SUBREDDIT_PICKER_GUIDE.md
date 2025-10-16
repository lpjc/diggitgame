# Subreddit Picker System

## Overview

The subreddit picker system dynamically selects target subreddits for dig sites based on a weighted combination of:
1. **Default popular subreddits** - A curated list of 200+ active communities
2. **Player-specific subreddits** - Communities the player has recently interacted with

## Core Module: `src/server/core/subreddit-picker.ts`

### Key Functions

#### `getRandomSubreddit(knownToPlayerWeight?: number): Promise<string>`
Returns a single random subreddit with weighted selection.

**Parameters:**
- `knownToPlayerWeight` (0-1, default: 0.5) - Probability of selecting from player's known subreddits

**Example:**
```typescript
// 60% chance to pick from player's activity, 40% from defaults
const subreddit = await getRandomSubreddit(0.6);
```

#### `getRecommendedSubreddits(count: number, knownToPlayerWeight?: number): Promise<string[]>`
Returns N recommended subreddits without duplicates.

**Parameters:**
- `count` - Number of subreddits to return
- `knownToPlayerWeight` (0-1, default: 0.5) - Probability weight for player's subreddits

**Example:**
```typescript
// Get 5 subreddits with 70% weight to player's activity
const subreddits = await getRecommendedSubreddits(5, 0.7);
```

#### `getUserRecentSubreddits(username: string, limit?: number): Promise<string[]>`
Fetches subreddits from a user's recent comment history.

**Parameters:**
- `username` - Reddit username
- `limit` (default: 20) - Number of recent comments to check

## Integration

### Post Creation (`src/server/core/post.ts`)

The `createPostA` function now uses dynamic subreddit selection and fetches the subreddit's icon:

```typescript
export const createPostA = async (targetSubreddit?: string) => {
  // If no target subreddit provided, pick one dynamically
  if (!targetSubreddit) {
    targetSubreddit = await getRandomSubreddit(0.6); // 60% weight to user's known subreddits
  }
  
  // Fetch subreddit icon for splash screen
  let appIconUri = 'default-icon.png';
  try {
    const subredditInfo = await reddit.getSubredditInfoByName(targetSubreddit);
    if (subredditInfo.id) {
      const styles = await reddit.getSubredditStyles(subredditInfo.id);
      if (styles.icon) {
        appIconUri = styles.icon;
      }
    }
  } catch (error) {
    // Falls back to default icon on error
  }
  
  // ... rest of post creation with appIconUri in splash
};
```

### API Endpoint (`src/server/index.ts`)

New endpoint for getting recommended subreddits:

```
GET /api/recommended-subreddits?count=5&weight=0.6
```

**Response:**
```json
{
  "success": true,
  "subreddits": ["askreddit", "gaming", "funny", "devvit", "science"]
}
```

## Default Subreddits

The system includes 200+ popular subreddits covering:
- General interest (reddit, funny, pics)
- Gaming (gaming, minecraft, eldenring)
- Technology (programming, pcmasterrace, apple)
- Science (science, space, biology)
- Entertainment (movies, music, anime)
- Lifestyle (fitness, cooking, diy)
- And many more...

## How It Works

1. **Fetch User Activity**: When a player creates a dig site, the system fetches their recent comment history
2. **Extract Subreddits**: Unique subreddits are extracted from their activity
3. **Weighted Selection**: Based on the weight parameter:
   - If player has ≥2 known subreddits AND random roll succeeds → pick from player's list
   - Otherwise → pick from default list
4. **Fallback**: If all else fails, defaults to "askreddit"

## Usage Examples

### Create a dig site with dynamic selection
```typescript
// Automatically picks based on player activity
const post = await createPostA();
```

### Create a dig site for a specific subreddit
```typescript
// Override with specific subreddit
const post = await createPostA('gaming');
```

### Get recommendations for UI
```typescript
// Get 10 subreddits with high weight to player's activity
const recommendations = await getRecommendedSubreddits(10, 0.8);
```

## Benefits

1. **Personalization**: Players see dig sites for communities they care about
2. **Discovery**: Still exposes players to popular subreddits they might not know
3. **Engagement**: Higher relevance = more engagement
4. **Flexibility**: Easy to adjust weights or add more defaults
5. **Fallback**: Always has a valid subreddit even if user data is unavailable

## Future Enhancements

Possible improvements:
- Cache user's subreddit list in Redis for performance
- Add subreddit popularity scoring
- Filter out NSFW or restricted subreddits
- Allow players to favorite/block certain subreddits
- Track which subreddits generate most engagement
