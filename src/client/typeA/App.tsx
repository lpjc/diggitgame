// Job: Client entry for Type A dig experience; wires engine, tools, UI, and ensures viewport-fit canvas
import { useEffect, useState, useRef } from 'react';
import { fetchAPI } from '../shared/utils/api';
import { DigSiteData } from '../../shared/types/game';
import { GameEngine } from './game/GameEngine';
import { DigSceneRenderer } from './game/DigSceneRenderer';
import { ToolManager } from './game/tools/ToolManager';
import { DetectorTool } from './game/tools/DetectorTool';
import { ShovelTool } from './game/tools/ShovelTool';
import { BrushTool } from './game/tools/BrushTool';
import { ArtifactSystem } from './game/ArtifactSystem';
import { ToolDock } from './components/ToolDock';
import { DiscoveryModal } from './components/DiscoveryModal';

export const App = () => {
  console.log('🔵 TYPE A - EXCAVATION GAME LOADED');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [digSiteData, setDigSiteData] = useState<DigSiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTool, setActiveTool] = useState<'detector' | 'shovel' | 'brush' | null>(null);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [artifactAdded, setArtifactAdded] = useState(false);
  const [celebration, setCelebration] = useState<{ show: boolean; stage: 'idle'|'pulse'|'linger' }>(() => ({ show: false, stage: 'idle' }));
  const [claiming, setClaiming] = useState(false);
  const [localFound, setLocalFound] = useState<number | null>(null);
  const [plusOne, setPlusOne] = useState(false);
  
  const gameEngineRef = useRef<GameEngine | null>(null);
  const toolManagerRef = useRef<ToolManager | null>(null);
  const artifactSystemRef = useRef<ArtifactSystem | null>(null);

  useEffect(() => {
    const loadDigSite = async () => {
      try {
        // Get postId from init endpoint (which has context)
        const initData = await fetchAPI<{ postId: string }>('/api/init');
        const data = await fetchAPI<DigSiteData>(`/api/digsite/${initData.postId}`);
        setDigSiteData(data);
      } catch (error) {
        console.error('Failed to load dig site:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDigSite();
  }, []);

  useEffect(() => {
    if (digSiteData?.depthProgress) {
      setLocalFound(digSiteData.depthProgress.found);
    }
  }, [digSiteData?.depthProgress?.found]);

  const startGame = () => {
    if (!canvasRef.current || !digSiteData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const engine = new GameEngine(canvas);
    const artifactSystem = new ArtifactSystem(digSiteData.artifact);

    // Set up the dirt layer and artifact
    engine.setDirtLayer(engine.getState().dirtLayer);
    engine.setArtifact(digSiteData.artifact);

    // Create renderer
    const renderer = new DigSceneRenderer(ctx);
    (engine as any).biome = digSiteData.biome;
    (engine as any).dirtMaterials = digSiteData.dirtMaterials;
    (engine as any).borderColor = digSiteData.borderColor;
    engine.setRenderer(renderer);

    // Hook reveal callbacks
    (engine as any).onReveal70 = () => {
      // Floating message
      const ctx2 = ctx;
      ctx2.save();
      // Draw transient overlay text for one frame; Tool overlay will still run
      ctx2.restore();
      // Use shovel overlay system instead? Simpler here: console + toast-like temporary DOM
      const toast = document.createElement('div');
      toast.textContent = "It's beautiful, keep going!";
      Object.assign(toast.style, {
        position: 'absolute',
        left: '50%',
        top: '12%',
        transform: 'translateX(-50%)',
        color: '#FFE69B',
        fontWeight: '700',
        fontSize: '18px',
        textShadow: '0 2px 6px rgba(0,0,0,0.6)',
        opacity: '0',
        transition: 'opacity 200ms ease-out',
        zIndex: '20',
      } as CSSStyleDeclaration);
      const container = canvas.parentElement as HTMLElement | null;
      if (container) {
        container.appendChild(toast);
        requestAnimationFrame(() => (toast.style.opacity = '1'));
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => toast.remove(), 1200);
        }, 1600);
      }
    };

    (engine as any).onReveal95 = () => {
      // Instead of emoji overlay, open the discovery modal with nugget tap-to-reveal
      setShowDiscovery(true);
    };

    // Initialize tool manager
    const toolManager = new ToolManager({
      dirtLayer: engine.getState().dirtLayer,
      artifact: engine.getState().artifact,
      trashItems: engine.getState().trashItems,
      canvas,
      ctx,
      // Placeholder, updated by engine.setupCanvas()
      cellWidth: 5,
      cellHeight: 5,
      originX: 0,
      originY: 0,
      onArtifactDamage: () => {
        artifactSystem.markDamaged();
        console.log('⚠️ Artifact damaged!');
      },
      onArtifactBreak: () => {
        artifactSystem.markBroken();
        setShowDiscovery(true);
        console.log('💔 Artifact broken!');
      },
    });

    toolManager.registerTool(new DetectorTool());
    toolManager.registerTool(new ShovelTool());
    toolManager.registerTool(new BrushTool());

    engine.setToolManager(toolManager);
    // Sync initial viewport to tools
    const vp = engine.getViewport();
    toolManager.updateContext({
      cellWidth: vp.cellWidth,
      cellHeight: vp.cellHeight,
      originX: vp.originX,
      originY: vp.originY,
      artifact: engine.getState().artifact,
      trashItems: engine.getState().trashItems,
    });

    // No DOM artifact layer needed now; artifact renders in-canvas

    // Set up pointer events
    const handlePointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      toolManager.handlePointerDown(x, y);
    };

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      toolManager.handlePointerMove(x, y);
    };

    const handlePointerUp = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      toolManager.handlePointerUp(x, y);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);

    gameEngineRef.current = engine;
    toolManagerRef.current = toolManager;
    artifactSystemRef.current = artifactSystem;

    engine.setPhase('playing');
    engine.start();

    setGameStarted(true);

    // Cleanup
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
    };
  };

  const handleToolSelect = (tool: 'detector' | 'shovel' | 'brush') => {
    setActiveTool(tool);
    toolManagerRef.current?.setActiveTool(tool);
  };

  const handleAddToMuseum = async () => {
    if (!digSiteData || !artifactSystemRef.current) return;

    try {
      setClaiming(true);
      console.log('Add to museum clicked');
      
      if (digSiteData.artifact.type === 'subreddit_relic' && digSiteData.artifact.relic) {
        // Relic flow: create new dig site under USER and comment
        await fetchAPI('/api/relic/claim', {
          method: 'POST',
          body: JSON.stringify({
            subredditName: digSiteData.artifact.relic.subredditName,
            sourcePostId: digSiteData.postId,
          }),
        });
        setArtifactAdded(true);
      } else {
        // Prepare artifact data for the new persistence system
        const artifactData = {
          type: digSiteData.artifact.type,
          redditData: digSiteData.artifact.post,
          relicData: digSiteData.artifact.relic,
        };
        
        // Call new artifact persistence API
        const response = await fetchAPI<{
          success: boolean;
          artifactId: string;
          foundByCount: number;
          rarityTier: string;
        }>('/api/artifact/save', {
          method: 'POST',
          body: JSON.stringify({
            artifactData,
            sourceDigSite: digSiteData.postId,
            isBroken: artifactSystemRef.current.isBrokenState(),
          }),
        });
        
        console.log(`Artifact saved! Rarity: ${response.rarityTier}, Found by ${response.foundByCount} players`);
        setArtifactAdded(true);

        if (!artifactSystemRef.current.isBrokenState() && digSiteData.artifact.type === 'post') {
          setLocalFound((prev) => (prev == null ? (digSiteData.depthProgress?.found || 0) + 1 : prev + 1));
          setPlusOne(true);
          setTimeout(() => setPlusOne(false), 900);
        }
      }

      // Update community and player stats, and mirror to postData
      try {
        await fetchAPI('/api/stats/update', {
          method: 'POST',
          body: JSON.stringify({
            postId: digSiteData.postId,
            action: artifactSystemRef.current.isBrokenState() ? 'broken' : 'found',
          }),
        });
      } catch (e) {
        console.warn('Stats update failed:', e);
      }
    } catch (error) {
      console.error('Failed to add artifact to museum:', error);
    }
    finally {
      setClaiming(false);
    }
  };

  // Auto-start game when data loads
  useEffect(() => {
    if (digSiteData && !gameStarted && canvasRef.current) {
      startGame();
    }
  }, [digSiteData, gameStarted]);

  if (loading || !digSiteData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-100 to-orange-100">
        <div className="text-center">
          <div className="text-6xl mb-4">⛏️</div>
          <p className="text-xl font-semibold text-gray-700">Loading dig site...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      <style>{`@keyframes float-up { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-12px); } }`}</style>
      <div className="absolute inset-0 flex items-center justify-center p-2">
        <div className="relative w-full h-full max-w-[100vh] max-h-[100vh] aspect-[9/16]">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
            style={{ touchAction: 'none' }}
          />

          {/* celebration overlay removed in favor of nugget modal */}
        </div>
      </div>

      {gameStarted && <ToolDock activeTool={activeTool} onToolSelect={handleToolSelect} />}

      {/* Depth Progress HUD */}
      {digSiteData?.depthProgress && (
        <div className="absolute left-2 bottom-2 bg-black/60 text-white rounded-lg px-3 py-2 text-xs relative">
          {digSiteData.depthProgress.threshold != null && (
            <div className="w-48 h-2 bg-white/20 rounded overflow-hidden">
              <div className="h-full bg-orange-400" style={{ width: `${(() => {
                const found = localFound ?? digSiteData.depthProgress.found;
                const threshold = digSiteData.depthProgress.threshold || 1;
                return Math.min(100, Math.floor((found / threshold) * 100));
              })()}%` }} />
            </div>
          )}
          {digSiteData.depthProgress.threshold != null && (
            <div className="mt-1 opacity-80">Artifacts until next depth: {(() => {
              const found = localFound ?? digSiteData.depthProgress.found;
              const threshold = digSiteData.depthProgress.threshold || 0;
              return Math.max(0, threshold - found);
            })()}</div>
          )}
          {plusOne && (
            <div style={{ position: 'absolute', right: '6px', top: '-4px', color: '#FDBA74', fontWeight: 700, fontSize: '12px', animation: 'float-up 0.9s ease-out forwards' }}>+1</div>
          )}
        </div>
      )}

      {showDiscovery && digSiteData && (
        <DiscoveryModal
          artifact={digSiteData.artifact}
          isBroken={artifactSystemRef.current?.isBrokenState() || false}
          onAddToMuseum={handleAddToMuseum}
          onFindMore={() => window.location.reload()}
          onViewMuseum={() => console.log('Navigate to museum')}
          isAdded={artifactAdded}
        />
      )}

      {claiming && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md px-4 py-3 text-sm font-semibold">Claiming...</div>
        </div>
      )}
    </div>
  );
};
