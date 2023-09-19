import API, { Endpoints } from '@typings/api';
import useSWR, { SWRConfiguration } from 'swr';

// export const jsonFetcher = <T>(url: string, init?: RequestInit) =>
//   fetch(url, init).then((res) => res.json() as Promise<T>);

export async function jsonFetcher<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, init);

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

export const useTunnelEndpoint = <T>(
  endpoint: Endpoints,
  options: SWRConfiguration<API.Response<T>> = {},
  fetcher: (
    url: string,
    init?: RequestInit
  ) => Promise<API.Response<T>> = jsonFetcher<API.Response<T>>
) =>
  useSWR<API.Response<T>>(
    `${import.meta.env.FRONTEND_API_ENDPOINT}${endpoint}`,
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
