import { Tool, ToolContext } from './Tool';

export class ShovelTool implements Tool {
  name: 'shovel' = 'shovel';

  private lastDigTime: number = 0;
  private cooldown: number = 250; // faster cadence for better feel
  private artifactHits: number = 0; // shared lives across the entire artifact
  private impactParticles: Array<{ x: number; y: number; vx: number; vy: number; life: number }> =
    [];
  private ring?: { x: number; y: number; radius: number; life: number };
  private floatingTexts: Array<{ x: number; y: number; text: string; life: number; vy: number }> =
    [];
  private redParticles: Array<{ x: number; y: number; vx: number; vy: number; life: number }> = [];
  private artifactFlashCells: Array<{ x: number; y: number; life: number }> = [];

  onActivate(_context: ToolContext): void {
    this.lastDigTime = 0;
    this.artifactHits = 0;
  }

  onUpdate(_context: ToolContext, _deltaTime: number): void {
    // Update particle lifetimes
    this.impactParticles = this.impactParticles.filter((p) => {
      p.x += p.vx * 0.5;
      p.y += p.vy * 0.5;
      p.life -= 16;
      return p.life > 0;
    });
    this.redParticles = this.redParticles.filter((p) => {
      p.x += p.vx * 0.4 + (Math.random() - 0.5) * 0.6;
      p.y += p.vy * 0.4 + (Math.random() - 0.5) * 0.6;
      p.life -= 16;
      return p.life > 0;
    });
    if (this.ring) {
      this.ring.life -= 16;
      if (this.ring.life <= 0) this.ring = undefined;
    }
    // Update floating texts
    this.floatingTexts = this.floatingTexts.filter((t) => {
      t.y -= t.vy;
      t.life -= 16;
      return t.life > 0;
    });
    this.artifactFlashCells = this.artifactFlashCells.filter((c) => {
      c.life -= 16;
      return c.life > 0;
    });
  }

  onDeactivate(_context: ToolContext): void {
    this.artifactHits = 0;
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

    let hitArtifactEffective = false;
    const damagedCells: Array<{ x: number; y: number }> = [];

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
            const before = dirtLayer.cells[targetY][targetX];
            const after = Math.max(0, before - digDepth);
            if (after !== before) removedAny = true;
            dirtLayer.cells[targetY][targetX] = after;

            // Count artifact damage only if we actually hit exposed or newly-exposed artifact
            if (this.isArtifactCell(targetX, targetY, artifact)) {
              const wasExposedBefore = before <= artifact.depth;
              const revealedNow = before > artifact.depth && after <= artifact.depth;
              if (wasExposedBefore || revealedNow) {
                hitArtifactEffective = true;
                damagedCells.push({ x: targetX, y: targetY });
              }
            }
          }
        }
      }
    }

    // Handle artifact collision
    if (hitArtifactEffective) {
      this.artifactHits += 1;
      const nextHits = this.artifactHits;

      if (nextHits >= 3) {
        if (onArtifactBreak) onArtifactBreak();
        console.log('SHOVEL HIT ARTIFACT! (break)');
      } else if (nextHits === 2) {
        if (onArtifactDamage) onArtifactDamage();
        this.spawnFloatingText(x, y - 12, 'Stop! it’s cracking!');
        this.showCrackWarning(x, y, context);
        this.spawnRedParticles(x, y);
        this.flashArtifactCells(damagedCells);
        console.log('SHOVEL HIT ARTIFACT! (damage 2)');
      } else if (nextHits === 1) {
        if (onArtifactDamage) onArtifactDamage();
        this.spawnFloatingText(x, y - 12, 'Careful! Shovel hits too hard!');
        this.showCrackWarning(x, y, context);
        this.spawnRedParticles(x, y);
        this.flashArtifactCells(damagedCells);
        console.log('SHOVEL HIT ARTIFACT! (damage 1)');
      }
    }

    // Visual/audio feedback only on successful dig
    if (removedAny) {
      this.ring = { x, y, radius: digRadius, life: 180 };
      this.spawnImpactParticles(x, y);
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

  private showRing(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radiusPx: number,
    life: number
  ): void {
    ctx.save();
    const alpha = Math.max(0, Math.min(1, life / 180));
    ctx.strokeStyle = `rgba(139, 115, 85, ${0.8 * alpha})`;
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

  private drawImpactParticles(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(139, 115, 85, 0.9)';
    this.impactParticles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  private spawnRedParticles(x: number, y: number): void {
    const count = 14;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 2.5;
      this.redParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 280 + Math.random() * 220,
      });
    }
  }

  private drawRedParticles(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(220, 40, 40, 0.9)';
    this.redParticles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  private flashArtifactCells(cells: Array<{ x: number; y: number }>): void {
    cells.forEach((c) => this.artifactFlashCells.push({ x: c.x, y: c.y, life: 260 }));
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

  renderOverlay(context: ToolContext): void {
    const { ctx, originX, originY, cellWidth, cellHeight } = context;
    if (this.ring) {
      this.showRing(ctx, this.ring.x, this.ring.y, this.ring.radius, this.ring.life);
    }
    if (this.impactParticles.length > 0) {
      this.drawImpactParticles(ctx);
    }
    if (this.redParticles.length > 0) {
      this.drawRedParticles(ctx);
    }
    if (this.floatingTexts.length > 0) {
      this.drawFloatingTexts(ctx);
    }
    if (this.artifactFlashCells.length > 0) {
      ctx.save();
      this.artifactFlashCells.forEach((c) => {
        const alpha = Math.max(0, Math.min(1, c.life / 260));
        const jitterX = (Math.random() - 0.5) * 2;
        const jitterY = (Math.random() - 0.5) * 2;
        ctx.fillStyle = `rgba(255, 50, 50, ${0.6 * alpha})`;
        ctx.fillRect(
          originX + c.x * cellWidth + jitterX,
          originY + c.y * cellHeight + jitterY,
          cellWidth,
          cellHeight
        );
      });
      ctx.restore();
    }
  }

  private readonly FLOATING_TEXT_LIFE = 3200;
  private spawnFloatingText(x: number, y: number, text: string): void {
    this.floatingTexts.push({ x, y, text, life: this.FLOATING_TEXT_LIFE, vy: 0.35 });
  }

  private drawFloatingTexts(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    this.floatingTexts.forEach((t) => {
      const alpha = Math.max(0, Math.min(1, t.life / this.FLOATING_TEXT_LIFE));
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = `rgba(255, 230, 150, ${alpha})`;
      ctx.strokeStyle = `rgba(120, 50, 50, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillText(t.text, t.x, t.y);
    });
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
