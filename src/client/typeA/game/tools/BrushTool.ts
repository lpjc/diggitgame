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
    const { dirtLayer } = context;
    
    // Convert screen coordinates to grid coordinates
    const cellSize = 5;
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);

    // Brush parameters
    const brushDepth = 1; // Gentle removal
    const brushRadius = 8; // pixels

    // Remove dirt in circular area
    for (let dy = -brushRadius; dy <= brushRadius; dy++) {
      for (let dx = -brushRadius; dx <= brushRadius; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= brushRadius) {
          const targetX = gridX + Math.floor(dx / cellSize);
          const targetY = gridY + Math.floor(dy / cellSize);

          if (
            targetX >= 0 &&
            targetX < dirtLayer.width &&
            targetY >= 0 &&
            targetY < dirtLayer.height
          ) {
            const currentDepth = dirtLayer.cells[targetY][targetX];
            if (currentDepth > 0) {
              dirtLayer.cells[targetY][targetX] = Math.max(0, currentDepth - brushDepth);
              
              // Create dust particle
              if (Math.random() < 0.3) {
                this.createDustParticle(x + dx, y + dy);
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
