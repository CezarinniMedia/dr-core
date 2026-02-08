import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TrafficPoint {
  dominio: string;
  periodo_data: string;
  visitas: number;
  visitas_unicas?: number;
  bounce_rate?: number;
  pages_per_visit?: number;
  avg_visit_duration?: number;
  fonte_dados?: string;
}

export interface TrafficSummary {
  dominio: string;
  trafegoAtual: number;
  trafegoAnterior: number;
  delta: number; // % change
  tendencia: 'up' | 'down' | 'stable';
  totalPontos: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

export function useTrafficData(
  dominios: string[],
  periodoTipo: string = 'MENSAL',
  dateRange?: DateRange
) {
  return useQuery({
    queryKey: ['traffic-data', dominios, periodoTipo, dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async () => {
      if (dominios.length === 0) return { points: [], summaries: [], chartData: [] };

      let query = supabase
        .from('trafego_historico')
        .select('dominio, periodo_data, visitas, visitas_unicas, bounce_rate, pages_per_visit, avg_visit_duration, fonte_dados')
        .in('dominio', dominios)
        .eq('periodo_tipo', periodoTipo)
        .order('periodo_data', { ascending: true });

      if (dateRange?.from) {
        query = query.gte('periodo_data', dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange?.to) {
        query = query.lte('periodo_data', dateRange.to.toISOString().split('T')[0]);
      }

      const { data, error } = await query.limit(1000);
      if (error) throw error;

      const points = (data || []) as TrafficPoint[];

      // Group by domain
      const byDomain: Record<string, TrafficPoint[]> = {};
      points.forEach(p => {
        if (!byDomain[p.dominio]) byDomain[p.dominio] = [];
        byDomain[p.dominio].push(p);
      });

      // Build summaries
      const summaries: TrafficSummary[] = dominios.map(dom => {
        const pts = byDomain[dom] || [];
        const sorted = [...pts].sort((a, b) => a.periodo_data.localeCompare(b.periodo_data));
        const current = sorted[sorted.length - 1]?.visitas || 0;
        const previous = sorted.length >= 2 ? sorted[sorted.length - 2]?.visitas || 0 : 0;
        const delta = previous > 0 ? ((current - previous) / previous) * 100 : 0;

        return {
          dominio: dom,
          trafegoAtual: current,
          trafegoAnterior: previous,
          delta: Math.round(delta * 10) / 10,
          tendencia: delta > 5 ? 'up' : delta < -5 ? 'down' : 'stable',
          totalPontos: pts.length,
        };
      });

      // Build recharts-compatible data: array of { date, domain1, domain2, ... }
      const allDates = [...new Set(points.map(p => p.periodo_data))].sort();
      const chartData = allDates.map(date => {
        const entry: Record<string, any> = { date };
        dominios.forEach(dom => {
          const point = points.find(p => p.dominio === dom && p.periodo_data === date);
          entry[dom] = point?.visitas || null;
        });
        return entry;
      });

      return { points, summaries, chartData, byDomain };
    },
    enabled: dominios.length > 0,
  });
}

// Sparkline data for a single domain (last 6 months)
export function useTrafficSparkline(dominio: string | undefined) {
  return useQuery({
    queryKey: ['traffic-sparkline', dominio],
    queryFn: async () => {
      if (!dominio) return [];

      const { data, error } = await supabase
        .from('trafego_historico')
        .select('periodo_data, visitas')
        .eq('dominio', dominio)
        .eq('periodo_tipo', 'MENSAL')
        .order('periodo_data', { ascending: true })
        .limit(6);

      if (error) throw error;
      return (data || []).map(d => ({ date: d.periodo_data, value: d.visitas || 0 }));
    },
    enabled: !!dominio,
  });
}

// Available domains for domain picker
export function useAvailableDomains() {
  return useQuery({
    queryKey: ['available-domains'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ofertas')
        .select('id, nome, dominio_principal')
        .not('dominio_principal', 'is', null)
        .order('nome');

      if (error) throw error;
      return (data || []).filter(d => d.dominio_principal);
    },
  });
}
