import { Injectable } from '@nestjs/common';
import { UserDependencies } from './user/dependencies';
import User from './user';
import { DbService } from '../db';
import UsersModel from '@typings/models/users';

@Injectable()
export class UsersService {
  private readonly users: Map<number, User> = new Map();
  private readonly studentIds: Map<number, number> = new Map();
  constructor(private readonly deps: UserDependencies) {}

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
    if (!userData) throw new Error('Failed to create user');
    return this.build(userData);
  }
  public async delete(id: number): Promise<boolean> {
    const user = await this.get(id);
    if (!user) return false;
    this.users.delete(id);
    return !!(await this.db.users.delete(id));
  }
}
