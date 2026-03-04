import { supabase } from '@/integrations/supabase/client';

export const DEMO_TAG = '__demo__';

// ─── Context ──────────────────────────────────────────
async function getContext() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Não autenticado');
  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .single();
  if (!data) throw new Error('Workspace não encontrado');
  return { wsId: data.workspace_id, userId: user.id };
}

// ─── Helpers ──────────────────────────────────────────
function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString();
}

function monthDate(monthsAgo: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

// ─── Offer Definitions ───────────────────────────────
interface OfferDef {
  nome: string;
  vertical: string;
  geo: string;
  status: string;
  priority: number;
  baseTraffic: number;
  trend: 'up' | 'down' | 'stable' | 'spike';
  ticket: number;
}

const OFFER_DEFS: OfferDef[] = [
  // HOT (5)
  { nome: 'Detox Slim Pro', vertical: 'emagrecimento', geo: 'BR', status: 'HOT', priority: 5, baseTraffic: 450000, trend: 'up', ticket: 197 },
  { nome: 'Crypto Profit AI', vertical: 'financas', geo: 'BR', status: 'HOT', priority: 5, baseTraffic: 320000, trend: 'up', ticket: 497 },
  { nome: 'Keto Burn Ultra', vertical: 'emagrecimento', geo: 'US', status: 'HOT', priority: 4, baseTraffic: 580000, trend: 'up', ticket: 67 },
  { nome: 'AmorVida Plus', vertical: 'relacionamento', geo: 'BR', status: 'HOT', priority: 4, baseTraffic: 210000, trend: 'up', ticket: 147 },
  { nome: 'GlicoPure Control', vertical: 'saude', geo: 'BR', status: 'HOT', priority: 5, baseTraffic: 390000, trend: 'spike', ticket: 197 },
  // SCALING (3)
  { nome: 'FatKiller 360', vertical: 'emagrecimento', geo: 'BR', status: 'SCALING', priority: 5, baseTraffic: 720000, trend: 'stable', ticket: 197 },
  { nome: 'InvestBot Premium', vertical: 'financas', geo: 'BR', status: 'SCALING', priority: 4, baseTraffic: 510000, trend: 'stable', ticket: 997 },
  { nome: 'DermaGlow Serum', vertical: 'skincare', geo: 'US', status: 'SCALING', priority: 4, baseTraffic: 340000, trend: 'stable', ticket: 49 },
  // ANALYZING (5)
  { nome: 'NeuroFocus Max', vertical: 'saude', geo: 'BR', status: 'ANALYZING', priority: 3, baseTraffic: 180000, trend: 'up', ticket: 247 },
  { nome: 'TestoForce Alpha', vertical: 'masculino', geo: 'BR', status: 'ANALYZING', priority: 3, baseTraffic: 150000, trend: 'up', ticket: 197 },
  { nome: 'HairGrowth Pro', vertical: 'beleza', geo: 'BR', status: 'ANALYZING', priority: 3, baseTraffic: 120000, trend: 'stable', ticket: 147 },
  { nome: 'SkinRevive Complex', vertical: 'skincare', geo: 'ES', status: 'ANALYZING', priority: 2, baseTraffic: 90000, trend: 'stable', ticket: 39 },
  { nome: 'TradeMaster Pro', vertical: 'financas', geo: 'US', status: 'ANALYZING', priority: 3, baseTraffic: 260000, trend: 'up', ticket: 297 },
  // RADAR (6)
  { nome: 'MemoryBoost IQ', vertical: 'saude', geo: 'BR', status: 'RADAR', priority: 2, baseTraffic: 75000, trend: 'stable', ticket: 197 },
  { nome: 'DiabeFree Natural', vertical: 'saude', geo: 'BR', status: 'RADAR', priority: 2, baseTraffic: 60000, trend: 'stable', ticket: 247 },
  { nome: 'CollagenPure Elite', vertical: 'beleza', geo: 'PT', status: 'RADAR', priority: 1, baseTraffic: 45000, trend: 'stable', ticket: 49 },
  { nome: 'ArticularFlex Pro', vertical: 'saude', geo: 'BR', status: 'RADAR', priority: 2, baseTraffic: 55000, trend: 'stable', ticket: 197 },
  { nome: 'RendaExtra Digital', vertical: 'marketing_digital', geo: 'BR', status: 'RADAR', priority: 1, baseTraffic: 40000, trend: 'up', ticket: 47 },
  { nome: 'BetWin Analytics', vertical: 'apostas', geo: 'BR', status: 'RADAR', priority: 2, baseTraffic: 95000, trend: 'spike', ticket: 97 },
  // CLONED (2)
  { nome: 'EmagrecePlus Turbo', vertical: 'emagrecimento', geo: 'BR', status: 'CLONED', priority: 4, baseTraffic: 350000, trend: 'stable', ticket: 197 },
  { nome: 'LibidoMax Power', vertical: 'masculino', geo: 'BR', status: 'CLONED', priority: 3, baseTraffic: 200000, trend: 'down', ticket: 247 },
  // DEAD (2)
  { nome: 'ProstaGuard Plus', vertical: 'saude', geo: 'US', status: 'DEAD', priority: 1, baseTraffic: 15000, trend: 'down', ticket: 67 },
  { nome: 'AfiliaForce Mastermind', vertical: 'marketing_digital', geo: 'BR', status: 'DEAD', priority: 1, baseTraffic: 8000, trend: 'down', ticket: 997 },
  // VAULT (1) + DYING (1)
  { nome: 'VisionClear HD', vertical: 'saude', geo: 'BR', status: 'VAULT', priority: 3, baseTraffic: 280000, trend: 'stable', ticket: 197 },
  { nome: 'CardioShield Plus', vertical: 'saude', geo: 'BR', status: 'DYING', priority: 2, baseTraffic: 35000, trend: 'down', ticket: 297 },
];

// ─── Traffic Generator ───────────────────────────────
function generateTraffic(
  offerId: string, domain: string, wsId: string,
  base: number, trend: string
) {
  const records = [];
  for (let m = 11; m >= 0; m--) {
    const progress = (11 - m) / 11;
    let mult: number;
    switch (trend) {
      case 'up':
        mult = 0.4 + progress * 0.8 + (Math.random() * 0.15 - 0.075);
        break;
      case 'down':
        mult = 1.2 - progress * 0.85 + (Math.random() * 0.15 - 0.075);
        break;
      case 'spike':
        mult = 0.85 + Math.random() * 0.2;
        if (m >= 1 && m <= 3) mult = 2.2 + Math.random() * 0.8;
        break;
      default:
        mult = 0.8 + Math.random() * 0.4;
    }
    const visits = Math.max(Math.round(base * mult), 100);
    records.push({
      spied_offer_id: offerId,
      domain,
      workspace_id: wsId,
      period_date: monthDate(m),
      visits,
      source: 'similarweb',
      period_type: 'monthly',
      unique_visitors: Math.round(visits * (0.6 + Math.random() * 0.15)),
      pages_per_visit: +(1.5 + Math.random() * 3).toFixed(1),
      avg_visit_duration: +(30 + Math.random() * 180).toFixed(0),
      bounce_rate: +(30 + Math.random() * 40).toFixed(1),
    });
  }
  return records;
}

// ─── Ofertas Próprias Definitions ────────────────────
const OFERTA_DEFS = [
  { nome: 'Operação Detox Slim', slug: 'demo-operacao-detox-slim', status: 'ATIVA', vertical: 'emagrecimento', mercado: 'BR', ticket_front: 197, cpa_target: 45, roas_target: 3.5, spiedName: 'Detox Slim Pro', source: 'clone' as const },
  { nome: 'Operação Crypto AI', slug: 'demo-operacao-crypto-ai', status: 'ATIVA', vertical: 'financas', mercado: 'BR', ticket_front: 497, cpa_target: 120, roas_target: 4.0, spiedName: 'Crypto Profit AI', source: 'clone' as const },
  { nome: 'Projeto NeuroMax', slug: 'demo-projeto-neuromax', status: 'TEST', vertical: 'saude', mercado: 'BR', ticket_front: 247, cpa_target: 60, roas_target: 3.0, spiedName: null, source: 'manual' as const },
  { nome: 'Projeto FatBurn BR', slug: 'demo-projeto-fatburn', status: 'RESEARCH', vertical: 'emagrecimento', mercado: 'BR', ticket_front: 197, cpa_target: null, roas_target: null, spiedName: null, source: 'manual' as const },
  { nome: 'Operação AmorVida', slug: 'demo-operacao-amorvida', status: 'PAUSE', vertical: 'relacionamento', mercado: 'BR', ticket_front: 147, cpa_target: null, roas_target: null, spiedName: 'AmorVida Plus', source: 'clone' as const },
  { nome: 'Projeto CDB Easy', slug: 'demo-projeto-cdb-easy', status: 'MORTA', vertical: 'financas', mercado: 'BR', ticket_front: 97, cpa_target: null, roas_target: null, spiedName: null, source: 'manual' as const },
];

// ─── Avatar Definitions ──────────────────────────────
const AVATAR_DEFS = [
  { nome: 'Maria - Mulher 35-50 Emagrecimento', ofertaNome: 'Operação Detox Slim', estado_atual: 'Acima do peso, frustrada com dietas que não funcionam', estado_desejado: 'Corpo saudável e confiança restaurada', pain_matrix: { dores: ['Não consegue emagrecer', 'Metabolismo lento', 'Baixa autoestima', 'Roupas não cabem'], intensidade: 8 }, desire_matrix: { desejos: ['Corpo saudável', 'Confiança', 'Energia', 'Usar roupas bonitas'], urgencia: 9 } },
  { nome: 'João - Homem 30-45 Investidor', ofertaNome: 'Operação Crypto AI', estado_atual: 'Quer investir mas tem medo de perder dinheiro', estado_desejado: 'Renda passiva e independência financeira', pain_matrix: { dores: ['Salário não cresce', 'Inflação corrói economias', 'Não entende investimentos'], intensidade: 7 }, desire_matrix: { desejos: ['Liberdade financeira', 'Renda passiva', 'Segurança'], urgencia: 8 } },
  { nome: 'Ana - Mulher 40-55 Saúde Cognitiva', ofertaNome: 'Projeto NeuroMax', estado_atual: 'Dificuldade de concentração e memória no trabalho', estado_desejado: 'Clareza mental e foco produtivo', pain_matrix: { dores: ['Esquecimento frequente', 'Falta de foco', 'Cansaço mental', 'Medo de demência'], intensidade: 7 }, desire_matrix: { desejos: ['Memória afiada', 'Produtividade', 'Clareza mental'], urgencia: 7 } },
  { nome: 'Pedro - Homem 25-40 Fitness', ofertaNome: 'Projeto FatBurn BR', estado_atual: 'Gordura abdominal resistente, sem tempo para academia', estado_desejado: 'Corpo definido com energia alta', pain_matrix: { dores: ['Barriga saliente', 'Sem tempo para academia', 'Dietas muito restritivas'], intensidade: 6 }, desire_matrix: { desejos: ['Corpo definido', 'Energia', 'Atratividade'], urgencia: 8 } },
  { nome: 'Fernanda - Mulher 30-45 Relacionamento', ofertaNome: 'Operação AmorVida', estado_atual: 'Relacionamento esfriando, distância emocional', estado_desejado: 'Conexão profunda e paixão renovada', pain_matrix: { dores: ['Parceiro distante', 'Rotina matou paixão', 'Insegurança'], intensidade: 8 }, desire_matrix: { desejos: ['Conexão emocional', 'Paixão', 'Segurança'], urgencia: 9 } },
  { nome: 'Sandra - Mulher 45-60 Anti-Aging', ofertaNome: null, estado_atual: 'Sinais de envelhecimento incomodam cada vez mais', estado_desejado: 'Pele jovem e radiante sem procedimentos invasivos', pain_matrix: { dores: ['Rugas visíveis', 'Manchas na pele', 'Flacidez', 'Procedimentos caros'], intensidade: 7 }, desire_matrix: { desejos: ['Pele jovem', 'Autoestima elevada', 'Receber elogios'], urgencia: 7 } },
  { nome: 'Carlos - Homem 35-50 Apostador', ofertaNome: null, estado_atual: 'Perde mais do que ganha em apostas esportivas', estado_desejado: 'Sistema lucrativo com gestão de banca disciplinada', pain_matrix: { dores: ['Perdas acumuladas', 'Sem método consistente', 'Aposta por impulso'], intensidade: 8 }, desire_matrix: { desejos: ['Lucro consistente', 'Controle emocional', 'Método comprovado'], urgencia: 9 } },
  { nome: 'Roberto - Homem 50-65 Saúde Masculina', ofertaNome: null, estado_atual: 'Problemas de próstata afetando qualidade de vida', estado_desejado: 'Saúde masculina restaurada naturalmente', pain_matrix: { dores: ['Idas frequentes ao banheiro', 'Noites mal dormidas', 'Medo de procedimentos'], intensidade: 8 }, desire_matrix: { desejos: ['Noites tranquilas', 'Disposição', 'Solução natural'], urgencia: 8 } },
];

// ─── Criativo Definitions ────────────────────────────
const CRIATIVO_DEFS = [
  { nome: 'VSL Detox Principal', ofertaNome: 'Operação Detox Slim', tipo: 'VIDEO', status: 'WINNER', hook: 'Médico revela substância natural que derrete gordura em 30 dias', plataforma: 'facebook', angulo: 'autoridade médica' },
  { nome: 'Carousel Detox Before/After', ofertaNome: 'Operação Detox Slim', tipo: 'CAROUSEL', status: 'TEST', hook: 'Veja a transformação de 3.847 mulheres em apenas 4 semanas', plataforma: 'facebook', angulo: 'prova social' },
  { nome: 'UGC Detox Depoimento', ofertaNome: 'Operação Detox Slim', tipo: 'VIDEO', status: 'DRAFT', hook: 'Perdi 12kg sem academia e sem dieta restritiva', plataforma: 'tiktok', angulo: 'testemunho' },
  { nome: 'VSL Crypto Principal', ofertaNome: 'Operação Crypto AI', tipo: 'VIDEO', status: 'WINNER', hook: 'IA prevê Bitcoin com 94% de acerto — veja os resultados ao vivo', plataforma: 'youtube', angulo: 'tecnologia + prova' },
  { nome: 'Static Crypto ROI', ofertaNome: 'Operação Crypto AI', tipo: 'IMAGEM', status: 'KILLED', hook: 'R$500 viraram R$47.000 em 90 dias usando esta IA', plataforma: 'facebook', angulo: 'resultado financeiro', decisionNotes: 'CTR 0.3%, CPA R$280 (target R$120). Público frio não converteu.' },
  { nome: 'VSL NeuroMax Focus', ofertaNome: 'Projeto NeuroMax', tipo: 'VIDEO', status: 'TEST', hook: 'Harvard confirma: esta substância turbina o cérebro em 7 dias', plataforma: 'facebook', angulo: 'autoridade científica' },
  { nome: 'Carousel NeuroMax Benefits', ofertaNome: 'Projeto NeuroMax', tipo: 'CAROUSEL', status: 'DRAFT', hook: '5 sinais de que seu cérebro está envelhecendo rápido demais', plataforma: 'instagram', angulo: 'medo + solução' },
  { nome: 'UGC FatBurn Gym', ofertaNome: 'Projeto FatBurn BR', tipo: 'VIDEO', status: 'DRAFT', hook: 'Personal trainer revela o verdadeiro segredo da barriga chapada', plataforma: 'tiktok', angulo: 'autoridade fitness' },
  { nome: 'VSL AmorVida Conexão', ofertaNome: 'Operação AmorVida', tipo: 'VIDEO', status: 'KILLED', hook: 'O método de 4 passos que salvou 12.000 casamentos', plataforma: 'facebook', angulo: 'prova social', decisionNotes: 'ROAS 0.8, público frio não engajou. Teste com público quente pendente.' },
  { nome: 'Static AmorVida Quiz', ofertaNome: 'Operação AmorVida', tipo: 'IMAGEM', status: 'TEST', hook: 'Descubra em 2 minutos se seu relacionamento tem salvação', plataforma: 'facebook', angulo: 'quiz + curiosidade' },
  { nome: 'VSL CDB Easy Renda', ofertaNome: 'Projeto CDB Easy', tipo: 'VIDEO', status: 'KILLED', hook: 'Ganhe R$3.000/mês com CDB sem sair de casa', plataforma: 'youtube', angulo: 'renda passiva', decisionNotes: 'Oferta morta — compliance barrou promessa de ganhos fixos' },
  { nome: 'Hook Test Emagrecimento A', ofertaNome: null, tipo: 'VIDEO', status: 'DRAFT', hook: 'Nutricionista chora ao revelar a verdade sobre emagrecimento', plataforma: 'tiktok', angulo: 'emoção + revelação' },
  { nome: 'Hook Test Finanças B', ofertaNome: null, tipo: 'IMAGEM', status: 'DRAFT', hook: 'O investimento que os bancos não querem que você conheça', plataforma: 'facebook', angulo: 'conspiração' },
  { nome: 'Hook Test Saúde C', ofertaNome: null, tipo: 'VIDEO', status: 'DRAFT', hook: 'Médico é processado por revelar remédio natural que a indústria esconde', plataforma: 'facebook', angulo: 'conspiração médica' },
  { nome: 'Hook Test Beleza D', ofertaNome: null, tipo: 'CAROUSEL', status: 'DRAFT', hook: 'Dermatologistas odeiam esse truque caseiro para rugas', plataforma: 'instagram', angulo: 'hack + truque' },
];

// ═══════════════════════════════════════════════════════
// SEED
// ═══════════════════════════════════════════════════════
export async function seedDemoData(onProgress?: (msg: string) => void) {
  const { wsId, userId } = await getContext();

  // Check if already seeded
  const { count } = await supabase
    .from('spied_offers')
    .select('*', { count: 'exact', head: true })
    .eq('discovery_source', DEMO_TAG)
    .eq('workspace_id', wsId);

  if (count && count > 0) {
    onProgress?.('Demo já ativo.');
    return;
  }

  // ── 1. Spied Offers ──
  onProgress?.('Inserindo ofertas espionadas (25)...');
  const offersPayload = OFFER_DEFS.map(o => ({
    nome: o.nome,
    main_domain: `${toSlug(o.nome)}.com`,
    vertical: o.vertical,
    geo: o.geo,
    status: o.status,
    priority: o.priority,
    product_ticket: o.ticket,
    estimated_monthly_traffic: o.baseTraffic,
    traffic_trend: o.trend,
    discovery_source: DEMO_TAG,
    workspace_id: wsId,
    notas: `**Vertical:** ${o.vertical} | **Geo:** ${o.geo} | **Ticket:** $${o.ticket}\n\n_Dado simulado para demo_`,
  }));

  const { data: offers, error: e1 } = await supabase
    .from('spied_offers')
    .insert(offersPayload)
    .select('id, nome, main_domain');

  if (e1 || !offers) throw new Error(`Erro spied_offers: ${e1?.message}`);

  const offerMap = new Map(offers.map(o => [o.nome, { id: o.id, domain: o.main_domain! }]));

  // ── 2. Domains ──
  onProgress?.('Inserindo domínios (50)...');
  const domainsPayload: Record<string, unknown>[] = [];
  for (const [nome, { id }] of offerMap) {
    const s = toSlug(nome);
    domainsPayload.push(
      { domain: `${s}.com`, url: `https://${s}.com`, domain_type: 'main', spied_offer_id: id, workspace_id: wsId, discovery_source: DEMO_TAG },
      { domain: `${s}.shop`, url: `https://${s}.shop`, domain_type: 'redirect', spied_offer_id: id, workspace_id: wsId, discovery_source: DEMO_TAG },
    );
  }
  await supabase.from('offer_domains').insert(domainsPayload);

  // ── 3. Traffic Data ──
  onProgress?.('Inserindo dados de tráfego (~600 registros)...');
  const trafficPayload: Record<string, unknown>[] = [];
  for (const def of OFFER_DEFS) {
    const entry = offerMap.get(def.nome);
    if (!entry) continue;
    const s = toSlug(def.nome);
    trafficPayload.push(
      ...generateTraffic(entry.id, `${s}.com`, wsId, def.baseTraffic, def.trend),
      ...generateTraffic(entry.id, `${s}.shop`, wsId, Math.round(def.baseTraffic * 0.3), def.trend),
    );
  }
  for (const batch of chunk(trafficPayload, 200)) {
    const { error } = await supabase
      .from('offer_traffic_data')
      .upsert(batch, { onConflict: 'spied_offer_id,domain,period_type,period_date' });
    if (error) console.warn('[DemoSeed] traffic warning:', error.message);
  }

  // ── 4. Ad Libraries ──
  onProgress?.('Inserindo bibliotecas de ads (25)...');
  const platforms = ['facebook', 'google', 'tiktok', 'taboola'];
  const libsPayload = [...offerMap.entries()].map(([nome, { id }]) => ({
    platform: platforms[rand(0, 3)],
    spied_offer_id: id,
    workspace_id: wsId,
    page_name: nome,
    page_url: `https://www.facebook.com/ads/library/?q=${encodeURIComponent(nome)}`,
    ad_count: rand(5, 150),
    notas: DEMO_TAG,
  }));
  await supabase.from('offer_ad_libraries').insert(libsPayload);

  // ── 5. Funnel Steps ──
  onProgress?.('Inserindo etapas de funil...');
  const funnelsPayload: Record<string, unknown>[] = [];
  for (const [nome, { id }] of offerMap) {
    const s = toSlug(nome);
    const def = OFFER_DEFS.find(o => o.nome === nome)!;
    funnelsPayload.push(
      { step_order: 1, step_type: 'presell', page_url: `https://${s}.com/lp`, page_title: `${nome} - Landing Page`, spied_offer_id: id, workspace_id: wsId },
      { step_order: 2, step_type: 'vsl', page_url: `https://${s}.com/vsl`, page_title: `${nome} - VSL`, spied_offer_id: id, workspace_id: wsId },
      { step_order: 3, step_type: 'checkout', page_url: `https://${s}.com/checkout`, product_name: nome, price: def.ticket, spied_offer_id: id, workspace_id: wsId },
    );
    if (rand(0, 1)) {
      funnelsPayload.push({ step_order: 4, step_type: 'upsell', page_url: `https://${s}.com/upsell`, product_name: `${nome} Premium`, price: def.ticket * 2, spied_offer_id: id, workspace_id: wsId });
    }
  }
  await supabase.from('offer_funnel_steps').insert(funnelsPayload);

  // ── 6. Spike Alerts ──
  onProgress?.('Inserindo alertas de spike (7)...');
  const spikeEntries: { nome: string; type: 'spike' | 'drop'; pct: number }[] = [
    { nome: 'Detox Slim Pro', type: 'spike', pct: 85 },
    { nome: 'FatKiller 360', type: 'spike', pct: 45 },
    { nome: 'Crypto Profit AI', type: 'spike', pct: 120 },
    { nome: 'BetWin Analytics', type: 'spike', pct: 200 },
    { nome: 'GlicoPure Control', type: 'spike', pct: 65 },
    { nome: 'CardioShield Plus', type: 'drop', pct: -62 },
    { nome: 'ProstaGuard Plus', type: 'drop', pct: -78 },
  ];
  const alertsPayload = spikeEntries
    .map(s => {
      const entry = offerMap.get(s.nome);
      if (!entry) return null;
      const def = OFFER_DEFS.find(o => o.nome === s.nome)!;
      const prev = def.baseTraffic;
      const curr = Math.round(prev * (1 + s.pct / 100));
      return {
        workspace_id: wsId,
        spied_offer_id: entry.id,
        domain: `${toSlug(s.nome)}.com`,
        period_date: monthDate(0),
        alert_type: s.type,
        current_visits: curr,
        previous_visits: prev,
        change_percent: s.pct,
        is_read: rand(0, 1) === 1,
        is_dismissed: false,
      };
    })
    .filter(Boolean);

  if (alertsPayload.length > 0) {
    await supabase
      .from('spike_alerts')
      .upsert(alertsPayload as Record<string, unknown>[], { onConflict: 'spied_offer_id,domain,period_date,alert_type' });
  }

  // ── 7. Ofertas Próprias ──
  onProgress?.('Inserindo ofertas próprias (6)...');
  const ofertasPayload = OFERTA_DEFS.map(o => ({
    nome: o.nome,
    slug: o.slug,
    status: o.status,
    vertical: o.vertical,
    mercado: o.mercado,
    ticket_front: o.ticket_front,
    cpa_target: o.cpa_target,
    roas_target: o.roas_target,
    source: o.source,
    spied_offer_id: o.spiedName ? offerMap.get(o.spiedName)?.id ?? null : null,
    workspace_id: wsId,
    notas_spy: DEMO_TAG,
  }));

  const { data: insertedOfertas } = await supabase
    .from('ofertas')
    .insert(ofertasPayload)
    .select('id, nome');

  const ofertaMap = new Map((insertedOfertas ?? []).map(o => [o.nome, o.id]));

  // ── 8. Avatares ──
  onProgress?.('Inserindo avatares (8)...');
  const avatarsPayload = AVATAR_DEFS.map(a => ({
    nome: a.nome,
    workspace_id: wsId,
    oferta_id: a.ofertaNome ? ofertaMap.get(a.ofertaNome) ?? null : null,
    estado_atual: a.estado_atual,
    estado_desejado: a.estado_desejado,
    pain_matrix: a.pain_matrix,
    desire_matrix: a.desire_matrix,
    notas: DEMO_TAG,
  }));
  await supabase.from('avatares').insert(avatarsPayload);

  // ── 9. Criativos ──
  onProgress?.('Inserindo criativos (15)...');
  const criativosPayload = CRIATIVO_DEFS.map(c => ({
    nome: c.nome,
    tipo: c.tipo,
    status: c.status,
    hook_text: c.hook,
    plataforma: c.plataforma,
    angulo: c.angulo,
    workspace_id: wsId,
    oferta_id: c.ofertaNome ? ofertaMap.get(c.ofertaNome) ?? null : null,
    tags: [DEMO_TAG],
    decision_notes: ('decisionNotes' in c ? (c as Record<string, unknown>).decisionNotes : null) as string | null,
    decision_metrics: c.status === 'WINNER'
      ? { ctr: +(1.5 + Math.random() * 2).toFixed(1), cpa: rand(30, 80), roas: +(2.5 + Math.random() * 3).toFixed(1) }
      : c.status === 'KILLED'
        ? { ctr: +(0.2 + Math.random() * 0.5).toFixed(1), cpa: rand(100, 300), roas: +(0.3 + Math.random() * 0.7).toFixed(1) }
        : null,
    test_started_at: ['TEST', 'WINNER', 'KILLED'].includes(c.status) ? daysAgo(rand(7, 60)) : null,
    decided_at: ['WINNER', 'KILLED'].includes(c.status) ? daysAgo(rand(1, 30)) : null,
  }));
  await supabase.from('criativos').insert(criativosPayload);

  // ── 10. Saved Views ──
  onProgress?.('Inserindo views salvas (3)...');
  await supabase.from('saved_views').insert([
    { name: '[Demo] Hot & Scaling BR', module: 'spy', filters: { statuses: ['HOT', 'SCALING'], geos: ['BR'] }, workspace_id: wsId, is_pinned: true },
    { name: '[Demo] Emagrecimento', module: 'spy', filters: { verticals: ['emagrecimento'] }, workspace_id: wsId },
    { name: '[Demo] High Traffic (300k+)', module: 'spy', filters: { min_traffic: 300000 }, workspace_id: wsId },
  ]);

  // ── 11. Activity Log ──
  onProgress?.('Inserindo atividades recentes (20)...');
  const actionTemplates = [
    { action: 'offer_created', label: 'Oferta adicionada ao radar' },
    { action: 'status_changed', label: 'Status alterado' },
    { action: 'traffic_imported', label: 'Dados de tráfego importados' },
    { action: 'spike_detected', label: 'Spike de tráfego detectado' },
    { action: 'offer_cloned', label: 'Oferta clonada' },
    { action: 'creative_created', label: 'Criativo criado' },
  ];
  const activityPayload = Array.from({ length: 20 }, (_, i) => {
    const tmpl = actionTemplates[i % actionTemplates.length];
    return {
      action: tmpl.action,
      entity_type: DEMO_TAG,
      entity_id: offers[i % offers.length].id,
      workspace_id: wsId,
      user_id: userId,
      metadata: { demo: true, detail: tmpl.label },
      created_at: daysAgo(rand(0, 30)),
    };
  });
  await supabase.from('activity_log').insert(activityPayload);

  // ── 12. Refresh MVs ──
  onProgress?.('Atualizando materialized views...');
  try {
    await supabase.rpc('refresh_pipeline');
  } catch (err) {
    console.warn('[DemoSeed] MV refresh warning:', err);
  }

  onProgress?.('Demo ativado!');
}

// ═══════════════════════════════════════════════════════
// CLEANUP
// ═══════════════════════════════════════════════════════
export async function cleanupDemoData(onProgress?: (msg: string) => void) {
  const { wsId } = await getContext();

  // Get demo spied offer IDs
  const { data: demoOffers } = await supabase
    .from('spied_offers')
    .select('id')
    .eq('discovery_source', DEMO_TAG)
    .eq('workspace_id', wsId);

  const offerIds = demoOffers?.map(o => o.id) ?? [];

  if (offerIds.length > 0) {
    onProgress?.('Removendo dados de espionagem...');
    await supabase.from('spike_alerts').delete().in('spied_offer_id', offerIds);
    await supabase.from('offer_traffic_data').delete().in('spied_offer_id', offerIds);
    await supabase.from('offer_funnel_steps').delete().in('spied_offer_id', offerIds);
    await supabase.from('ad_creatives').delete().in('spied_offer_id', offerIds);
    await supabase.from('offer_ad_libraries').delete().in('spied_offer_id', offerIds);
    await supabase.from('offer_domains').delete().in('spied_offer_id', offerIds);
    await supabase.from('spied_offers').delete().eq('discovery_source', DEMO_TAG).eq('workspace_id', wsId);
  }

  // Get demo ofertas
  const { data: demoOfertas } = await supabase
    .from('ofertas')
    .select('id')
    .like('slug', 'demo-%')
    .eq('workspace_id', wsId);

  const ofertaIds = demoOfertas?.map(o => o.id) ?? [];

  if (ofertaIds.length > 0) {
    onProgress?.('Removendo ofertas próprias...');
    await supabase.from('criativos').delete().in('oferta_id', ofertaIds);
    await supabase.from('avatares').delete().in('oferta_id', ofertaIds);
    await supabase.from('ofertas').delete().in('id', ofertaIds);
  }

  // Standalone criativos & avatares
  onProgress?.('Removendo criativos e avatares avulsos...');
  await supabase.from('criativos').delete().contains('tags', [DEMO_TAG]).eq('workspace_id', wsId);
  await supabase.from('avatares').delete().eq('notas', DEMO_TAG).eq('workspace_id', wsId);

  // Saved views & activity
  await supabase.from('saved_views').delete().like('name', '%[Demo]%').eq('workspace_id', wsId);
  await supabase.from('activity_log').delete().eq('entity_type', DEMO_TAG).eq('workspace_id', wsId);

  // Refresh MVs
  onProgress?.('Atualizando materialized views...');
  try {
    await supabase.rpc('refresh_pipeline');
  } catch (err) {
    console.warn('[DemoSeed] MV refresh warning:', err);
  }

  onProgress?.('Dados demo removidos!');
}

// ═══════════════════════════════════════════════════════
// STATUS CHECK
// ═══════════════════════════════════════════════════════
export async function checkDemoActive(): Promise<boolean> {
  try {
    const { wsId } = await getContext();
    const { count } = await supabase
      .from('spied_offers')
      .select('*', { count: 'exact', head: true })
      .eq('discovery_source', DEMO_TAG)
      .eq('workspace_id', wsId);
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}
