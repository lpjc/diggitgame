// Job: Grid view for broken artifacts using the new Reddit-like card.
// - Uses `ArtifactCard` for consistency but shows broken styling via strikethrough in detail (kept minimal here).
import { ArtifactWithPlayerData } from '../../../shared/types/artifact';
import { ArtifactCard } from './ArtifactCard';

interface BrokenArtifactsViewProps {
  artifacts: ArtifactWithPlayerData[];
}

export const BrokenArtifactsView: React.FC<BrokenArtifactsViewProps> = ({ artifacts }) => {
  if (artifacts.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">✨</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No broken artifacts</h3>
        <p className="text-gray-500">
          You haven't broken any artifacts yet. Keep up the careful excavation!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">💔 Broken Artifacts</h2>
        <p className="text-gray-600">
          Artifacts you broke during excavation. Be more careful with the shovel next time!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
        {artifacts.map((artifact) => (
          <ArtifactCard
            key={artifact.artifactId}
            artifact={artifact}
            onClick={() => console.log('Broken artifact clicked:', artifact)}
            isFirstDiscovery={false}
          />
        ))}
      </div>
    </div>
  );
};
