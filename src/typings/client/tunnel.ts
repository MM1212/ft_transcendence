import * as API from '@typings/api';
import { GroupEnumValues } from '@typings/utils';

export type PickEndpoints<M extends API.EndpointMethods> = {
  [K in keyof API.Endpoints.Registry as API.EndpointMethod<
    API.Endpoints.Registry[K]
  > extends M
    ? K
    : never]: API.EndpointMethod<API.Endpoints.Registry[K]> extends M
    ? API.Endpoints.Registry[K]
    : never;
};

export interface ITunnel {
  get<
    T extends keyof PickEndpoints<API.EndpointMethods.Get>,
    E extends PickEndpoints<API.EndpointMethods.Get>[T]
  >(
    uri: GroupEnumValues<T>,
    params?: API.EndpointParams<E>
  ): Promise<API.EndpointResponse<E>>;
  post<
    T extends keyof PickEndpoints<API.EndpointMethods.Post>,
    E extends PickEndpoints<API.EndpointMethods.Post>[T]
  >(
    uri: GroupEnumValues<T>,
    data: API.EndpointData<E>,
    params?: API.EndpointParams<E>
  ): Promise<API.EndpointResponse<E>>;
  put<
    T extends keyof PickEndpoints<API.EndpointMethods.Put>,
    E extends PickEndpoints<API.EndpointMethods.Put>[T]
  >(
    uri: GroupEnumValues<T>,
    data: API.EndpointData<E>,
    params: API.EndpointParams<E>
  ): Promise<API.EndpointResponse<E>>;
  del<
    T extends keyof PickEndpoints<API.EndpointMethods.Delete>,
    E extends PickEndpoints<API.EndpointMethods.Delete>[T]
  >(
    uri: GroupEnumValues<T>,
    params: API.EndpointParams<E>
  ): Promise<API.EndpointResponse<E>>;
  patch<
    T extends keyof PickEndpoints<API.EndpointMethods.Patch>,
    E extends PickEndpoints<API.EndpointMethods.Patch>[T]
  >(
    uri: GroupEnumValues<T>,
    data: API.EndpointData<E>,
    params: API.EndpointParams<E>
  ): Promise<API.EndpointResponse<E>>;
}
