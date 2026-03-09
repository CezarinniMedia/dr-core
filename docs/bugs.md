# Bugs Conhecidos - DR OPS
**Ultima atualizacao:** 2026-03-02

## CRITICOS (bloqueiam uso ou corrompem dados)

### BUG-001: Upload de arquivos falha com RLS
- **Onde:** Todo o sistema (criativos, avatares, etc.)
- **Erro:** "new row violates row-level security policy"
- **Impacto:** Impossivel upar fotos e videos
- **Causa provavel:** Storage bucket RLS policies nao configuradas para o usuario autenticado

### ~~BUG-002: Importacao de CSV grande extremamente lenta~~ (CORRIGIDO)
- **Onde:** Radar de Ofertas → Importar CSV
- **Correcao:** Reescrito para usar operacoes batch (chunks de 500) em vez de insercao 1-por-1. Domain matching usa batch queries (.in()) em vez de queries individuais. Progress bar granular com label descritivo por fase (criando ofertas, inserindo dominios, importando trafego).

### ~~BUG-017: Grafico de trafego trava browser ao adicionar muitas ofertas~~ (CORRIGIDO)
- **Onde:** Inteligencia de Trafego → botao "Comparar visiveis" / "Adicionar ao grafico"
- **Comportamento:** `addAllToChart` adicionava TODAS as ofertas filtradas (sortedRows, potencialmente centenas) ao chart Recharts, causando centenas de `<Area>` com animacoes e crashando o browser
- **Correcao:** (1) `addAllToChart` agora usa `paginatedRows` (somente pagina atual). (2) Safety cap `MAX_CHART_ITEMS = 50` com toast informativo em `addAllToChart` e `addSelectedToChart`. (3) `chartIds` e `useState` puro sem localStorage — refresh limpa tudo.
- **Commits:** afab241, 5fe8c87
- **QA:** PASS (2 rounds — concerns C1/C2 corrigidos)

### BUG-003: Graficos de trafego nao respeitam filtros de data
- **Onde:** Oferta individual → aba Trafego + Inteligencia de Trafego
- **Comportamento:** Ao selecionar periodo personalizado, grafico nem sempre atualiza
- **Impacto:** Visualizacao incorreta de dados

## IMPORTANTES (afetam UX significativamente)

### BUG-004: Sidebar collapse deixa lacuna direita
- **Onde:** Layout global
- **Comportamento:** Ao esconder sidebar, conteudo vai todo pra esquerda com espaco vazio a direita
- **Causa provavel:** CSS do conteudo principal nao faz flex-grow ou nao recalcula largura

### ~~BUG-005: Dashboard mostra dados zerados~~ (CORRIGIDO — Vision-3)
- **Correcao:** Dashboard reescrito com Intelligence Dashboard usando RPCs reais (get_dashboard_metrics, mv_dashboard_metrics)

### BUG-006: Criativos - card nao reabre apos criado
- **Onde:** Criativos → Kanban
- **Comportamento:** Apos criar um criativo, clicar nele nao abre detalhe
- **Impacto:** Impossivel editar criativo apos criacao

### BUG-007: Criativos - delay ao arrastar card entre colunas
- **Onde:** Criativos → Kanban
- **Comportamento:** Apos drag-and-drop, card demora para atualizar visualmente

### BUG-008: Emojis iOS em toda interface
- **Onde:** Sistema inteiro
- **Comportamento:** Usa emojis iOS em vez de icones Lucide profissionais
- **Impacto:** Visual amador/nao profissional

### BUG-009: Popup com informações cortadas
- **Onde:** Radar de ofertas
- **Comportamento:** Quando abre um pop-up como do importador universal na hora do matching (por exemplo, mas não apenas esse pop-up e esse momento) as informações ficam cortadas desnecessáriamente obrigando a rolar para o lado.
- **Impacto:** faz perder tempo e atrapalha a funcionalidade

### BUG-010: Dimensionamento geral está horrível
- **Onde:** todo o sistema
- **Comportamento:** exemplo durante o importador universal de csv: na coluna 'Tipo CSV' a informação 'semrush: Bulk Analysis' que deveria estar em apenas uma linha, está em 3 linhas / 'ação' a informação está em duas linhas / 'Dados' em 4 linhas. Todas desnecessariamente mal configuradas, deveriam estar em apenas uma. E esse tipo de problema tem no sistema todo em diversas coisas, não apenas listas, mas botões também etc.
- **Impacto:** faz perder tempo, atrapalha a funcionalidade e fica com Visual amador/nao profissional

## TECH DEBT (documentado, baixo risco, fix futuro)

### DEBT-001: ILIKE pattern injection no Command Palette global search
- **Onde:** `src/shared/hooks/useCommandPalette.ts` linhas 85-92
- **Comportamento:** `.or(\`nome.ilike.${pattern},main_domain.ilike.${pattern}\`)` passa input do usuario direto no pattern ILIKE sem escapar `%` e `_`
- **Risco:** BAIXO — RLS protege dados, usuario so ve seus proprios registros. Pior caso: resultados inesperados com wildcards
- **Fix sugerido:** Criar helper `escapeIlike(term)` que escapa `%` → `\%` e `_` → `\_` antes de montar o pattern
- **Origem:** QA review B4 (2026-03-03), aceito como tech debt

---

## MENORES (incomodam mas nao bloqueiam)

### BUG-009: Filtros de ofertas (modulo Ofertas) muito pequenos
- **Onde:** Ofertas (nao Radar)
- **Comportamento:** Botoes Research/Testando/Ativas/Pausadas/Mortas com tamanho muito pequeno

### BUG-010: Ofertas - so abre clicando no nome, nao no card
- **Onde:** Ofertas
- **Comportamento:** Clicar na area do card nao abre, so o texto do nome

### ~~BUG-011: Tooltips ausentes~~ (CORRIGIDO — Vision-6)
- **Correcao:** Tooltips adicionados nos componentes principais via aria-label e Tooltip/TooltipContent do shadcn/ui

### ~~BUG-012: Trend sparkline exagerando variacoes de trafego~~ (CORRIGIDO)
- **Onde:** Inteligencia de Trafego → coluna Trend
- **Comportamento:** Normalizacao min→max fazia variacoes de 10% preencherem 100% da altura da sparkline, criando impressao visual incompativel com o grafico real
- **Correcao:** Normalizacao proporcional — visual range minimo = 50% da media dos dados. Variacoes de 10% agora preenchem ~20% da altura (proporcional), spikes reais (>50%) preenchem naturalmente

---

## CORRIGIDOS NESTA SESSAO (2026-03-02)

### ~~BUG-013: Inteligencia de Trafego sem dados (zeros em todos os campos)~~ (CORRIGIDO)
- **Onde:** Radar → Inteligencia de Trafego (colunas Trend, Ultimo Mes, Variacao, Pico)
- **Causa:** Imports `getWorkspaceId` e `TrafficSummaryRow` ausentes em `useTrafficIntelligence.ts` apos revert — query falhava silenciosamente, `trafficSummary` ficava undefined
- **Correcao:** Restaurado para abordagem `compareTraffic + fetchAllTrafficRows` (query direta na tabela), eliminando dependencia das RPCs/MVs que podem nao estar deployadas

### ~~BUG-014: Inteligencia de Trafego mostrando apenas 1 mes de dados~~ (CORRIGIDO)
- **Onde:** Radar → Inteligencia de Trafego
- **Causa:** `fetchAllTrafficRows` filtrava por `period_type` ('monthly_sw' para SimilarWeb). Registros historicos (Nov/Dez) foram importados com `period_type='monthly'` mesmo sendo fonte SimilarWeb, deixando apenas o mes mais recente visivel
- **Correcao:** Filtro migrado de `period_type` para campo `source` ('similarweb' ou '!= similarweb') que e mais confiavel e consistente com os dados reais do banco

### ~~BUG-015: Chart de trafego dobrando valores (ex: 283K → 566K)~~ (CORRIGIDO)
- **Onde:** Radar → Inteligencia de Trafego → grafico comparativo
- **Causa:** Chart data usava soma (`+`) ao agregar visitas por periodo, somando registros de variantes de dominio (ex: site.com + www.site.com = dobro)
- **Correcao:** Trocado para `Math.max` por `YYYY-MM` — previne duplicacao independente de quantas variantes de dominio existam

### ~~BUG-016: compareTraffic agregando por data completa causava distorcoes~~ (CORRIGIDO)
- **Onde:** `trafficService.ts` → funcao `compareTraffic`
- **Causa:** Agrupava por `period_date` completo (ex: '2026-01-01'). Se mesmo mes tivesse registros em datas diferentes (ex: '2026-01-01' e '2026-01-31'), apareciam como dois meses distintos
- **Correcao:** Agrupamento mudado para `YYYY-MM` com `Math.max`, garantindo 1 valor por mes por oferta
