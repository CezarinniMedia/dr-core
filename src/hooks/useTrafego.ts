import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Histórico de tráfego por domínio (para gráficos)
export function useTrafegoHistorico(dominio: string, periodoTipo: string = 'MENSAL') {
  return useQuery({
    queryKey: ['trafego', dominio, periodoTipo],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('trafego_historico')
        .select('*')
        .eq('dominio', dominio)
        .eq('periodo_tipo', periodoTipo)
        .order('periodo_data', { ascending: true })
        .limit(24);

      if (error) throw error;
      return data;
    },
    enabled: !!dominio,
  });
}

// Comparação de tráfego entre múltiplos domínios
export function useTrafegoComparacao(dominios: string[]) {
  return useQuery({
    queryKey: ['trafego', 'comparacao', dominios],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('trafego_historico')
        .select('*')
        .in('dominio', dominios)
        .eq('periodo_tipo', 'MENSAL')
        .order('periodo_data', { ascending: true });

      if (error) throw error;

      // Agrupar por domínio para charts
      const grouped: Record<string, any[]> = {};
      (data as any[])?.forEach(row => {
        if (!grouped[row.dominio]) grouped[row.dominio] = [];
        grouped[row.dominio].push(row);
      });

      return grouped;
    },
    enabled: dominios.length > 0,
  });
}
