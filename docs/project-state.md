# Estado do Projeto - DR OPS
**Ultima atualizacao:** 2026-02-19
**Atualizado por:** Claude Sonnet 4.6

## Status Geral
- **Fase:** MVP com modulo SPY funcional, outros modulos em estado basico
- **Prioridade atual:** Estabilizar e polir modulo SPY → Corrigir bugs globais → Polir outros modulos
- **Deploy:** GitHub (CezarinniMedia/dr-core) auto-deploy → Hostinger
- **Lovable:** Tambem commita neste repo. Sincronizar com `git pull` antes de trabalhar localmente.

## O que funciona

### Modulo SPY (prioritario)
- **Radar de Ofertas**: lista com multi-status filter (badges toggle), multi-select (Cmd/Shift), bulk actions, paginacao (10/25/50/100/Todas), inline status edit via popover, colunas personalizaveis (salvas em localStorage), **toggle SimilarWeb/SEMrush para coluna de trafego** (padrao: SimilarWeb)
- **Inteligencia de Trafego**: sparklines, graficos comparativos multi-dominio, paginacao (top + bottom), multi-status filter, inline status edit, colunas personalizaveis (incluindo meses individuais de trafego), ordenacao por trafego/variacao/pico
- **Status disponiveis**: RADAR, ANALYZING, HOT, SCALING, DYING, DEAD, CLONED, VAULT, NEVER_SCALED
- **Importador Universal CSV**: detecta 10 tipos automaticamente (PublicWWW, **SimilarWeb**, Semrush Bulk/Geo/Pages/Subdomains/Subfolders/Traffic Trend/Summary/Bulk Historical)
  - Batch ops otimizado para 14k+ linhas (insercao paralela em chunks de 1000)
  - Reconhece periodo do filename em formato Semrush (`Aug 2025`) e ISO (`2026-01`)
  - "Aplicar a todos": tipo e periodo podem ser aplicados em batch a todos os arquivos
  - Dedup inteligente: ofertas, dominios e trafego nao duplicam ao reimportar
  - Traffic upsert com onConflict por fonte (SEMrush: `period_type=monthly`, SimilarWeb: `period_type=monthly_sw`)
  - Strip de BOM automatico em CSVs exportados pelo SimilarWeb
- **Oferta individual**: 7 tabs (Overview, Dominios, Bibliotecas, Ad Creatives, Funil, Trafego, Notas)
  - Overview: **campo Screenshot** com preview hover, lightbox (zoom+pan), copiar, abrir em nova aba, editar inline
- **Month Range Picker** estilo Semrush
- **Quick Add** e **Full Offer** modals
- **Fetch de trafego**: paralelo paginado (5 paginas simultaneas), cache 5 min via React Query

### Outros modulos
- Auth (login/logout via Supabase)
- Layout com sidebar, dark mode, header com usuario
- Ofertas proprias: CRUD basico com cards e filtros
- Avatar: listagem e detalhe basico
- Criativos: Kanban basico

## PLANs implementados
- PLAN 00-05: Foundation, Core Infra, Ofertas, Avatar, SPY, Criativos
- SPY Upgrade Parts 1-3: Database, UI, Traffic Intelligence
- Multiplos ajustes via Lovable (ver changelog)
- BUG-002 Fix: Importacao CSV batch + progress granular
- Fix: Parallel fetch + pagination (87k+ registros)
- Paginacao + multi-status + inline edit + colunas personalizaveis + VAULT/NEVER_SCALED
- CSV: formato ISO (YYYY-MM) + "Aplicar a todos"
- SimilarWeb como segunda fonte de trafego + toggle no Radar (2026-02-19)
- SimilarWeb: extracao completa (geo, screenshot, keywords, trafficSources→notas) + campo screenshot no Overview (2026-02-19)

## Dados no sistema
- 12k+ ofertas espionadas (importadas via CSV)
- 87k+ registros de trafego historico (SEMrush, period_type="monthly")
- Fonte principal: PublicWWW (footprint cdn.utmify.com.br) + Semrush Bulk Analysis
- SimilarWeb: primeiros imports a partir de 2026-02-19 (period_type="monthly_sw")

## Proximas acoes
Ver docs/tasks.md
