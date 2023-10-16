import useSWR, { SWRConfiguration } from 'swr';
import * as API from '@typings/api';
// export const jsonFetcher = <T>(url: string, init?: RequestInit) =>
//   fetch(url, init).then((res) => res.json() as Promise<T>);

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

export const buildTunnelEndpoint = (endpoint: API.Endpoints.All): string =>
  `${import.meta.env.FRONTEND_API_ENDPOINT}${endpoint}`;
export const useTunnelEndpoint = <
  T extends API.Endpoint<API.EndpointMethods, API.Endpoints.All>,
>(
  endpoint: API.EndpointTarget<T>,
  options: SWRConfiguration<API.EndpointResponse<T>> = {},
  fetcher: (
    url: string,
    init?: RequestInit
  ) => Promise<API.EndpointResponse<T>> = jsonFetcher<API.EndpointResponse<T>>
) =>
  useSWR<API.EndpointResponse<T>>(
    buildTunnelEndpoint(endpoint),
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
