import React from 'react';
import { ArtifactData } from '../../../shared/types/game';

interface DiscoveryModalProps {
  artifact: ArtifactData;
  isBroken: boolean;
  onAddToMuseum: () => void;
  onFindMore: () => void;
  onViewMuseum: () => void;
  isAdded: boolean;
}

export const DiscoveryModal: React.FC<DiscoveryModalProps> = ({
  artifact,
  isBroken,
  onAddToMuseum,
  onFindMore,
  onViewMuseum,
  isAdded,
}) => {
  if (artifact.type === 'post' && artifact.post) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
          {isBroken ? (
            <>
              <div className="text-6xl text-center mb-4">💔</div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                Artifact Broken!
              </h2>
              <p className="text-center text-gray-600 mb-4">
                You broke the artifact with the shovel. It's been added to your museum as a broken
                piece.
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl text-center mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                Discovery!
              </h2>
              <p className="text-center text-gray-600 mb-4">
                You found <span className="font-semibold">{artifact.post.title}</span>
              </p>
            </>
          )}

          <div className="bg-white rounded-lg p-4 mb-4 shadow-inner">
            <div className="flex items-start gap-3">
              {artifact.post.thumbnailUrl && (
                <img
                  src={artifact.post.thumbnailUrl}
                  alt="Post thumbnail"
                  className="w-16 h-16 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 line-clamp-2">
                  {artifact.post.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  r/{artifact.post.subreddit} • {artifact.post.author}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(artifact.post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {artifact.post.textSnippet && (
              <p className="text-xs text-gray-600 mt-3 line-clamp-3">
                {artifact.post.textSnippet}
              </p>
            )}
          </div>

          {!isAdded ? (
            <button
              onClick={onAddToMuseum}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors mb-3"
            >
              Add to Museum
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={onFindMore}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Find More Digs
              </button>
              <button
                onClick={onViewMuseum}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                View Your Museum
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (artifact.type === 'subreddit_relic' && artifact.relic) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
          <div className="text-6xl text-center mb-4 animate-pulse">🏛️</div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Subreddit Relic Discovered!
          </h2>
          <p className="text-center text-gray-600 mb-4">
            You discovered a new site! Unlock{' '}
            <span className="font-semibold">r/{artifact.relic.subredditName}</span>
          </p>

          <div className="bg-white rounded-lg p-4 mb-4 shadow-inner flex items-center gap-4">
            {artifact.relic.iconUrl && (
              <img
                src={artifact.relic.iconUrl}
                alt={`r/${artifact.relic.subredditName}`}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-800">r/{artifact.relic.subredditName}</p>
              <p className="text-sm text-gray-600 mt-1">{artifact.relic.description}</p>
            </div>
          </div>

          {!isAdded ? (
            <button
              onClick={onAddToMuseum}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Claim Relic
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={onFindMore}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Explore New Site
              </button>
              <button
                onClick={onViewMuseum}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                View Your Museum
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
