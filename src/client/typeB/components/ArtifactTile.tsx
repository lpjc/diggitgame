import { ArtifactWithPlayerData, RarityTier } from '../../../shared/types/artifact';

interface ArtifactTileProps {
  artifact: ArtifactWithPlayerData;
  onClick?: () => void;
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

function getRarityColor(tier: RarityTier): string {
  switch (tier) {
    case 'unique':
      return 'from-yellow-400 to-orange-500';
    case 'ultra_rare':
      return 'from-purple-400 to-pink-500';
    case 'rare':
      return 'from-blue-400 to-cyan-500';
    case 'uncommon':
      return 'from-green-400 to-emerald-500';
    case 'common':
      return 'from-gray-300 to-gray-400';
  }
}

export const ArtifactTile: React.FC<ArtifactTileProps> = ({ artifact, onClick }) => {
  const rarityTier = getRarityTier(artifact.foundByCount);
  const rarityLabel = getRarityLabel(rarityTier);
  const rarityColor = getRarityColor(rarityTier);

  // Post artifact
  if (artifact.type === 'post' && artifact.redditPost) {
    return (
      <div
        className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow ${
          artifact.isBroken ? 'opacity-60' : ''
        }`}
        onClick={onClick}
      >
        {/* Thumbnail */}
        {artifact.redditPost.thumbnailUrl && (
          <div className="w-full h-32 bg-gray-200 overflow-hidden">
            <img
              src={artifact.redditPost.thumbnailUrl}
              alt="Artifact thumbnail"
              className={`w-full h-full object-cover ${artifact.isBroken ? 'grayscale' : ''}`}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3
            className={`text-sm font-semibold text-gray-800 line-clamp-2 mb-2 ${
              artifact.isBroken ? 'line-through' : ''
            }`}
          >
            {artifact.redditPost.title}
          </h3>

          {/* Subreddit */}
          <p className="text-xs text-gray-600 mb-1">r/{artifact.subredditOfOrigin}</p>

          {/* Found date */}
          <p className="text-xs text-gray-500 mb-3">
            Found: {new Date(artifact.collectedAt).toLocaleDateString()}
          </p>

          {/* Rarity badge */}
          <div
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${rarityColor} mb-2`}
          >
            {rarityLabel}
          </div>

          {/* Found by count */}
          <p className="text-xs text-gray-500">
            Found by {artifact.foundByCount} player{artifact.foundByCount !== 1 ? 's' : ''}
          </p>

          {/* Broken badge */}
          {artifact.isBroken && (
            <div className="mt-2 inline-block px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded">
              💔 Broken
            </div>
          )}
        </div>
      </div>
    );
  }

  // Subreddit relic
  if (artifact.type === 'subreddit_relic' && artifact.subredditRelic) {
    return (
      <div
        className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
        onClick={onClick}
      >
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            {artifact.subredditRelic.iconUrl ? (
              <img
                src={artifact.subredditRelic.iconUrl}
                alt={`r/${artifact.subredditRelic.subredditName}`}
                className="w-20 h-20 rounded-full shadow-lg animate-pulse"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-purple-300 flex items-center justify-center text-4xl">
                🏛️
              </div>
            )}
          </div>

          {/* Name */}
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            r/{artifact.subredditRelic.subredditName}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {artifact.subredditRelic.description}
          </p>

          {/* Found date */}
          <p className="text-xs text-gray-500 mb-3">
            Discovered: {new Date(artifact.collectedAt).toLocaleDateString()}
          </p>

          {/* Rarity badge */}
          <div
            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${rarityColor}`}
          >
            {rarityLabel}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
