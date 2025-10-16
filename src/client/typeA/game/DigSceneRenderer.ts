// Job: Render the dig scene using dynamic cell sizes and a portrait dig area that fits viewport
import { DirtLayer, BiomeType, DirtMaterial, ArtifactData } from '../../../shared/types/game';

export class DigSceneRenderer {
  private ctx: CanvasRenderingContext2D;
  private cellWidth: number = 5; // CSS px per grid cell
  private cellHeight: number = 5; // CSS px per grid cell
  private pebbles: Array<{ x: number; y: number; size: number; color: string }> = [];
  private offscreen: HTMLCanvasElement | null = null;
  private offCtx: CanvasRenderingContext2D | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.generatePebbles();
  }

  private generatePebbles(): void {
    // Generate random pebbles for visual variety
    const numPebbles: number = 50 + Math.floor(Math.random() * 50);
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
    const colors: string[] = ['#666', '#777', '#888', '#999', '#aaa'];
    return colors[Math.floor(Math.random() * colors.length)] as string;
  }

  public render(
    dirtLayer: DirtLayer,
    biome: BiomeType,
    dirtMaterials: DirtMaterial[],
    borderColor: string,
    artifact?: ArtifactData,
    uncoveredPercentage?: number,
    viewport?: { cellWidth: number; cellHeight: number; originX: number; originY: number; digWidthPx: number; digHeightPx: number }
  ): void {
    if (viewport) {
      this.cellWidth = viewport.cellWidth;
      this.cellHeight = viewport.cellHeight;
    }

    // 1) Render dirt as 1x1 per cell into offscreen
    this.renderToOffscreen(dirtLayer, dirtMaterials);
    // 2) Blit offscreen scaled without smoothing into viewport rect
    this.blitOffscreen(viewport, dirtLayer.width, dirtLayer.height);
    // 3) Draw overlay details bound to cell sizes
    this.renderPebbles(dirtLayer, viewport);
    
    // Reveal artifact per-cell as a golden circle only where depth is reached
    if (artifact) {
      this.renderArtifactRevealedCellsGolden(dirtLayer, artifact, viewport);
    }
    
    this.renderBorder(biome, borderColor, viewport);
  }

  private ensureOffscreen(width: number, height: number): void {
    if (!this.offscreen) {
      this.offscreen = document.createElement('canvas');
    }
    if (!this.offCtx) {
      this.offCtx = this.offscreen.getContext('2d');
    }
    if (!this.offCtx) return;
    if (this.offscreen.width !== width || this.offscreen.height !== height) {
      this.offscreen.width = width;
      this.offscreen.height = height;
    }
  }

  private renderToOffscreen(dirtLayer: DirtLayer, materials: DirtMaterial[]): void {
    const { width, height, cells } = dirtLayer;
    this.ensureOffscreen(width, height);
    if (!this.offCtx) return;
    const ctx = this.offCtx;
    // Disable smoothing when drawing this offscreen buffer later
    ctx.imageSmoothingEnabled = false;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const depth = cells[y]?.[x];
        if (typeof depth === 'number' && depth > 0) {
          ctx.fillStyle = this.getDirtColor(depth, materials);
        } else {
          ctx.fillStyle = 'transparent';
        }
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  private blitOffscreen(
    viewport: { originX: number; originY: number; digWidthPx: number; digHeightPx: number } | undefined,
    gridW: number,
    gridH: number
  ): void {
    if (!this.offscreen) return;
    const originX = viewport?.originX ?? 0;
    const originY = viewport?.originY ?? 0;
    const widthPx = viewport?.digWidthPx ?? gridW * this.cellWidth;
    const heightPx = viewport?.digHeightPx ?? gridH * this.cellHeight;
    // Ensure nearest-neighbor upscaling on main ctx
    (this.ctx as any).mozImageSmoothingEnabled = false;
    (this.ctx as any).webkitImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.offscreen, 0, 0, gridW, gridH, originX, originY, widthPx, heightPx);
  }

  // Removed per-cell direct painting; offscreen buffer handles dirt fill without seams

  private getDirtColor(depth: number, materials: DirtMaterial[]): string {
    // Base color depends on material composition
    const baseMaterial: DirtMaterial = materials[0] ?? DirtMaterial.SOIL;
    const baseColor = this.getMaterialColor(baseMaterial);

    // Quantize depth to make hard steps instead of smooth gradients
    const clamped = Math.max(0, Math.min(60, depth));
    const steps = 6; // number of visible bands
    const stepIdx = Math.round((clamped / 60) * steps);
    const darkenAmount = (stepIdx / steps) * 0.5; // up to 50% darker in discrete steps

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

  private renderPebbles(dirtLayer: DirtLayer, viewport?: { originX: number; originY: number }): void {
    const originX = viewport?.originX ?? 0;
    const originY = viewport?.originY ?? 0;
    this.pebbles.forEach((pebble) => {
      const row = dirtLayer.cells[Math.floor(pebble.y)];
      const depth = row ? row[Math.floor(pebble.x)] ?? 0 : 0;
      
      // Only render pebbles where dirt is present
      if (depth > 0) {
        this.ctx.fillStyle = pebble.color;
        this.ctx.beginPath();
        this.ctx.arc(
          originX + pebble.x * this.cellWidth,
          originY + pebble.y * this.cellHeight,
          pebble.size * Math.min(this.cellWidth, this.cellHeight),
          0,
          Math.PI * 2
        );
        this.ctx.fill();
      }
    });
  }

  private renderBorder(
    biome: BiomeType,
    borderColor: string,
    viewport?: { originX: number; originY: number; digWidthPx: number; digHeightPx: number }
  ): void {
    const borderWidth = 10;
    const originX = viewport?.originX ?? 0;
    const originY = viewport?.originY ?? 0;
    const canvasWidth = viewport?.digWidthPx ?? 100 * this.cellWidth;
    const canvasHeight = viewport?.digHeightPx ?? 100 * this.cellHeight;

    // Draw border with biome texture
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = borderWidth;
    this.ctx.strokeRect(
      originX + borderWidth / 2,
      originY + borderWidth / 2,
      canvasWidth - borderWidth,
      canvasHeight - borderWidth
    );

    // Add biome-specific decorations
    this.renderBiomeDecorations(biome, borderColor, borderWidth, viewport);
  }

  private renderBiomeDecorations(
    biome: BiomeType,
    color: string,
    borderWidth: number,
    viewport?: { originX: number; originY: number; digWidthPx: number; digHeightPx: number }
  ): void {
    const originX = viewport?.originX ?? 0;
    const originY = viewport?.originY ?? 0;
    const canvasWidth = viewport?.digWidthPx ?? 100 * this.cellWidth;

    this.ctx.fillStyle = color;

    switch (biome) {
      case BiomeType.GRASS:
        // Draw grass tufts along top border
        for (let i = 0; i < 20; i++) {
          const x = (i / 20) * canvasWidth;
          this.ctx.fillRect(originX + x, originY + 0, 2, borderWidth);
        }
        break;
      case BiomeType.ROCK:
        // Draw rocky texture
        for (let i = 0; i < 15; i++) {
          const x = originX + Math.random() * canvasWidth;
          const y = originY + Math.random() * borderWidth;
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
          this.ctx.moveTo(originX + 0, originY + y);
          this.ctx.lineTo(originX + canvasWidth, originY + y);
          this.ctx.stroke();
        }
        break;
      case BiomeType.SWAMP:
        // Draw murky water droplets
        for (let i = 0; i < 10; i++) {
          const x = originX + Math.random() * canvasWidth;
          const y = originY + Math.random() * borderWidth;
          this.ctx.beginPath();
          this.ctx.arc(x, y, 2, 0, Math.PI * 2);
          this.ctx.fill();
        }
        break;
    }
  }

  private renderArtifactRevealedCellsGolden(
    dirtLayer: DirtLayer,
    artifact: ArtifactData,
    viewport?: { originX: number; originY: number }
  ): void {
    const { position, width, height, depth } = artifact;
    const originX = viewport?.originX ?? 0;
    const originY = viewport?.originY ?? 0;
    const maxY = Math.min(dirtLayer.height, position.y + height);
    const maxX = Math.min(dirtLayer.width, position.x + width);

    // Circle parameters in grid space
    const cx = position.x + width / 2;
    const cy = position.y + height / 2;
    const radius = Math.min(width, height) / 2;

    for (let y = position.y; y < maxY; y++) {
      const row = dirtLayer.cells[y];
      if (!row) continue;
      for (let x = position.x; x < maxX; x++) {
        const cellDepth = row[x];
        if (typeof cellDepth !== 'number' || cellDepth > depth) continue;

        // Cell center inside circle?
        const cellCx = x + 0.5;
        const cellCy = y + 0.5;
        const dx = cellCx - cx;
        const dy = cellCy - cy;
        if (dx * dx + dy * dy <= radius * radius) {
          // Golden fill with slight outline per-cell for crispness
          this.ctx.fillStyle = '#FFD700';
          this.ctx.fillRect(
            originX + x * this.cellWidth,
            originY + y * this.cellHeight,
            this.cellWidth,
            this.cellHeight
          );
          this.ctx.strokeStyle = 'rgba(180, 140, 0, 0.25)';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(
            originX + x * this.cellWidth + 0.5,
            originY + y * this.cellHeight + 0.5,
            Math.max(0, this.cellWidth - 1),
            Math.max(0, this.cellHeight - 1)
          );
        }
      }
    }
  }

  public setCellSize(size: number): void {
    this.cellWidth = size;
    this.cellHeight = size;
  }
}
