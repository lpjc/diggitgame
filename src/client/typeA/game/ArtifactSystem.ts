import { ArtifactData, DirtLayer } from '../../../shared/types/game';

export class ArtifactSystem {
  private artifact: ArtifactData;
  private uncoveredPercentage: number = 0;
  private isDamaged: boolean = false;
  private isBroken: boolean = false;

  constructor(artifact: ArtifactData) {
    this.artifact = artifact;
  }

  public getArtifact(): ArtifactData {
    return this.artifact;
  }

  public calculateUncoveredPercentage(dirtLayer: DirtLayer): number {
    const { position, depth, width, height } = this.artifact;

    let uncoveredCells = 0;
    let totalCells = 0;

    for (let y = position.y; y < position.y + height && y < dirtLayer.height; y++) {
      for (let x = position.x; x < position.x + width && x < dirtLayer.width; x++) {
        totalCells++;
        // Cell is "uncovered" if depth <= artifact.depth + 8
        if (dirtLayer.cells[y][x] <= depth + 8) {
          uncoveredCells++;
        }
      }
    }

    this.uncoveredPercentage = totalCells > 0 ? (uncoveredCells / totalCells) * 100 : 0;
    return this.uncoveredPercentage;
  }

  public getUncoveredPercentage(): number {
    return this.uncoveredPercentage;
  }

  public isDiscovered(): boolean {
    return this.uncoveredPercentage >= 70;
  }

  public markDamaged(): void {
    this.isDamaged = true;
  }

  public markBroken(): void {
    this.isBroken = true;
  }

  public isDamagedState(): boolean {
    return this.isDamaged;
  }

  public isBrokenState(): boolean {
    return this.isBroken;
  }
}

export class ArtifactGenerator {
  /**
   * Generate artifact data from server response
   */
  public static fromServerData(artifactData: ArtifactData): ArtifactData {
    return {
      type: artifactData.type,
      position: artifactData.position,
      depth: artifactData.depth,
      width: artifactData.width,
      height: artifactData.height,
      post: artifactData.post,
      relic: artifactData.relic,
    };
  }

  /**
   * Generate a placeholder artifact for testing
   */
  public static generatePlaceholder(): ArtifactData {
    const isRelic = Math.random() < 0.05;

    return {
      type: isRelic ? 'subreddit_relic' : 'post',
      position: {
        x: 30 + Math.floor(Math.random() * 40),
        y: 30 + Math.floor(Math.random() * 40),
      },
      depth: 40 + Math.floor(Math.random() * 20),
      width: isRelic ? 20 : 25,
      height: isRelic ? 20 : 15,
    };
  }
}
