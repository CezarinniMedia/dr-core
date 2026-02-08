import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ===== FOOTPRINTS =====
export function useArsenalFootprints(categoria?: string) {
  return useQuery({
    queryKey: ['arsenal', 'footprints', categoria],
    queryFn: async () => {
      let query = (supabase as any)
        .from('arsenal_footprints')
        .select('*')
        .order('eficacia', { ascending: true })
        .order('vezes_usado', { ascending: false });

      if (categoria) query = query.eq('categoria', categoria);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useIncrementFootprintUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: current } = await (supabase as any)
        .from('arsenal_footprints')
        .select('vezes_usado')
        .eq('id', id)
        .single();

      const { error } = await (supabase as any)
        .from('arsenal_footprints')
        .update({
          vezes_usado: (current?.vezes_usado || 0) + 1,
          ultima_verificacao: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arsenal', 'footprints'] });
    },
  });
}

// ===== KEYWORDS =====
export function useArsenalKeywords(tipo?: string) {
  return useQuery({
    queryKey: ['arsenal', 'keywords', tipo],
    queryFn: async () => {
      let query = (supabase as any)
        .from('arsenal_keywords')
        .select('*')
        .order('vezes_usado', { ascending: false });

      if (tipo) query = query.eq('tipo', tipo);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// ===== DORKS =====
export function useArsenalDorks(tipo?: string) {
  return useQuery({
    queryKey: ['arsenal', 'dorks', tipo],
    queryFn: async () => {
      let query = (supabase as any)
        .from('arsenal_dorks')
        .select('*')
        .order('vezes_usado', { ascending: false });

      if (tipo) query = query.eq('tipo', tipo);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
