import type * as API from '@typings/api/response';
import { GroupEnumValues } from '@typings/utils';

export enum EndpointMethods {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Delete = 'DELETE',
  Patch = 'PATCH',
}

export interface Endpoint<
  M extends EndpointMethods,
  T extends string,
  R = unknown,
  D = unknown,
  P extends unknown = unknown
> {
  method: M;
  type: T;
  _r: R;
  response: API.Response<R>;
  data: D;
  params: P;
}

export type EndpointTarget<T extends Endpoint<EndpointMethods, string>> =
  T['type'];
export type EndpointResponse<T extends Endpoint<EndpointMethods, string>> =
  T['response'];
export type InternalEndpointResponse<
  T extends Endpoint<EndpointMethods, string>
> = T['_r'];
export type EndpointData<T extends Endpoint<EndpointMethods, string>> =
  T['data'];
export type EndpointParams<T extends Endpoint<EndpointMethods, string>> =
  T['params'];
export type EndpointMethod<T extends Endpoint<EndpointMethods, string>> =
  T['method'];

export type BuildEndpoint<T extends Endpoint<EndpointMethods, string>> = (
  target: EndpointTarget<T>,
  params: EndpointParams<T>
) => string;

// T is the enum of all endpoints
// Returns an string union of all the enum values
export type GroupEndpointTargets<T extends string> = GroupEnumValues<T>;
export interface EndpointRegistry {
  [EndpointMethods.Get]: {};
  [EndpointMethods.Post]: {};
  [EndpointMethods.Put]: {};
  [EndpointMethods.Delete]: {};
  [EndpointMethods.Patch]: {};
}
export interface GetEndpoint<
  T extends string,
  R = unknown,
  P extends Record<string, unknown> = Record<string, unknown>
> extends Endpoint<EndpointMethods.Get, T, R, undefined, P> {}
