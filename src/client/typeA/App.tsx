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
      setCelebration({ show: true, stage: 'pulse' });
      // After 1.5s pulse, move to linger
      setTimeout(() => setCelebration({ show: true, stage: 'linger' }), 1500);
    };

    // Initialize tool manager
    const toolManager = new ToolManager({
      dirtLayer: engine.getState().dirtLayer,
      artifact: engine.getState().artifact,
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
      await fetchAPI('/api/museum/add-artifact', {
        method: 'POST',
        body: JSON.stringify({
          artifactData: digSiteData.artifact,
          sourceDigSite: digSiteData.postId,
          isBroken: artifactSystemRef.current.isBrokenState(),
        }),
      });
      setArtifactAdded(true);
    } catch (error) {
      console.error('Failed to add artifact to museum:', error);
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
      <style>{`
        @keyframes celebration-ring {
          0% { transform: scale(0.6); opacity: 0.9; }
          60% { opacity: 0.5; }
          100% { transform: scale(1.25); opacity: 0; }
        }
      `}</style>
      <div className="absolute inset-0 flex items-center justify-center p-2">
        <div className="relative w-full h-full max-w-[100vh] max-h-[100vh] aspect-[9/16]">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
            style={{ touchAction: 'none' }}
          />

          {celebration.show && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
              {/* Dim background */}
              <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.45)' }} />
              {/* Light rays and pulses */}
              <div
                className="relative flex items-center justify-center"
                style={{ width: '60%', height: '40%', pointerEvents: 'none' }}
              >
                <div
                  className="absolute"
                  style={{
                    width: '220px',
                    height: '220px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,223,119,0.85) 0%, rgba(255,223,119,0.25) 45%, rgba(255,223,119,0) 70%)',
                    transform: celebration.stage === 'pulse' ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    filter: 'blur(1px)',
                  }}
                />
                <div
                  className="absolute"
                  style={{
                    width: '260px',
                    height: '260px',
                    borderRadius: '50%',
                    border: '3px solid rgba(255,220,120,0.9)',
                  animation: 'celebration-ring 1400ms ease-out infinite',
                  }}
                />
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    color: '#FFD700',
                    fontSize: '48px',
                    textShadow: '0 3px 10px rgba(0,0,0,0.6)',
                    transform: celebration.stage === 'pulse' ? 'scale(1.25)' : 'scale(1.0)',
                    transition: 'transform 260ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  {/* Placeholder artifact icon */}
                  {digSiteData.artifact.type === 'subreddit_relic' ? '🏛️' : '📜'}
                </div>
              </div>

              {/* CTA button */}
              {celebration.stage === 'linger' && (
                <div className="absolute bottom-[12%] w-full flex justify-center" style={{ pointerEvents: 'auto' }}>
                  <button
                    onClick={handleAddToMuseum}
                    className="px-5 py-3 rounded-lg text-gray-900 font-bold"
                    style={{
                      background: 'linear-gradient(180deg, #FFE082 0%, #FFC107 100%)',
                      boxShadow: '0 6px 18px rgba(255,193,7,0.45), inset 0 2px 0 rgba(255,255,255,0.7)',
                    }}
                  >
                    Add to your Museum
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {gameStarted && <ToolDock activeTool={activeTool} onToolSelect={handleToolSelect} />}

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
    </div>
  );
};
