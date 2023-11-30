import { useLocation } from 'wouter';
import { useSearch } from 'wouter/use-location';

const useQuery = <T>(): T => {
  const queryString = useSearch();
  const query = new URLSearchParams(queryString);
  return [...query.entries()].reduce((acc, [key, value]) => {
    return { ...acc, [key]: value };
  }, {}) as T;
};

export default useQuery;