import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { UserDependencies } from '../user/dependencies';
import User from '../user';
import { DbService } from '../../db';
import UsersModel from '@typings/models/users';
import { OnEvent } from '@nestjs/event-emitter';
import { HttpError } from '@/helpers/decorators/httpError';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly users: Map<number, User> = new Map();
  private readonly studentIds: Map<number, number> = new Map();
  constructor(
    @Inject(forwardRef(() => UserDependencies))
    private readonly deps: UserDependencies,
  ) {}

  @OnEvent('sse.connected')
  private async onSseConnected(userId: number) {
    const user = await this.get(userId);
    if (!user || user.isConnected) return;
    this.logger.log(`User ${user.nickname}[${user.id}] connected`);
    user.set('status', user.get('storedStatus')).set('connected', true);
    user.propagate('status');
    this.deps.events.emit('user.connected', user);
  }
  @OnEvent('sse.disconnected')
  private async onSseDisconnected(userId: number) {
    const user = await this.get(userId);
    if (!user) return;
    this.logger.log(`User ${user.nickname}[${user.id}] disconnected`);
    user
      .set('status', UsersModel.Models.Status.Offline)
      .set('connected', false);
    user.propagate('status');
    this.deps.events.emit('user.disconnected', user);
  }

  private get db(): DbService {
    return this.deps.db;
  }

  public has(id: number): boolean {
    return this.users.has(id);
  }

  public async getAll(
    filters: UsersModel.DTO.DB.GetLimits = {},
  ): Promise<UsersModel.Models.IUserInfo[]> {
    const users = await this.db.users.getAll(filters);
    return users;
  }

  public useAll(): User[] {
    return [...this.users.values()];
  }

  public async search(
    query: string,
    filters: UsersModel.DTO.DB.GetLimits = {},
  ): Promise<UsersModel.Models.IUserInfo[]> {
    const users = await this.db.users.search(query, filters);
    return users;
  }

  public async get(id: number, fetch: boolean = false): Promise<User | null> {
    if (!this.has(id)) fetch = true;
    const user = this.users.get(id);
    if (user && !fetch) return user;
    const data = await this.fetch(id);
    if (!data) return null;
    user?.setTo(data);
    return user ?? this.build(data);
  }
  public async getMany(ids: number[]): Promise<User[]> {
    const toFetch = ids.filter((id) => !this.has(id));
    if (toFetch.length > 0) {
      const data = await this.fetchMany(toFetch);
      for (const user of data) this.build(user);
    }
    return ids.map((id) => this.users.get(id)!);
  }
  public async getByStudentId(
    studentId: number,
    fetch: boolean = false,
  ): Promise<User | null> {
    let id = this.studentIds.get(studentId);
    if (!id) id = (await this.db.users.getByStudentId(studentId))?.id;
    if (!id) return null;
    return await this.get(id, fetch);
  }
  public async getByNickname(
    nickname: string,
    fetch: boolean = false,
  ): Promise<User | null> {
    const data = await this.db.users.getByNickname(nickname);
    if (!data) return null;
    return await this.get(data.id, fetch);
  }

  private async fetch(id: number): Promise<UsersModel.Models.IUser | null> {
    return await this.db.users.get(id);
  }
  private async fetchMany(ids: number[]): Promise<UsersModel.Models.IUser[]> {
    return await this.db.users.getMany(ids);
  }
  private build(data: UsersModel.Models.IUser): User {
    const user = new User(data, this.deps);
    this.users.set(data.id, user);
    this.pruneCache();
    return user;
  }
  private pruneCache(): void {
    if (this.users.size < 10) return;
    const first = this.users.keys().next().value;
    this.users.delete(first);
  }

  public async create(data: UsersModel.DTO.DB.IUserCreate): Promise<User> {
    let attempts = 0;
    while (attempts < 5) {
      try {
        if (await this.db.users.exists(data.nickname)) {
          data.nickname += `_${Math.floor(Math.random() * 100)}`;
        } else break;
        attempts++;
      } catch (e) {
        throw new HttpError('Failed to create user');
      }
    }
    if (attempts >= 5) throw new HttpError('Failed to create user');
    const userData = await this.db.users.create(data);
    if (!userData) throw new HttpError('Failed to create user');
    return this.build(userData);
  }
  public async delete(id: number): Promise<boolean> {
    const user = await this.get(id);
    if (!user) return false;
    this.users.delete(id);
    return !!(await this.db.users.delete(id));
  }

  public async exists(id: number | string): Promise<boolean> {
    return await this.db.users.exists(id);
  }
}
