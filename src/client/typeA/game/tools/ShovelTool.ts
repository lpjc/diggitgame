import { Tool, ToolContext } from './Tool';

export class ShovelTool implements Tool {
  name: 'shovel' = 'shovel';
  
  private lastDigTime: number = 0;
  private cooldown: number = 500; // 500ms cooldown
  private artifactHitLocations: Set<string> = new Set();

  onActivate(_context: ToolContext): void {
    this.lastDigTime = 0;
    this.artifactHitLocations.clear();
  }

  onUpdate(_context: ToolContext, _deltaTime: number): void {
    // No continuous updates needed
  }

  onDeactivate(_context: ToolContext): void {
    this.artifactHitLocations.clear();
  }

  handlePointerDown(x: number, y: number, context: ToolContext): void {
    const now = Date.now();
    
    // Check cooldown
    if (now - this.lastDigTime < this.cooldown) {
      return;
    }

    this.dig(x, y, context);
    this.lastDigTime = now;
  }

  private dig(x: number, y: number, context: ToolContext): void {
    const { dirtLayer, artifact, onArtifactDamage, onArtifactBreak } = context;
    
    // Convert screen coordinates to grid coordinates
    const cellSize = 5;
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);

    // Dig parameters
    const digDepth = 10;
    const digRadius = 15; // pixels

    let hitArtifact = false;
    const hitLocation = `${gridX},${gridY}`;

    // Remove dirt in circular area
    for (let dy = -digRadius; dy <= digRadius; dy++) {
      for (let dx = -digRadius; dx <= digRadius; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= digRadius) {
          const targetX = gridX + Math.floor(dx / cellSize);
          const targetY = gridY + Math.floor(dy / cellSize);

          if (
            targetX >= 0 &&
            targetX < dirtLayer.width &&
            targetY >= 0 &&
            targetY < dirtLayer.height
          ) {
            // Check if we're hitting the artifact
            if (this.isArtifactCell(targetX, targetY, artifact)) {
              hitArtifact = true;
            }

            // Remove dirt
            dirtLayer.cells[targetY][targetX] = Math.max(
              0,
              dirtLayer.cells[targetY][targetX] - digDepth
            );
          }
        }
      }
    }

    // Handle artifact collision
    if (hitArtifact) {
      if (this.artifactHitLocations.has(hitLocation)) {
        // Second hit at same location - break artifact
        if (onArtifactBreak) {
          onArtifactBreak();
        }
      } else {
        // First hit - show warning
        this.artifactHitLocations.add(hitLocation);
        if (onArtifactDamage) {
          onArtifactDamage();
        }
        this.showCrackWarning(x, y, context);
      }
    }

    // Visual feedback
    this.showDigEffect(x, y, context);
  }

  private isArtifactCell(
    x: number,
    y: number,
    artifact: { position: { x: number; y: number }; width: number; height: number; depth: number }
  ): boolean {
    const { position, width, height } = artifact;
    return (
      x >= position.x &&
      x < position.x + width &&
      y >= position.y &&
      y < position.y + height
    );
  }

  private showDigEffect(x: number, y: number, context: ToolContext): void {
    const { ctx } = context;

    ctx.save();
    ctx.fillStyle = 'rgba(139, 115, 85, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private showCrackWarning(x: number, y: number, context: ToolContext): void {
    const { ctx } = context;

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.lineWidth = 3;
    
    // Draw crack lines
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 10);
    ctx.lineTo(x + 10, y + 10);
    ctx.moveTo(x + 10, y - 10);
    ctx.lineTo(x - 10, y + 10);
    ctx.stroke();
    
    ctx.restore();
  }
}
