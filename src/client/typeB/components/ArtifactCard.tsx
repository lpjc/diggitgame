import React from 'react';
import { ArtifactWithPlayerData, RarityTier } from '../../../shared/types/artifact';
import { RarityBadge, SubredditBadge, FirstDiscoveryBadge } from './Badges';
import { calculateBRRDate, formatNumber } from '../utils/dateCalculator';

interface ArtifactCardProps {
  artifact: ArtifactWithPlayerData;
  onClick: () => void;
  isFirstDiscovery: boolean;
}

function getRarityTier(foundByCount: number): RarityTier {
  if (foundByCount === 1) return 'unique';
  if (foundByCount < 5) return 'ultra_rare';
  if (foundByCount <= 20) return 'rare';
  if (foundByCount <= 100) return 'uncommon';
  return 'common';
}

export const ArtifactCard: React.FC<ArtifactCardProps> = ({
  artifact,
  onClick,
  isFirstDiscovery,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const hasImage = artifact.type === 'post' && artifact.redditPost?.thumbnailUrl;
  const rarityTier = getRarityTier(artifact.foundByCount);
  const brrDate = calculateBRRDate(artifact.redditPost?.createdAt || artifact.firstDiscoveredAt);

  return (
    <div
      className="flex-shrink-0 w-48 h-full bg-white rounded border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden relative"
      onClick={onClick}
    >
      {/* Badges */}
      <div className="absolute top-1 right-1 z-10 flex flex-col gap-1">
        <RarityBadge tier={rarityTier} />
        {isFirstDiscovery && <FirstDiscoveryBadge />}
      </div>

      {/* Content */}
      <div className="flex flex-col h-full">
        {/* Image or placeholder */}
        {hasImage ? (
          imageError ? (
            <div className="w-full h-24 bg-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🏺</span>
            </div>
          ) : (
            <img
              src={artifact.redditPost!.thumbnailUrl}
              alt=""
              className="w-full h-24 object-cover flex-shrink-0"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )
        ) : (
          <div className="w-full h-24 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">📄</span>
          </div>
        )}

        {/* Info */}
        <div className="p-2 flex-1 flex flex-col justify-between">
          <h3 className="text-xs font-semibold line-clamp-2 mb-1">
            {artifact.redditPost?.title || 'Untitled'}
          </h3>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <SubredditBadge subreddit={artifact.subredditOfOrigin} />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>⬆️ {formatNumber(artifact.redditPost?.score || 0)}</span>
              <span>{brrDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
