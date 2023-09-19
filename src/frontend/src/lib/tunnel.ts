import API, { Endpoints } from '@typings/api';
import rest from '@utils/rest';

class APITunnel {
  private readonly endpoint: string = import.meta.env.FRONTEND_API_ENDPOINT;

  private buildUrl(uri: Endpoints): string {
    return `${this.endpoint}${uri}`;
  }
  private async request<R, T>(
    uri: Endpoints,
    data?: T,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
  ): Promise<API.Response<R>> {
    const url = this.buildUrl(uri);
    try {
      switch (method) {
        case 'GET':
          return await rest.get<API.Response<R>>(url);
        case 'POST':
          return await rest.post<API.Response<R>>(url, data);
        case 'PUT':
          return await rest.put<API.Response<R>>(url, data);
        case 'DELETE':
          return await rest.del<API.Response<R>>(url);
        default:
          return await rest.get<API.Response<R>>(url);
      }
    } catch (err: any) {
      return API.buildErrorResponse(err.message);
    }
  }
  public async get<R>(uri: Endpoints): Promise<API.Response<R>> {
    return await this.request<R, undefined>(uri);
  }
  public async post<R, T>(uri: Endpoints, data: T): Promise<API.Response<R>> {
    return await this.request<R, T>(uri, data, 'POST');
  }
  public async put<R, T>(uri: Endpoints, data: T): Promise<API.Response<R>> {
    return await this.request<R, T>(uri, data, 'PUT');
  }
  public async delete<R>(uri: Endpoints): Promise<API.Response<R>> {
    return await this.request<R, undefined>(uri, undefined, 'DELETE');
  }
}

const tunnel = new APITunnel();

export default tunnel;
