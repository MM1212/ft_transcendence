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
export const useTunnelEndpoint = <
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

export class FetchError extends Error {
  response: Response;
  data: {
    message: string;
  };
  constructor({
    message,
    response,
    data,
  }: {
    message: string;
    response: Response;
    data: {
      message: string;
    };
  }) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(message);

    this.name = 'FetchError';
    this.response = response;
    this.data = data ?? { message: message };
  }
}
