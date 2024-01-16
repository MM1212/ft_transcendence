
export class Mana {
  public manaCur: number;
  protected manaMax: number;
  public manaStep: number = 100;
  constructor() {
    this.manaCur = 100;
    this.manaMax = 100;
  }

  get mana(): number {
    return this.manaCur;
  }
  get manaMaxVal(): number {
    return this.manaMax;
  }

  set mana(val: number) {
    this.manaCur = val;
  }
  set manaMaxVal(val: number) {
    this.manaMax = val;
  }

  public spendMana(val: number): void {
    this.manaCur -= val;
  }

  public gainMana(val: number): void {
    this.manaCur += val;
  }

  public isManaEnough(val: number): boolean {
    return this.manaCur >= val;
  }

  public isManaFull(): boolean {
    return this.manaCur == this.manaMax;
  }

  update(player: string, delta: number): void {
    if (this.manaCur < this.manaMax) {
      this.manaCur += 0.1 * delta;
    }
  }
}
