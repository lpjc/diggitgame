import React, { useEffect, useState } from 'react';
import { ArtifactCard } from '../../typeB/components/ArtifactCard';
import type { ArtifactWithPlayerData } from '../../../shared/types/artifact';
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
  const [showNugget, setShowNugget] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!isBroken) {
      const t = setTimeout(() => setShowNugget(true), 900 + Math.random() * 600);
      return () => clearTimeout(t);
    }
  }, [isBroken]);

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
                Your shovel broke the artifact!
              </p>
              <button
                onClick={onFindMore}
                className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-3 rounded-lg transition-colors mb-1"
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              {!revealed ? (
                <>
                  {!showNugget ? (
                    <p className="text-center text-gray-600 mb-4">Preparing your find...</p>
                  ) : (
                    <div className="flex flex-col items-center gap-3 mb-4">
                      <div
                        onClick={() => setRevealed(true)}
                        className="w-40 h-40 rounded-full cursor-pointer"
                        style={{
                          background: 'radial-gradient(circle, rgba(255,208,96,0.9) 0%, rgba(255,208,96,0.65) 45%, rgba(255,208,96,0) 70%)',
                          boxShadow: '0 12px 28px rgba(255,193,7,0.35), inset 0 2px 0 rgba(255,255,255,0.7)'
                        }}
                        title={`Click to reveal a historical artifact from r/${artifact.post.subreddit}`}
                      />
                      <p className="text-sm text-gray-700">Tap the golden circle to reveal an artifact from r/{artifact.post.subreddit}</p>
                    </div>
                  )}
                </>
              ) : null}
            </>
          )}

          {(!isBroken && revealed) && (
            <div className="bg-white rounded-lg p-3 mb-4 shadow-inner">
              <ArtifactCard
                artifact={{
                  artifactId: 'temp',
                  type: 'post',
                  subredditOfOrigin: artifact.post.subreddit,
                  foundByCount: 0,
                  firstDiscoveredAt: artifact.post.createdAt,
                  firstDiscoveredBy: 'you',
                  redditPost: {
                    ...artifact.post,
                  },
                } as unknown as ArtifactWithPlayerData}
                onClick={() => {}}
                isFirstDiscovery={false}
              />
            </div>
          )}

          {!isBroken && !isAdded && revealed ? (
            <button
              onClick={onAddToMuseum}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-colors mb-3"
            >
              Claim!
            </button>
          ) : null}
          {(!isBroken && isAdded) && (
            <div className="space-y-2">
              <button
                onClick={onFindMore}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Find more artifacts!
              </button>
              <button
                onClick={onViewMuseum}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Go to Museum
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
        <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
          <div className="text-6xl text-center mb-4 animate-pulse">💎</div>
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
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Open new dig site!
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
