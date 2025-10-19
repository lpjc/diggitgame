// Job: Responsive grid of Reddit-like artifact post cards (no thumbnails).
// - Renders many collected posts in a dense grid using `ArtifactCard`.
// - Emits `onArtifactClick` to open a detail overlay in the parent.

import { ArtifactWithPlayerData } from '../../../shared/types/artifact';
import { ArtifactCard } from './ArtifactCard';

interface ArtifactGridProps {
  artifacts: ArtifactWithPlayerData[];
  onArtifactClick: (artifact: ArtifactWithPlayerData) => void;
  currentUserId: string;
}

export const ArtifactGrid: React.FC<ArtifactGridProps> = ({
  artifacts,
  onArtifactClick,
  currentUserId,
}) => {
  if (artifacts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🏺</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No artifacts yet</h3>
        <p className="text-gray-500">
          Start excavating dig sites to discover artifacts for your museum!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 p-2">
      {artifacts.map((artifact) => (
        <ArtifactCard
          key={artifact.artifactId}
          artifact={artifact}
          onClick={() => onArtifactClick(artifact)}
          isFirstDiscovery={artifact.firstDiscoveredBy === currentUserId}
        />
      ))}
    </div>
  );
};
