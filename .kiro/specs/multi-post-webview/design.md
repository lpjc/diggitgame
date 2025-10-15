# Design Document

## Overview

This design establishes a multi-post-type architecture for a Devvit React application. The system will support two distinct post types (typeA and typeB), each with its own webview interface, while sharing a centralized server infrastructure for Reddit API access and data management. The architecture leverages Devvit Web's multiple entrypoint feature, Express server endpoints, and Reddit's user action capabilities.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Reddit Platform                          │
│  ┌──────────────┐              ┌──────────────┐            │
│  │   Post A     │              │   Post B     │            │
│  │  (typeA)     │              │  (typeB)     │            │
│  └──────┬───────┘              └──────┬───────┘            │
│         │                             │                     │
│         │  Launch Webview             │  Launch Webview    │
│         ▼                             ▼                     │
│  ┌──────────────┐              ┌──────────────┐            │
│  │  Webview A   │              │  Webview B   │            │
│  │ (React App)  │              │ (React App)  │            │
│  └──────┬───────┘              └──────┬───────┘            │
│         │                             │                     │
│         │  fetch /api/*               │  fetch /api/*      │
│         └─────────────┬───────────────┘                     │
│                       ▼                                     │
│              ┌─────────────────┐                            │
│              │  Express Server │                            │
│              │  (Node.js)      │                            │
│              └────────┬────────┘                            │
│                       │                                     │
│         ┌─────────────┼─────────────┐                       │
│         ▼             ▼             ▼                       │
│   ┌─────────┐  ┌──────────┐  ┌──────────┐                 │
│   │  Redis  │  │ Reddit   │  │  User    │                 │
│   │  Store  │  │   API    │  │ Actions  │                 │
│   └─────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite (separate builds for each post type)
- **Server**: Express 5 with @devvit/web/server
- **Data Layer**: Redis (via Devvit)
- **API Integration**: Reddit API (via @devvit/web/server)
- **Type Safety**: Shared TypeScript types across client/server

## Components and Interfaces

### 1. Configuration Layer (devvit.json)

**Purpose**: Define multiple post entrypoints, permissions, and menu actions

**Structure**:
```json
{
  "post": {
    "dir": "dist/client",
    "entrypoints": {
      "typeA": {
        "entry": "typeA.html",
        "height": "regular"
      },
      "typeB": {
        "entry": "typeB.html",
        "height": "tall"
      }
    }
  },
  "permissions": {
    "reddit": {
      "enable": true,
      "asUser": ["SUBMIT_POST", "SUBMIT_COMMENT"]
    }
  },
  "menu": {
    "items": [
      {
        "label": "Create PostA",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/create-post-a"
      },
      {
        "label": "Create PostB",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/create-post-b"
      }
    ]
  }
}
```

**Key Design Decisions**:
- Two separate entrypoints allow completely different React applications per post type
- Regular height for typeA (standard post), tall height for typeB (more immersive)
- Reddit permissions enabled with user action capabilities for posts and comments
- Mod menu items provide easy post creation interface

### 2. Build System

**Purpose**: Generate separate client bundles for each post type

**Structure**:
```
src/client/
├── typeA/
│   ├── index.html (entry for typeA)
│   ├── main.tsx (React app for typeA)
│   └── App.tsx (typeA-specific components)
├── typeB/
│   ├── index.html (entry for typeB)
│   ├── main.tsx (React app for typeB)
│   └── App.tsx (typeB-specific components)
├── shared/
│   ├── components/ (shared React components)
│   └── utils/ (shared utilities)
└── vite.config.ts (multi-entry build config)
```

**Vite Configuration**:
```typescript
// src/client/vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        typeA: resolve(__dirname, 'typeA/index.html'),
        typeB: resolve(__dirname, 'typeB/index.html'),
      },
    },
  },
});
```

**Key Design Decisions**:
- Separate directories for each post type allow independent development
- Shared components folder promotes code reuse
- Vite multi-entry build generates typeA.html and typeB.html in dist/client
- Each post type can have completely different UI/UX

### 3. Server Layer

**Purpose**: Centralized API endpoints with Reddit integration

**Structure**:
```
src/server/
├── index.ts (Express app setup)
├── core/
│   ├── post.ts (post creation logic)
│   ├── comment.ts (comment creation logic)
│   └── data.ts (data fetching logic)
├── routes/
│   ├── api.ts (public API routes)
│   └── internal.ts (internal/menu routes)
└── middleware/
    └── validation.ts (request validation)
```

**API Endpoints**:

1. **GET /api/data-feed**
   - Fetches centralized Reddit data
   - Returns aggregated information for both post types
   - Full Reddit API access

2. **POST /api/create-user-post**
   - Creates post on user's behalf
   - Requires user consent
   - Uses runAs: 'USER'

3. **POST /api/create-user-comment**
   - Creates comment on user's behalf
   - Requires user consent
   - Uses runAs: 'USER'

4. **POST /internal/menu/create-post-a**
   - Internal endpoint for mod menu
   - Creates typeA post
   - Returns navigation URL

5. **POST /internal/menu/create-post-b**
   - Internal endpoint for mod menu
   - Creates typeB post
   - Returns navigation URL

**Key Design Decisions**:
- All endpoints under /api/ for client access
- Internal endpoints under /internal/ for Devvit menu actions
- Centralized data logic prevents duplication across post types
- Express middleware handles authentication automatically via Devvit

### 4. Post Creation Module

**Purpose**: Handle creation of different post types with appropriate configuration

**Interface**:
```typescript
// src/server/core/post.ts

interface PostConfig {
  type: 'typeA' | 'typeB';
  title: string;
  splash: SplashConfig;
  postData?: Record<string, unknown>;
}

interface SplashConfig {
  appDisplayName: string;
  heading: string;
  description: string;
  buttonLabel: string;
  backgroundUri?: string;
  appIconUri?: string;
  entryUri: string;
}

export async function createPostA(): Promise<Post>;
export async function createPostB(): Promise<Post>;
export async function createCustomPost(config: PostConfig): Promise<Post>;
```

**Implementation Pattern**:
```typescript
export const createPostA = async () => {
  return await reddit.submitCustomPost({
    splash: {
      appDisplayName: 'Game Type A',
      heading: 'Welcome to Type A!',
      description: 'Experience A awaits',
      buttonLabel: 'Launch Type A',
      entryUri: 'typeA.html',
      backgroundUri: 'typeA-splash.png',
    },
    postData: {
      postType: 'typeA',
      initialState: {},
    },
    subredditName: context.subredditName!,
    title: 'Type A Game Post',
  });
};
```

**Key Design Decisions**:
- Separate functions for each post type for clarity
- Splash screens customized per post type for distinct branding
- postData includes type identifier for server-side routing
- entryUri points to correct HTML file (typeA.html or typeB.html)

### 5. User Action Module

**Purpose**: Enable users to create posts and comments on their own behalf

**Interface**:
```typescript
// src/server/core/userActions.ts

interface UserPostRequest {
  title: string;
  content: string;
  subredditName: string;
  postType?: 'typeA' | 'typeB';
}

interface UserCommentRequest {
  postId: string;
  text: string;
}

export async function createUserPost(request: UserPostRequest): Promise<Post>;
export async function createUserComment(request: UserCommentRequest): Promise<Comment>;
```

**Implementation Pattern**:
```typescript
export const createUserPost = async (request: UserPostRequest) => {
  return await reddit.submitPost({
    runAs: 'USER',
    userGeneratedContent: {
      text: request.content,
    },
    subredditName: request.subredditName,
    title: request.title,
    splash: {
      appDisplayName: 'User Generated',
    },
  });
};

export const createUserComment = async (request: UserCommentRequest) => {
  return await reddit.submitComment({
    runAs: 'USER',
    postId: request.postId,
    text: request.text,
  });
};
```

**Key Design Decisions**:
- runAs: 'USER' ensures actions appear under user's identity
- userGeneratedContent required for compliance
- Server-side validation before submission
- Clear error messages for failed user actions

### 6. Data Feed Module

**Purpose**: Centralized Reddit data access for both post types

**Interface**:
```typescript
// src/server/core/data.ts

interface DataFeedResponse {
  posts: PostSummary[];
  comments: CommentSummary[];
  subredditInfo: SubredditInfo;
  userData?: UserData;
}

export async function getDataFeed(subredditName: string): Promise<DataFeedResponse>;
export async function getUserData(username: string): Promise<UserData>;
export async function getPostData(postId: string): Promise<PostData>;
```

**Implementation Pattern**:
```typescript
export const getDataFeed = async (subredditName: string) => {
  const [posts, subredditInfo, username] = await Promise.all([
    reddit.getHotPosts({ subredditName, limit: 10 }),
    reddit.getSubredditInfoByName(subredditName),
    reddit.getCurrentUsername(),
  ]);

  return {
    posts: posts.map(mapPostSummary),
    subredditInfo: mapSubredditInfo(subredditInfo),
    userData: username ? await getUserData(username) : undefined,
  };
};
```

**Key Design Decisions**:
- Parallel API calls using Promise.all for performance
- Centralized mapping functions for consistent data shape
- Optional user data (may be anonymous)
- Cached responses where appropriate using Redis

## Data Models

### Shared Types (src/shared/types/)

```typescript
// api.ts - API request/response types
export interface InitResponse {
  type: 'init';
  postId: string;
  postType: 'typeA' | 'typeB';
  count: number;
  username: string;
}

export interface DataFeedResponse {
  posts: PostSummary[];
  comments: CommentSummary[];
  subredditInfo: SubredditInfo;
}

export interface UserActionRequest {
  action: 'create-post' | 'create-comment';
  data: UserPostRequest | UserCommentRequest;
  consent: boolean;
}

export interface UserActionResponse {
  success: boolean;
  id?: string;
  error?: string;
}

// post.ts - Post-related types
export interface PostSummary {
  id: string;
  title: string;
  author: string;
  score: number;
  createdAt: number;
}

export interface PostData {
  postType: 'typeA' | 'typeB';
  initialState: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// user.ts - User-related types
export interface UserData {
  username: string;
  karma: number;
  createdAt: number;
}
```

**Key Design Decisions**:
- All API types defined in shared folder for type safety
- Discriminated unions for action types
- Explicit consent field for user actions
- Metadata fields for extensibility

## Error Handling

### Client-Side Error Handling

```typescript
// src/client/shared/utils/api.ts

export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(error.message, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network request failed', 0);
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}
```

### Server-Side Error Handling

```typescript
// src/server/middleware/errorHandler.ts

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err);

  if (err instanceof ValidationError) {
    res.status(400).json({
      status: 'error',
      message: err.message,
      field: err.field,
    });
    return;
  }

  if (err instanceof RedditAPIError) {
    res.status(502).json({
      status: 'error',
      message: 'Reddit API request failed',
      details: err.message,
    });
    return;
  }

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};
```

**Error Categories**:
1. **Validation Errors** (400): Invalid request data
2. **Authentication Errors** (401): User not authenticated
3. **Authorization Errors** (403): User lacks permissions
4. **Not Found Errors** (404): Resource doesn't exist
5. **Reddit API Errors** (502): External API failure
6. **Server Errors** (500): Internal failures

**Key Design Decisions**:
- Consistent error response format across all endpoints
- Detailed logging for debugging
- User-friendly error messages
- Proper HTTP status codes

## Testing Strategy

### Unit Testing

**Client Tests**:
```typescript
// src/client/typeA/__tests__/App.test.tsx
describe('TypeA App', () => {
  it('renders initial state', () => {
    render(<App />);
    expect(screen.getByText('Type A')).toBeInTheDocument();
  });

  it('fetches data on mount', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ postType: 'typeA' }),
    });
    global.fetch = mockFetch;

    render(<App />);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/init');
    });
  });
});
```

**Server Tests**:
```typescript
// src/server/__tests__/post.test.ts
describe('Post Creation', () => {
  it('creates typeA post with correct config', async () => {
    const post = await createPostA();
    expect(post).toBeDefined();
    expect(post.splash.entryUri).toBe('typeA.html');
  });

  it('creates typeB post with correct config', async () => {
    const post = await createPostB();
    expect(post).toBeDefined();
    expect(post.splash.entryUri).toBe('typeB.html');
  });
});
```

### Integration Testing

**API Endpoint Tests**:
```typescript
// src/server/__tests__/api.integration.test.ts
describe('API Endpoints', () => {
  it('GET /api/data-feed returns data', async () => {
    const response = await request(app)
      .get('/api/data-feed')
      .expect(200);

    expect(response.body).toHaveProperty('posts');
    expect(response.body).toHaveProperty('subredditInfo');
  });

  it('POST /api/create-user-post requires consent', async () => {
    const response = await request(app)
      .post('/api/create-user-post')
      .send({ title: 'Test', content: 'Test', consent: false })
      .expect(400);

    expect(response.body.message).toContain('consent');
  });
});
```

### Manual Testing in Playtest

**Test Scenarios**:
1. Run `npm run dev` and open playtest URL
2. Use mod menu to create PostA - verify typeA webview loads
3. Use mod menu to create PostB - verify typeB webview loads
4. Test data feed endpoint from both webviews
5. Test user post creation with consent flow
6. Test user comment creation
7. Verify splash screens display correctly for each type
8. Test error handling for failed API calls

**Key Design Decisions**:
- Unit tests for individual components and functions
- Integration tests for API endpoints
- Manual playtest for end-to-end validation
- Mock Reddit API in unit tests
- Use actual Devvit environment for integration tests

## Implementation Notes

### Phase 1: Configuration and Structure
- Update devvit.json with multiple entrypoints and permissions
- Create directory structure for typeA and typeB clients
- Set up Vite multi-entry build configuration

### Phase 2: Server Infrastructure
- Implement post creation functions for both types
- Add menu action endpoints
- Create data feed endpoint with Reddit API integration
- Implement user action endpoints

### Phase 3: Client Applications
- Build typeA React application
- Build typeB React application
- Implement shared components and utilities
- Add API client with error handling

### Phase 4: Testing and Validation
- Write unit tests for critical paths
- Test in playtest environment
- Validate mod menu actions
- Verify user action flows

### Migration from Current State

The existing app has:
- Single post type with default entrypoint
- Basic Express server with increment/decrement API
- Single React application
- One menu item for post creation

Migration steps:
1. Preserve existing functionality as typeA
2. Add typeB as new post type
3. Update devvit.json configuration
4. Refactor post creation to support both types
5. Add new menu items
6. Implement data feed and user action endpoints
7. Update build process for multiple entries

This approach ensures backward compatibility while adding new capabilities.
