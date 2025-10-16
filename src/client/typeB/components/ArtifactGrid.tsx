import { ArtifactWithPlayerData } from '../../../shared/types/artifact';
import { ArtifactTile } from './ArtifactTile';

interface ArtifactGridProps {
  artifacts: ArtifactWithPlayerData[];
}

export const ArtifactGrid: React.FC<ArtifactGridProps> = ({ artifacts }) => {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {artifacts.map((artifact) => (
        <ArtifactTile
          key={artifact.artifactId}
          artifact={artifact}
          onClick={() => {
            // TODO: Show artifact details modal
            console.log('Artifact clicked:', artifact);
          }}
        />
      ))}
    </div>
  );
};
