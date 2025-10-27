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
  const [phase, setPhase] = useState<'sink' | 'nugget' | 'revealed'>(isBroken ? 'nugget' : 'sink');

  useEffect(() => {
    if (!isBroken) {
      const t1 = setTimeout(() => {
        setPhase('nugget');
        // Slightly stagger the nugget so backdrop can fade first
        setTimeout(() => setShowNugget(true), 180);
      }, 850 + Math.random() * 350);
      return () => clearTimeout(t1);
    } else {
      setPhase('nugget');
      setShowNugget(true);
    }
  }, [isBroken]);

  if (artifact.type === 'post' && artifact.post) {
    // Stay on the dirt completely during the sink phase
    if (!isBroken && phase === 'sink') return null;
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: phase === 'nugget' || revealed ? 'rgba(0,0,0,0.80)' : 'rgba(0,0,0,0)', transition: 'background 360ms ease' }}>
        <style>{`
          @keyframes circle-enter { from { opacity: 0; transform: translateY(28px) scale(0.92); } to { opacity: 1; transform: translateY(0) scale(1); } }
          @keyframes card-zoom { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        `}</style>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-2xl max-w-sm w-[320px] p-4" style={{ animation: revealed ? 'card-zoom 280ms ease-out' : undefined }}>
          {isBroken ? (
            <>
              <div className="text-3xl text-center mb-2">💔</div>
              <h2 className="text-base font-bold text-center text-gray-800 mb-1">
                Artifact Broken!
              </h2>
              <p className="text-center text-gray-600 mb-3 text-sm">
                Your shovel broke the artifact!
              </p>
              <button
                onClick={onFindMore}
                className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-2 rounded-md transition-colors mb-1 text-sm"
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              {!revealed ? (
                <>
                  {!showNugget ? null : (
                    <div className="flex flex-col items-center gap-3 mb-1">
                      <div
                        onClick={() => {
                          setRevealed(true);
                        }}
                        className="w-28 h-28 rounded-full cursor-pointer"
                        style={{
                          background: '#FFD700',
                          boxShadow: '0 10px 22px rgba(255,193,7,0.45), inset 0 0 0 1px rgba(255,255,255,0.7)',
                          animation: 'circle-enter 420ms cubic-bezier(.2,.8,.2,1)'
                        }}
                        title={`Tap to reveal a historical artifact from r/${artifact.post.subreddit}`}
                      />
                      <p className="text-xs text-gray-700 font-medium">Tap to reveal a historical artifact from r/{artifact.post.subreddit}</p>
                    </div>
                  )}
                </>
              ) : null}
            </>
          )}

          {(!isBroken && revealed) && (
            <div className="bg-white rounded-lg p-2 mb-3 shadow-inner">
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
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-md transition-colors mb-2 text-sm"
            >
              Claim!
            </button>
          ) : null}
          {(!isBroken && isAdded) && (
            <div className="space-y-2">
              <button
                onClick={onFindMore}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition-colors text-sm"
              >
                Find more artifacts!
              </button>
              <button
                onClick={onViewMuseum}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded-md transition-colors text-sm"
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
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: phase === 'nugget' || revealed ? 'rgba(0,0,0,0.80)' : 'rgba(0,0,0,0)', transition: 'background 360ms ease' }}>
        <div className="bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl shadow-2xl max-w-sm w-[320px] p-4" style={{ animation: revealed ? 'card-zoom 280ms ease-out' : undefined }}>
          <div className="text-3xl text-center mb-3 animate-pulse">💎</div>
          <h2 className="text-base font-bold text-center text-gray-800 mb-1">
            Subreddit Relic Discovered!
          </h2>
          <p className="text-center text-gray-600 mb-3 text-sm">
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
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-md transition-colors text-sm"
            >
              Open new dig site!
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={onFindMore}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition-colors text-sm"
              >
                Explore New Site
              </button>
              <button
                onClick={onViewMuseum}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded-md transition-colors text-sm"
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
