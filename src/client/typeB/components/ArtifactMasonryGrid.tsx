// Job: Three horizontal shelves of artifacts rendered over a repeating museum
// background image applied to the horizontally scrolling container itself so it
// repeats with scroll. The background comes from `/inside-museum.png`, fits the
// container height, and repeats horizontally as you scroll. Each artifact shows
// a small front "plaque" with age and rarity emblem.

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

  // Split artifacts into 3 shelves
  const row1: ArtifactWithPlayerData[] = [];
  const row2: ArtifactWithPlayerData[] = [];
  const row3: ArtifactWithPlayerData[] = [];

  visibleArtifacts.forEach((artifact, index) => {
    if (index % 3 === 0) row1.push(artifact);
    else if (index % 3 === 1) row2.push(artifact);
    else row3.push(artifact);
  });

  // Rarity tier helper removed from UI usage (kept out to avoid dead code warnings)

  const ShelfRow: React.FC<{ items: ArtifactWithPlayerData[]; shelfTone: 'amber-700' | 'amber-600' | 'amber-800' }>
    = ({ items }) => {
    // Plaque removed; no per-row tones currently applied

    return (
      <div className={`flex gap-4 h-1/3 items-end pb-[3%]`}>
        {items.map((artifact) => {
          // Age and rarity no longer displayed here (handled inside card)
          return (
            <div key={artifact.artifactId} className="relative">
              <div className="mb-2">
                <ArtifactCard
                  artifact={artifact}
                  onClick={() => onArtifactClick(artifact)}
                  isFirstDiscovery={artifact.firstDiscoveredBy === currentUserId}
                />
              </div>
              {/* Plaque removed – age now displayed inside the card itself */}
            </div>
          );
        })}
        {/* Extend shelf visually with long gradient */}
        <div className="flex-shrink-0 w-[40vw]" />
      </div>
    );
  };

  return (
    <div
      className="flex-1 overflow-x-auto overflow-y-hidden touch-pan-x select-none"
      style={{
        backgroundImage: "url('/inside-museum.png')",
        backgroundRepeat: 'repeat-x',
        backgroundSize: 'auto 100%',
        backgroundPosition: '0 0',
        backgroundAttachment: 'scroll',
      }}
      onMouseDown={(e) => {
        const container = e.currentTarget as HTMLDivElement;
        const startX = e.pageX - container.offsetLeft;
        const scrollLeft = container.scrollLeft;
        let isDown = true;
        const onMove = (ev: MouseEvent) => {
          if (!isDown) return;
          const x = ev.pageX - container.offsetLeft;
          const walk = (x - startX) * 1; // drag speed
          container.scrollLeft = scrollLeft - walk;
        };
        const onUp = () => {
          isDown = false;
          window.removeEventListener('mousemove', onMove);
          window.removeEventListener('mouseup', onUp);
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
      }}
      onTouchStart={(e) => {
        const container = e.currentTarget as HTMLDivElement;
        const firstTouch = e.touches.item(0);
        if (!firstTouch) return;
        const startX = firstTouch.pageX - container.offsetLeft;
        const startLeft = container.scrollLeft;
        const onMove = (ev: TouchEvent) => {
          const movingTouch = ev.touches.item(0);
          if (!movingTouch) return;
          const x = movingTouch.pageX - container.offsetLeft;
          const walk = (x - startX) * 1;
          container.scrollLeft = startLeft - walk;
        };
        const onEnd = () => {
          window.removeEventListener('touchmove', onMove);
          window.removeEventListener('touchend', onEnd);
          window.removeEventListener('touchcancel', onEnd);
        };
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onEnd);
        window.addEventListener('touchcancel', onEnd);
      }}
    >
      <div
        className="flex flex-col gap-2 p-2"
        style={{ height: '80%' }}
      >
        {/* Shelf 1 */}
        <ShelfRow items={row1} shelfTone="amber-700" />
        {row1.length > 0 && <div ref={loadMoreRef} className="w-4 h-0" />}
        {/* Shelf 2 */}
        <ShelfRow items={row2} shelfTone="amber-600" />
        {/* Shelf 3 */}
        <ShelfRow items={row3} shelfTone="amber-800" />
      </div>
    </div>
  );
};
