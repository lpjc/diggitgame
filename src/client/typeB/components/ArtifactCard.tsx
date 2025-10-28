// Job: Compact Reddit-like post card for a collected artifact, with no thumbnails.
// - Shows Month Year (age) above subreddit, subreddit icon/name, title, score, and quick stats.
// - Used in large grid views; clicking opens detail overlay in parent.
// - Image thumbnails are intentionally omitted per design.

import React, { useEffect, useState } from 'react';
import { ArtifactWithPlayerData } from '../../../shared/types/artifact';
// Note: Badges are NOT shown on the card itself (they live on plaques)
// Keeping imports local to avoid unused imports
import { formatNumber } from '../utils/dateCalculator';
import { fetchSubredditIcon } from '../../shared/utils/api';
import { navigateTo } from '@devvit/web/client';

interface ArtifactCardProps {
  artifact: ArtifactWithPlayerData;
  onClick: () => void;
  isFirstDiscovery: boolean;
}

// Rarity is not used on the card (shown on plaques); helper removed for clarity

export const ArtifactCard: React.FC<ArtifactCardProps> = ({
  artifact,
  onClick,
}) => {
  const handleCardClick = () => {
    // If there's a Reddit post permalink, navigate to it
    if (artifact.redditPost?.permalink) {
      navigateTo(`https://reddit.com${artifact.redditPost.permalink}`);
    } else {
      // Fallback to the provided onClick handler
      onClick();
    }
  };
  const [subredditIconUrl, setSubredditIconUrl] = useState<string>('/snoo.png');

  // Fetch subreddit icon for post artifacts
  useEffect(() => {
    const loadSubredditIcon = async () => {
      // For subreddit relics, use the stored iconUrl
      if (artifact.type === 'subreddit_relic' && artifact.subredditRelic?.iconUrl) {
        setSubredditIconUrl(artifact.subredditRelic.iconUrl);
        return;
      }

      // For post artifacts, fetch the icon dynamically
      if (artifact.type === 'post') {
        try {
          const iconUrl = await fetchSubredditIcon(artifact.subredditOfOrigin);
          setSubredditIconUrl(iconUrl);
        } catch (error) {
          console.warn(`Failed to load icon for r/${artifact.subredditOfOrigin}:`, error);
          setSubredditIconUrl('/snoo.png');
        }
      }
    };

    loadSubredditIcon();
  }, [artifact.type, artifact.subredditOfOrigin, artifact.subredditRelic?.iconUrl]);

  const titleText =
    artifact.type === 'post'
      ? artifact.redditPost?.title || 'Untitled'
      : `r/${artifact.subredditRelic?.subredditName ?? artifact.subredditOfOrigin}`;

  // Month Year label (e.g., June 2021) computed from createdAt or firstDiscoveredAt
  const monthYear = (() => {
    const ts = artifact.redditPost?.createdAt || artifact.firstDiscoveredAt;
    if (!ts) return '';
    const d = new Date(ts);
    // Use built-in locale to avoid extra deps; enforce long month
    return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  })();

  return (
    <div
      className="flex w-[180px] max-w-[180px] flex-col gap-1.5 rounded-[10px] bg-white p-2 font-['Inter',_sans-serif] shadow hover:shadow-lg cursor-pointer"
      style={{ fontFeatureSettings: 'normal' }}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 shrink-0 overflow-hidden rounded-full bg-gray-100">
          <img alt={`r/${artifact.subredditOfOrigin}`} className="absolute inset-0 w-full h-full object-cover" src={subredditIconUrl} />
        </div>
        <div className="flex flex-col items-start leading-none">
          {monthYear && (
            <span className="text-[10px] leading-4 font-semibold text-[#34424A]">{monthYear}</span>
          )}
          <span className="text-[10px] leading-4 font-semibold text-[#5C6C74]">r/{artifact.subredditOfOrigin}</span>
          {/* Badges removed on card per design (appear on shelf plaque) */}
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] leading-5 font-bold break-words whitespace-pre-wrap text-[#11151A] line-clamp-2">
          {titleText}
        </span>

        {/* Footer actions */}
        <div className="flex justify-between items-center gap-2 text-[#5C6C74]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <img src="/icon/for-cards/upvote-icon-orange.png" className="w-4 h-4" />
              <span className="text-[10px] font-semibold">{formatNumber(artifact.redditPost?.score || 0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <img src="/icon/for-cards/comment-icon-orange.png" className="w-4 h-4" />
              <span className="text-[10px] font-semibold">{formatNumber(artifact.redditPost?.commentCount || 0)}</span>
            </div>
          </div>
          {artifact.redditPost?.permalink && (
            <button
              type="button"
              className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                navigateTo(`https://reddit.com${artifact.redditPost!.permalink}`);
              }}
              aria-label="Open on Reddit"
            >
              {/* Open in new window icon */}
              <img src="/icon/for-cards/open-new-icon-grey.png" className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
