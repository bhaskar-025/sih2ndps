import { useQuery } from '@tanstack/react-query';
import { schemeService } from '../services/schemeService';

export const useSchemes = () => {
  const query = useQuery({
    queryKey: ['incentive-schemes'],
    queryFn: () => schemeService.getSchemes(),
    staleTime: 1000 * 60 * 10, // 10 mins
  });

  return {
    schemes: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useScheme = (id: string | undefined) => {
  return useQuery({
    queryKey: ['incentive-scheme', id],
    queryFn: () => (id ? schemeService.getSchemeById(id) : Promise.reject('No ID')),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 10,
  });
};

export default useSchemes;
