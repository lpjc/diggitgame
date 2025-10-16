import { Tool, ToolContext } from './Tool';
import { ProximityLevel } from '../../../../shared/types/game';

export class DetectorTool implements Tool {
  name: 'detector' = 'detector';
  
  private isActive: boolean = false;
  private lastPingTime: number = 0;
  private pingInterval: number = 1000; // 1 second
  private currentPosition: { x: number; y: number } | null = null;

  onActivate(_context: ToolContext): void {
    this.isActive = true;
    this.lastPingTime = 0;
  }

  onUpdate(context: ToolContext, _deltaTime: number): void {
    // No periodic pings; detector pings only on click (pointer down)
  }

  onDeactivate(_context: ToolContext): void {
    this.isActive = false;
    this.currentPosition = null;
  }

  handlePointerDown(x: number, y: number, context: ToolContext): void {
    this.currentPosition = { x, y };
    this.ping(x, y, context);
    this.lastPingTime = Date.now();
  }

  handlePointerMove(x: number, y: number, _context: ToolContext): void {
    if (this.isActive) {
      this.currentPosition = { x, y };
    }
  }

  handlePointerUp(_x: number, _y: number, _context: ToolContext): void {
    this.currentPosition = null;
  }

  private ping(x: number, y: number, context: ToolContext): void {
    const { artifact } = context;
    const { cellWidth, cellHeight, originX, originY } = context;
    
    // Convert screen coordinates to grid coordinates
    const gridXF = (x - originX) / cellWidth;
    const gridYF = (y - originY) / cellHeight;
    const gridX = Math.floor(gridXF);
    const gridY = Math.floor(gridYF);

    // Calculate distance to circular artifact boundary in grid cells
    const distance = this.calculateDistanceToArtifactCircle(gridX, gridY, artifact);
    // Debug: log distances and mapping
    const cx = artifact.position.x + artifact.width / 2;
    const cy = artifact.position.y + artifact.height / 2;
    const radius = Math.min(artifact.width, artifact.height) / 2;
    const dx = gridX + 0.5 - cx;
    const dy = gridY + 0.5 - cy;
    const centerDistance = Math.sqrt(dx * dx + dy * dy);
    const thresholds = { veryClose: 1, close: 3, far: 6 };
    console.log('DETECTOR PING', {
      raw: { x, y },
      origin: { originX, originY },
      cell: { cellWidth, cellHeight },
      grid: { gridXF, gridYF, gridX, gridY },
      artifactRect: { ax: artifact.position.x, ay: artifact.position.y, aw: artifact.width, ah: artifact.height },
      artifactCircle: { cx, cy, radius },
      distances: { centerDistance, boundaryDistance: distance },
      thresholds,
    });
    const proximity = this.getProximityLevel(distance);

    // Visual feedback
    this.showPingEffect(x, y, proximity, context);

    // Audio feedback
    this.playBeep(proximity);
  }

  private calculateDistanceToArtifactCircle(
    x: number,
    y: number,
    artifact: { position: { x: number; y: number }; width: number; height: number }
  ): number {
    const { position, width, height } = artifact;
    const cx = position.x + width / 2;
    const cy = position.y + height / 2;
    const radius = Math.min(width, height) / 2;
    const dx = x + 0.5 - cx; // use cell center
    const dy = y + 0.5 - cy;
    const distToCenter = Math.sqrt(dx * dx + dy * dy);
    const distToBoundary = distToCenter - radius;
    return Math.max(0, distToBoundary);
  }

  private getProximityLevel(distance: number): ProximityLevel {
    // Distance is in grid cells to boundary; tune thresholds to big pixels
    if (distance < 1) return ProximityLevel.VERY_CLOSE;
    if (distance < 3) return ProximityLevel.CLOSE;
    if (distance < 6) return ProximityLevel.FAR;
    return ProximityLevel.VERY_FAR;
  }

  private showPingEffect(
    x: number,
    y: number,
    proximity: ProximityLevel,
    context: ToolContext
  ): void {
    const container = context.canvas.parentElement as HTMLElement | null;
    if (!container) return;
    this.ensureRippleStyles();

    const color = this.getProximityColor(proximity);
    const baseSize = Math.min(context.cellWidth, context.cellHeight);
    const diameter = Math.max(80, Math.floor(baseSize * 10));

    // Create 3 delayed ripples for a nicer effect
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('div');
      ring.className = 'detector-ripple';
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
      ring.style.width = `${diameter}px`;
      ring.style.height = `${diameter}px`;
      ring.style.borderColor = color;
      ring.style.animationDelay = `${i * 80}ms`;
      container.appendChild(ring);
      ring.addEventListener('animationend', () => ring.remove());
    }
  }

  private ensureRippleStyles(): void {
    if (document.getElementById('detector-ripple-styles')) return;
    const style = document.createElement('style');
    style.id = 'detector-ripple-styles';
    style.textContent = `
      .detector-ripple {
        position: absolute;
        pointer-events: none;
        border: 3px solid #ff0000;
        border-radius: 50%;
        transform: translate(-50%, -50%) scale(0);
        opacity: 0.9;
        z-index: 10;
        animation: detector-ripple-anim 700ms ease-out forwards;
      }
      @keyframes detector-ripple-anim {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0.9; }
        70% { opacity: 0.5; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  private getProximityColor(proximity: ProximityLevel): string {
    switch (proximity) {
      case ProximityLevel.VERY_CLOSE:
        return '#00FF00'; // Green
      case ProximityLevel.CLOSE:
        return '#FFFF00'; // Yellow
      case ProximityLevel.FAR:
        return '#FFA500'; // Orange
      case ProximityLevel.VERY_FAR:
        return '#FF0000'; // Red
    }
  }

  private playBeep(proximity: ProximityLevel): void {
    // Audio feedback with varying pitch
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Frequency based on proximity
    const frequency = this.getProximityFrequency(proximity);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }

  private getProximityFrequency(proximity: ProximityLevel): number {
    switch (proximity) {
      case ProximityLevel.VERY_CLOSE:
        return 800; // High pitch
      case ProximityLevel.CLOSE:
        return 600;
      case ProximityLevel.FAR:
        return 400;
      case ProximityLevel.VERY_FAR:
        return 200; // Low pitch
    }
  }
}
