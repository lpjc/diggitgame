import { useEffect, useState } from 'react';
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
  const [autoScroll, setAutoScroll] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactWithPlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <CollectionHeader username={userId} />

      {/* Control Banner */}
      <ControlBanner
        stats={museumData.stats}
        sortBy={sortBy}
        onSortChange={setSortBy}
        autoScroll={autoScroll}
        onAutoScrollToggle={() => setAutoScroll(!autoScroll)}
      />

      {/* Shelves - three horizontal scrollable rows */}
      <ArtifactMasonryGrid
        artifacts={museumData.artifacts}
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
    </div>
  );
};
