import { GameState, GamePhase, DirtLayer, ArtifactData } from '../../../shared/types/game';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: GameState;
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;

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
      uncoveredPercentage: 0,
      isDamaged: false,
      isBroken: false,
      activeTool: null,
    };

    this.setupCanvas();
    window.addEventListener('resize', () => this.setupCanvas());
  }

  private setupCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
  }

  private createEmptyDirtLayer(): DirtLayer {
    const width = 100;
    const height = 100;
    const cells: number[][] = [];

    for (let y = 0; y < height; y++) {
      cells[y] = [];
      for (let x = 0; x < width; x++) {
        cells[y][x] = 60; // Max depth
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
    this.state.artifact = artifact;
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
        if (dirtLayer.cells[y][x] <= depth + 8) {
          uncoveredCells++;
        }
      }
    }

    this.state.uncoveredPercentage = totalCells > 0 ? (uncoveredCells / totalCells) * 100 : 0;
  }

  private render(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);

    // Render based on current phase
    switch (this.state.phase) {
      case 'splash':
        this.renderSplash();
        break;
      case 'playing':
        this.renderGame();
        break;
      case 'discovered':
        this.renderDiscovery();
        break;
      case 'museum_preview':
        this.renderMuseumPreview();
        break;
    }
  }

  private renderSplash(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(0, 0, rect.width, rect.height);
    this.ctx.fillStyle = '#333';
    this.ctx.font = '24px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Loading...', rect.width / 2, rect.height / 2);
  }

  private renderGame(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.fillStyle = '#8B7355';
    this.ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Placeholder for actual game rendering
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Dig Site Active', rect.width / 2, 30);
  }

  private renderDiscovery(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillRect(0, 0, rect.width, rect.height);
    this.ctx.fillStyle = '#333';
    this.ctx.font = '24px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Discovery!', rect.width / 2, rect.height / 2);
  }

  private renderMuseumPreview(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.fillStyle = '#e0e0e0';
    this.ctx.fillRect(0, 0, rect.width, rect.height);
    this.ctx.fillStyle = '#333';
    this.ctx.font = '20px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Museum Preview', rect.width / 2, rect.height / 2);
  }

  public destroy(): void {
    this.stop();
    window.removeEventListener('resize', () => this.setupCanvas());
  }
}
