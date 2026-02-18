# Changelog - DR OPS

## 2026-02-18 - CSV: Reconhecimento de formato ISO + "Aplicar a todos" (Claude Opus 4.6)
- **Fix:** `extractPeriodFromFilename` agora reconhece formato ISO `YYYY-MM` (ex: `consolidado_2026-01.csv`) alem do formato Semrush (`Aug 2025`)
- Regex adicionado em `csvClassifier.ts` e `UniversalImportModal.tsx`
- **"Aplicar a todos"**: Na etapa 2 (classificacao), botoes para aplicar tipo ou periodo de um arquivo a todos os demais
- Funcoes `applyTypeToAll` e `applyPeriodToAll` no modal de importacao

## 2026-02-18 - Paginacao, multi-status, inline edit, colunas personalizaveis (Claude Opus 4.6)
- **Paginacao** na Inteligencia de Trafego (10/25/50/100/Todas) — controles em cima e embaixo da tabela
- **Multi-status filter** em ambas views (SpyRadar + TrafficIntelligence): badges clicaveis com toggle, substituindo select single
- **Inline status edit**: clicar na badge de status abre popover para mudar status direto na tabela
- **Colunas personalizaveis** em ambas views: botao "Colunas" com checkboxes, preferencia salva em localStorage
- **Meses individuais de trafego** como colunas opcionais na Inteligencia de Trafego
- **Novos status**: VAULT (bau de sites irrelevantes) e NEVER_SCALED (sites que nunca escalaram)
- Removidos emojis iOS das labels de status (HOT, Scaling) — usando apenas texto
- Arquivos: `src/components/spy/TrafficIntelligenceView.tsx`, `src/pages/SpyRadar.tsx`

## 2026-02-17 - Fix: Parallel fetch + pagination fix (Claude Opus 4.6)
- **Fix:** Inteligencia de Trafego carregava no maximo 1000 registros (limite do Supabase)
- Reescrito `fetchAllTrafficRows` com fetch paralelo paginado (5 paginas simultaneas)
- Fix na paginacao do SpyRadar que nao aplicava corretamente o range

## 2026-02-17 - BUG-002: Performance da importacao CSV (Claude Opus 4.6)
- **Fix:** Importacao de CSV grande (14k+ linhas) reescrita com operacoes batch
- `handleMatchDomains`: queries individuais por dominio substituidas por batch queries (.in()) em chunks de 100 + matching local em memoria
- `handleImport`: insercao 1-por-1 substituida por batch inserts em chunks de 500
  - Ofertas: batch insert direto (antes: mutation individual com getUser/getWorkspace por chamada)
  - Dominios: pre-fetch dos existentes via batch query + batch insert dos novos
  - Trafego: upsert direto em batch (antes: via hook que refazia auth a cada chamada)
- Progress bar granular com label descritivo por fase ("Criando ofertas... 150/300", "Inserindo dominios... 5000/14000", etc.)
- Spinner com "Analisando..." durante o matching no step 2
- Removidas dependencias de useCreateSpiedOffer e useBulkInsertTrafficData no modal (operacoes diretas via Supabase client)
- Arquivo: `src/components/spy/UniversalImportModal.tsx`

## 2026-02-17 - Setup de desenvolvimento local
- Repo clonado localmente em /Users/admin/DR-OPS/_SYSTEM/APP-WEB-DR-OPS/dr-core/
- Criado CLAUDE.md para Claude Code CLI
- Criado docs/ com project-state.md, tasks.md, bugs.md, architecture.md, changelog.md
- Plano mestre criado em PLANO-MESTRE-DR-OPS.md

## 2026-02-08 a 2026-02-14 - Ajustes via Lovable (direto)
- Implementado Importador Universal CSV (substituiu SemrushImportModal + PublicWWWPipeline)
- Classificador inteligente de CSV (csvClassifier.ts) com 9 tipos
- Integracao Funil <-> Dominios (toggle manual/selecionar dominio)
- Campos first_seen, discovery_source, discovery_query em offer_domains
- Geo multi-pais com notas automaticas
- MonthRangePicker estilo Semrush
- Multi-select com Cmd/Shift + bulk actions (alterar status, deletar)
- Paginacao (10/25/50/100/Todas)
- Aba Inteligencia de Trafego com sparklines e graficos comparativos
- Edicao inline em Dominios, Bibliotecas, Funil, Trafego
- Fix: PublicWWW nao importa coluna de ranking como trafego
- Fix: Bulk Analysis auto-exclui colunas irrelevantes
- Fix: N/A tratado como 0 visitas
- Fix: Headers em portugues suportados
- Fix: Matching hierarquico de dominios (app.site.com → site.com)
- Fix: Dedup de dominios por URL
- Aba "Sobre" com explicacao de cada status

## 2026-02-07 a 2026-02-08 - SPY Upgrades via Claude + Lovable
- SPY Upgrade Part 1: Database (schema expandido para ofertas espionadas)
- SPY Upgrade Part 2: UI (importador, dominios, bibliotecas, funil)
- SPY Upgrade Part 3: Traffic Intelligence

## 2026-02-06 a 2026-02-07 - MVP Build via Lovable
- PLAN 00: Foundation (auth, layout, sidebar, dark mode)
- PLAN 01: Core Infrastructure (logging, analytics, file upload)
- PLAN 02: Ofertas (CRUD)
- PLAN 03: Avatar & Research
- PLAN 04: Espionagem (SPY)
- PLAN 05: Criativos (Kanban)
