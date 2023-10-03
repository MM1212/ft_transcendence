import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Intra } from '@typings/intra';

@Injectable()
export class IntraAPI {
  private accessToken?: string = undefined;
  constructor(private readonly config: ConfigService<ImportMetaEnv>) {}
  private get headers(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.accessToken) headers.Authorization = `Bearer ${this.accessToken}`;
    return headers;
  }
  private get rootUrl(): string {
    return this.config.get('BACKEND_42_ROOT_URI')!;
  }
  public set token(val: string) {
    this.accessToken = val;
  }
  private buildUrl(endpoint: Intra.Endpoints): string {
    return `${this.rootUrl}${endpoint}`;
  }
  private async request<T>(
    endpoint: Intra.Endpoints,
    method: string = 'GET',
  ): Promise<T> {
    return await fetch(this.buildUrl(endpoint), {
      method,
      headers: this.headers,
    }).then((resp) => resp.json());
  }
  public async me(): Promise<Intra.Student.Data> {
    return await this.request<Intra.Student.Data>(Intra.Endpoints.Me);
  }
}
