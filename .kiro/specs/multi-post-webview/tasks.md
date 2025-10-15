# Implementation Plan

- [x] 1. Update devvit.json configuration for multiple post types


  - Add multiple entrypoints (typeA and typeB) in post configuration
  - Enable Reddit API permissions with user action capabilities (SUBMIT_POST, SUBMIT_COMMENT)
  - Add two menu items for creating PostA and PostB
  - _Requirements: 1.1, 2.1, 3.1, 4.1_



- [ ] 2. Set up client directory structure for multiple post types
  - Create src/client/typeA directory with index.html, main.tsx, and App.tsx
  - Create src/client/typeB directory with index.html, main.tsx, and App.tsx
  - Create src/client/shared directory for shared components and utilities


  - Move existing client code to typeA as the base implementation
  - _Requirements: 1.2, 1.4_

- [x] 3. Configure Vite for multi-entry build


  - Update src/client/vite.config.ts to support multiple entry points (typeA.html and typeB.html)
  - Configure build output to generate separate bundles in dist/client
  - Test build process to verify both HTML files are generated correctly
  - _Requirements: 1.4_



- [ ] 4. Implement shared TypeScript types for API communication
  - Create src/shared/types/api.ts with InitResponse, DataFeedResponse, UserActionRequest, UserActionResponse
  - Create src/shared/types/post.ts with PostSummary, PostData types


  - Create src/shared/types/user.ts with UserData type
  - _Requirements: 5.5_

- [ ] 5. Create post creation module for both post types
  - Implement createPostA function in src/server/core/post.ts with typeA-specific splash configuration


  - Implement createPostB function in src/server/core/post.ts with typeB-specific splash configuration
  - Add postType identifier to postData for server-side routing
  - _Requirements: 1.1, 1.5, 2.2, 2.3_

- [x] 6. Add menu action endpoints for post creation


  - Implement POST /internal/menu/create-post-a endpoint that calls createPostA
  - Implement POST /internal/menu/create-post-b endpoint that calls createPostB
  - Return navigation URL in response for redirect to created post
  - Add error handling for failed post creation
  - _Requirements: 2.2, 2.3, 2.5, 2.6_



- [ ] 7. Implement centralized data feed endpoint
  - Create src/server/core/data.ts with getDataFeed function
  - Implement GET /api/data-feed endpoint that fetches Reddit data (posts, subreddit info, user data)
  - Use Promise.all for parallel API calls to improve performance


  - Add error handling with appropriate status codes
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 8. Implement user action endpoints
  - Create src/server/core/userActions.ts with createUserPost and createUserComment functions


  - Implement POST /api/create-user-post endpoint with runAs: 'USER' and userGeneratedContent
  - Implement POST /api/create-user-comment endpoint with runAs: 'USER'
  - Add consent validation before executing user actions
  - Add error handling with clear user-facing messages
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6_



- [ ] 9. Create shared API client utility for fetch calls
  - Implement fetchAPI function in src/client/shared/utils/api.ts with error handling
  - Create APIError class for consistent error representation


  - Add TypeScript generics for type-safe API responses
  - _Requirements: 5.1, 5.4_

- [ ] 10. Build typeA React application
  - Implement App.tsx for typeA with initial state and API integration


  - Add fetch call to /api/init on component mount
  - Add fetch call to /api/data-feed to display centralized data
  - Implement basic UI showing post type and data
  - _Requirements: 1.3, 5.1, 5.2_




- [ ] 11. Build typeB React application
  - Implement App.tsx for typeB with distinct UI from typeA
  - Add fetch call to /api/init on component mount
  - Add fetch call to /api/data-feed to display centralized data
  - Implement different layout/styling to distinguish from typeA
  - _Requirements: 1.3, 5.1, 5.2_

- [ ] 12. Update server init endpoint to include postType
  - Modify GET /api/init to return postType from postData
  - Update InitResponse type to include postType field
  - Ensure both typeA and typeB clients receive correct postType
  - _Requirements: 1.3, 5.5_

- [ ] 13. Add user action UI components
  - Create user consent dialog component in src/client/shared/components
  - Add "Create Post" button that triggers consent flow and calls /api/create-user-post
  - Add "Create Comment" button that triggers consent flow and calls /api/create-user-comment
  - Display success/error messages based on API response
  - _Requirements: 4.4, 4.5_

- [ ] 14. Test build and deployment process
  - Run npm run build to verify both client bundles are generated
  - Verify dist/client contains typeA.html and typeB.html
  - Verify dist/server contains index.cjs with all endpoints
  - Check that all assets are properly bundled
  - _Requirements: 1.4, 6.1_

- [ ] 15. Test in playtest environment
  - Run npm run dev and open playtest URL
  - Use mod menu to create PostA and verify typeA webview loads with correct splash screen
  - Use mod menu to create PostB and verify typeB webview loads with correct splash screen
  - Test data feed endpoint from both webviews
  - Test user post and comment creation with consent flow
  - Verify error handling for failed API calls
  - _Requirements: 6.2, 6.3, 6.4, 6.5_
