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
    if (!this.isActive || !this.currentPosition) return;

    const now = Date.now();
    if (now - this.lastPingTime >= this.pingInterval) {
      this.ping(this.currentPosition.x, this.currentPosition.y, context);
      this.lastPingTime = now;
    }
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
    const gridX = Math.floor((x - originX) / cellWidth);
    const gridY = Math.floor((y - originY) / cellHeight);

    // Calculate distance to nearest edge of artifact
    const distance = this.calculateDistanceToArtifact(gridX, gridY, artifact);
    const proximity = this.getProximityLevel(distance);

    // Visual feedback
    this.showPingEffect(x, y, proximity, context);

    // Audio feedback
    this.playBeep(proximity);
  }

  private calculateDistanceToArtifact(
    x: number,
    y: number,
    artifact: { position: { x: number; y: number }; width: number; height: number }
  ): number {
    const { position, width, height } = artifact;
    
    // Find closest point on artifact rectangle
    const closestX = Math.max(position.x, Math.min(x, position.x + width));
    const closestY = Math.max(position.y, Math.min(y, position.y + height));
    
    // Calculate Euclidean distance
    const dx = x - closestX;
    const dy = y - closestY;
    
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getProximityLevel(distance: number): ProximityLevel {
    if (distance < 5) return ProximityLevel.VERY_CLOSE;
    if (distance < 15) return ProximityLevel.CLOSE;
    if (distance < 30) return ProximityLevel.FAR;
    return ProximityLevel.VERY_FAR;
  }

  private showPingEffect(
    x: number,
    y: number,
    proximity: ProximityLevel,
    context: ToolContext
  ): void {
    const { ctx } = context;
    const color = this.getProximityColor(proximity);

    // Draw expanding circle
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.7;
    
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x, y, 10 + i * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();
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
