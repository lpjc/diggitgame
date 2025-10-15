import { DirtLayer, BiomeType, DirtMaterial, ArtifactData } from '../../../shared/types/game';

export class DigSceneRenderer {
  private ctx: CanvasRenderingContext2D;
  private cellSize: number = 5; // pixels per cell
  private pebbles: Array<{ x: number; y: number; size: number; color: string }> = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.generatePebbles();
  }

  private generatePebbles(): void {
    // Generate random pebbles for visual variety
    const numPebbles = 50 + Math.floor(Math.random() * 50);
    for (let i = 0; i < numPebbles; i++) {
      this.pebbles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 0.3 + Math.random() * 0.7,
        color: this.getRandomPebbleColor(),
      });
    }
  }

  private getRandomPebbleColor(): string {
    const colors = ['#666', '#777', '#888', '#999', '#aaa'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  public render(
    dirtLayer: DirtLayer,
    biome: BiomeType,
    dirtMaterials: DirtMaterial[],
    borderColor: string,
    artifact?: ArtifactData,
    uncoveredPercentage?: number
  ): void {
    this.renderDirtLayer(dirtLayer, dirtMaterials);
    this.renderPebbles(dirtLayer);
    
    // Render artifact silhouette if uncovered
    if (artifact && uncoveredPercentage !== undefined && uncoveredPercentage > 0) {
      this.renderArtifactSilhouette(artifact, uncoveredPercentage);
    }
    
    this.renderBorder(biome, borderColor);
  }

  private renderDirtLayer(dirtLayer: DirtLayer, materials: DirtMaterial[]): void {
    const { cells, width, height } = dirtLayer;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const depth = cells[y][x];
        if (depth > 0) {
          const color = this.getDirtColor(depth, materials);
          this.ctx.fillStyle = color;
          this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        }
      }
    }
  }

  private getDirtColor(depth: number, materials: DirtMaterial[]): string {
    // Base color depends on material composition
    const baseColor = this.getMaterialColor(materials[0]);
    
    // Darken based on depth (0-60)
    const depthFactor = depth / 60;
    const darkenAmount = depthFactor * 0.4; // Up to 40% darker

    return this.adjustBrightness(baseColor, -darkenAmount);
  }

  private getMaterialColor(material: DirtMaterial): string {
    switch (material) {
      case DirtMaterial.SOIL:
        return '#8B7355'; // Brown
      case DirtMaterial.CLAY:
        return '#A0826D'; // Reddish brown
      case DirtMaterial.GRAVEL:
        return '#9C9C9C'; // Gray
      case DirtMaterial.MUD:
        return '#6B5D4F'; // Dark brown
      default:
        return '#8B7355';
    }
  }

  private adjustBrightness(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const adjust = (val: number) => {
      const adjusted = Math.round(val * (1 + amount));
      return Math.max(0, Math.min(255, adjusted));
    };

    const newR = adjust(r).toString(16).padStart(2, '0');
    const newG = adjust(g).toString(16).padStart(2, '0');
    const newB = adjust(b).toString(16).padStart(2, '0');

    return `#${newR}${newG}${newB}`;
  }

  private renderPebbles(dirtLayer: DirtLayer): void {
    this.pebbles.forEach((pebble) => {
      const depth = dirtLayer.cells[Math.floor(pebble.y)]?.[Math.floor(pebble.x)] || 0;
      
      // Only render pebbles where dirt is present
      if (depth > 0) {
        this.ctx.fillStyle = pebble.color;
        this.ctx.beginPath();
        this.ctx.arc(
          pebble.x * this.cellSize,
          pebble.y * this.cellSize,
          pebble.size * this.cellSize,
          0,
          Math.PI * 2
        );
        this.ctx.fill();
      }
    });
  }

  private renderBorder(biome: BiomeType, borderColor: string): void {
    const borderWidth = 10;
    const canvasWidth = 100 * this.cellSize;
    const canvasHeight = 100 * this.cellSize;

    // Draw border with biome texture
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = borderWidth;
    this.ctx.strokeRect(
      borderWidth / 2,
      borderWidth / 2,
      canvasWidth - borderWidth,
      canvasHeight - borderWidth
    );

    // Add biome-specific decorations
    this.renderBiomeDecorations(biome, borderColor, borderWidth);
  }

  private renderBiomeDecorations(biome: BiomeType, color: string, borderWidth: number): void {
    const canvasWidth = 100 * this.cellSize;
    const canvasHeight = 100 * this.cellSize;

    this.ctx.fillStyle = color;

    switch (biome) {
      case BiomeType.GRASS:
        // Draw grass tufts along top border
        for (let i = 0; i < 20; i++) {
          const x = (i / 20) * canvasWidth;
          this.ctx.fillRect(x, 0, 2, borderWidth);
        }
        break;
      case BiomeType.ROCK:
        // Draw rocky texture
        for (let i = 0; i < 15; i++) {
          const x = Math.random() * canvasWidth;
          const y = Math.random() * borderWidth;
          this.ctx.fillRect(x, y, 3, 3);
        }
        break;
      case BiomeType.SAND:
        // Draw wavy sand pattern
        this.ctx.strokeStyle = this.adjustBrightness(color, -0.2);
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const y = (i / 5) * borderWidth;
          this.ctx.beginPath();
          this.ctx.moveTo(0, y);
          this.ctx.lineTo(canvasWidth, y);
          this.ctx.stroke();
        }
        break;
      case BiomeType.SWAMP:
        // Draw murky water droplets
        for (let i = 0; i < 10; i++) {
          const x = Math.random() * canvasWidth;
          const y = Math.random() * borderWidth;
          this.ctx.beginPath();
          this.ctx.arc(x, y, 2, 0, Math.PI * 2);
          this.ctx.fill();
        }
        break;
    }
  }

  private renderArtifactSilhouette(artifact: ArtifactData, uncoveredPercentage: number): void {
    const { position, width, height } = artifact;
    const x = position.x * this.cellSize;
    const y = position.y * this.cellSize;
    const w = width * this.cellSize;
    const h = height * this.cellSize;

    // Calculate opacity: fade from silhouette (0%) to full clarity (100%)
    const opacity = Math.min(1, uncoveredPercentage / 100);

    // Draw silhouette background
    this.ctx.fillStyle = `rgba(50, 50, 50, ${0.3 + opacity * 0.4})`;
    this.ctx.fillRect(x, y, w, h);

    // Draw artifact outline
    this.ctx.strokeStyle = `rgba(255, 215, 0, ${opacity})`;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, w, h);

    // Add glow effect when >= 70% uncovered
    if (uncoveredPercentage >= 70) {
      this.ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
      this.ctx.shadowBlur = 15;
      this.ctx.strokeRect(x, y, w, h);
      this.ctx.shadowBlur = 0;
    }

    // Draw artifact type indicator
    this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    this.ctx.font = `${Math.floor(h / 3)}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    const icon = artifact.type === 'subreddit_relic' ? '🏛️' : '📜';
    this.ctx.fillText(icon, x + w / 2, y + h / 2);
  }

  public setCellSize(size: number): void {
    this.cellSize = size;
  }
}
