import { ArtifactWithPlayerData } from '../../../shared/types/artifact';
import { ArtifactTile } from './ArtifactTile';

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {artifacts.map((artifact) => (
          <ArtifactTile
            key={artifact.artifactId}
            artifact={artifact}
            onClick={() => {
              // TODO: Show artifact details modal
              console.log('Broken artifact clicked:', artifact);
            }}
          />
        ))}
      </div>
    </div>
  );
};
