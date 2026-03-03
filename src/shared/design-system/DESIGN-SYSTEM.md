# DR OPS Design System — Pattern Library

> **Version:** 2.0 | **Theme:** Dark-only | **Updated:** 2026-03-03
> **Source of Truth:** `tokens.yaml` → `tokens.css` → Tailwind config → Components
> **Architecture:** Atomic Design (Atoms → Molecules → Organisms → Templates → Pages)

---

## 1. Filosofia

**Formula:** `Command Center + Warm Glow in Darkness + Precision Tool + Stealth Wealth`

O design system do DR OPS traduz a estetica de um **command center de operacoes** — monitores em sala escura, LED strips quentes nas bordas, dados brilhando como estrelas contra escuridao profunda.

| Pilar | Traducao para UI |
|-------|-----------------|
| **Command Center** | Dark backgrounds (#0A0A0A), alta densidade de dados, layout grid rigido |
| **Warm Glow in Darkness** | Luz como recurso precioso — glow effects reservados para elementos que merecem atencao |
| **Precision Tool** | Bordas thin (1px), tipografia Inter/JetBrains Mono, espacamento consistente |
| **Stealth Wealth** | Superficie limpa, momentos de impacto visual reservados para dados criticos |

**Principio central:** *"Luz quente cirurgica emergindo de escuridao profunda"* — cada elemento luminoso na interface deve ter proposito. Glow nunca e decorativo.

---

## 2. ADHD Design Principles

> Documento completo: [`outputs/ux-design/dr-core/reports/adhd-design-principles.md`](../../../../outputs/ux-design/dr-core/reports/adhd-design-principles.md)

O operador tem perfil ADHD confirmado (Atencao Concentrada P20, Memoria Visual P90). Todas as decisoes de componente devem respeitar estas 15 regras:

| # | Principio | Regra-chave |
|---|-----------|-------------|
| UX-01 | Zero Telas Mortas | Todo loading DEVE ter feedback visual (skeleton, shimmer, progress) |
| UX-02 | Visual-First Information | sparkline > numero com cor > badge > texto puro |
| UX-03 | Acao Unica por Contexto | 1 CTA primario por view/modal, secundarios em ghost/outline |
| UX-04 | Flow Ininterrupto | Nunca interromper hiperfoco com modais bloqueantes |
| UX-05 | Feedback Instantaneo | Toda interacao produz resposta visual em <100ms |
| UX-06 | Ancoragem Temporal | Tempo relativo ("ha 3 dias") alem do absoluto |
| UX-07 | Sistema como Organizador | Auto-classificar, auto-agrupar, auto-sugerir |
| UX-08 | Impulsividade Protegida | Destrutivas = undo 10s; construtivas = sem confirmacao |
| UX-09 | Painel Unico | Tudo na mesma tela ou a 1 click de distancia |
| UX-10 | "O Que Fazer Agora" | Toda tela comunica a proxima acao recomendada |
| UX-11 | Luz Quente como Recompensa | Warm glow (amber/gold) para sucesso; max 3-5 glows por tela |
| UX-12 | Densidade Hierarquica | KPI hero > chart > tabela > metadata |
| UX-13 | Keyboard-First | Toda acao frequente tem atalho; j/k para navegacao |
| UX-14 | Memoria Contextual Vinculada | Toda informacao vinculada a entidade pai |
| UX-15 | Celebracao de Progresso | Marcos visuais para imports, promocoes, winners |

---

## 3. Catalogo de Tokens

Source: `tokens.yaml` (96 tokens) → `tokens.css` (CSS custom properties)

### 3.1 Foundation — Backgrounds & Surfaces

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-void` | `#000000` | Pure black — max contrast areas |
| `--bg-base` | `#0A0A0A` | App background principal |
| `--bg-deep` | `#0D1117` | Background alternativo frio |
| `--bg-surface` | `#141414` | Cards, panels, containers |
| `--bg-elevated` | `#1A1A1A` | Modals, popovers |
| `--bg-raised` | `#1E1E2E` | Hover states, higher elevation |
| `--bg-subtle` | `#252830` | Inputs, interactive areas |

### 3.2 Primary Accent — Violet

| Token | Valor | Uso |
|-------|-------|-----|
| `--accent-primary` | `#7C3AED` | CTAs primarios, active states, ring |
| `--accent-primary-light` | `#8B5CF6` | Hover states, badges premium |
| `--accent-primary-soft` | `#A855F7` | Glows, ambient effects |
| `--accent-primary-muted` | `rgba(124,58,237,0.2)` | Background de elementos ativos |

### 3.3 Secondary Accents

| Token | Valor | Uso |
|-------|-------|-----|
| `--accent-teal` | `#00D4AA` | Charts, dados positivos, links |
| `--accent-cyan` | `#06B6D4` | Informacional, sparklines |
| `--accent-green` | `#22C55E` | Success, metricas positivas |
| `--accent-blue` | `#3B82F6` | Links, info, graficos |
| `--accent-amber` | `#D4A574` | LED-glow signature, warm highlights |
| `--accent-gold` | `#C4954A` | Premium badges, metalico |
| `--accent-orange` | `#F97316` | Spikes, alerts urgentes |

### 3.4 Semantic Colors

| Token | Valor | Uso |
|-------|-------|-----|
| `--semantic-success` | `#22C55E` | Acao completada, oferta ativa |
| `--semantic-warning` | `#EAB308` | Atencao, dados incompletos |
| `--semantic-error` | `#EF4444` | Erro, oferta morta, queda |
| `--semantic-danger` | `#F43F5E` | Acoes destrutivas, alertas criticos |
| `--semantic-info` | `#3B82F6` | Informacional, ajuda |
| `--semantic-spike` | `#F97316` | Spike detectado (>100%) |
| `--semantic-hot` | `#EF4444` | Oferta hot — prioridade maxima |

### 3.5 Text Colors

| Token | Valor | Uso |
|-------|-------|-----|
| `--text-primary` | `#FFFFFF` | Headings, KPIs |
| `--text-body` | `#F5F0EB` | Body text (off-white) |
| `--text-secondary` | `#949494` | Labels, metadata |
| `--text-muted` | `#6B7280` | Placeholders, disabled |

### 3.6 Borders

| Token | Valor | Uso |
|-------|-------|-----|
| `--border-default` | `#1F1F1F` | Bordas padrao |
| `--border-subtle` | `#2D2D2D` | Separadores |
| `--border-interactive` | `#3D3D3D` | Inputs, hover states |
| `--border-glow` | `rgba(124,58,237,0.25)` | Glow violet |
| `--border-glow-warm` | `rgba(212,165,116,0.25)` | Glow amber |

### 3.7 Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-sm` | `6px` | Badges, pills |
| `--radius-md` | `8px` | Buttons, inputs |
| `--radius-lg` | `12px` | Cards, panels |
| `--radius-xl` | `16px` | Modais, large containers |

### 3.8 Glows / Shadows

| Token | Valor | Uso |
|-------|-------|-----|
| `--glow-primary` | `0 0 20px rgba(124,58,237,0.15)` | Cards focados, active |
| `--glow-amber` | `0 0 20px rgba(212,165,116,0.15)` | Warm LED signature |
| `--glow-teal` | `0 0 20px rgba(0,212,170,0.15)` | Data highlights |
| `--glow-success` | `0 0 12px rgba(34,197,94,0.15)` | Completed actions |
| `--glow-error` | `0 0 12px rgba(239,68,68,0.15)` | Destructive alerts |

### 3.9 Opacity Tokens (21 tokens)

Consolidacao de 37 variantes RGBA inline. Niveis: `-10` (10%), `-20` (20%), `-40` (40%).

| Token | Valor | Uso |
|-------|-------|-----|
| `--accent-primary-10` | `rgba(124,58,237,0.1)` | Hover states violet |
| `--accent-primary-20` | `rgba(124,58,237,0.2)` | Borders, badges violet |
| `--accent-primary-40` | `rgba(124,58,237,0.4)` | Fills densos violet |
| `--accent-teal-10` | `rgba(0,212,170,0.1)` | Backgrounds sutis teal |
| `--accent-teal-20` | `rgba(0,212,170,0.2)` | Borders, badges teal |
| `--accent-teal-40` | `rgba(0,212,170,0.4)` | Heatmap levels |
| `--accent-amber-10` | `rgba(212,165,116,0.1)` | Backgrounds amber |
| `--accent-amber-20` | `rgba(212,165,116,0.2)` | Borders amber |
| `--accent-blue-10` | `rgba(59,130,246,0.1)` | Backgrounds blue |
| `--accent-blue-20` | `rgba(59,130,246,0.2)` | Borders blue |
| `--accent-green-10` | `rgba(34,197,94,0.1)` | Backgrounds green |
| `--accent-green-20` | `rgba(34,197,94,0.2)` | Borders green |
| `--accent-green-40` | `rgba(34,197,94,0.4)` | Fills green |
| `--semantic-error-10` | `rgba(239,68,68,0.1)` | Backgrounds error |
| `--semantic-error-20` | `rgba(239,68,68,0.2)` | Borders error |
| `--semantic-warning-10` | `rgba(234,179,8,0.1)` | Backgrounds warning |
| `--semantic-warning-20` | `rgba(234,179,8,0.2)` | Borders warning |
| `--text-muted-10` | `rgba(107,114,128,0.1)` | Backgrounds muted |
| `--text-muted-20` | `rgba(107,114,128,0.2)` | Separadores muted |
| `--accent-gold-20` | `rgba(196,149,74,0.2)` | Premium badges gold |
| `--semantic-spike-10` | `rgba(249,115,22,0.1)` | Background spike alerts |
| `--semantic-spike-20` | `rgba(249,115,22,0.2)` | Border spike alerts |

### 3.10 Glass & Overlay

| Token | Valor | Uso |
|-------|-------|-----|
| `--glass-solid` | `rgba(20,20,20,0.92)` | Tooltips, menus |
| `--glass-interactive` | `rgba(20,20,20,0.8)` | Modais, popovers |
| `--overlay-dark` | `rgba(0,0,0,0.5)` | Backdrop de modais |
| `--overlay-light` | `rgba(0,0,0,0.3)` | Backdrop de drawers |
| `--border-glass` | `rgba(255,255,255,0.05)` | Border sutil glass |

### 3.11 Typography

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-sans` | `Inter, system-ui, sans-serif` | Primary font |
| `--font-mono` | `JetBrains Mono, Fira Code, monospace` | Technical data |
| `--text-kpi` | `48px` / weight 700 | KPI numbers |
| `--text-page-title` | `24px` / weight 600 | Page titles |
| `--text-section-head` | `18px` / weight 600 | Section headings |
| `--text-card-title` | `16px` / weight 500 | Card titles |
| `--text-body-size` | `14px` / weight 400 | Body text |
| `--text-label` | `12px` / weight 400 | Labels |
| `--text-caption` | `11px` / weight 400 | Captions, timestamps |

### 3.12 Animation

| Token | Valor | Uso |
|-------|-------|-----|
| `--duration-fast` | `150ms` | Fade-in, tooltips |
| `--duration-normal` | `200ms` | Hover, focus transitions |
| `--duration-slow` | `400ms` | Sparkline draw |
| `--duration-glow-pulse` | `2s` | Spike detection pulse |
| `--duration-shimmer` | `1.5s` | Loading skeletons |
| `--ease-out` | `cubic-bezier(0.16,1,0.3,1)` | Content entrance |
| `--ease-in-out` | `cubic-bezier(0.45,0,0.55,1)` | Glow pulse |

### 3.13 Spacing

| Token | Valor | Uso |
|-------|-------|-----|
| `--space-card-gap` | `16px` | Gap entre cards |
| `--space-section-gap` | `24px` | Gap entre secoes |
| `--space-card-padding` | `16px` | Padding de cards |
| `--space-card-padding-lg` | `24px` | Padding de cards grandes |

### 3.14 Layout

| Token | Valor | Uso |
|-------|-------|-----|
| `--sidebar-width` | `240px` | Sidebar expandida |
| `--sidebar-width-collapsed` | `64px` | Sidebar colapsada |
| `--content-max-width` | `1440px` | Largura maxima |

---

## 4. Catalogo de Componentes

### Primitives (Atoms)

#### LEDGlowBorder

Traduz LED strip lighting do aesthetic profile para bordas com glow. Aplica borda fina (1-2px) com box-shadow colorido em uma direcao.

**Props:**

| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `variant` | `"primary" \| "amber" \| "teal" \| "success" \| "error" \| "spike"` | `"primary"` | Cor do glow |
| `intensity` | `"subtle" \| "medium" \| "strong"` | `"subtle"` | Intensidade do efeito |
| `animated` | `boolean` | `false` | Ativa glow-pulse animation |
| `position` | `"left" \| "bottom" \| "top" \| "right"` | `"bottom"` | Direcao da borda |
| `className` | `string` | — | Classes adicionais |

**Quando usar:** Cards que precisam de destaque direcional (sidebar active, spike alerts, sections).
**Quando NAO usar:** Decoracao pura, elementos que nao merecem destaque, listas internas.

```tsx
<LEDGlowBorder variant="spike" position="left" intensity="medium" animated>
  <div className="p-4">Spike detected: +230%</div>
</LEDGlowBorder>
```

---

#### AmbientGlow

Envoltorio que aplica box-shadow ambient multi-camada (border + mid + far). Cria efeito de "luz emanando" de um card.

**Props:**

| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `color` | `"primary" \| "amber" \| "teal" \| "success" \| "error" \| "spike"` | `"primary"` | Cor do ambient glow |
| `intensity` | `"subtle" \| "medium" \| "strong"` | `"medium"` | Intensidade (opacity) |
| `className` | `string` | — | Classes adicionais |

**Quando usar:** Destacar cards importantes (KPIs, spike alerts novos, winner badges).
**Quando NAO usar:** Mais de 3-5 elementos por tela. Nunca em listas/tabelas.

```tsx
<AmbientGlow color="amber" intensity="subtle">
  <div className="p-6 bg-[var(--bg-surface)] rounded-xl">
    Winner offer with warm glow
  </div>
</AmbientGlow>
```

---

#### GlassmorphismCard

Card com backdrop-filter blur e background semi-transparente. Para overlays, tooltips e modais.

**Props:**

| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `blur` | `number` | `8` | Intensidade do blur (px) |
| `opacity` | `"solid" \| "interactive" \| "light"` | `"interactive"` | Nivel de opacidade |
| `className` | `string` | — | Classes adicionais |

**Quando usar:** Modais, tooltips, popovers, command palette, menus flutuantes.
**Quando NAO usar:** Cards regulares de conteudo, tabelas, secoes de pagina.

```tsx
<GlassmorphismCard blur={12} opacity="solid">
  <div className="p-4">Modal content with glass effect</div>
</GlassmorphismCard>
```

---

### Components (Atoms)

#### StatusBadge

Badge com icone Lucide + cor semantica para 13 status de oferta. Suporta animacao glow-pulse para status hot/winner.

**Props:**

| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `status` | `OfferStatus` | — | Status da oferta (13 opcoes) |
| `size` | `"sm" \| "md"` | `"sm"` | Tamanho do badge |
| `animated` | `boolean` | `false` | Ativa glow-pulse (hot, winner) |
| `className` | `string` | — | Classes adicionais |

**Status suportados:** `radar`, `analyzing`, `hot`, `scaling`, `cloned`, `dying`, `dead`, `vault`, `never_scaled`, `winner`, `killed`, `testing`, `draft`

**Quando usar:** Tabelas do radar, cards de oferta, filtros, detail views.
**Quando NAO usar:** Status que nao sao de oferta; para status genericos use badges do shadcn.

```tsx
<StatusBadge status="hot" animated />
<StatusBadge status="scaling" size="md" />
<StatusBadge status="winner" animated />
```

---

#### SparklineBadge

Mini grafico SVG inline que mostra tendencia de dados em ~48x20px. Auto-detecta trend (up/down/stable) e aplica cores semanticas.

**Props:**

| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `data` | `number[]` | — | Array de valores (min 2) |
| `trend` | `"up" \| "down" \| "stable"` | auto-detect | Override da tendencia |
| `width` | `number` | `48` | Largura SVG |
| `height` | `number` | `20` | Altura SVG |
| `color` | `string` | auto (por trend) | Override de cor |
| `className` | `string` | — | Classes adicionais |

**Quando usar:** Colunas de trafego em tabelas, KPI cards, resumo de tendencias.
**Quando NAO usar:** Dados com menos de 2 pontos; graficos que precisam de eixos/labels.

```tsx
<SparklineBadge data={[100, 120, 95, 180, 210]} />
<SparklineBadge data={[500, 400, 300, 200]} trend="down" />
```

---

### Molecules

#### DataMetricCard

Card de KPI com valor grande (48px bold), label, trend indicator, change percentage e sparkline opcional. Hover glow opcional.

**Props:**

| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `value` | `string \| number` | — | Valor principal do KPI |
| `label` | `string` | — | Label descritivo |
| `change` | `number` | — | Variacao percentual |
| `trend` | `"up" \| "down" \| "stable"` | — | Direcao da tendencia |
| `sparklineData` | `number[]` | — | Dados para sparkline |
| `icon` | `LucideIcon` | — | Icone Lucide no header |
| `glowOnHover` | `boolean` | `false` | Ativa glow violet no hover |
| `className` | `string` | — | Classes adicionais |

**Quando usar:** Dashboard KPIs, resumo de metricas, header de paginas de detalhe.
**Quando NAO usar:** Dados sem contexto numerico; metricas em tabelas (usar SparklineBadge direto).

```tsx
<DataMetricCard
  value="12,483"
  label="Total Radar"
  change={8.3}
  trend="up"
  sparklineData={[10200, 10800, 11500, 12100, 12483]}
  icon={Radar}
  glowOnHover
/>
```

---

#### SpikeAlertCard

Card de alerta de spike composto por LEDGlowBorder (left, spike) + AmbientGlow (quando novo). Mostra nome da oferta, dominio, variacao percentual e visitas before/after.

**Props:**

| Prop | Tipo | Default | Descricao |
|------|------|---------|-----------|
| `offerName` | `string` | — | Nome da oferta |
| `domain` | `string` | — | Dominio com spike |
| `changePercent` | `number` | — | Variacao percentual |
| `visitsBefore` | `number` | — | Visitas antes |
| `visitsAfter` | `number` | — | Visitas depois |
| `detectedAt` | `string` | — | Timestamp de deteccao |
| `onClick` | `() => void` | — | Handler de click |
| `isNew` | `boolean` | `false` | Spike novo (ativa glow pulsante) |
| `className` | `string` | — | Classes adicionais |

**Quando usar:** Dashboard spike alerts, feed de atividade, notificacoes.
**Quando NAO usar:** Alertas genericos que nao sao spikes de trafego.

```tsx
<SpikeAlertCard
  offerName="Alpha Offer"
  domain="alpha-offer.com"
  changePercent={230}
  visitsBefore={5000}
  visitsAfter={16500}
  detectedAt="ha 2h"
  isNew
  onClick={() => navigate(`/spy/${offerId}`)}
/>
```

---

## 5. Guidelines

### 5.1 Quando Usar Glow

Glow e o recurso visual mais precioso do sistema. Usar com parcimonia.

| Situacao | Glow? | Tipo |
|----------|-------|------|
| Spike detectado (>100%) | Sim | `glow-pulse` orange, animated |
| Card de oferta HOT | Sim | `border-glow-warm` sutil, permanente |
| Card selecionado/focado | Sim | `glow-primary` violet |
| Sucesso de import | Sim | `ambient-glow` green/amber, momentaneo |
| Sidebar item ativo | Sim | LED left, gradient violet |
| Card regular em lista | **Nao** | Apenas `border-default` |
| Botoes regulares | **Nao** | Hover change de border-color |
| Todos os cards numa grid | **Nao** | Max 3-5 glows por tela |

### 5.2 Hierarquia de Cores

| Cor | Proposito | Frequencia |
|-----|-----------|------------|
| **Violet** (`#7C3AED`) | Acao primaria, CTAs, active states, ring | 40% UI |
| **Amber** (`#D4A574`) | Warmth signature, LED glow, clone | 15% UI / 60% pessoal |
| **Teal** (`#00D4AA`) | Dados, charts, links, highlights | 39% UI |
| **Orange** (`#F97316`) | Urgencia, spikes, alertas quentes | 20% UI |
| **Gold** (`#C4954A`) | Premium, winner, badges metalicos | 10% UI |
| **Green** (`#22C55E`) | Sucesso, positivo, scaling | 35% UI |
| **Blue** (`#3B82F6`) | Info, links secundarios | 25% UI |
| **Red** (`#EF4444`) | Erro, morte, queda, hot | Semantico |

### 5.3 Animacoes

**Permitidas:**

| Animacao | Duracao | Uso |
|----------|---------|-----|
| `glow-pulse` | 2s infinite | Spike detection, alerts, new data |
| `fade-in` | 150ms | Entrada de conteudo, tooltips |
| `shimmer` | 1.5s infinite | Loading states, skeletons |
| `sparkline-draw` | 400ms | Render inicial de sparklines |
| `slide-in-right` | 200ms | Sidebar expand, panel reveal |

**PROIBIDAS (ADHD-unfriendly):**

| Animacao | Motivo |
|----------|--------|
| `bounce` | Distrai, compete com conteudo |
| `shake` | Ansiedade, sensacao de erro |
| `rotate` | Desorientacao, perde referencia espacial |
| `zoom-in/out` repetido | Instabilidade visual |

**Reduced Motion:** Todas as animacoes respeitam `prefers-reduced-motion: reduce` (WCAG 2.1 SC 2.3.3).

---

## 6. Mapeamento Vision para Implementacao

### Implementado nesta sessao (Phase 4-7)

| Artefato | Path | Tipo |
|----------|------|------|
| tokens.yaml (96 tokens) | `src/shared/design-system/tokens.yaml` | Source of truth |
| tokens.css | `src/shared/design-system/tokens.css` | CSS custom properties |
| LEDGlowBorder | `src/shared/design-system/primitives/LEDGlowBorder.tsx` | Atom (primitive) |
| AmbientGlow | `src/shared/design-system/primitives/AmbientGlow.tsx` | Atom (primitive) |
| GlassmorphismCard | `src/shared/design-system/primitives/GlassmorphismCard.tsx` | Atom (primitive) |
| StatusBadge | `src/shared/design-system/components/StatusBadge.tsx` | Atom |
| SparklineBadge | `src/shared/design-system/components/SparklineBadge.tsx` | Atom |
| DataMetricCard | `src/shared/design-system/components/DataMetricCard.tsx` | Molecule |
| SpikeAlertCard | `src/shared/design-system/components/SpikeAlertCard.tsx` | Molecule |
| ADHD Principles | `outputs/ux-design/dr-core/reports/adhd-design-principles.md` | UX Research |
| 5 Wireframes | `outputs/ux-design/dr-core/wireframes/` | Wireframes |
| A11y Report | `outputs/ux-design/dr-core/reports/a11y-report.md` | QA |
| QA Gate Report | `outputs/ux-design/dr-core/reports/qa-gate-report.md` | QA |

### Backlog (Tier 2/3)

| Item | Prioridade | Descricao |
|------|-----------|-----------|
| HeatmapCalendar | Tier 2 | Organism: calendario de atividade com opacity tokens teal |
| StatusDistributionChart | Tier 2 | Organism: donut chart de distribuicao de status |
| ActivityFeed | Tier 2 | Organism: feed de atividade recente com timeline |
| VirtualizedTable | Tier 2 | Organism: tabela virtualizada generica (TanStack Virtual) |
| useFormDialog | Tier 3 | Hook: pattern de dialog com form + validation |
| RGBA migration | Tier 3 | Migrar ~45 instancias de RGBA inline para opacity tokens |
| Skeleton loaders | Tier 3 | Componentes skeleton para cada section type |
| Breadcrumb Navigation | Tier 3 | Organism: navegacao contextual de breadcrumbs |

---

*Uma — desenhando com empatia para quem pensa em imagens e vive em velocidade*
