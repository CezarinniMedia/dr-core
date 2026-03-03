# Wireframe 1/5 — Daily Briefing Page

> **Autor:** Uma (@ux-design-expert) | **Data:** 2026-03-03
> **Fase:** 3 (Wireframes) | **Fidelidade:** Mid-fi (estrutura + tokens + specs)
> **Refs Vision:** aesthetic-profile sec 3.2 (KPI Row + Chart + Data Table), sec 5.3 (Forward Momentum), sec 6.1 (Data Metric Card)
> **Principios ADHD:** UX-09 (daily anchor), UX-03 (graficos > texto), UX-10 (direcao clara), UX-06 (ancoragem temporal), UX-11 (warm glow como recompensa)
> **Status:** AGUARDANDO APROVACAO

---

## Conceito

A Daily Briefing e a **ancora diaria** do operador ADHD: a primeira tela que ele ve ao abrir o DR OPS. Responde a uma unica pergunta: **"O que precisa da minha atencao AGORA?"**

Nao e o Dashboard (metricas gerais). E um **briefing operacional** — acoes pendentes, spikes detectados, decisoes necessarias. O operador abre, escaneia em 5 segundos, e sabe exatamente o que fazer.

---

## Layout ASCII

```
+------------------------------------------------------------------+
|  SIDEBAR   |  DAILY BRIEFING                        Mon, 03 Mar  |
|  (64/240px)|  Bom dia, Marcos. Aqui esta seu briefing.           |
|            |                                                      |
|  [collapsed|  +----------+ +----------+ +----------+ +----------+|
|   or       |  | RADAR    | | SPIKES   | | IMPORTS  | | CRIATIVOS||
|   expanded]|  | 12,483   | | 7        | | 3        | | 4        ||
|            |  | ofertas  | | em 7d    | | pendentes| | >72h test||
|            |  | +2.1%    | | [pulse]  | |          | | [!]      ||
|            |  +----------+ +----------+ +----------+ +----------+|
|            |                                                      |
|            |  SPIKES QUE PRECISAM DE ATENCAO          ver todos > |
|            |  +--------------------------------------------------+|
|            |  | [pulse] NutraVida Plus    nutravida.com   +342%  ||
|            |  |         12,400 → 54,800 visits    ha 6h          ||
|            |  +--------------------------------------------------+|
|            |  | [pulse] SlimFast BR       slimfast.com.br +187%  ||
|            |  |         8,200 → 23,534 visits     ha 14h         ||
|            |  +--------------------------------------------------+|
|            |  | [pulse] KetoMax           ketomax.shop    +124%  ||
|            |  |         4,100 → 9,184 visits      ha 1d          ||
|            |  +--------------------------------------------------+|
|            |                                                      |
|            |  ACOES PENDENTES                                     |
|            |  +--------------------------------------------------+|
|            |  | [AlertTriangle] 4 criativos em TEST > 72h        ||
|            |  |   Precisam decisao WIN/KILL                      ||
|            |  |                        [Revisar Criativos] (CTA) ||
|            |  +--------------------------------------------------+|
|            |  | [Package] 3 imports CSV aguardando processamento  ||
|            |  |   PublicWWW (2), Semrush Bulk (1)                 ||
|            |  |                        [Processar Imports] (CTA)  ||
|            |  +--------------------------------------------------+|
|            |  | [TrendingUp] 23 ofertas novas desde ontem         ||
|            |  |   Adicionadas via import automatico               ||
|            |  |                        [Ver Novas Ofertas] (CTA)  ||
|            |  +--------------------------------------------------+|
|            |                                                      |
|            |  ACOES RAPIDAS                                       |
|            |  +------------+ +------------+ +------------+        |
|            |  | [Upload]   | | [Search]   | | [Plus]     |        |
|            |  | Importar   | | Cmd+K      | | Quick Add  |        |
|            |  | CSV        | | Buscar     | | Oferta     |        |
|            |  +------------+ +------------+ +------------+        |
|            |                                                      |
|            |  [text-muted] Ultima atualizacao: ha 2 minutos       |
+------------------------------------------------------------------+
```

---

## Specs Detalhadas

### 1. Header da Pagina

```
Titulo: "DAILY BRIEFING"
  font: var(--text-page-title) = 24px
  weight: 600 (semi-bold)
  color: var(--text-primary) = #FFFFFF

Saudacao: "Bom dia, Marcos. Aqui esta seu briefing."
  font: var(--text-body-size) = 14px
  weight: 400
  color: var(--text-secondary) = #949494

Data: "Mon, 03 Mar"
  font: var(--text-label) = 12px
  weight: 400
  color: var(--text-muted) = #6B7280
  position: top-right
```

**ADHD-UX-06 (ancoragem temporal):** Data visivel no header ancora o operador no tempo. Saudacao adapta por horario (Bom dia / Boa tarde / Boa noite).

---

### 2. KPI Row (4 cards)

```
Layout: grid 4 colunas, gap var(--space-card-gap) = 16px
Cada card:
  background: var(--bg-surface) = #141414
  border: 1px solid var(--border-default) = #1F1F1F
  border-radius: var(--radius-lg) = 12px
  padding: var(--space-card-padding) = 16px
  height: 96px

Numero grande:
  font: var(--text-kpi) = 48px (ajustar para 36px se 4 cards nao cabem)
  weight: 700
  color: var(--text-primary)
  font-variant-numeric: tabular-nums

Label:
  font: var(--text-label) = 12px
  weight: 400
  color: var(--text-secondary)
  text-transform: uppercase

Trend badge (quando aplicavel):
  font: var(--text-caption) = 11px
  color: var(--accent-green) para positivo, var(--semantic-error) para negativo
  icon: TrendingUp / TrendingDown (Lucide, 12px)
```

**Cards:**

| # | Label | Valor exemplo | Trend | Badge especial |
|---|-------|---------------|-------|----------------|
| 1 | OFERTAS NO RADAR | 12,483 | +2.1% (verde) | - |
| 2 | SPIKES 7D | 7 | - | Orange glow pulse se >0 |
| 3 | IMPORTS PENDENTES | 3 | - | - |
| 4 | CRIATIVOS >72H TEST | 4 | - | Warning icon se >0 |

**Card "SPIKES 7D" estado especial:**
```css
/* Quando spikes > 0 */
border: 1px solid var(--semantic-spike);  /* #F97316 */
box-shadow: var(--glow-amber);            /* 0 0 20px rgba(212, 165, 116, 0.15) */
animation: glow-pulse 2s ease-in-out infinite;
```

**ADHD-UX-02 (visual-first):** Numeros grandes com tabular-nums, trend visual com seta e cor, zero texto explicativo desnecessario.
**ADHD-UX-11 (warm glow):** Spike card pulsa com glow orange — atrai o olho sem ser agressivo.

---

### 3. Spike Alerts Section

```
Section header:
  titulo: "SPIKES QUE PRECISAM DE ATENCAO"
    font: var(--text-section-head) = 18px
    weight: 600
    color: var(--text-primary)
  link: "ver todos >"
    font: var(--text-label) = 12px
    color: var(--accent-primary) = #7C3AED
    hover: underline

Cada spike card:
  background: var(--bg-surface) = #141414
  border: 1px solid var(--border-subtle) = #2D2D2D
  border-left: 3px solid var(--semantic-spike) = #F97316
  border-radius: var(--radius-lg) = 12px
  padding: 16px
  margin-bottom: 8px
  cursor: pointer (navega para SpyOfferDetail)

  Hover:
    border-color: var(--semantic-spike)
    box-shadow: 0 0 12px rgba(249, 115, 22, 0.1)

  Layout interno:
    Row 1: [GlowDot orange] Nome da oferta (16px medium) + Dominio (12px muted mono)
    Row 2: Visits antes → depois (14px, cor neutra) + % variacao (14px bold, orange)
    Row 3: "ha Xh" (11px, --text-muted) — timestamp relativo

  GlowDot (indicador pulsante):
    width: 8px, height: 8px
    background: var(--semantic-spike)
    border-radius: 50%
    animation: glow-pulse 2s ease-in-out infinite
    box-shadow: 0 0 6px rgba(249, 115, 22, 0.5)
```

**Max items visiveis:** 3 (com "ver todos" para lista completa)
**Ordenacao:** Por % variacao descrescente (maior spike primeiro)
**Click:** Navega para `/spy/offer/{id}` (SpyOfferDetail)

**ADHD-UX-09 (daily anchor):** Spikes sao a informacao mais time-sensitive — posicionados logo apos KPIs.
**ADHD-UX-06 (ancoragem temporal):** "ha 6h", "ha 14h", "ha 1d" — tempo relativo, nao data absoluta.
**ADHD-UX-10 (direcao clara):** Cada spike e clicavel — zero ambiguidade sobre o que fazer.
**LED strip signature:** `border-left: 3px solid` com cor spike traduz o LED strip lateral.

---

### 4. Acoes Pendentes Section

```
Section header:
  titulo: "ACOES PENDENTES"
    font: var(--text-section-head) = 18px
    weight: 600

Cada action card:
  background: var(--bg-surface) = #141414
  border: 1px solid var(--border-default) = #1F1F1F
  border-radius: var(--radius-lg) = 12px
  padding: 16px
  margin-bottom: 8px

  Layout interno:
    Left: Lucide icon (20px, cor contextual)
    Center:
      Titulo: texto principal (14px medium, --text-primary)
      Subtitulo: contexto (12px, --text-secondary)
    Right: CTA button

  CTA button:
    variant: outline
    size: sm
    border: 1px solid var(--border-interactive) = #3D3D3D
    color: var(--text-primary)
    hover: border-color var(--accent-primary), glow sutil

    Para acoes urgentes (criativos >72h):
      variant: default (solid)
      background: var(--accent-primary) = #7C3AED
      hover: glow-primary
```

**Acoes previstas:**

| Icon (Lucide) | Titulo | Subtitulo | CTA | Urgencia |
|---------------|--------|-----------|-----|----------|
| AlertTriangle | X criativos em TEST > 72h | Precisam decisao WIN/KILL | Revisar Criativos | ALTA (CTA solid) |
| Package | X imports CSV aguardando | PublicWWW (N), Semrush (N) | Processar Imports | MEDIA (CTA outline) |
| TrendingUp | X ofertas novas desde ontem | Adicionadas via import | Ver Novas Ofertas | BAIXA (CTA outline) |
| Clock | Trafego desatualizado >7d | X dominios sem update | Atualizar Trafego | MEDIA |

**Regras de visibilidade:**
- Cada acao so aparece se o contador > 0
- Ordenadas por urgencia (ALTA primeiro)
- Se zero acoes: mostra estado "Tudo em dia" com checkmark verde + glow success momentaneo

**ADHD-UX-10 (direcao clara):** Cada acao tem CTA explicito. O operador nao precisa pensar "o que eu faco?" — o botao diz.
**ADHD-UX-03 (acao unica):** Uma acao primaria (solid) por vez — a mais urgente. Resto e outline.

---

### 5. Acoes Rapidas Section

```
Section header:
  titulo: "ACOES RAPIDAS"
    font: var(--text-section-head) = 18px
    weight: 600

Layout: grid 3 colunas, gap 12px

Cada quick action:
  background: var(--bg-surface) = #141414
  border: 1px solid var(--border-default) = #1F1F1F
  border-radius: var(--radius-lg) = 12px
  padding: 16px
  text-align: center
  cursor: pointer
  transition: all 200ms ease

  Hover:
    border-color: var(--accent-primary)
    box-shadow: var(--glow-primary)
    transform: translateY(-1px)

  Icon: Lucide, 24px, var(--accent-primary)
  Label: 12px, var(--text-secondary), uppercase
```

**Acoes:**

| Icon (Lucide) | Label | Acao | Shortcut |
|---------------|-------|------|----------|
| Upload | Importar CSV | Abre UniversalImportModal | Ctrl+I |
| Search | Buscar (Cmd+K) | Abre CommandPalette | Cmd+K |
| Plus | Quick Add Oferta | Abre QuickAddOfferModal | Ctrl+N |

**ADHD-UX-13 (keyboard-first):** Shortcuts visiveis em tooltip de cada botao.
**ADHD-UX-05 (feedback instantaneo):** Hover tem glow + micro-translate.

---

### 6. Footer

```
Timestamp de atualizacao:
  "Ultima atualizacao: ha 2 minutos"
  font: var(--text-caption) = 11px
  color: var(--text-muted) = #6B7280
  position: bottom-left do content area
```

**ADHD-UX-06:** Reforco de quando os dados foram atualizados pela ultima vez.

---

## Hierarquia Visual (Z-Pattern de Leitura)

```
1. KPI Row ............ Scan rapido: numeros grandes, cores
2. Spike cards ........ Atencao imediata: orange pulse, % variacao
3. Acoes pendentes .... O que fazer: CTAs explicitos
4. Acoes rapidas ...... Atalhos: 1 click para acoes frequentes
```

O layout segue a hierarquia `KPI > Alert > Action > Quick Access` — do mais urgente ao mais utilitario. O operador ADHD escaneia de cima para baixo em 5-10 segundos e identifica o que precisa de atencao.

---

## Responsive Behavior

```
>= 1280px: 4 KPIs em row, spike + acoes lado a lado (2 colunas)
>= 1024px: 4 KPIs em row, spike + acoes empilhados
>= 768px:  2 KPIs por row (2x2), tudo empilhado
< 768px:   1 KPI por row, tudo empilhado
```

---

## Data Sources (Supabase)

| Secao | Query/RPC |
|-------|-----------|
| KPI: Ofertas no Radar | `count(*) from spied_offers where workspace_id = X` |
| KPI: Spikes 7d | `count(*) from spike_alerts where created_at > now() - interval '7 days'` |
| KPI: Imports pendentes | `count(*) from import_batches where status = 'pending'` |
| KPI: Criativos >72h | `count(*) from ad_creatives where status = 'testing' and updated_at < now() - interval '72 hours'` |
| Spike cards | `select * from spike_alerts order by change_percent desc limit 3` |
| Ofertas novas | `count(*) from spied_offers where created_at > now() - interval '1 day'` |

---

## Estado Vazio (Zero State)

```
Quando nao ha spikes nem acoes pendentes:

+--------------------------------------------------+
|  [CheckCircle icon, 48px, --accent-green]        |
|                                                    |
|  Tudo em dia!                                      |
|  Nenhuma acao pendente. Bora espionar?             |
|                                                    |
|  [Importar CSV]  [Abrir Radar]                     |
+--------------------------------------------------+

Background: var(--bg-surface)
Border: 1px solid var(--accent-green-20)
Glow momentaneo: var(--glow-success) por 2s ao carregar
```

**ADHD-UX-10:** Empty state NUNCA e vazio — sempre tem CTA.
**ADHD-UX-15 (celebracao):** "Tudo em dia" com glow verde = recompensa visual.

---

## Notas de Implementacao

1. **Rota:** `/briefing` ou `/` (pagina inicial pos-login)
2. **Componente:** `src/features/dashboard/components/DailyBriefing.tsx`
3. **Frequencia de refresh:** A cada 5 minutos (React Query staleTime)
4. **Realtime:** Spike alerts via Supabase Realtime (pg_notify) — novo spike aparece instantaneamente
5. **SimilarWeb e fonte principal** de trafego total — dados de visits vem de SimilarWeb quando disponivel, SEMrush para organico apenas

---

*Uma — desenhando com empatia para quem pensa em imagens e vive em velocidade*
