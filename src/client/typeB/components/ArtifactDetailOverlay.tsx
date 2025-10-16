import React from 'react';
import { ArtifactWithPlayerData, RarityTier } from '../../../shared/types/artifact';
import { calculateBRRDate, calculateActualAge, formatNumber } from '../utils/dateCalculator';

interface ArtifactDetailOverlayProps {
  artifact: ArtifactWithPlayerData;
  isFirstDiscovery: boolean;
  onClose: () => void;
}

function getRarityTier(foundByCount: number): RarityTier {
  if (foundByCount === 1) return 'unique';
  if (foundByCount < 5) return 'ultra_rare';
  if (foundByCount <= 20) return 'rare';
  if (foundByCount <= 100) return 'uncommon';
  return 'common';
}

function getRarityLabel(tier: RarityTier): string {
  switch (tier) {
    case 'unique':
      return '⭐ Unique Discovery';
    case 'ultra_rare':
      return '💎 Ultra Rare';
    case 'rare':
      return '🔷 Rare';
    case 'uncommon':
      return '🔹 Uncommon';
    case 'common':
      return '⚪ Common';
  }
}

export const ArtifactDetailOverlay: React.FC<ArtifactDetailOverlayProps> = ({
  artifact,
  isFirstDiscovery,
  onClose,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const rarityTier = getRarityTier(artifact.foundByCount);
  const brrDate = calculateBRRDate(artifact.redditPost?.createdAt || artifact.firstDiscoveredAt);
  const actualAge = calculateActualAge(
    artifact.redditPost?.createdAt || artifact.firstDiscoveredAt
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Artifact Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* First Discovery Banner */}
          {isFirstDiscovery && (
            <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-400 rounded-lg p-4 mb-4">
              <p className="text-center text-amber-900 font-bold text-lg">
                🏆 You discovered this first!
              </p>
            </div>
          )}

          {/* Image */}
          {artifact.type === 'post' && artifact.redditPost?.thumbnailUrl && (
            <>
              {imageError ? (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg mb-4">
                  <span className="text-6xl">🏺</span>
                </div>
              ) : (
                <img
                  src={artifact.redditPost.thumbnailUrl}
                  alt=""
                  className="w-full rounded-lg mb-4"
                  onError={() => setImageError(true)}
                />
              )}
            </>
          )}

          {/* Title */}
          <h3 className="text-2xl font-bold mb-4">{artifact.redditPost?.title}</h3>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <MetadataItem label="Subreddit" value={`r/${artifact.subredditOfOrigin}`} />
            <MetadataItem label="Posted" value={`${brrDate} (${actualAge})`} />
            <MetadataItem
              label="Score"
              value={`⬆️ ${formatNumber(artifact.redditPost?.score || 0)}`}
            />
            <MetadataItem label="Rarity" value={getRarityLabel(rarityTier)} />
            <MetadataItem label="Found By" value={`${artifact.foundByCount} players`} />
            <MetadataItem
              label="First Discovered By"
              value={`u/${artifact.firstDiscoveredBy || 'Unknown'}`}
            />
          </div>

          {/* Collected Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              You collected this on {new Date(artifact.collectedAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">From dig site: {artifact.sourceDigSite}</p>
          </div>

          {/* View on Reddit */}
          {artifact.redditPost?.permalink && (
            <a
              href={`https://reddit.com${artifact.redditPost.permalink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4 text-center bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
            >
              View on Reddit →
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const MetadataItem: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
};
