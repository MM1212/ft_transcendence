import * as API from '@typings/api';

export type PickEndpoints<M extends API.EndpointMethods = API.EndpointMethods> =
  API.Endpoints.Registry[M];

export interface ITunnel {
  buildEndpoint<
    T extends API.Endpoint<API.EndpointMethods, API.Endpoints.All>,
  >(
    uri: API.EndpointTarget<T>,
    params?: API.EndpointParams<T>
  ): string;
  get<
    T extends keyof PickEndpoints<API.EndpointMethods.Get>,
    E extends PickEndpoints<API.EndpointMethods.Get>[T]
  >(
    uri: T,
    params?: API.EndpointParams<E>
  ): Promise<API.EndpointResponse<E>>;
  post<
    T extends keyof PickEndpoints<API.EndpointMethods.Post>,
    E extends PickEndpoints<API.EndpointMethods.Post>[T]
  >(
    uri: T,
    data: API.EndpointData<E>,
    params?: API.EndpointParams<E>
  ): Promise<API.EndpointResponse<E>>;
  put<
    T extends keyof PickEndpoints<API.EndpointMethods.Put>,
    E extends PickEndpoints<API.EndpointMethods.Put>[T]
  >(
    uri: T,
    data: API.EndpointData<E>,
    params?: API.EndpointParams<E>
  ): Promise<API.EndpointResponse<E>>;
  del<
    T extends keyof PickEndpoints<API.EndpointMethods.Delete>,
    E extends PickEndpoints<API.EndpointMethods.Delete>[T]
  >(
    uri: T,
    params?: API.EndpointParams<E>
  ): Promise<API.EndpointResponse<E>>;
  patch<
    T extends keyof PickEndpoints<API.EndpointMethods.Patch>,
    E extends PickEndpoints<API.EndpointMethods.Patch>[T]
  >(
    uri: T,
    data: API.EndpointData<E>,
    params?: API.EndpointParams<E>
  ): Promise<API.EndpointResponse<E>>;
}
