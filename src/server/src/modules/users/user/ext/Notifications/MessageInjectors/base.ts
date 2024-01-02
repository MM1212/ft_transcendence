export abstract class MessageInjectorBase {
  constructor(
    public readonly type: string,
    private readonly props: Record<string, unknown>,
  ) {}
  build(): string {
    const strs = [`type: ${this.type}`];
    for (const [key, value] of Object.entries(this.props)) {
      strs.push(`${key}: ${value}`);
    }
    return `{{${strs.join('||')}}}`;
  }
  toString(): string {
    return this.build();
  }
}
