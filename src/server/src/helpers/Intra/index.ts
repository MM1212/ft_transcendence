import { Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Intra } from '@typings/intra';

@Injectable({ scope: Scope.REQUEST })
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
    replacers: Record<string, string> = {},
    params: Record<string, string> = {},
  ): Promise<T> {
    const url = new URL(
      this.buildUrl(endpoint).replace(/{(\w+)}/g, (_, key) => replacers[key]),
    );
    for (const [key, val] of Object.entries(params)) {
      url.searchParams.append(key, val);
    }
    return await fetch(url.toJSON(), {
      method,
      headers: this.headers,
    }).then((resp) => resp.json());
  }
  public async me(): Promise<Intra.Student.Data> {
    return await this.request<Intra.Student.Data>(Intra.Endpoints.Me);
  }
}
