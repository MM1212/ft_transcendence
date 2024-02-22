import useSWR, { SWRConfiguration } from 'swr';
import * as API from '@typings/api';
import tunnel from '@lib/tunnel';

export async function jsonFetcher<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, {
    credentials: 'include',
    ...init,
  });

  const data = await response.json();
  if (response.ok) {
    return data;
  }

  throw new FetchError({
    message: response.statusText,
    response,
    data,
  });
}

export const buildTunnelEndpoint = (
  endpoint: API.Endpoints.All,
  params: Record<string, unknown> = {}
): string => {
  return tunnel.buildEndpoint(endpoint, params);
};
export const useRawTunnelEndpoint = <
  T extends API.Endpoint<API.EndpointMethods, API.Endpoints.All>,
>(
  endpoint: API.EndpointTarget<T> | null,
  params: API.EndpointParams<T> = {},
  options: SWRConfiguration<API.EndpointResponse<T>> = {},
  fetcher: (
    url: string,
    init?: RequestInit
  ) => Promise<API.EndpointResponse<T>> = jsonFetcher<API.EndpointResponse<T>>
) =>
  useSWR<API.EndpointResponse<T>>(
    endpoint
      ? buildTunnelEndpoint(endpoint, params as Record<string, unknown>)
      : null,
    fetcher,
    options
  );

const apiFetcher = async <T>(
  url: RequestInfo,
  init?: RequestInit
): Promise<T> => {
  try {
    const resp = await jsonFetcher<API.Response<T>>(url, init);
    if (resp.status !== 'ok') throw new Error(resp.errorMsg ?? 'Unknown error');
    return resp.data;
  } catch (err: any) {
    if (err instanceof FetchError) {
      const apiError = err as FetchError<API.Response<T>>;
      if (apiError.data.status !== 'ok' && apiError.data.errorMsg) {
        throw new Error(apiError.data.errorMsg);
      }
    }
    throw err;
  }
};

export const useTunnelEndpoint = <
  T extends API.Endpoint<API.EndpointMethods, API.Endpoints.All>,
>(
  endpoint: API.EndpointTarget<T> | null,
  params: API.EndpointParams<T> = {},
  options: SWRConfiguration<API.InternalEndpointResponse<T>> = {},
  fetcher: (
    url: string,
    init?: RequestInit
  ) => Promise<API.InternalEndpointResponse<T>> = apiFetcher<
    API.InternalEndpointResponse<T>
  >
) =>
  useSWR<API.InternalEndpointResponse<T>>(
    endpoint
      ? buildTunnelEndpoint(endpoint, params as Record<string, unknown>)
      : null,
    fetcher,
    options
  );

export class FetchError<T> extends Error {
  response: Response;
  data: T;
  constructor({
    message,
    response,
    data,
  }: {
    message: string;
    response: Response;
    data: T;
  }) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(message);

    this.name = 'FetchError';
    this.response = response;
    this.data = data ?? ({ message: message } as any);
  }
}
