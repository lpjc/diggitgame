// Job: Manage tool lifecycle and forward input events with dynamic context.
// Also renders global overlays (floating texts) independent of the active tool.
import { Tool, ToolContext } from './Tool';
import { DirtLayer, TrashItem } from '../../../../shared/types/game';

export class ToolManager {
  private tools: Map<string, Tool> = new Map();
  private activeTool: Tool | null = null;
  private context: ToolContext;
  private floatingTexts: Array<{ x: number; y: number; text: string; life: number; vy: number }> = [];
  private readonly FLOATING_TEXT_LIFE = 5200;
  private trashRevealState: WeakMap<TrashItem, { first: boolean; fifty: boolean }> = new WeakMap();

  constructor(context: ToolContext) {
    this.context = context;
    // Bind trash reveal callback into context so tools can notify us
    this.context.onTrashCellRevealed = (trash, sx, sy) => this.handleTrashReveal(trash, sx, sy, this.context.dirtLayer);
  }

  public registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  public setActiveTool(toolName: 'detector' | 'shovel' | 'brush' | null): void {
    if (this.activeTool) {
      this.activeTool.onDeactivate(this.context);
    }

    if (toolName) {
      const tool = this.tools.get(toolName);
      if (tool) {
        this.activeTool = tool;
        this.activeTool.onActivate(this.context);
      }
    } else {
      this.activeTool = null;
    }
  }

  public getActiveTool(): Tool | null {
    return this.activeTool;
  }

  public update(deltaTime: number): void {
    if (this.activeTool) {
      this.activeTool.onUpdate(this.context, deltaTime);
    }
    // Update global floating texts
    this.floatingTexts = this.floatingTexts.filter((t) => {
      t.y -= t.vy;
      t.life -= deltaTime;
      return t.life > 0;
    });
  }

  public renderOverlay(): void {
    if (this.activeTool?.renderOverlay) {
      this.activeTool.renderOverlay(this.context);
    }
    // Draw global floating texts last
    if (this.floatingTexts.length > 0) {
      const ctx = this.context.ctx;
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
  }

  public handlePointerDown(x: number, y: number): void {
    if (this.activeTool?.handlePointerDown) {
      this.activeTool.handlePointerDown(x, y, this.context);
    }
  }

  public handlePointerMove(x: number, y: number): void {
    if (this.activeTool?.handlePointerMove) {
      this.activeTool.handlePointerMove(x, y, this.context);
    }
  }

  public handlePointerUp(x: number, y: number): void {
    if (this.activeTool?.handlePointerUp) {
      this.activeTool.handlePointerUp(x, y, this.context);
    }
  }

  public updateContext(context: Partial<ToolContext>): void {
    this.context = { ...this.context, ...context };
    if (!this.context.onTrashCellRevealed) {
      this.context.onTrashCellRevealed = (trash, sx, sy) => this.handleTrashReveal(trash, sx, sy, this.context.dirtLayer);
    }
  }

  // Spawn a global floating text at screen-space coordinates
  public spawnFloatingText(x: number, y: number, text: string): void {
    this.floatingTexts.push({ x, y, text, life: this.FLOATING_TEXT_LIFE, vy: 0.35 });
  }

  private computeTrashUncoveredPercent(trash: TrashItem, dirtLayer: DirtLayer): number {
    const { position, width, height, depth } = trash;
    let uncovered = 0;
    let total = 0;
    const maxY = Math.min(dirtLayer.height, position.y + height);
    const maxX = Math.min(dirtLayer.width, position.x + width);
    for (let y = position.y; y < maxY; y++) {
      const row = dirtLayer.cells[y];
      if (!row) continue;
      for (let x = position.x; x < maxX; x++) {
        total++;
        const cell = row[x];
        if (typeof cell === 'number' && cell <= depth) uncovered++;
      }
    }
    return total > 0 ? (uncovered / total) * 100 : 0;
  }

  private handleTrashReveal(trash: TrashItem, screenX: number, screenY: number, dirtLayer: DirtLayer): void {
    const percent = this.computeTrashUncoveredPercent(trash, dirtLayer);
    const state = this.trashRevealState.get(trash) ?? { first: false, fifty: false };
    if (!state.first && percent > 0) {
      this.spawnFloatingText(screenX, screenY, 'what is that?');
      state.first = true;
    }
    if (!state.fifty && percent >= 50) {
      this.spawnFloatingText(screenX, screenY, 'worthless...');
      state.fifty = true;
    }
    this.trashRevealState.set(trash, state);
  }
}
