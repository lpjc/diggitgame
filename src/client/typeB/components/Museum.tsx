// Job: Screen-level container for the Museum view. Fetches museum data and
// renders overlays: a top-center username banner and a bottom-right floating
// controls menu. Applies client-side sorting (field + direction) and passes the
// sorted artifacts to the masonry grid.
import { useEffect, useMemo, useState } from 'react';
import { fetchAPI } from '../../shared/utils/api';
import { GetMuseumResponse, ArtifactWithPlayerData } from '../../../shared/types/artifact';
import { CollectionHeader } from './CollectionHeader';
import { ControlBanner } from './ControlBanner';
import { ArtifactMasonryGrid } from './ArtifactMasonryGrid';
import { ArtifactDetailOverlay } from './ArtifactDetailOverlay';

interface MuseumProps {
  userId: string;
}

export const Museum: React.FC<MuseumProps> = ({ userId }) => {
  const [museumData, setMuseumData] = useState<GetMuseumResponse | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'rarity' | 'subreddit'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [autoScroll, setAutoScroll] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactWithPlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGiftToast, setShowGiftToast] = useState(false);
  const [snoovatarUrl, setSnoovatarUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchMuseumData();
  }, [userId, sortBy]);

  // Fetch current user's Snoovatar once
  useEffect(() => {
    (async () => {
      try {
        const result = await fetchAPI<{ username: string; snoovatarUrl: string | null }>(
          '/api/me/snoovatar'
        );
        setSnoovatarUrl(result.snoovatarUrl);
      } catch (e) {
        // Non-fatal; leave as null
      }
    })();
  }, []);

  async function fetchMuseumData() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAPI<GetMuseumResponse>(
        `/api/museum/${userId}?sortBy=${sortBy}&includeBroken=false`
      );
      setMuseumData(data);
    } catch (err) {
      console.error('Failed to fetch museum:', err);
      setError('Failed to load museum. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Sorting helper and memoized sorted artifacts. Must be declared before any
  // conditional returns to respect the Rules of Hooks (consistent hook order).
  function sortArtifactsLocal(
    artifacts: ArtifactWithPlayerData[],
    key: 'date' | 'rarity' | 'subreddit',
    dir: 'asc' | 'desc'
  ): ArtifactWithPlayerData[] {
    const sign = dir === 'asc' ? 1 : -1;
    const arr = [...artifacts];
    if (key === 'date') return arr.sort((a, b) => sign * (a.collectedAt - b.collectedAt));
    if (key === 'rarity') return arr.sort((a, b) => sign * (a.foundByCount - b.foundByCount));
    return arr.sort((a, b) => sign * a.subredditOfOrigin.localeCompare(b.subredditOfOrigin));
  }

  const sortedArtifacts = useMemo(() => {
    const base = museumData?.artifacts ?? [];
    return sortArtifactsLocal(base, sortBy, sortDir);
  }, [museumData, sortBy, sortDir]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="text-4xl mb-2">🏛️</div>
          <p className="text-sm font-semibold text-gray-700">Loading museum...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <button
            onClick={fetchMuseumData}
            className="mt-2 px-4 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!museumData) return null;

  // Empty museum state
  if (museumData.artifacts.length === 0) {
    return (
      <div className="h-screen relative flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
        {/* Floating top-right controls */}
        <div className="fixed top-4 right-4 z-50">
          <ControlBanner
            stats={museumData.stats}
            sortBy={sortBy}
            sortDir={sortDir}
            onSortChange={setSortBy}
            onSortDirChange={setSortDir}
            autoScroll={autoScroll}
            onAutoScrollToggle={() => setAutoScroll(!autoScroll)}
            onGiftShop={() => {
              setShowGiftToast(true);
              window.setTimeout(() => setShowGiftToast(false), 2200);
            }}
          />
        </div>

        {/* Bottom-left grouped overlay: Snoovatar + Collection Header */}
        <div className="fixed bottom-4 left-1 z-50 flex items-center">
          {/* Snoovatar */}
          <div style={{ height: '30vh', width: 'auto' }}>
            <img
              src={snoovatarUrl || 'https://i.redd.it/snoovatar/avatars/5a27568f-6463-41c7-a719-272bd9bd29e3.png'}
              alt="Snoovatar"
              className="h-full object-cover"
              style={{ width: 'auto', maxWidth: '100%' }}
            />
          </div>
          
          {/* Collection Header - positioned to overlap the avatar */}
          <div className="pointer-events-auto -ml-8 mt-4 z-40">
            <CollectionHeader username={userId} />
          </div>
        </div>

        {/* Empty museum content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="text-6xl mb-4">🏺</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Your museum is empty</h2>
            <p className="text-gray-600 mb-6">Go find a dig site to start collecting artifacts!</p>
            <a
              href="https://www.reddit.com/r/diggitgame_dev/new/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
            >
              Find Dig Site
            </a>
          </div>
        </div>

        {/* Gift shop toast */}
        {showGiftToast && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[60]">
            <div className="px-3 py-2 rounded-lg bg-black/80 text-white text-xs shadow-lg">
              Gift Shop: Planned feature pending game dev funding
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen relative flex flex-col">
      {/* Floating top-right controls */}
      <div className="fixed top-4 right-4 z-50">
        <ControlBanner
          stats={museumData.stats}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={setSortBy}
          onSortDirChange={setSortDir}
          autoScroll={autoScroll}
          onAutoScrollToggle={() => setAutoScroll(!autoScroll)}
          onGiftShop={() => {
            setShowGiftToast(true);
            window.setTimeout(() => setShowGiftToast(false), 2200);
          }}
        />
      </div>

      {/* Bottom-left grouped overlay: Snoovatar + Collection Header */}
      <div className="fixed bottom-4 left-[-8px] flex items-center z-30">
        {/* Snoovatar */}
        <div className="z-50" style={{ height: '30vh', width: 'auto'}}>
          <img
            src={snoovatarUrl || 'https://i.redd.it/snoovatar/avatars/5a27568f-6463-41c7-a719-272bd9bd29e3.png'}
            alt="Snoovatar"
            className="h-full object-cover z-50"
            style={{ width: 'auto', maxWidth: '100%' }}
          />
        </div>
        
        {/* Collection Header - positioned to overlap the avatar */}
        <div className="pointer-events-auto -ml-8 mt-4 z-20">
          <CollectionHeader username={userId} />
        </div>
      </div>

      {/* Shelves - three horizontal scrollable rows (background applied on the grid container) */}
      <ArtifactMasonryGrid
        artifacts={sortedArtifacts}
        onArtifactClick={setSelectedArtifact}
        currentUserId={userId}
      />

      {/* Detail Overlay */}
      {selectedArtifact && (
        <ArtifactDetailOverlay
          artifact={selectedArtifact}
          isFirstDiscovery={selectedArtifact.firstDiscoveredBy === userId}
          onClose={() => setSelectedArtifact(null)}
        />
      )}

      {/* Gift shop toast */}
      {showGiftToast && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[60]">
          <div className="px-3 py-2 rounded-lg bg-black/80 text-white text-xs shadow-lg">
            Gift Shop: Planned feature pending game dev funding
          </div>
        </div>
      )}
    </div>
  );
};
