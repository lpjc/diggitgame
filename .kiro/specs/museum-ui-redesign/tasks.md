# Implementation Plan

- [x] 1. Update data models and API for first discovery tracking


  - Add `firstDiscoveredBy` field to CentralizedArtifact type
  - Update artifact creation to record first discoverer's username
  - Update museum API to calculate first discoveries stat
  - Modify broken artifact handling to only increment counter (not add to collection)
  - _Requirements: 6.1, 6.2, 6.7, 6.9, 8.1, 8.2, 8.3, 8.4, 8.5_



- [ ] 2. Create BRR/ARR date calculator utility
  - Implement calculateBRRDate function with fractional notation (¼, ½, ¾)
  - Implement calculateActualAge function for detailed view


  - Implement formatNumber utility for K/M suffixes
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

- [x] 3. Build badge components


  - Create RarityBadge component with color-coded tiers
  - Create SubredditBadge component
  - Create FirstDiscoveryBadge component with animation
  - _Requirements: 2.8, 2.9, 6.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_



- [ ] 4. Implement Collection Header component
  - Create sticky header with "The u/(username) Collection" banner
  - Style with museum/gallery aesthetic
  - Ensure sticky positioning works correctly


  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 5. Implement Control Banner component
  - Create sticky control banner with stats display
  - Add sort buttons (Date, Rarity, Subreddit)
  - Add auto-scroll toggle button


  - Display stats: totalFound, uniqueSubreddits, firstDiscoveries, totalBroken
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11_

- [ ] 6. Create Scrolling Background component
  - Implement horizontally scrolling grid of thumbnails
  - Add lazy loading for background images


  - Implement auto-scroll with slow speed
  - Add seamless loop when reaching end
  - Apply semi-transparent overlay
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_



- [ ] 7. Build Artifact Card component with Reddit-style layout
  - Create card with masonry grid sizing (2x2 for images, 1x2 for text)
  - Display thumbnail, title, upvotes, comments, BRR/ARR date
  - Add pinned badges (rarity, subreddit, first discovery)
  - Implement Reddit-style post format
  - Add hover effects and click handler
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.10, 2.11, 2.12_



- [ ] 8. Implement Artifact Masonry Grid with lazy loading
  - Create masonry grid layout with CSS Grid
  - Implement Intersection Observer for lazy loading
  - Load initial 20 artifacts, then load more on scroll

  - Handle responsive column counts (mobile: 2, tablet: 4, desktop: 6)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 9. Create Artifact Detail Overlay component
  - Build modal overlay with full artifact details
  - Display image, title, metadata (subreddit, date, score, rarity)
  - Show first discoverer and "You discovered this first!" banner



  - Display both BRR/ARR date and actual age
  - Add close button and click-outside-to-close
  - Add "View on Reddit" link
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11_

- [ ] 10. Integrate all components in main Museum component
  - Fetch museum data with first discoveries stat
  - Manage state for sort, auto-scroll, selected artifact
  - Wire up all component interactions
  - Handle loading and error states
  - _Requirements: All requirements integration_

- [ ] 11. Implement responsive design
  - Test and adjust grid columns for mobile (2 cols)
  - Test and adjust grid columns for tablet (4 cols)
  - Test and adjust grid columns for desktop (6 cols)
  - Make overlay full-screen on mobile
  - Adjust auto-scroll speed for mobile
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [ ] 12. Polish and optimize
  - Add loading placeholders to prevent layout shift
  - Implement image fallbacks for broken thumbnails
  - Test performance with 100+ artifacts
  - Add smooth transitions and animations
  - Test auto-scroll performance
  - _Requirements: 9.4, 9.5, 9.6_
