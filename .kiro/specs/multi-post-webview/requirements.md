# Requirements Document

## Introduction

This feature establishes the core infrastructure for a Devvit React application that supports multiple post types, each with its own webview interface. The system will enable moderators to spawn different post types through mod tools, provide centralized data access with full Reddit API capabilities, and allow users to create posts and comments on their own behalf. This foundational structure will serve as the base for future game content implementation.

## Requirements

### Requirement 1: Multiple Post Type Support

**User Story:** As a moderator, I want to create different types of posts (PostA and PostB) through mod tools, so that I can spawn distinct game experiences in my subreddit.

#### Acceptance Criteria

1. WHEN the app is configured THEN the system SHALL define two distinct post types (typeA and typeB) in devvit.json
2. WHEN a post type is defined THEN each type SHALL have its own webview entrypoint (HTML file)
3. WHEN a user views a post THEN the system SHALL render the correct webview based on the post type
4. WHEN the build process runs THEN the system SHALL generate separate client bundles for typeA and typeB in dist/client
5. IF a post type is created THEN the system SHALL display an appropriate splash screen for that type

### Requirement 2: Mod Tool Post Creation

**User Story:** As a moderator, I want to use mod menu actions to spawn PostA or PostB, so that I can easily create different game instances in my subreddit.

#### Acceptance Criteria

1. WHEN the app is installed THEN the system SHALL register two menu items in the subreddit mod tools
2. WHEN a moderator clicks "Create PostA" THEN the system SHALL create a post of typeA with appropriate title and splash screen
3. WHEN a moderator clicks "Create PostB" THEN the system SHALL create a post of typeB with appropriate title and splash screen
4. WHEN a post is created THEN the system SHALL show a success toast notification to the moderator
5. WHEN a post is created THEN the system SHALL navigate the moderator to the newly created post
6. IF post creation fails THEN the system SHALL display an error message to the moderator

### Requirement 3: Centralized Data Access with Reddit API

**User Story:** As a developer, I want a centralized server-side data layer with full Reddit API access, so that both webviews can fetch and manipulate Reddit data consistently.

#### Acceptance Criteria

1. WHEN the app is configured THEN the system SHALL enable Reddit API permissions in devvit.json
2. WHEN the server starts THEN the system SHALL expose API endpoints under the /api/ path
3. WHEN a client makes a request THEN the system SHALL provide access to Reddit API data through server endpoints
4. WHEN an API endpoint is called THEN the system SHALL have access to the full Reddit API via @devvit/web/server
5. IF a client needs Reddit data THEN the system SHALL fetch it through the centralized server endpoints
6. WHEN an API call is made THEN the system SHALL handle errors gracefully and return appropriate status codes

### Requirement 4: User Action Capabilities

**User Story:** As a user, I want the app to create posts and comments on my behalf when I take specific actions, so that I can participate in the game experience using my own Reddit identity.

#### Acceptance Criteria

1. WHEN the app is configured THEN the system SHALL enable user action permissions for SUBMIT_POST and SUBMIT_COMMENT in devvit.json
2. WHEN a user triggers a post creation action THEN the system SHALL create a post using runAs: 'USER' with user-generated content
3. WHEN a user triggers a comment creation action THEN the system SHALL create a comment using runAs: 'USER' with user-generated content
4. WHEN a user action is performed THEN the system SHALL require explicit user consent before posting/commenting
5. IF a user action fails THEN the system SHALL provide clear error feedback to the user
6. WHEN a user-generated post is created THEN the system SHALL include appropriate splash screen configuration

### Requirement 5: Client-Server Communication

**User Story:** As a developer, I want the client webviews to communicate with the server using standard fetch calls, so that I can leverage modern web development patterns.

#### Acceptance Criteria

1. WHEN a client needs data THEN the system SHALL use standard fetch API to call server endpoints
2. WHEN the server receives a request THEN the system SHALL process it and return JSON responses
3. WHEN communication occurs THEN the system SHALL handle authentication automatically via Devvit middleware
4. IF a network request fails THEN the system SHALL provide appropriate error handling in the client
5. WHEN data is exchanged THEN the system SHALL use shared TypeScript types from src/shared for type safety

### Requirement 6: Development and Testing Workflow

**User Story:** As a developer, I want to test both post types in a playtest environment, so that I can verify the functionality before deployment.

#### Acceptance Criteria

1. WHEN npm run dev is executed THEN the system SHALL start the development server with hot reloading
2. WHEN the playtest URL is opened THEN the system SHALL display the app in a test subreddit
3. WHEN testing THEN the system SHALL allow creation of both post types through mod tools
4. WHEN a post is created in playtest THEN the system SHALL render the correct webview for that type
5. IF changes are made to client or server code THEN the system SHALL reflect updates without full restart
