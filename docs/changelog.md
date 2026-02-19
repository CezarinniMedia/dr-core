# Changelog - DR OPS

## 2026-02-19 - SimilarWeb: extração completa + screenshot + notas automáticas (Claude Sonnet 4.6)

### Extração de dados SimilarWeb expandida (`csvClassifier.ts`)
- **`countryRank/CountryCode`** → campo `geo` da oferta (país principal onde a oferta roda)
- **`screenshot`** → `screenshot_url` na oferta (armazenado no banco, editável na UI)
- **Notes appendix** composto automaticamente na ordem:
  1. `topKeywords/0/name` → **Top Keyword**
  2. `title` → **Título**
  3. `description` → **Descrição**
  4. `topKeywords/1–4/name` → **Mais Keywords** (lista)
  5. `trafficSources/Direct|Social|Search|Referrals|Paid Referrals|Mail` → tabela markdown ao final
- Novo tipo `ExtractedOfferUpdate` no classifier com campos: `domain`, `screenshot_url`, `notes_appendix`, `geo`
- `ProcessedCsvResult` agora inclui campo `offerUpdates: ExtractedOfferUpdate[]`
- Todos os processadores existentes (SEMrush, PublicWWW) atualizados para retornar `offerUpdates: []`

### Phase 6 de importação (`UniversalImportModal.tsx`)
- Nova fase após geo: aplica `offerUpdates` às ofertas matchadas (apenas CSVs do tipo `similarweb`)
- `screenshot_url`: salvo apenas se a oferta ainda não tiver um (não sobrescreve)
- `notas`: appended ao final das notas existentes (nunca sobrescreve)
- `geo`: definido apenas se a oferta ainda não tiver geo

### Campo screenshot na oferta (`SpyOverviewTab.tsx` + migration)
- Nova migration: `ALTER TABLE spied_offers ADD COLUMN IF NOT EXISTS screenshot_url TEXT`
- `types.ts` atualizado com `screenshot_url: string | null`
- **Card "Screenshot"** adicionado como primeiro card (full width) no Overview da oferta
- **Campo editável**: clicar no texto da URL ativa edição inline (input + Salvar/Cancelar)
- **3 botões sempre visíveis**:
  - **Preview** (olhinho): hover mostra mini-preview flutuante ~280px; clique abre lightbox
  - **Copiar** URL
  - **Abrir em nova aba**
- **Lightbox modal** (centralizado, não fullscreen):
  - Zoom com botões +/- e **Alt+scroll**
  - Drag para mover a imagem (click e arrastar)
  - Contador de % clicável para resetar zoom/posição
  - Fechar: clique fora, botão X ou tecla Escape

---

## 2026-02-19 - SimilarWeb como fonte de tráfego + toggle no Radar (Claude Sonnet 4.6)

### Contexto
SEMrush mede apenas tráfego orgânico (busca). SimilarWeb mede tráfego total (paid, social, direct, referral) — essencial para sites de presell/native ads onde 99% do tráfego é pago. Adicionado suporte completo ao SimilarWeb como segunda fonte de dados de tráfego.

### csvClassifier.ts
- Novo tipo `"similarweb"` adicionado ao `CsvType`
- Strip de BOM (`\uFEFF`) no início do texto CSV — comum em exports do SimilarWeb
- `normalizeHeader` atualizado para remover BOM
- `hasHeader` expandido para detectar headers SimilarWeb (`domain`, `bouncerate`, `visits`, `pagespervisit`, `timeonsite`)
- **Detecção automática**: identifica CSV SimilarWeb via coluna `estimatedMonthlyVisits/YYYY-MM-DD`
- **`processSimilarWeb()`**: extrai tráfego mensal de colunas `estimatedMonthlyVisits/YYYY-MM-DD`, bounce rate (decimal→%), pages/visit, time on site, domínios e geodistribuição com country codes
- `getDefaultExcludedColumns` atualizado com colunas relevantes do SimilarWeb

### UniversalImportModal.tsx
- `"SimilarWeb"` adicionado ao seletor de tipo (cor roxa `bg-purple-500/20 text-purple-400`)
- Registros SimilarWeb inseridos com `period_type = "monthly_sw"` — separados dos dados SEMrush (`period_type = "monthly"`) para evitar conflito de upsert entre fontes

### useSpiedOffers.ts
- Novo hook **`useLatestTrafficPerOffer(provider)`**: retorna `Map<offer_id, visits>` com o tráfego mais recente por oferta, filtrado por `period_type` (`"monthly_sw"` para SimilarWeb, `"monthly"` para SEMrush)

### SpyRadar.tsx
- **Toggle SimilarWeb / SEMrush** na linha de filtros — padrão: SimilarWeb, persistido em localStorage (`spy-radar-traffic-source`)
- Coluna "Tráfego" exibe dados da fonte selecionada com indicador `(SW)` / `(SR)` no header
- Fallback para `estimated_monthly_traffic` se não houver dados da fonte selecionada

### Arquitetura de dados de tráfego
- `period_type = "monthly"` → todos os dados SEMrush existentes (sem migração necessária)
- `period_type = "monthly_sw"` → dados SimilarWeb importados a partir desta data
- Unique constraint `(spied_offer_id, domain, period_type, period_date)` garante dedup por fonte

---

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
