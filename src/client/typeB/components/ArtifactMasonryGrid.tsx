import { useState, useEffect, useRef } from 'react';
import { ArtifactWithPlayerData } from '../../../shared/types/artifact';
import { ArtifactCard } from './ArtifactCard';

interface ArtifactMasonryGridProps {
  artifacts: ArtifactWithPlayerData[];
  onArtifactClick: (artifact: ArtifactWithPlayerData) => void;
  currentUserId: string;
}

export const ArtifactMasonryGrid: React.FC<ArtifactMasonryGridProps> = ({
  artifacts,
  onArtifactClick,
  currentUserId,
}) => {
  const [visibleCount, setVisibleCount] = useState(30);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && visibleCount < artifacts.length) {
          setVisibleCount((prev) => Math.min(prev + 30, artifacts.length));
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [visibleCount, artifacts.length]);

  const visibleArtifacts = artifacts.slice(0, visibleCount);

  if (artifacts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-2">🏺</div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">No artifacts yet</h3>
          <p className="text-xs text-gray-500">Start excavating to discover artifacts!</p>
        </div>
      </div>
    );
  }

  // Split artifacts into 3 rows
  const row1: ArtifactWithPlayerData[] = [];
  const row2: ArtifactWithPlayerData[] = [];
  const row3: ArtifactWithPlayerData[] = [];

  visibleArtifacts.forEach((artifact, index) => {
    if (index % 3 === 0) row1.push(artifact);
    else if (index % 3 === 1) row2.push(artifact);
    else row3.push(artifact);
  });

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden">
      <div className="flex flex-col gap-2 p-2 h-full">
        {/* Row 1 */}
        <div className="flex gap-2 h-1/3">
          {row1.map((artifact) => (
            <ArtifactCard
              key={artifact.artifactId}
              artifact={artifact}
              onClick={() => onArtifactClick(artifact)}
              isFirstDiscovery={artifact.firstDiscoveredBy === currentUserId}
            />
          ))}
          {row1.length > 0 && <div ref={loadMoreRef} className="w-4 flex-shrink-0" />}
        </div>

        {/* Row 2 */}
        <div className="flex gap-2 h-1/3">
          {row2.map((artifact) => (
            <ArtifactCard
              key={artifact.artifactId}
              artifact={artifact}
              onClick={() => onArtifactClick(artifact)}
              isFirstDiscovery={artifact.firstDiscoveredBy === currentUserId}
            />
          ))}
        </div>

        {/* Row 3 */}
        <div className="flex gap-2 h-1/3">
          {row3.map((artifact) => (
            <ArtifactCard
              key={artifact.artifactId}
              artifact={artifact}
              onClick={() => onArtifactClick(artifact)}
              isFirstDiscovery={artifact.firstDiscoveredBy === currentUserId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
