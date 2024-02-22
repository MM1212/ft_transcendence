import User from '../..';
import UserExtBase from '../Base';

export class UserExtCredits extends UserExtBase {
  constructor(user: User) {
    super(user);
  }

  public get value(): number {
    return this.user.get('credits');
  }

  public async add(value: number, sync: boolean = true): Promise<void> {
    const resp = await this.helpers.db.users.update(this.user.id, {
      credits: {
        increment: value,
      },
    });
    if (!resp) throw new Error('Failed to add credits');
    this.user.set('credits', resp.credits);
    if (sync) {
      this.user.propagate('credits');
    }
    const achievement = await this.user.achievements.get<{count: number}>('store:credits');
    await achievement.update( previous => ({
      ...previous,
      count: previous.count + value
    }))
  }

  public async remove(value: number, sync: boolean = true): Promise<void> {
    const resp = await this.helpers.db.users.update(this.user.id, {
      credits: {
        decrement: value,
      },
    });
    if (!resp) throw new Error('Failed to remove credits');
    this.user.set('credits', resp.credits);
    if (sync) {
      this.user.propagate('credits');
    }
  }

  public async set(value: number, sync: boolean = true): Promise<void> {
    const resp = await this.helpers.db.users.update(this.user.id, {
      credits: value,
    });
    if (!resp) throw new Error('Failed to set credits');
    this.user.set('credits', resp.credits);
    if (sync) {
      this.user.propagate('credits');
    }
  }

  public async sync(): Promise<void> {
    this.user.propagate('credits');
  }
}
