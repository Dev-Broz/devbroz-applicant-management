import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CustomFilter, AIFilterCriteria } from '@/types/applicant';
import { Json } from '@/integrations/supabase/types';

interface DbCustomFilter {
  id: string;
  name: string;
  description: string | null;
  filter_criteria: Json;
  original_query: string | null;
  matched_applicant_ids: string[] | null;
  created_at: string;
  updated_at: string;
}

const transformDbFilter = (dbFilter: DbCustomFilter): CustomFilter => ({
  id: dbFilter.id,
  name: dbFilter.name,
  description: dbFilter.description || undefined,
  filterCriteria: dbFilter.filter_criteria as unknown as AIFilterCriteria,
  originalQuery: dbFilter.original_query || undefined,
  matchedApplicantIds: dbFilter.matched_applicant_ids || undefined,
  createdAt: dbFilter.created_at,
});

export function useCustomFilters() {
  return useQuery({
    queryKey: ['custom-filters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_filters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as DbCustomFilter[]).map(transformDbFilter);
    },
  });
}

export function useSaveCustomFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filter: Omit<CustomFilter, 'id' | 'createdAt'>) => {
      const insertData = {
        name: filter.name,
        description: filter.description || null,
        filter_criteria: filter.filterCriteria as unknown as Json,
        original_query: filter.originalQuery || null,
        matched_applicant_ids: filter.matchedApplicantIds || null,
      };
      
      const { data, error } = await supabase
        .from('custom_filters')
        .insert([insertData])
        .select()
        .single();

      if (error) throw error;
      return transformDbFilter(data as DbCustomFilter);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-filters'] });
    },
  });
}

export function useDeleteCustomFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filterId: string) => {
      const { error } = await supabase
        .from('custom_filters')
        .delete()
        .eq('id', filterId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-filters'] });
    },
  });
}
