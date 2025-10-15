import { useEffect, useState, useRef } from 'react';
import { fetchAPI } from '../shared/utils/api';
import { DigSiteData } from '../../shared/types/game';
import { GameEngine } from './game/GameEngine';
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

    // Initialize tool manager
    const toolManager = new ToolManager({
      dirtLayer: engine.getState().dirtLayer,
      artifact: digSiteData.artifact,
      canvas,
      ctx,
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

    gameEngineRef.current = engine;
    toolManagerRef.current = toolManager;
    artifactSystemRef.current = artifactSystem;

    engine.setPhase('playing');
    engine.start();

    setGameStarted(true);
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
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />

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
