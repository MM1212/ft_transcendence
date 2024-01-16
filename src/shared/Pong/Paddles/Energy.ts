
export class Energy {
  public energyCur: number;
  protected energyMax: number;
  public energyStep: number = 100;
  constructor() {
    this.energyCur = 100;
    this.energyMax = 100;
  }

  get energy(): number {
    return this.energyCur;
  }
  get energyMaxVal(): number {
    return this.energyMax;
  }

  set energy(val: number) {
    this.energyCur = val;
  }
  set energyMaxVal(val: number) {
    this.energyMax = val;
  }

  public spendEnergy(val: number): void {
    this.energyCur -= val;
  }

  public gainEnergy(val: number): void {
    this.energyCur += val;
  }

  public isEnergyEnough(val: number): boolean {
    return this.energyCur >= val;
  }

  public isEnergyFull(): boolean {
    return this.energyCur == this.energyMax;
  }

  update(player: string, delta: number): void {
    if (this.energyCur < this.energyMax) {
      this.energyCur += 0.5 * delta;
    }
  }
}
