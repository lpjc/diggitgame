// Job: Own the core game loop, viewport sizing, and state. Computes a portrait dig area
// that always fits the viewport and provides dynamic cell sizes and offsets to renderer/tools.
import { GameState, GamePhase, DirtLayer, ArtifactData, TrashItem } from '../../../shared/types/game';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private onResize: () => void;

  // Portrait dig area layout
  private readonly desiredAspectRatio: number = 9 / 16; // width / height
  private originX: number = 0;
  private originY: number = 0;
  private digWidthPx: number = 0;  // CSS px
  private digHeightPx: number = 0; // CSS px
  private cellWidth: number = 5;   // CSS px per grid cell (dynamic)
  private cellHeight: number = 5;  // CSS px per grid cell (dynamic)
  private gridInitialized: boolean = false;
  private readonly pixelSizeCss: number = 16; // Big square pixel size in CSS px
  private hasLoggedSeventy: boolean = false;
  private hasTriggeredNinetyFive: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;

    // Initialize game state
    this.state = {
      phase: 'splash',
      dirtLayer: this.createEmptyDirtLayer(),
      artifact: this.createPlaceholderArtifact(),
      trashItems: [],
      uncoveredPercentage: 0,
      isDamaged: false,
      isBroken: false,
      activeTool: null,
    };

    this.onResize = () => this.setupCanvas();
    this.setupCanvas();
    window.addEventListener('resize', this.onResize);
  }

  private setupCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    // Backing store size in device pixels
    this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));

    // Reset transform then scale to CSS pixel space
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    // Compute portrait dig area that fits inside rect while preserving 9:16
    const availW = rect.width;
    const availH = rect.height;
    if (availW / availH <= this.desiredAspectRatio) {
      // Limited by width
      this.digWidthPx = availW;
      this.digHeightPx = availW / this.desiredAspectRatio;
    } else {
      // Limited by height
      this.digHeightPx = availH;
      this.digWidthPx = availH * this.desiredAspectRatio;
    }

    // Snap dig area to multiples of pixel size to ensure square pixels without stretching
    const snappedWidth = Math.max(this.pixelSizeCss, Math.floor(this.digWidthPx / this.pixelSizeCss) * this.pixelSizeCss);
    const snappedHeight = Math.max(this.pixelSizeCss, Math.floor(this.digHeightPx / this.pixelSizeCss) * this.pixelSizeCss);
    this.digWidthPx = snappedWidth;
    this.digHeightPx = snappedHeight;

    // Center the snapped dig area within the canvas
    this.originX = Math.floor((availW - this.digWidthPx) / 2);
    this.originY = Math.floor((availH - this.digHeightPx) / 2);

    // Initialize grid resolution from viewport (first mount only)
    if (!this.gridInitialized) {
      // Choose grid from snapped size and pixel size
      let targetW = Math.max(10, Math.floor(this.digWidthPx / this.pixelSizeCss));
      let targetH = Math.max(10, Math.floor(this.digHeightPx / this.pixelSizeCss));
      // Cap total cells for perf
      const maxCells = 150_000;
      let total = targetW * targetH;
      if (total > maxCells) {
        const scale = Math.sqrt(maxCells / total);
        targetW = Math.max(10, Math.floor(targetW * scale));
        targetH = Math.max(10, Math.floor(targetH * scale));
      }
      this.state.dirtLayer = this.createEmptyDirtLayerWithSize(targetW, targetH);
      this.gridInitialized = true;
    } else {
      // If dig area changed (e.g., rotation) and grid no longer aligns to pixelSize, rebuild
      const expectedW = Math.max(10, Math.floor(this.digWidthPx / this.pixelSizeCss));
      const expectedH = Math.max(10, Math.floor(this.digHeightPx / this.pixelSizeCss));
      if (expectedW !== this.state.dirtLayer.width || expectedH !== this.state.dirtLayer.height) {
        this.state.dirtLayer = this.createEmptyDirtLayerWithSize(expectedW, expectedH);
      }
    }

    // Derive cell size from current dirt grid
    // Square pixels in CSS px
    this.cellWidth = this.pixelSizeCss;
    this.cellHeight = this.pixelSizeCss;

    // Keep tools in sync with new mapping
    const toolManager = (this as any).toolManager as { updateContext?: (ctx: any) => void } | undefined;
    if (toolManager?.updateContext) {
      toolManager.updateContext({
        cellWidth: this.cellWidth,
        cellHeight: this.cellHeight,
        originX: this.originX,
        originY: this.originY,
      });
    }
  }

  private createEmptyDirtLayer(): DirtLayer {
    const width = 100;
    const height = 100;
    const cells: number[][] = [];

    for (let y = 0; y < height; y++) {
      cells[y] = [];
      for (let x = 0; x < width; x++) {
        cells[y]![x] = 60; // Max depth
      }
    }

    return { cells, width, height };
  }

  // Create an empty layer with provided dimensions
  private createEmptyDirtLayerWithSize(width: number, height: number): DirtLayer {
    const cells: number[][] = [];
    for (let y = 0; y < height; y++) {
      cells[y] = [];
      for (let x = 0; x < width; x++) {
        cells[y]![x] = 60;
      }
    }
    return { cells, width, height };
  }

  private createPlaceholderArtifact(): ArtifactData {
    return {
      type: 'post',
      position: { x: 50, y: 50 },
      depth: 50,
      width: 25,
      height: 15,
    };
  }

  public setState(newState: Partial<GameState>): void {
    this.state = { ...this.state, ...newState };
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public setPhase(phase: GamePhase): void {
    this.state.phase = phase;
  }

  public getPhase(): GamePhase {
    return this.state.phase;
  }

  public setDirtLayer(dirtLayer: DirtLayer): void {
    this.state.dirtLayer = dirtLayer;
  }

  public setArtifact(artifact: ArtifactData): void {
    // Scale artifact from canonical 100x100 grid if needed
    const gridW = this.state.dirtLayer.width;
    const gridH = this.state.dirtLayer.height;
    const looksCanonical = artifact.width <= 100 && artifact.height <= 100;
    const assignDepth = (_d?: number): number => {
      // Choose a random layer from the surface index [40..60] (40=deeper, 60=bottom)
      // Our dirt model uses "remaining thickness" where 60 is surface and 0 is bottom.
      // Convert layer index L (from surface) to remaining-thickness T by T = max(0, 60 - L).
      const layerFromSurface = 40 + Math.floor(Math.random() * 21); // 40..60
      const remainingDepth = Math.max(0, 60 - layerFromSurface);
      // Store and log for verification
      (this as any)._artifactLayerFromSurface = layerFromSurface;
      return remainingDepth; // smaller values are deeper in our model
    };
    if (looksCanonical) {
      const placed = {
        ...artifact,
        position: {
          x: Math.round((artifact.position.x / 100) * gridW),
          y: Math.round((artifact.position.y / 100) * gridH),
        },
        width: 3,
        height: 3,
        depth: assignDepth(artifact.depth),
      } as ArtifactData;
      this.state.artifact = placed;
    } else {
      const placed = { ...artifact, width: 3, height: 3, depth: assignDepth(artifact.depth) } as ArtifactData;
      this.state.artifact = placed;
    }
    console.log(
      'Artifact placement -> layerFromSurface:',
      (this as any)._artifactLayerFromSurface,
      ' remainingDepth:',
      this.state.artifact.depth
    );

    // Generate two trash items now that artifact is placed
    this.state.trashItems = this.generateTrashItems(2, 3, 3);
  }

  private generateTrashItems(count: number, width: number, height: number): TrashItem[] {
    const items: TrashItem[] = [];
    const gridW = this.state.dirtLayer.width;
    const gridH = this.state.dirtLayer.height;

    const artifact = this.state.artifact;
    const artifactRect = { x: artifact.position.x, y: artifact.position.y, w: artifact.width, h: artifact.height };

    const nonOverlap = (x: number, y: number): boolean => {
      // Avoid overlap with artifact rect and already placed trash rects
      const rect = { x, y, w: width, h: height };
      const overlap = (r1: any, r2: any) => !(r1.x + r1.w <= r2.x || r2.x + r2.w <= r1.x || r1.y + r1.h <= r2.y || r2.y + r2.h <= r1.y);
      if (overlap(rect, artifactRect)) return false;
      for (const t of items) {
        const tr = { x: t.position.x, y: t.position.y, w: t.width, h: t.height };
        if (overlap(rect, tr)) return false;
      }
      return true;
    };

    const assignDepth = (): number => {
      const layerFromSurface = 40 + Math.floor(Math.random() * 21); // 40..60
      return Math.max(0, 60 - layerFromSurface);
    };

    let safety = 2000;
    while (items.length < count && safety-- > 0) {
      const x = Math.floor(Math.random() * Math.max(1, gridW - width));
      const y = Math.floor(Math.random() * Math.max(1, gridH - height));
      if (!nonOverlap(x, y)) continue;
      items.push({ position: { x, y }, width, height, depth: assignDepth() });
    }
    return items;
  }

  public start(): void {
    if (this.animationFrameId !== null) {
      return; // Already running
    }
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private gameLoop = (): void => {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    // Update game logic based on current phase
    if (this.state.phase === 'playing') {
      this.updateUncoveredPercentage();
      
      // Update tool manager
      if ((this as any).toolManager) {
        (this as any).toolManager.update(deltaTime);
      }
    }
  }

  private updateUncoveredPercentage(): void {
    const { artifact, dirtLayer } = this.state;
    const { position, depth, width, height } = artifact;

    let uncoveredCells = 0;
    let totalCells = 0;

    for (let y = position.y; y < position.y + height && y < dirtLayer.height; y++) {
      for (let x = position.x; x < position.x + width && x < dirtLayer.width; x++) {
        totalCells++;
        const cell = dirtLayer.cells[y]?.[x];
        if (cell !== undefined && cell <= depth) {
          uncoveredCells++;
        }
      }
    }

    this.state.uncoveredPercentage = totalCells > 0 ? (uncoveredCells / totalCells) * 100 : 0;

    // One-time log when crossing 70%
    if (!this.hasLoggedSeventy && this.state.uncoveredPercentage >= 70) {
      console.log('Artifact 70% revealed');
      this.hasLoggedSeventy = true;
      const onReveal70 = (this as any).onReveal70 as (() => void) | undefined;
      if (onReveal70) onReveal70();
    }

    // Trigger celebration at 95%
    if (!this.hasTriggeredNinetyFive && this.state.uncoveredPercentage >= 95) {
      this.hasTriggeredNinetyFive = true;
      const onReveal95 = (this as any).onReveal95 as (() => void) | undefined;
      if (onReveal95) onReveal95();
    }
  }

  public setRenderer(renderer: any): void {
    (this as any).renderer = renderer;
  }

  public setToolManager(toolManager: any): void {
    (this as any).toolManager = toolManager;
  }

  private render(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);

    // Render based on current phase
    const renderer = (this as any).renderer;
    if (this.state.phase === 'playing' && renderer) {
      renderer.render(
        this.state.dirtLayer,
        (this as any).biome,
        (this as any).dirtMaterials,
        (this as any).borderColor,
        this.state.trashItems,
        this.state.artifact,
        this.state.uncoveredPercentage,
        {
          cellWidth: this.cellWidth,
          cellHeight: this.cellHeight,
          originX: this.originX,
          originY: this.originY,
          digWidthPx: this.digWidthPx,
          digHeightPx: this.digHeightPx,
        }
      );
      // Draw tool overlays after main scene
      const toolManager = (this as any).toolManager as { renderOverlay?: () => void } | undefined;
      if (toolManager?.renderOverlay) toolManager.renderOverlay();
    }
  }

  public getViewport(): {
    cellWidth: number;
    cellHeight: number;
    originX: number;
    originY: number;
    digWidthPx: number;
    digHeightPx: number;
  } {
    return {
      cellWidth: this.cellWidth,
      cellHeight: this.cellHeight,
      originX: this.originX,
      originY: this.originY,
      digWidthPx: this.digWidthPx,
      digHeightPx: this.digHeightPx,
    };
  }

  public destroy(): void {
    this.stop();
    window.removeEventListener('resize', this.onResize);
  }
}
