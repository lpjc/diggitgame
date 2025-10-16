# Museum UI Redesign - Testing Guide

## Quick Start

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open the museum:**
   - Navigate to a TypeB post (museum post)
   - The new UI should load automatically

## What to Test

### 1. Collection Header
- [ ] Header displays "The u/{username} Collection"
- [ ] Header stays visible when scrolling (sticky)
- [ ] Header has amber/orange gradient background
- [ ] Subtitle shows "A curated gallery of excavated artifacts"

### 2. Control Banner
- [ ] Banner stays visible below header when scrolling (sticky)
- [ ] Stats display correctly:
  - ✅ Found (count of intact artifacts)
  - 🗺️ Subreddits (unique subreddits)
  - ⭐ First Discoveries (artifacts user found first)
  - 💔 Broken (count of broken artifacts)
- [ ] Sort buttons work:
  - 📅 Date (most recent first)
  - 💎 Rarity (lowest foundByCount first)
  - 📂 Subreddit (alphabetical)
- [ ] Active sort button is highlighted
- [ ] Auto-scroll toggle works (enables/disables background scrolling)

### 3. Scrolling Background
- [ ] Background shows thumbnails of all artifacts
- [ ] Thumbnails are semi-transparent
- [ ] Auto-scroll moves slowly when enabled
- [ ] Auto-scroll stops when disabled
- [ ] Background loops seamlessly
- [ ] Images lazy load as they scroll into view

### 4. Artifact Grid
- [ ] Grid displays artifacts in masonry layout
- [ ] Image posts take 2x2 grid cells
- [ ] Text posts take 1x2 grid cells
- [ ] Grid is responsive:
  - Mobile: 2 columns
  - Tablet: 4 columns
  - Desktop: 6 columns
- [ ] Initial load shows 20 artifacts
- [ ] Scrolling down loads more artifacts (20 at a time)
- [ ] Empty state shows when no artifacts

### 5. Artifact Cards
- [ ] Cards show:
  - Thumbnail (if available)
  - Post title
  - Upvote count (⬆️ with K/M formatting)
  - BRR/ARR date
- [ ] Badges display in top-right corner:
  - Rarity badge (color-coded)
  - Subreddit badge (blue)
  - First discovery badge (gold, animated) if user found it first
- [ ] Hover effect (shadow increases)
- [ ] Click opens detail overlay
- [ ] Broken images show placeholder (🏺)

### 6. Artifact Detail Overlay
- [ ] Overlay opens when clicking artifact
- [ ] Overlay shows:
  - Full-size image (or placeholder)
  - Post title
  - Subreddit
  - Posted date (BRR/ARR + actual age)
  - Score (upvotes)
  - Rarity tier
  - Found by count
  - First discovered by username
- [ ] "You discovered this first!" banner shows if applicable
- [ ] Collection info shows:
  - When user collected it
  - Source dig site
- [ ] "View on Reddit" link works
- [ ] Close button (X) closes overlay
- [ ] Clicking outside overlay closes it
- [ ] Background is dimmed when overlay is open

### 7. BRR/ARR Date Format
- [ ] Posts before April 1, 2018 show "X BRR"
- [ ] Posts after April 1, 2018 show "X ARR"
- [ ] Fractional notation works:
  - ¼ for 0.25-0.5 years
  - ½ for 0.5-0.75 years
  - ¾ for 0.75-1.0 years
- [ ] Detail overlay shows both BRR/ARR and actual age
- [ ] Example: "2¼ BRR (5 years, 3 months old)"

### 8. First Discovery Tracking
- [ ] First discovery badge appears on cards user discovered first
- [ ] First discoveries count shows in control banner
- [ ] Detail overlay shows first discoverer username
- [ ] "You discovered this first!" banner appears in overlay

### 9. Broken Artifacts
- [ ] Broken count shows in control banner
- [ ] Broken artifacts are NOT in the grid
- [ ] Breaking an artifact increments counter
- [ ] Broken artifacts don't affect first discovery tracking

### 10. Sorting
- [ ] Date sort: Most recent first
- [ ] Rarity sort: Lowest foundByCount first (rarest first)
- [ ] Subreddit sort: Alphabetical by subreddit name
- [ ] Grid updates when changing sort

### 11. Performance
- [ ] Initial load is fast (< 2 seconds)
- [ ] Scrolling is smooth
- [ ] Lazy loading works (no lag when scrolling)
- [ ] Auto-scroll is smooth (no jank)
- [ ] Large collections (100+ artifacts) perform well

### 12. Responsive Design
- [ ] Mobile (< 768px):
  - 2 columns
  - Sticky elements work
  - Overlay is full-screen
- [ ] Tablet (768px - 1024px):
  - 4 columns
  - All features work
- [ ] Desktop (> 1024px):
  - 6 columns
  - All features work

## Test Scenarios

### Scenario 1: New User (Empty Museum)
1. Open museum with no artifacts
2. Verify empty state displays:
   - 🏺 icon
   - "No artifacts yet" message
   - Instructions to start excavating

### Scenario 2: First Discovery
1. Excavate an artifact that no one has found before
2. Add to museum
3. Open museum
4. Verify:
   - First discovery badge appears on card
   - First discoveries count is 1
   - Detail overlay shows "You discovered this first!"

### Scenario 3: Breaking an Artifact
1. Excavate an artifact
2. Break it with shovel
3. Add to museum (broken)
4. Open museum
5. Verify:
   - Broken count increments
   - Artifact does NOT appear in grid
   - Total found count does NOT increment

### Scenario 4: Large Collection
1. Collect 100+ artifacts
2. Open museum
3. Verify:
   - Initial load shows 20 artifacts
   - Scrolling loads more
   - Performance is smooth
   - Auto-scroll works

### Scenario 5: Sorting
1. Collect artifacts from different subreddits with different rarities
2. Test each sort option:
   - Date: Verify most recent first
   - Rarity: Verify rarest first
   - Subreddit: Verify alphabetical

### Scenario 6: Auto-Scroll
1. Open museum with 10+ artifacts
2. Enable auto-scroll
3. Verify background scrolls slowly
4. Disable auto-scroll
5. Verify background stops

### Scenario 7: Detail Overlay
1. Click any artifact
2. Verify all details display correctly
3. Click "View on Reddit"
4. Verify link opens correct post
5. Close overlay with X button
6. Open another artifact
7. Close by clicking outside

## Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader announces elements correctly
- [ ] Color contrast is sufficient
- [ ] Focus indicators are visible

## Edge Cases

- [ ] Artifact with no thumbnail
- [ ] Artifact with very long title
- [ ] Artifact with broken image URL
- [ ] Museum with only 1 artifact
- [ ] Museum with 1000+ artifacts
- [ ] Subreddit name with special characters
- [ ] Post from exactly April 1, 2018 (0 BRR/ARR)

## Known Issues to Watch For

1. **Image loading**: Some Reddit thumbnails may be expired or broken
2. **Scroll performance**: Very large collections (1000+) may lag
3. **Auto-scroll**: May cause motion sickness for some users (that's why it's optional)
4. **Mobile layout**: Small screens may have cramped cards

## Reporting Issues

When reporting issues, include:
1. Browser and version
2. Device (desktop/mobile/tablet)
3. Screen size
4. Steps to reproduce
5. Expected vs actual behavior
6. Screenshots if applicable

## Success Criteria

The implementation is successful if:
- ✅ All UI components render correctly
- ✅ No TypeScript errors
- ✅ No console errors
- ✅ Responsive design works on all devices
- ✅ Performance is acceptable (< 2s load, smooth scrolling)
- ✅ First discovery tracking works
- ✅ BRR/ARR dates display correctly
- ✅ Broken artifacts are counted but not displayed
- ✅ All sorting options work
- ✅ Auto-scroll toggle works
- ✅ Detail overlay displays all information
- ✅ Image fallbacks work for broken URLs

## Next Steps After Testing

1. Fix any bugs found during testing
2. Gather user feedback
3. Consider implementing future enhancements:
   - Search/filter
   - Custom collections
   - Sharing
   - Achievements
   - Leaderboards
