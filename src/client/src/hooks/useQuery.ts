import { useLocation } from 'wouter';

const useQuery = <T>(): T => {
  const [location]: [string] = useLocation();
  const query = new URLSearchParams(location);
  return [...query.entries()].reduce((acc, [key, value]) => {
    return { ...acc, [key]: value };
  }, {}) as T;
};

export default useQuery;