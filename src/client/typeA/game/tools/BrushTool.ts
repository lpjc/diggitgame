import { Tool, ToolContext } from './Tool';

export class BrushTool implements Tool {
  name: 'brush' = 'brush';
  
  private isBrushing: boolean = false;
  private lastBrushPosition: { x: number; y: number } | null = null;
  private dustParticles: Array<{ x: number; y: number; vx: number; vy: number; life: number }> = [];

  onActivate(_context: ToolContext): void {
    this.isBrushing = false;
    this.lastBrushPosition = null;
    this.dustParticles = [];
  }

  onUpdate(_context: ToolContext, deltaTime: number): void {
    // Update dust particles
    this.dustParticles = this.dustParticles.filter((particle) => {
      particle.x += particle.vx * (deltaTime / 16);
      particle.y += particle.vy * (deltaTime / 16);
      particle.life -= deltaTime;
      return particle.life > 0;
    });
  }

  renderOverlay(context: ToolContext): void {
    // Draw dust particles after main scene so they're visible
    this.renderDustParticles(context.ctx);
  }

  onDeactivate(_context: ToolContext): void {
    this.isBrushing = false;
    this.lastBrushPosition = null;
    this.dustParticles = [];
  }

  handlePointerDown(x: number, y: number, _context: ToolContext): void {
    this.isBrushing = true;
    this.lastBrushPosition = { x, y };
  }

  handlePointerMove(x: number, y: number, context: ToolContext): void {
    if (this.isBrushing) {
      this.brush(x, y, context);
      this.lastBrushPosition = { x, y };
    }
  }

  handlePointerUp(_x: number, _y: number, _context: ToolContext): void {
    this.isBrushing = false;
    this.lastBrushPosition = null;
  }

  private brush(x: number, y: number, context: ToolContext): void {
    const { dirtLayer, cellWidth, cellHeight, originX, originY } = context;

    // Convert screen coordinates to grid coordinates
    const gridX = Math.floor((x - originX) / cellWidth);
    const gridY = Math.floor((y - originY) / cellHeight);

    // Brush parameters
    const brushDepth = 1; // Gentle removal
    const brushRadiusPx = Math.max(8, Math.floor(Math.min(cellWidth, cellHeight) * 1.25));

    // Remove dirt in circular area (grid space)
    const gridStep = Math.min(cellWidth, cellHeight);
    const gridRadius = Math.max(1, Math.round(brushRadiusPx / gridStep));
    for (let ty = -gridRadius; ty <= gridRadius; ty++) {
      for (let tx = -gridRadius; tx <= gridRadius; tx++) {
        const distGrid = Math.sqrt(tx * tx + ty * ty);
        if (distGrid <= gridRadius) {
          const targetX = gridX + tx;
          const targetY = gridY + ty;

          if (
            targetX >= 0 &&
            targetX < dirtLayer.width &&
            targetY >= 0 &&
            targetY < dirtLayer.height
          ) {
            const currentDepth = dirtLayer.cells[targetY][targetX];
            if (currentDepth > 0) {
              const after = Math.max(0, currentDepth - brushDepth);
              dirtLayer.cells[targetY][targetX] = after;

              // Create dust particle near the affected cell center
              if (Math.random() < 0.3) {
                const cx = originX + (targetX + 0.5) * cellWidth + (Math.random() - 0.5) * cellWidth * 0.6;
                const cy = originY + (targetY + 0.5) * cellHeight + (Math.random() - 0.5) * cellHeight * 0.6;
                this.createDustParticle(cx, cy);
              }

              // Detect trash threshold crossing and notify manager
              if (context.trashItems?.length) {
                for (const t of context.trashItems) {
                  if (this.isTrashCell(targetX, targetY, t)) {
                    const revealedTrashCell = currentDepth > t.depth && after <= t.depth;
                    if (revealedTrashCell) {
                      const sx = originX + (targetX + 0.5) * cellWidth;
                      const sy = originY + (targetY + 0.5) * cellHeight;
                      context.onTrashCellRevealed?.(t, sx, sy);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Visual and audio feedback
    this.showBrushEffect(x, y, context);
    this.triggerHaptic();
  }

  private isTrashCell(
    x: number,
    y: number,
    trash: { position: { x: number; y: number }; width: number; height: number }
  ): boolean {
    const { position, width, height } = trash;
    const cx = position.x + width / 2;
    const cy = position.y + height / 2;
    const radius = Math.min(width, height) / 2;
    const cellCx = x + 0.5;
    const cellCy = y + 0.5;
    const dx = cellCx - cx;
    const dy = cellCy - cy;
    return dx * dx + dy * dy <= radius * radius;
  }

  private createDustParticle(x: number, y: number): void {
    this.dustParticles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 2 - 1,
      life: 500 + Math.random() * 500,
    });
  }

  private showBrushEffect(x: number, y: number, context: ToolContext): void {
    const { ctx } = context;

    // Draw brush stroke
    ctx.save();
    ctx.strokeStyle = 'rgba(200, 180, 150, 0.3)';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    
    if (this.lastBrushPosition) {
      ctx.beginPath();
      ctx.moveTo(this.lastBrushPosition.x, this.lastBrushPosition.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    
    ctx.restore();

    // Draw dust particles
    this.dustParticles.forEach((particle) => {
      ctx.save();
      ctx.fillStyle = `rgba(200, 180, 150, ${particle.life / 1000})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  private triggerHaptic(): void {
    // Light haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }

  public renderDustParticles(ctx: CanvasRenderingContext2D): void {
    this.dustParticles.forEach((particle) => {
      ctx.save();
      ctx.fillStyle = `rgba(200, 180, 150, ${particle.life / 1000})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
