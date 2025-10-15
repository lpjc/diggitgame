import { DirtLayer, ArtifactData } from '../../../../shared/types/game';

export interface ToolContext {
  dirtLayer: DirtLayer;
  artifact: ArtifactData;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  onArtifactDamage?: () => void;
  onArtifactBreak?: () => void;
}

export interface Tool {
  name: 'detector' | 'shovel' | 'brush';
  
  onActivate(context: ToolContext): void;
  onUpdate(context: ToolContext, deltaTime: number): void;
  onDeactivate(context: ToolContext): void;
  
  handlePointerDown?(x: number, y: number, context: ToolContext): void;
  handlePointerMove?(x: number, y: number, context: ToolContext): void;
  handlePointerUp?(x: number, y: number, context: ToolContext): void;
}
