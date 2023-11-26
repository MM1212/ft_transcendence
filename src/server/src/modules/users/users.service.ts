import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { UserDependencies } from './user/dependencies';
import User from './user';
import { DbService } from '../db';
import UsersModel from '@typings/models/users';
import { OnEvent } from '@nestjs/event-emitter';
import { HttpError } from '@/helpers/decorators/httpError';

@Injectable()
export class UsersService {
  private readonly users: Map<number, User> = new Map();
  private readonly studentIds: Map<number, number> = new Map();
  constructor(
    @Inject(forwardRef(() => UserDependencies))
    private readonly deps: UserDependencies,
  ) {}

  @OnEvent('sse.connected')
  private async onSseConnected(userId: number) {
    console.log('User connected', userId);

    const user = await this.get(userId);
    if (!user || !user.isOffline) return;
    user.set('status', user.get('storedStatus'));
    console.log(user.public);

    user.propagate('status');
  }
  @OnEvent('sse.disconnected')
  private async onSseDisconnected(userId: number) {
    console.log('User disconnected', userId);
    const user = await this.get(userId);
    if (!user) return;
    user.set('status', UsersModel.Models.Status.Offline);
    user.propagate('status');
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
}
