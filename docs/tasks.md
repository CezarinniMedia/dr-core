# Tarefas - DR OPS
**Ultima atualizacao:** 2026-03-01
**Atualizado por:** Claude Opus 4.6 (@pm Morgan)

## Estado Atual
- **Vision:** 6/6 fases PASS (feature/vision-1-foundation)
- **Brownfield:** 17/17 stories Done
- **Testes:** 209 passando, 0 falhas
- **Build:** Clean, typecheck clean

---

## FASE 0: Merge & Deploy (IMEDIATO)

### 0.1 Merge feature/vision-1-foundation
- [ ] Code review final do PR (feature/vision-1-foundation → dev)
- [ ] Merge para dev
- [ ] Testar em staging (dev branch)
- [ ] Merge dev → main (auto-deploy Hostinger)

### 0.2 Pos-Deploy
- [ ] Verificar pg_cron habilitado no Supabase remoto
- [ ] Rodar `supabase gen types typescript` para regenerar types.ts
- [ ] Validar migracoes aplicadas (Phase 3 intelligence, Phase 5 saved_views, Phase 5 pipeline)
- [ ] Verificar realtime subscription (spike_alerts) funcionando em producao
- [ ] Testar import CSV com Web Worker em producao
- [ ] Confirmar refresh automatico das MVs (pg_cron jobs)

---

## FASE 1: Consolidacao & Limpeza (pos-merge)

### 1.1 Tech Debt Aceito no Vision
- [ ] Resolver 160 erros ESLint pre-existentes (maioria `no-explicit-any`)
- [ ] Consolidar STATUS_BADGE duplicado (constants.ts + SpyOfferDetail.tsx)
- [ ] Extrair hook compartilhado useWorkspaceId() (duplicado em 2 hooks do dashboard)
- [ ] Fix useEffect dependency em CriativoFormDialog (naming engine)
- [ ] Reset form state on cancel em OfertaFormDialog
- [ ] Converter ~45 instancias restantes de text-muted-foreground para design tokens

### 1.2 Remover Artefatos Temporarios
- [ ] Remover backward-compat views (mv_dashboard_stats, mv_offer_traffic_summary) apos confirmar RPCs novos em uso
- [ ] Limpar arquivo `.bak` de migracao (supabase/migrations/*.bak)
- [ ] Remover pasta `squads/` se nao mais necessaria

### 1.3 Testes Adicionais
- [ ] Adicionar testes para modulos VISION-4 (Arsenal, Ofertas, Avatar, Criativos) — 0% coverage
- [ ] Adicionar testes de integracao para virtualizacao (TrafficTable)
- [ ] Testar color contrast manualmente (axe-core nao cobre em jsdom)

---

## FASE 2: Features Operacionais (proximo sprint)

### 2.1 SPY Radar — Evolucoes
- [ ] Bulk tagging (prop onBulkTag ja preparada no SpyBulkActionsBar)
- [ ] "Bau"/archive para esconder dominios irrelevantes (ex: hotmart.com)
- [ ] Badges coloridos no grafico comparativo por dominio
- [ ] Export de ofertas/trafego para CSV/Excel

### 2.2 Pipeline Automatizado
- [ ] Automacao semanal: PublicWWW (footprint) → CSV → Import → Trafego → Curadoria
- [ ] Edge Function para processamento de CSV server-side
- [ ] Scheduled triggers para pipeline completo
- [ ] Notificacao de novos spikes via email/push

### 2.3 Arsenal — Evolucoes
- [ ] Integrar Arsenal com Import Modal (usar footprint do Arsenal como query de import)
- [ ] Historico de execucao de dorks
- [ ] Templates de footprints por vertical

---

## FASE 3: Novos Modulos (futuro)

| Modulo | Descricao | Prioridade |
|--------|-----------|------------|
| Paginas (Funil Visual) | Visualizacao tipo Funnelytics | Media |
| Analytics | Dados VTurb, FB Ads, Google Ads, historico de modificacoes | Media |
| Prompts & Agents | Templates de prompts, automacao com AI | Baixa |
| Canvas & Whiteboard | Planejamento visual | Baixa |
| Automacoes | Workflows automatizados | Baixa |
| Search | Busca global unificada | Baixa |
| Mobile | App mobile (PWA ou nativo) | Baixa |

---

## Referencia: Vision Completo

| Fase | Status | QA Gate |
|------|--------|---------|
| VISION-1: Foundation | Done | PASS |
| VISION-2: Design System Integration | Done | PASS |
| VISION-2A: Sacred Features | Done | PASS |
| VISION-3: Intelligence Layer | Done | PASS |
| VISION-4: Modules | Done | PASS |
| VISION-5: Automation | Done | PASS |
| VISION-6: Accessibility & Testing | Done | PASS |

## Referencia: Brownfield Completo

| Sprint | Stories | Status |
|--------|---------|--------|
| Sprint 0 | BD-0.1, BD-0.2, BD-0.3 | 3/3 Done |
| Sprint 1 | BD-1.1, BD-1.2, BD-1.3, BD-1.4 | 4/4 Done |
| Sprint 2 | BD-2.1, BD-2.2, BD-2.3, BD-2.4, BD-2.5 | 5/5 Done |
| Sprint 3 | BD-3.1, BD-3.2, BD-3.3, BD-3.4, BD-3.5 | 5/5 Done |
| **Total** | **17 stories** | **17/17 Done** |
