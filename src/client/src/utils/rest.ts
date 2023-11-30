const restWrapper = async <R = unknown>(
  url: string,
  options: RequestInit
): Promise<R> => {
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
  });

  if (!response.ok) {
    throw response;
  }

  return await response.json();
};

const post = <R = unknown, B = unknown>(
  url: string,
  body: B,
  options: RequestInit = {}
): Promise<R> =>
  restWrapper(url, {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

const put = <R = unknown, B = unknown>(
  url: string,
  body: B,
  options: RequestInit = {}
): Promise<R> =>
  restWrapper(url, {
    method: 'PUT',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

const get = <R = unknown>(url: string, options: RequestInit = {}): Promise<R> =>
  restWrapper(url, {
    method: 'GET',
    ...options,
  });

const del = <R = unknown>(url: string, options: RequestInit = {}): Promise<R> =>
  restWrapper(url, {
    method: 'DELETE',
    ...options,
  });

const patch = <R = unknown, B = unknown>(
  url: string,
  body: B,
  options: RequestInit = {}
): Promise<R> =>
  restWrapper(url, {
    method: 'PATCH',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

const rest = {
  post,
  put,
  get,
  del,
  patch,
} as const;

export { post, put, get, del };

export default rest;
