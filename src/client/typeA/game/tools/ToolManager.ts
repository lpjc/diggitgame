// Job: Manage tool lifecycle and forward input events with dynamic context
import { Tool, ToolContext } from './Tool';

export class ToolManager {
  private tools: Map<string, Tool> = new Map();
  private activeTool: Tool | null = null;
  private context: ToolContext;

  constructor(context: ToolContext) {
    this.context = context;
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
  }

  public renderOverlay(): void {
    if (this.activeTool?.renderOverlay) {
      this.activeTool.renderOverlay(this.context);
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
  }
}
