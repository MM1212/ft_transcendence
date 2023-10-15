import * as API from '@typings/api';
import rest from '@utils/rest';

class APITunnel {
  private readonly endpoint: string = import.meta.env.FRONTEND_API_ENDPOINT;

  private buildUrl(uri: API.Endpoints.All): string {
    return `${this.endpoint}${uri}`;
  }
  private buildEndpoint<
    T extends API.Endpoint<API.EndpointMethods, API.Endpoints.All>,
  >(uri: API.EndpointTarget<T>, params: API.EndpointParams<T>): string {
    const url = this.buildUrl(uri).replace(/{([^}]+)}/g, (_, key) => {
      const value = params[key];
      if (!value)
        throw new Error(`Missing parameter '${key}' for endpoint '${uri}'`);
      delete params[key];
      return `${value}`;
    });

    const query = new URLSearchParams();
    if (params)
      for (const [key, value] of Object.entries(params))
        query.set(key, value?.toString() ?? `${value}`);
    return `${url}?${query}`;
  }
  private async request<
    T extends API.Endpoint<API.EndpointMethods, API.Endpoints.All>,
  >(
    uri: API.EndpointTarget<T>,
    data: API.EndpointData<T>,
    params: API.EndpointParams<T>,
    method: API.EndpointMethod<T>
  ): Promise<API.EndpointResponse<T>> {
    const url = this.buildEndpoint(uri, params);
    try {
      switch (method) {
        case API.EndpointMethods.Get:
          return await rest.get<API.EndpointResponse<T>>(url);
        case API.EndpointMethods.Post:
          return await rest.post<API.EndpointResponse<T>>(url, data);
        case API.EndpointMethods.Put:
          return await rest.put<API.EndpointResponse<T>>(url, data);
        case API.EndpointMethods.Delete:
          return await rest.del<API.EndpointResponse<T>>(url);
        case API.EndpointMethods.Patch:
          return await rest.patch<API.EndpointResponse<T>>(url, data);
        default:
          return await rest.get<API.EndpointResponse<T>>(url);
      }
    } catch (err: any) {
      return API.buildErrorResponse(err.message);
    }
  }
  public async get<
    T extends API.Endpoint<API.EndpointMethods.Get, API.Endpoints.All>,
  >(
    uri: API.EndpointTarget<T>,
    params: API.EndpointParams<T>
  ): Promise<API.EndpointResponse<T>> {
    return await this.request<T>(
      uri,
      undefined,
      params,
      API.EndpointMethods.Get
    );
  }
  public async post<
    T extends API.Endpoint<API.EndpointMethods.Post, API.Endpoints.All>,
  >(
    uri: API.EndpointTarget<T>,
    data: API.EndpointData<T>,
    params: API.EndpointParams<T> = {}
  ): Promise<API.EndpointResponse<T>> {
    return await this.request<T>(uri, data, params, API.EndpointMethods.Post);
  }
  public async put<
    T extends API.Endpoint<API.EndpointMethods.Put, API.Endpoints.All>,
  >(
    uri: API.EndpointTarget<T>,
    data: API.EndpointData<T>,
    params: API.EndpointParams<T> = {}
  ): Promise<API.EndpointResponse<T>> {
    return await this.request<T>(uri, data, params, API.EndpointMethods.Put);
  }
  public async delete<
    T extends API.Endpoint<API.EndpointMethods.Delete, API.Endpoints.All>,
  >(
    uri: API.EndpointTarget<T>,
    params: API.EndpointParams<T> = {}
  ): Promise<API.EndpointResponse<T>> {
    return await this.request<T>(
      uri,
      undefined,
      params,
      API.EndpointMethods.Delete
    );
  }
  public async patch<
    T extends API.Endpoint<API.EndpointMethods.Patch, API.Endpoints.All>,
  >(
    uri: API.EndpointTarget<T>,
    data: API.EndpointData<T>,
    params: API.EndpointParams<T> = {}
  ): Promise<API.EndpointResponse<T>> {
    return await this.request<T>(uri, data, params, API.EndpointMethods.Patch);
  }
}

const tunnel = new APITunnel();

export default tunnel;
