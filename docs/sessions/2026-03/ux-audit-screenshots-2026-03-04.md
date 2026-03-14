# UX Audit — Screenshot Analysis (2026-03-04)

> **Source:** 15 screenshots renomeados em `/Users/admin/Downloads/A editar/`
> **Analyst:** Uma (UX-Design Expert) + Claude Opus 4.6
> **Branch:** feature/vision-1-foundation

---

## Catalogo de Issues Identificadas

### GRUPO A — Design System & Visual Quality

#### A1. Design System geral fraco
- **Print:** `design system geral está fraco.png`, `o design system geral disso aqui é ruim...png`
- **Problema:** Header do Radar de Ofertas e areas de filtro tem aparencia plana, sem profundidade visual. Falta hierarquia, espacamento, e acabamento premium.
- **Impacto:** Alto — afeta percepcao de todo o sistema
- **Componentes:** Header do Radar, FilterBar, tab navigation
- **Solucao proposta:** Revisao do spacing, typography scale, border/shadow tokens, e card elevation no design system

#### A2. Botoes de filtro muito pequenos e feios (recorrente)
- **Prints:** `esses botoes estao muito pequeno e feios...png`, `botoes pequenos e feios novamente.png`
- **Problema:** Status filter tabs/chips (Todas, Research, Testando, Ativas, Pausadas, Mortas / Radar, Analyzing, Hot, Scaling...) sao muito pequenos, sem padding adequado, sem visual atraente
- **Impacto:** Alto — aparece em TODAS as paginas com filtros
- **Componentes:** StatusFilterTabs (Ofertas), status chips (Radar), status chips (Traffic)
- **Solucao proposta:** Aumentar tamanho (min-height 36px, padding-x 16px), melhorar visual com hover states, active states mais claros, possivelmente com contagem de items

#### A3. Status em ALL CAPS — deve ser Title Case
- **Print:** `coloque minusculo - só com primeira letra maiuscula e os icones.png`
- **Problema:** Dropdown de status mostra RADAR, ANALYZING, HOT, SCALING etc. em maiusculas. Deve ser "Radar", "Analyzing", "Hot" etc.
- **Impacto:** Medio — visual agressivo, nao profissional
- **Componentes:** Status select/dropdown no SpyOfferDetail, possivelmente em outros locais
- **Solucao proposta:** Criar funcao `formatStatus()` centralizada que converte para Title Case

#### A4. Overflow em metric cards (Ticket)
- **Print:** `tem blocos que o preenchimento esta ficando maior que ele - veja o ticket por exemplo.png`
- **Problema:** No SpyOfferDetail, o card de "Ticket" mostra "R$ 297, 2" que transborda o container. Font size nao se adapta ao conteudo.
- **Impacto:** Medio — visual quebrado em dados reais
- **Componentes:** Metric cards no SpyOfferDetail header
- **Solucao proposta:** Auto-sizing de font (clamp ou scale down), truncation com tooltip, ou aumentar largura minima do card

---

### GRUPO B — Layout & Responsividade

#### B1. Sidebar collapse nao expande conteudo
- **Print:** `se escondo a sidebar, o site nao fica responsivo - fica todo para a esquerda.png`
- **Problema:** Ao colapsar a sidebar, o conteudo principal fica alinhado a esquerda com grande espaco vazio a direita. Deveria expandir para ocupar toda a largura.
- **Impacto:** Alto — problema estrutural de layout
- **Componentes:** DashboardLayout, AppSidebar, SidebarProvider
- **Solucao proposta:** Conteudo principal deve usar `flex-1` ou `w-full` quando sidebar colapsa, com transicao suave

#### B2. Desalinhamento horizontal header vs sidebar
- **Print:** `esse desalinhamento de linha horizontal com a sidebar é zoada.png`
- **Problema:** A linha horizontal do header do conteudo nao se alinha com o topo da sidebar. Cria descontinuidade visual.
- **Impacto:** Medio — detalhe visual irritante
- **Componentes:** AppHeader, AppSidebar, DashboardLayout
- **Solucao proposta:** Alinhar border/divider do content area com o topo do sidebar content

---

### GRUPO C — Funcionalidade & UX Flow

#### C1. Edicao via modal e ruim — quer inline/page edit
- **Prints:** `ter que abrir isso para editar é ruim...png`, `seria legal editar tudo nessas abas...png`
- **Problema:** Para editar uma oferta, abre um modal centralizado (FullOfferFormModal). Usuario quer editar DIRETO na pagina de detalhe da oferta, alternando entre modo View e Edit.
- **Impacto:** Alto — afeta workflow principal de curadoria
- **Componentes:** SpyOfferDetail, FullOfferFormModal, tabs de detalhe
- **Solucao proposta:** Implementar toggle View/Edit na pagina de detalhe. Cada secao/tab pode ter seu proprio modo edit inline. Modal pode permanecer para Quick Add mas nao para edicao completa.

#### C2. Botoes de Sinais de Escala nao clicaveis
- **Print:** `esses botoes nao estao clicaveis.png`
- **Problema:** Os toggles de "Sinais de Escala" (Ads Ativos, Criativos Variados, Trafego Crescendo, etc.) nao respondem ao clique.
- **Impacto:** Alto — funcionalidade quebrada
- **Componentes:** Scale signals section no SpyOfferDetail (Overview tab)
- **Solucao proposta:** Debug e fix do handler onClick/onChange dos switches. Verificar se mutation esta conectada.

#### C3. Views vs Presets — confusao conceitual
- **Print:** `qual a diferenca de views e presets.png`
- **Problema:** Na barra do Radar, existem "Views" e "Presets" (dentro do seletor de colunas) com funcionalidade que se sobrepoe. Usuario nao entende a diferenca.
- **Impacto:** Medio — confusao de UX
- **Componentes:** SavedViewsDropdown, SpyColumnSelector (presets section)
- **Solucao proposta:** Unificar conceitos. "Views" = combinacao de colunas + filtros + ordenacao. Remover "Presets" como conceito separado ou tornar mais claro (Presets = apenas colunas, Views = tudo).

#### C4. Faltam opcoes de personalizacao de colunas no Radar
- **Print:** `faltam opcoes de personalizacao de colunas no radar.png`
- **Problema:** O seletor de colunas na aba de Inteligencia de Trafego tem opcoes limitadas (Status, Oferta, Trend, Ultimo Mes, Variacao, Pico, Descoberto + meses individuais). Faltam muitas opcoes.
- **Impacto:** Medio — limita analise personalizada
- **Componentes:** Column selector no TrafficIntelligenceView
- **Solucao proposta:** Adicionar todas as colunas possiveis: Vertical, Geo, Fonte, Prioridade, Notas (preview), Screenshot, todos os meses disponiveis, metricas calculadas.

#### C5. Ordenacao personalizada com agrupamento (estilo Facebook Ads)
- **Print:** `no radar-ofertas as colunas até que estao legais...png`
- **Problema:** Colunas no Radar/Ofertas estao boas mas falta poder ORDENAR de forma personalizada mantendo o agrupamento por categorias (como Facebook Ads Manager).
- **Impacto:** Medio — power user feature
- **Componentes:** SpyOffersTable, SpyColumnSelector
- **Solucao proposta:** Implementar drag-and-drop de colunas dentro de grupos, persistir ordenacao por view. Referencia: Facebook Ads Manager column customization.

---

### GRUPO D — Bugs

#### D1. BUG: Trend, ultimo mes e variacao inconsistentes
- **Print:** `BUG - veja que trend - ultimo mes e variacao não sao condizentes...png`
- **Problema:** Para webflow.io, o trend sparkline mostra crescimento, ultimo mes = 7.6M, variacao = +10%, mas "7.6M (Jan 26)" sugere que o ultimo mes e Jan e a variacao nao bate com o sparkline visual.
- **Impacto:** Alto — dados inconsistentes destroem confianca
- **Componentes:** TrafficTable, calculo de variacao, sparkline data
- **Solucao proposta:** Investigar: (1) sparkline pode estar usando periodo diferente dos numeros, (2) "ultimo mes" pode estar pegando mes errado, (3) variacao pode estar calculada sobre periodo diferente. Unificar fonte de dados.

---

## Prioridade de Implementacao Sugerida

| # | Issue | Severidade | Esforco | Prioridade |
|---|-------|-----------|---------|------------|
| C2 | Scale signals nao clicaveis | BUG | Baixo | P0 |
| D1 | Trend/variacao inconsistentes | BUG | Medio | P0 |
| B1 | Sidebar collapse layout | UX | Medio | P1 |
| A2 | Botoes filtro pequenos/feios | Visual | Medio | P1 |
| C1 | Inline edit vs modal | UX | Alto | P1 |
| A3 | Status ALL CAPS → Title Case | Visual | Baixo | P1 |
| A4 | Metric card overflow | Visual | Baixo | P1 |
| B2 | Desalinhamento header/sidebar | Visual | Baixo | P2 |
| C3 | Views vs Presets unificar | UX | Medio | P2 |
| C4 | Mais colunas no selector | Feature | Medio | P2 |
| A1 | Design system refinement | Visual | Alto | P2 |
| C5 | Ordenacao estilo FB Ads | Feature | Alto | P3 |

---

## Contextos Antigos — Features Potencialmente Desejadas

Analise dos 4 arquivos de contexto identificou features mencionadas pelo usuario que podem NAO ter sido implementadas ainda. Documentadas separadamente para consulta.

Ver: `old-context-wishlist-2026-03-04.md`
