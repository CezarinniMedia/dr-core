# Story BD-2.4: Deprecate Legacy Database Tables
**Epic:** EPIC-BD | **Sprint:** 2 | **Status:** Ready | **Estimate:** 4h | **Priority:** MEDIO

---

## Descricao
7 tabelas legacy (nomes em portugues) duplicam tabelas modernas (nomes em ingles). Migrar campos uteis que existem apenas nas tabelas legacy, depois deprecar para reduzir confusao e manter schema limpo.

## Tabelas a Deprecar

| Legacy | Moderna | Campos a Migrar | Acao |
|--------|---------|-----------------|------|
| ad_bibliotecas (19 cols) | offer_ad_libraries | pagina_nome, pagina_url | ADD columns → migrate data → DROP table |
| oferta_dominios | offer_domains | whois_registrar, whois_expiry, hosting_provider, ip_address | ADD columns → migrate data → DROP table |
| funil_paginas | offer_funnel_steps | nenhum | DROP table |
| fontes_captura | campo discovery_source em spied_offers | nenhum | DROP table |
| trafego_historico | offer_traffic_data | import_batch_id, comparacao_batch_id | Avaliar se batch tracking e necessario → DROP |

## Acceptance Criteria

### AC-1: Migration de Campos Uteis
- [ ] Given: campos uteis existem apenas em tabelas legacy
- [ ] When: migration e executada
- [ ] Then: campos sao adicionados a tabela moderna
- [ ] And: dados existentes sao migrados corretamente

### AC-2: Application Updates
- [ ] Given: codigo referencia tabelas legacy
- [ ] When: deprecacao acontece
- [ ] Then: todas as queries apontam para tabelas modernas
- [ ] And: types.ts atualizado com novas colunas

### AC-3: Safe Deprecation
- [ ] Given: tabelas legacy estao deprecadas
- [ ] When: migration DROP e executada
- [ ] Then: backup dos dados legacy e salvo antes do DROP
- [ ] And: aplicacao funciona normalmente sem tabelas legacy

### AC-4: RLS nas Tabelas Mantidas
- [ ] Given: tabelas modernas recebem campos migrados
- [ ] When: RLS policies sao verificadas
- [ ] Then: todas as tabelas mantidas tem RLS correto

## Arquivos a Modificar
- [ ] supabase/migrations/YYYYMMDD_deprecate_legacy_tables.sql
- [ ] src/integrations/supabase/types.ts (atualizar tipos)
- [ ] Qualquer componente que consulte tabelas legacy diretamente
- [ ] src/hooks/ (queries que referenciam tabelas legacy)

## Riscos
- Dados em tabelas legacy podem ter registros que nao existem nas modernas
- Falta de FK em algumas tabelas legacy dificulta migracao
- Migration deve ser reversivel (DOWN migration)

## Dependencias
- BD-0.2 concluido (indexes ja criados nas tabelas modernas)
