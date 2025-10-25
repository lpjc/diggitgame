// Job: Define the tool contracts and shared context passed to tools (grid, canvas, helpers)
import { DirtLayer, ArtifactData, TrashItem } from '../../../../shared/types/game';

export interface ToolContext {
  dirtLayer: DirtLayer;
  artifact: ArtifactData;
  trashItems: TrashItem[];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  // Dynamic cell size in CSS pixels for non-square grids
  cellWidth: number;
  cellHeight: number;
  // Top-left origin of the dig area inside the canvas (CSS px)
  originX: number;
  originY: number;
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
  // Optional overlay rendering drawn after the main scene each frame
  renderOverlay?(context: ToolContext): void;
}
