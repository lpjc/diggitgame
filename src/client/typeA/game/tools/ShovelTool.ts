import { Tool, ToolContext } from './Tool';

export class ShovelTool implements Tool {
  name: 'shovel' = 'shovel';
  
  private lastDigTime: number = 0;
  private cooldown: number = 250; // faster cadence for better feel
  private artifactHitLocations: Set<string> = new Set();
  private impactParticles: Array<{ x: number; y: number; vx: number; vy: number; life: number }> = [];

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
    const { cellWidth, cellHeight, originX, originY } = context;
    
    // Convert screen coordinates to grid coordinates
    const gridX = Math.floor((x - originX) / cellWidth);
    const gridY = Math.floor((y - originY) / cellHeight);

    // Dig parameters
    const digDepth = 10;
    // Scale shovel radius with pixel size; base ~2 squares
    const digRadius = Math.max(12, Math.floor(Math.min(cellWidth, cellHeight) * 2));

    let hitArtifact = false;
    const hitLocation = `${gridX},${gridY}`;

    // Remove dirt in circular area (grid space to avoid duplicate hits per cell)
    const gridStep = Math.min(cellWidth, cellHeight);
    const gridRadius = Math.max(1, Math.round(digRadius / gridStep) + 1); // +1 cell wider impact
    let removedAny = false;
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
            if (this.isArtifactCell(targetX, targetY, artifact)) {
              hitArtifact = true;
            }
            const before = dirtLayer.cells[targetY][targetX];
            const after = Math.max(0, before - digDepth);
            if (after !== before) removedAny = true;
            dirtLayer.cells[targetY][targetX] = after;
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
        console.log('SHOVEL HIT ARTIFACT! (break)');
      } else {
        // First hit - show warning
        this.artifactHitLocations.add(hitLocation);
        if (onArtifactDamage) {
          onArtifactDamage();
        }
        this.showCrackWarning(x, y, context);
        console.log('SHOVEL HIT ARTIFACT! (damage)');
      }
    }

    // Visual/audio feedback only on successful dig
    if (removedAny) {
      this.showDigEffect(x, y, context, digRadius);
      this.spawnImpactParticles(x, y);
      this.drawImpactParticles(context);
      this.playThud();
      console.log('SHOVEL HIT!');
    }
  }

  private isArtifactCell(
    x: number,
    y: number,
    artifact: { position: { x: number; y: number }; width: number; height: number; depth: number }
  ): boolean {
    // Match the renderer's circular artifact for hit detection
    const { position, width, height } = artifact;
    const cx = position.x + width / 2;
    const cy = position.y + height / 2;
    const radius = Math.min(width, height) / 2;
    const cellCx = x + 0.5;
    const cellCy = y + 0.5;
    const dx = cellCx - cx;
    const dy = cellCy - cy;
    return dx * dx + dy * dy <= radius * radius;
  }

  private showDigEffect(x: number, y: number, context: ToolContext, radiusPx: number): void {
    const { ctx } = context;

    ctx.save();
    // Hard-edged outline only (no soft fill)
    ctx.strokeStyle = 'rgba(139, 115, 85, 0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radiusPx, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private spawnImpactParticles(x: number, y: number): void {
    this.impactParticles = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      this.impactParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 300 + Math.random() * 300,
      });
    }
  }

  private drawImpactParticles(context: ToolContext): void {
    const { ctx } = context;
    ctx.save();
    ctx.fillStyle = 'rgba(139, 115, 85, 0.9)';
    this.impactParticles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  private playThud(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 140; // low thud
      osc.connect(gain);
      gain.connect(audioContext.destination);
      const t = audioContext.currentTime;
      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.start(t);
      osc.stop(t + 0.13);
    } catch {}
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
