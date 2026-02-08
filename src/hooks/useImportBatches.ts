import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useImportBatches(limit: number = 10) {
  return useQuery({
    queryKey: ['import-batches', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('import_batches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}
