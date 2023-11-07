import * as API from '@typings/api';
import { ITunnel } from '@typings/client/tunnel';
import rest from '@utils/rest';

class APITunnel implements ITunnel {
  private readonly endpoint: string = import.meta.env.FRONTEND_API_ENDPOINT;

  private buildUrl(uri: string): string {
    return `${this.endpoint}${uri}`;
  }
  public buildEndpoint<
    T extends API.Endpoint<API.EndpointMethods, API.Endpoints.All>,
  >(
    uri: API.EndpointTarget<T>,
    params: API.EndpointParams<T> = {} as API.EndpointParams<T>
  ): string {
    console.log(uri, params);
    
    if (!params) return this.buildUrl(uri);
    const url = new URL(
      this.buildUrl(
        uri.replace(/:(\w+)/g, (_, key) => {
          const value = params[key];
          if (!value)
            throw new Error(`Missing parameter '${key}' for endpoint '${uri}'`);
          delete params[key];
          return `${value}`;
        })
      )
    );

    if (params)
      for (const [key, value] of Object.entries(params))
        url.searchParams.set(key, value?.toString() ?? `${value}`);
    return url.toString();
  }
  private async request(
    uri: any,
    data: any,
    params: any,
    method: API.EndpointMethods
  ): Promise<any> {
    const url = this.buildEndpoint(uri, params);
    try {
      switch (method as API.EndpointMethods) {
        case API.EndpointMethods.Get:
          return await rest.get<any>(url);
        case API.EndpointMethods.Post:
          return await rest.post<any>(url, data);
        case API.EndpointMethods.Put:
          return await rest.put<any>(url, data);
        case API.EndpointMethods.Delete:
          return await rest.del<any>(url);
        case API.EndpointMethods.Patch:
          return await rest.patch<any>(url, data);
        default:
          return await rest.get<any>(url);
      }
    } catch (err: any) {
      return API.buildErrorResponse(err.message);
    }
  }
  public async get(uri: any, params: any = {}): Promise<any> {
    return await this.request(uri, undefined, params, API.EndpointMethods.Get);
  }
  public async post(uri: any, data: any, params: any = {}): Promise<any> {
    return await this.request(uri, data, params, API.EndpointMethods.Post);
  }
  public async put(uri: any, data: any, params: any = {}): Promise<any> {
    return await this.request(uri, data, params, API.EndpointMethods.Put);
  }
  public async del(uri: any, params: any = {}): Promise<any> {
    return await this.request(
      uri,
      undefined,
      params,
      API.EndpointMethods.Delete
    );
  }
  public async patch(uri: any, data: any, params: any = {}): Promise<any> {
    return await this.request(uri, data, params, API.EndpointMethods.Patch);
  }
}

const tunnel: ITunnel = new APITunnel();

export default tunnel;
