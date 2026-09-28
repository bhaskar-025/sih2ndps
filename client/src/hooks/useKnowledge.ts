import { useQuery } from '@tanstack/react-query';
import { knowledgeService } from '../services/knowledgeService';

export const useKnowledgeOverview = () => {
  return useQuery({
    queryKey: ['knowledge-overview'],
    queryFn: () => knowledgeService.getOverview(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useKnowledgeSearch = (params: {
  q?: string;
  department?: string;
  industry?: string;
  category?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['knowledge-search', params],
    queryFn: () => knowledgeService.search(params),
    enabled: Boolean(params.q || params.department || params.industry || params.category),
    staleTime: 1000 * 60 * 2,
  });
};

export const useDepartmentKnowledge = (idOrCode: string | undefined) => {
  return useQuery({
    queryKey: ['department-knowledge', idOrCode],
    queryFn: () => (idOrCode ? knowledgeService.getDepartmentProfile(idOrCode) : Promise.reject('No ID')),
    enabled: Boolean(idOrCode),
    staleTime: 1000 * 60 * 5,
  });
};

export const useFAQs = (params?: {
  department?: string;
  category?: string;
  keyword?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['regulatory-faqs', params],
    queryFn: () => knowledgeService.getFAQs(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useRegulations = (params?: {
  department?: string;
  industry?: string;
  actName?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['statutory-regulations', params],
    queryFn: () => knowledgeService.getRegulations(params),
    staleTime: 1000 * 60 * 5,
  });
};

export default useKnowledgeOverview;
