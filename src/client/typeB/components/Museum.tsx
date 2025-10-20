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

  useEffect(() => {
    fetchMuseumData();
  }, [userId, sortBy]);

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

  return (
    <div className="h-screen relative flex flex-col">
      {/* Top-center banner overlay */}
      <div className="pointer-events-none fixed top-2 left-1/2 -translate-x-1/2 z-50">
        <div className="pointer-events-auto">
          <CollectionHeader username={userId} />
        </div>
      </div>

      {/* Floating bottom-right controls */}
      <div className="fixed bottom-4 right-4 z-50">
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
