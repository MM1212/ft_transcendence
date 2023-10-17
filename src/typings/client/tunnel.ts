import * as API from '@typings/api';

export interface ITunnel {
  get<T extends API.Endpoint<API.EndpointMethods.Get, API.Endpoints.All>>(
    uri: API.EndpointTarget<T>,
    params: API.EndpointParams<T>
  ): Promise<API.EndpointResponse<T>>;
  post<
    T extends API.Endpoint<API.EndpointMethods.Post, API.Endpoints.All>,
  >(
    uri: API.EndpointTarget<T>,
    data: API.EndpointData<T>,
    params?: API.EndpointParams<T>
  ): Promise<API.EndpointResponse<T>>;
  put<
    T extends API.Endpoint<API.EndpointMethods.Put, API.Endpoints.All>,
  >(
    uri: API.EndpointTarget<T>,
    data: API.EndpointData<T>,
    params: API.EndpointParams<T>
  ): Promise<API.EndpointResponse<T>>;
  delete<
    T extends API.Endpoint<API.EndpointMethods.Delete, API.Endpoints.All>,
  >(
    uri: API.EndpointTarget<T>,
    params: API.EndpointParams<T>
  ): Promise<API.EndpointResponse<T>>;
  patch<
    T extends API.Endpoint<API.EndpointMethods.Patch, API.Endpoints.All>,
  >(
    uri: API.EndpointTarget<T>,
    data: API.EndpointData<T>,
    params: API.EndpointParams<T>
  ): Promise<API.EndpointResponse<T>>;
}
