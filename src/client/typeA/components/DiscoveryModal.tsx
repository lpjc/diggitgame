// Job: Floating discovery overlay for Type A; handles nugget reveal animation, shows revealed post using the museum ArtifactCard, and renders community progress with +1 tick under the post
import React, { useEffect, useState } from 'react';
import { ArtifactData } from '../../../shared/types/game';
import { ArtifactCard } from '../../typeB/components/ArtifactCard';
import type { ArtifactWithPlayerData } from '../../../shared/types/artifact';

interface DiscoveryModalProps {
  artifact: ArtifactData;
  isBroken: boolean;
  onAddToMuseum: () => void;
  onFindMore: () => void;
  onViewMuseum: () => void;
  isAdded: boolean;
  initialFound?: number;
  threshold?: number | null;
  onRevealed?: () => void;
}

export const DiscoveryModal: React.FC<DiscoveryModalProps> = ({
  artifact,
  isBroken,
  onAddToMuseum,
  onFindMore,
  onViewMuseum,
  isAdded,
  initialFound = 0,
  threshold = null,
  onRevealed,
}) => {
  const [showNugget, setShowNugget] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [phase, setPhase] = useState<'sink' | 'nugget' | 'revealed'>(isBroken ? 'nugget' : 'sink');
  const [displayFound, setDisplayFound] = useState<number>(initialFound);
  const [showPlusOne, setShowPlusOne] = useState(false);

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
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: phase === 'nugget' || revealed ? 'rgba(0,0,0,0.80)' : 'rgba(0,0,0,0)', transition: 'background 600ms ease' }}>
        <style>{`
          @keyframes circle-enter { from { opacity: 0; transform: translateY(28px) scale(0.92); } to { opacity: 1; transform: translateY(0) scale(1); } }
          @keyframes content-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes float-up { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-12px); } }
        `}</style>
        <div className="max-w-sm w-[340px]" style={{ animation: 'content-fade 520ms ease-out' }}>
          {isBroken ? (
            <div className="flex flex-col items-center">
              <div className="text-4xl text-center mb-3">💔</div>
              <h2 className="text-base font-bold text-center text-white mb-1 drop-shadow">Artifact Broken!</h2>
              <p className="text-center text-white/80 mb-4 text-sm drop-shadow">Your shovel broke the artifact!</p>
              <button
                onClick={onFindMore}
                className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm font-semibold"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {!revealed ? (
                !showNugget ? null : (
                  <div className="flex flex-col items-center gap-3">
                    <div
                      onClick={() => {
                        setRevealed(true);
                        setTimeout(() => {
                          setDisplayFound((f) => f + 1);
                          setShowPlusOne(true);
                          setTimeout(() => setShowPlusOne(false), 1200);
                        }, 200);
                        onRevealed?.();
                      }}
                      className="w-28 h-28 rounded-full cursor-pointer"
                      style={{
                        background: '#FFD700',
                        boxShadow: '0 10px 22px rgba(255,193,7,0.45), inset 0 0 0 1px rgba(255,255,255,0.7)',
                        animation: 'circle-enter 700ms cubic-bezier(.2,.8,.2,1)'
                      }}
                      title={`Tap to reveal a historical artifact from r/${artifact.post.subreddit}`}
                    />
                    <p className="text-sm text-white/95 font-semibold drop-shadow">Tap to reveal a historical artifact from r/{artifact.post.subreddit}</p>
                  </div>
                )
              ) : null}
            </>
          )}

          {(!isBroken && revealed) && (
            <div className="mt-4 space-y-3">
              {/* Revealed post using exact museum ArtifactCard */}
              <div className="mb-2">
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

              {/* Progress under the revealed post */}
              {threshold != null && (
                <div className="text-white text-xs">
                  <div className="flex items-center gap-2 relative">
                    <div className="min-w-[44px] text-right tabular-nums">
                      {displayFound}/{threshold}
                    </div>
                    <div className="w-48 h-2 bg-white/20 rounded overflow-hidden">
                      <div
                        className="h-full bg-orange-400 transition-[width] duration-500"
                        style={{ width: `${Math.min(100, Math.floor(((displayFound) / (threshold || 1)) * 100))}%` }}
                      />
                    </div>
                    {showPlusOne && (
                      <div style={{ position: 'absolute', left: '-6px', top: '-10px', color: '#FDBA74', fontWeight: 700, fontSize: '12px', animation: 'float-up 1.1s ease-out forwards' }}>+1</div>
                    )}
                  </div>
                  <div className="mt-2 text-[11px] leading-snug opacity-90">
                    Community goal to unlock next depth for r/{artifact.post.subreddit}
                  </div>
                </div>
              )}

              {/* Actions */}
              {!isAdded ? (
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={onAddToMuseum}
                    className="px-4 py-2 rounded-md bg-orange-500/90 hover:bg-orange-500 text-white text-sm font-semibold"
                  >
                    Claim!
                  </button>
                  <button
                    onClick={onFindMore}
                    className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm font-semibold"
                  >
                    Find more
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={onFindMore}
                    className="px-4 py-2 rounded-md bg-blue-500/90 hover:bg-blue-500 text-white text-sm font-semibold"
                  >
                    Find more artifacts!
                  </button>
                  <button
                    onClick={onViewMuseum}
                    className="px-4 py-2 rounded-md bg-purple-500/90 hover:bg-purple-500 text-white text-sm font-semibold"
                  >
                    Go to Museum
                  </button>
                </div>
              )}
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
              Open new dig site as me
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
