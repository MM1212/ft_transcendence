import { CacheObserver } from '@shared/CacheObserver';
import User from '../..';
import UserExtBase from '../Base';
import InventoryModel from '@typings/models/users/inventory';

class Item<T extends Record<string, unknown> = Record<string, unknown>>
  extends CacheObserver<InventoryModel.Models.IItem<Record<string, unknown>>>
  implements InventoryModel.Models.IItem<T>
{
  constructor(
    data: InventoryModel.Models.IItem<T>,
    private readonly ext: UserExtInventory,
  ) {
    super(data);
  }

  private get helpers(): UserExtBase['helpers'] {
    // @ts-expect-error impl
    return this.ext.helpers;
  }

  get public(): InventoryModel.Models.IItem<T> {
    return this.get() as InventoryModel.Models.IItem<T>;
  }

  get id(): number {
    return this.get('id');
  }
  get type() {
    return this.get('type');
  }
  get name() {
    return this.get('name');
  }
  get meta(): T {
    return this.get('meta') as T;
  }
  get createdAt(): number {
    return this.get('createdAt');
  }
  get userId(): number {
    return this.get('userId');
  }
  get user(): User {
    return this.ext.user;
  }
  get inventory(): UserExtInventory {
    return this.ext;
  }

  public async update(meta: T | ((prev: T) => T)): Promise<void> {
    if (typeof meta === 'function') {
      meta = meta(this.meta);
    }
    await this.helpers.db.users.inventory.update(this.id, {
      meta: meta as any,
    });
    this.set('meta', meta);
    this.inventory.sync();
  }
}

class UserExtInventory extends UserExtBase {
  constructor(user: User) {
    super(user);
  }

  public get items(): Item[] {
    return this.user.get('inventory').map((item) => new Item(item, this));
  }

  public getById(id: number): Item | undefined {
    return this.items.find((item) => item.id === id);
  }
  public getByType(type: string): Item[] {
    return this.items.filter((item) => item.type === type);
  }
  public getByName(name: string): Item[] {
    return this.items.filter((item) => item.name === name);
  }
  public async add(
    type: string,
    name: string,
    meta?: Record<string, unknown>,
  ): Promise<InventoryModel.Models.IItem> {
    const item = await this.helpers.db.users.inventory.create(
      this.user.id,
      type,
      name,
      meta,
    );
    this.user.set('inventory', (prev) => [...prev, item]);
    return item;
  }
  public async remove(id: number): Promise<void> {
    await this.helpers.db.users.inventory.delete(id);
    this.user.set('inventory', (prev) => prev.filter((item) => item.id !== id));
  }
  public async removeAllByType(type: string): Promise<void> {
    await this.helpers.db.users.inventory.deleteByType(this.user.id, type);
    this.user.set('inventory', (prev) =>
      prev.filter((item) => item.type !== type),
    );
  }
  public async removeAllByName(name: string): Promise<void> {
    await this.helpers.db.users.inventory.deleteByName(this.user.id, name);
    this.user.set('inventory', (prev) =>
      prev.filter((item) => item.name !== name),
    );
  }
  public async removeAll(): Promise<void> {
    await this.helpers.db.users.inventory.deleteAll(this.user.id);
    this.user.set('inventory', []);
  }

  public sync(): void {
    this.helpers.sseService.emitTo<InventoryModel.Sse.UpdateInventoryEvent>(
      InventoryModel.Sse.Events.UpdateInventory,
      this.user.id,
      this.items,
    );
  }
}

export default UserExtInventory;
