# Wireframe 4/5 — Creative Lifecycle: WINNER / KILLED

> **Autor:** Uma (@ux-design-expert) | **Data:** 2026-03-03
> **Fase:** 3 (Wireframes) | **Fidelidade:** Mid-fi (estrutura + tokens + specs)
> **Refs Vision:** aesthetic-profile sec 9.2 Tier 2 (Status Badge System), sec 6.1 (Data Metric Card), sec 7.4 (Stealth Wealth / Display Controlado)
> **Principios ADHD:** UX-03 (acao unica por contexto), UX-05 (feedback instantaneo), UX-10 (direcao clara), UX-11 (warm glow como recompensa), UX-15 (celebracao de progresso), UX-08 (impulsividade protegida)
> **Componente existente:** `src/features/creatives/components/KanbanBoard.tsx`, `CriativoFormDialog.tsx`
> **Status:** FINAL

---

## Conceito

Hoje o lifecycle de criativos e: `draft → active → archived → testing` — sem conceito de WINNER ou KILLED. O operador nao tem como marcar criativos que funcionaram (escalar) vs criativos que falharam (aprender e mover).

O novo lifecycle adiciona os estados terminais **WINNER** e **KILLED** com decision flow baseado em metricas reais (CTR, CPA, ROAS). O Kanban visual reflete o funil: `DRAFT → TEST → WINNER | KILLED`.

**Filosofia Stealth Wealth:** Um criativo WINNER e um momento de **display controlado** — merece tratamento visual premium (gold badge, glow). Um KILLED e **stealth** — muted, mas com campo obrigatorio de learning (o fracasso deve ensinar).

---

## Layout ASCII — Kanban Atualizado

```
+------------------------------------------------------------------+
| SIDEBAR | CRIATIVOS                              [+ Novo] [Filter]|
|         |                                                          |
|         | +------------+ +------------+ +------------+ +----------+|
|         | | DRAFT (5)  | | TEST (3)   | | WINNER (2) | | KILLED  ||
|         | |            | |            | |            | | (8)     ||
|         | | +--------+ | | +--------+ | | +--------+ | | +------+||
|         | | |thumb   | | | |thumb   | | | |[trophy]| | | |thumb |||
|         | | |        | | | |        | | | |  gold  | | | |      |||
|         | | |Criat.01| | | |Criat.03| | | |glow   | | | |muted |||
|         | | |Angulo A| | | |Angulo C| | | |        | | | |      |||
|         | | |        | | | |3d test | | | |Criat.07| | | |Cri.09|||
|         | | |[drag]  | | | |[!]>72h | | | |Angulo G| | | |Ang.I |||
|         | | +--------+ | | +--------+ | | |ROAS 4.2| | | |learn |||
|         | |            | |            | | +--------+ | | +------+||
|         | | +--------+ | | +--------+ | |            | |         ||
|         | | |thumb   | | | |thumb   | | | +--------+ | | +------+||
|         | | |Criat.02| | | |Criat.04| | | |[trophy]| | | |thumb |||
|         | | |Angulo B| | | |Angulo D| | | |        | | | |muted |||
|         | | +--------+ | | |5d test | | | |Criat.08| | | +------+||
|         | |            | | +--------+ | | |Angulo H| | |         ||
|         | | +--------+ | |            | | |ROAS 3.1| | |         ||
|         | | |thumb   | | | +--------+ | | +--------+ | |         ||
|         | | |Criat.05| | | |thumb   | | |            | |         ||
|         | | |Angulo E| | | |Criat.06| | |            | |         ||
|         | | +--------+ | | |Angulo F| | |            | |         ||
|         | |            | | |1d test | | |            | |         ||
|         | |            | | +--------+ | |            | |         ||
|         | +------------+ +------------+ +------------+ +----------+|
+------------------------------------------------------------------+
```

---

## Specs Detalhadas

### 1. Kanban Columns

```
Columns: 4 (DRAFT, TEST, WINNER, KILLED)
Layout: grid-template-columns: repeat(4, 1fr)
Gap: var(--space-card-gap) = 16px
Min column width: 240px
Overflow-x: auto (scroll horizontal se tela estreita)

Column header:
  Layout: flex, space-between, align-center
  padding-bottom: 12px
  border-bottom: 2px solid [column color]  /* LED strip */

  Titulo:
    font: var(--text-card-title) = 16px
    weight: 600
    color: var(--text-primary)

  Count badge:
    font: var(--text-caption) = 11px
    background: [column color]-10  /* opacidade 10% */
    color: [column color]
    border-radius: var(--radius-sm)
    padding: 2px 8px
```

**Column colors (LED strip + badge):**

| Column | Color token | Hex | LED border | Significado |
|--------|------------|-----|------------|-------------|
| DRAFT | `--text-muted` | #6B7280 | 2px solid #6B7280 | Neutro, em preparo |
| TEST | `--accent-primary` | #7C3AED | 2px solid #7C3AED | Ativo, sob observacao |
| WINNER | `--accent-gold` | #C4954A | 2px solid #C4954A | Sucesso, escalar |
| KILLED | `--semantic-error` | #EF4444 | 2px solid #EF4444 | Falhou, aprender |

---

### 2. Card de Criativo — Estado Base (DRAFT / TEST)

```
Container:
  background: var(--bg-surface) = #141414
  border: 1px solid var(--border-default) = #1F1F1F
  border-radius: var(--radius-lg) = 12px
  padding: 0 (thumbnail flush top, content com padding)
  cursor: grab (drag-and-drop)
  transition: all 200ms ease

  Hover:
    border-color: var(--border-interactive)
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3)
    transform: translateY(-2px)

  Dragging:
    opacity: 0.7
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5)
    border-color: var(--accent-primary)

Thumbnail area:
  height: 120px
  width: 100%
  background: var(--bg-subtle) (placeholder se sem imagem)
  border-radius: var(--radius-lg) var(--radius-lg) 0 0
  object-fit: cover
  overflow: hidden

Content area:
  padding: 12px

  Nome:
    font: var(--text-body-size) = 14px
    weight: 500
    color: var(--text-primary)
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis

  Angulo badge:
    font: var(--text-caption) = 11px
    background: var(--accent-primary-10)
    color: var(--accent-primary-light)
    border-radius: var(--radius-sm)
    padding: 2px 8px
    margin-top: 4px
    display: inline-block

  Metricas row (quando em TEST):
    margin-top: 8px
    display: flex
    gap: 8px

    Cada metrica:
      font: var(--text-caption) = 11px
      color: var(--text-secondary)

  Dias em teste (quando em TEST):
    font: var(--text-caption) = 11px
    color: var(--text-muted)
    margin-top: 4px
    "3d em teste" ou "5d em teste"

Footer:
  padding: 8px 12px
  border-top: 1px solid var(--border-default)
  display: flex
  justify-content: space-between

  Three-dot menu: MoreHorizontal (Lucide, 14px)
  Status action: depende do estado
```

---

### 3. Card de Criativo — Estado TEST com Alerta

```
Quando em TEST > 72h (3 dias):
  border: 1px solid var(--semantic-warning) = #EAB308
  box-shadow: 0 0 8px rgba(234, 179, 8, 0.1)

  Warning badge (canto superior direito do thumbnail):
    background: var(--semantic-warning)
    color: var(--bg-base)
    font: var(--text-caption) = 11px, weight 600
    border-radius: 0 var(--radius-lg) 0 var(--radius-sm)
    padding: 4px 8px
    content: "! >72h"

  Footer action:
    [Zap icon] "Decidir" button
    variant: outline, border-color var(--semantic-warning)
    click: abre Decision Modal
```

**ADHD-UX-10 (direcao clara):** >72h = operador PRECISA decidir. Warning visual + CTA "Decidir" direto no card.
**ADHD-UX-06 (ancoragem temporal):** "Xd em teste" ancora no tempo.

---

### 4. Card de Criativo — Estado WINNER

```
Container:
  background: var(--bg-surface)
  border: 1px solid var(--accent-gold) = #C4954A
  box-shadow:
    0 0 0 1px rgba(196, 149, 74, 0.2),
    0 0 20px rgba(196, 149, 74, 0.08)  /* gold ambient glow */
  border-radius: var(--radius-lg)

  /* LED strip bottom — "vitrine de conquista" */
  border-bottom: 3px solid var(--accent-gold)

Trophy badge (canto superior direito do thumbnail):
  background: linear-gradient(135deg, var(--accent-gold), var(--accent-amber))
  color: var(--bg-base)
  font: var(--text-caption) = 11px, weight 700
  border-radius: 0 var(--radius-lg) 0 var(--radius-sm)
  padding: 4px 10px
  icon: Trophy (Lucide, 12px) a esquerda
  content: "WINNER"
  text-transform: uppercase

Metricas inline (abaixo do nome):
  display: grid
  grid-template-columns: 1fr 1fr 1fr
  gap: 4px
  margin-top: 8px

  Cada metrica:
    text-align: center
    Label: 10px, --text-muted, uppercase
    Valor: 14px, weight 600, --accent-green (se positivo)

  | Label | Exemplo | Cor |
  |-------|---------|-----|
  | CTR | 3.2% | --accent-green |
  | CPA | R$18 | --accent-green |
  | ROAS | 4.2x | --accent-gold (destaque) |
```

**ADHD-UX-11 (warm glow):** Gold glow + trophy badge = recompensa visual. O operador VE sucesso.
**ADHD-UX-15 (celebracao):** WINNER e um momento de display controlado (stealth wealth sec 7.4).

---

### 5. Card de Criativo — Estado KILLED

```
Container:
  background: var(--bg-surface)
  border: 1px solid var(--border-default)
  opacity: 0.65  /* muted — nao compete com WINNER */
  border-radius: var(--radius-lg)

  Hover:
    opacity: 0.85 (revelar detalhes ao passar)

Thumbnail:
  filter: grayscale(60%)  /* dessaturar */

Killed badge:
  background: var(--semantic-error-20)
  color: var(--semantic-error)
  font: var(--text-caption) = 11px, weight 600
  icon: X (Lucide, 12px)
  content: "KILLED"

Learning snippet (obrigatorio):
  background: var(--bg-subtle)
  border-left: 2px solid var(--semantic-error) /* LED strip */
  border-radius: var(--radius-sm)
  padding: 6px 8px
  margin-top: 8px

  Label: "Learning:" (10px, --text-muted, uppercase)
  Texto: 12px, --text-secondary, max 2 linhas com ellipsis
  Ex: "CTR baixo — hook nao conectou com dor principal"
```

**ADHD-UX-08 (impulsividade protegida):** Killed nao e deletado — e arquivado com learning. O fracasso ensina.
**Stealth wealth:** Killed e muted (opacity 0.65, grayscale) — nao grita, mas esta la se precisar consultar.

---

### 6. Decision Modal (WINNER / KILL)

```
Trigger: Click "Decidir" no card TEST ou drag para WINNER/KILLED column

+--------------------------------------------------+
| [backdrop blur 8px]                              |
|                                                    |
|  +----------------------------------------------+  |
|  |                                          [X] |  |
|  |  [Zap] Decisao: NutraVida - Angulo Saude     |  |
|  |  Criativo em teste ha 5 dias.                 |  |
|  |                                                |  |
|  |  METRICAS DO TESTE                             |  |
|  |                                                |  |
|  |  CTR (%)           CPA (R$)        ROAS (x)   |  |
|  |  +------------+    +----------+    +--------+  |  |
|  |  | 3.2        |    | 18.50    |    | 4.2    |  |  |
|  |  +------------+    +----------+    +--------+  |  |
|  |  benchmark: 1.5%   target: <R$25   min: 2.5x  |  |
|  |  [checkmark grn]   [checkmark grn]  [check grn]|  |
|  |                                                |  |
|  |  +--------------------------------------------+|  |
|  |  | RECOMENDACAO DO SISTEMA                    ||  |
|  |  |                                            ||  |
|  |  | [Trophy] WINNER — Todas as metricas acima  ||  |
|  |  | dos benchmarks. Recomendado escalar.       ||  |
|  |  |                                            ||  |
|  |  | ou                                         ||  |
|  |  |                                            ||  |
|  |  | [X] KILL — CTR abaixo do benchmark.        ||  |
|  |  | Considere ajustar hook ou angulo.          ||  |
|  |  +--------------------------------------------+|  |
|  |                                                |  |
|  |  Notas de decisao (opcional para WINNER,       |  |
|  |  OBRIGATORIO para KILL)                        |  |
|  |  +--------------------------------------------+|  |
|  |  | O que funcionou / O que aprendemos...      ||  |
|  |  +--------------------------------------------+|  |
|  |                                                |  |
|  |  +-------------------+  +--------------------+ |  |
|  |  | [X] Matar         |  | [Trophy] WINNER!   | |  |
|  |  +-------------------+  +--------------------+ |  |
|  |                                                |  |
|  +----------------------------------------------+  |
+--------------------------------------------------+
```

---

### 7. Decision Modal — Specs

```
Modal container:
  width: min(520px, 90vw)
  background: var(--bg-elevated)
  border: 1px solid var(--border-default)
  border-radius: var(--radius-xl)
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(124, 58, 237, 0.04)

Header:
  icon: Zap (Lucide, 20px, var(--accent-primary))
  titulo: "Decisao: [nome do criativo]"
    font: 18px, weight 600, --text-primary
  subtitulo: "Criativo em teste ha Xd."
    font: 14px, --text-secondary

Metricas (3 inputs inline):
  Layout: grid 3 colunas, gap 16px

  Cada metrica:
    Label: 12px, --text-muted, uppercase
    Input:
      background: var(--bg-subtle)
      border: 1px solid var(--border-interactive)
      border-radius: var(--radius-md)
      font: var(--text-page-title) = 24px (numero grande)
      weight: 700
      color: var(--text-primary)
      text-align: center
      width: 100%
      padding: 12px

    Benchmark label (abaixo do input):
      font: 11px, --text-muted
      content: "benchmark: X" ou "target: <X" ou "min: Xx"

    Indicador (abaixo do benchmark):
      Se valor >= benchmark: CheckCircle (Lucide, 14px, --accent-green)
      Se valor < benchmark: XCircle (Lucide, 14px, --semantic-error)
      Atualiza em tempo real conforme operador digita

Decision tree (auto-calculo):
  CTR > benchmark (1.5%) → check
  CPA < target (R$25) → check
  ROAS > min (2.5x) → check

  Todos check → "WINNER" recomendado
  Qualquer fail → "KILL" recomendado
  Mix → Ambos habilitados, sem recomendacao forte

Recommendation card:
  background: var(--bg-subtle)
  border-radius: var(--radius-md)
  padding: 16px

  Se WINNER:
    border-left: 3px solid var(--accent-gold) /* LED strip */
    icon: Trophy (--accent-gold)
    texto: "WINNER — Todas as metricas acima dos benchmarks. Recomendado escalar."

  Se KILL:
    border-left: 3px solid var(--semantic-error) /* LED strip */
    icon: X (--semantic-error)
    texto: "KILL — [metrica] abaixo do benchmark. Considere ajustar [sugestao]."

Notas textarea:
  background: var(--bg-subtle)
  border: 1px solid var(--border-interactive)
  rows: 3
  placeholder: "O que funcionou / O que aprendemos..."

  Se KILL: borda se torna --semantic-error se vazio + tentativa de submit
  Label adicional: "* Obrigatorio para KILL (o fracasso deve ensinar)"

Footer buttons:
  Layout: flex, gap 12px, justify-end

  Botao KILL:
    variant: outline
    border: 1px solid var(--semantic-error)
    color: var(--semantic-error)
    icon: X (Lucide, 14px)
    label: "Matar"
    hover: background var(--semantic-error-10)

  Botao WINNER:
    background: linear-gradient(135deg, var(--accent-gold), var(--accent-amber))
    color: var(--bg-base) (texto escuro)
    font: weight 600
    icon: Trophy (Lucide, 14px)
    label: "WINNER!"
    hover: box-shadow 0 0 16px rgba(196, 149, 74, 0.3)
    border-radius: var(--radius-md)

  Estado disabled (durante submit):
    opacity: 0.6
    cursor: not-allowed
```

**ADHD-UX-07 (sistema como organizador):** O sistema CALCULA a recomendacao. Operador so confirma ou override.
**ADHD-UX-03 (acao unica):** Dois botoes mas com hierarquia visual clara — WINNER e o CTA premium (gold gradient), KILL e outline discreto.
**ADHD-UX-05 (feedback instantaneo):** Indicadores check/x atualizam em tempo real conforme digita metricas.

---

### 8. Success States

```
WINNER marcado:
  1. Modal fecha com fade-out
  2. Card anima para coluna WINNER:
     - Slide horizontal (300ms ease-out)
     - Badge Trophy aparece com scale-in (200ms)
     - Gold glow pulse momentaneo (1 ciclo, 2s)
  3. Toast:
     +------------------------------------------+
     | [Trophy gold] Criativo WINNER!            |
     | NutraVida - Angulo Saude promovido.       |
     | ROAS: 4.2x                                |
     +------------------------------------------+
     border-left: 3px solid var(--accent-gold)
     auto-dismiss: 5s

KILLED marcado:
  1. Modal fecha
  2. Card anima para coluna KILLED:
     - Slide horizontal (300ms ease-out)
     - Opacity reduz para 0.65 (200ms)
     - Thumbnail dessatura (grayscale transition)
  3. Toast:
     +------------------------------------------+
     | [X muted] Criativo killed                 |
     | Learning salvo.         [Undo 10s]        |
     +------------------------------------------+
     border-left: 3px solid var(--semantic-error)
     auto-dismiss: 10s (mais longo por ter undo)
```

**ADHD-UX-15 (celebracao):** WINNER tem celebracao real — gold pulse, trophy, ROAS no toast.
**ADHD-UX-08 (impulsividade protegida):** KILL tem undo de 10s — protege impulsividade.
**ADHD-UX-11 (warm glow):** Gold glow e reservado para WINNER — momento de display controlado.

---

### 9. Drag-and-Drop entre Colunas

```
DRAFT → TEST: Livre (drag direto)
TEST → WINNER: Abre Decision Modal antes de confirmar
TEST → KILLED: Abre Decision Modal antes de confirmar
WINNER → TEST: Livre (retorno a teste)
KILLED → TEST: Livre (reabrir teste)
DRAFT → WINNER/KILLED: Bloqueado (nao pode pular TEST)

Feedback visual durante drag:
  Card fantasma: opacity 0.5, box-shadow com glow da coluna destino
  Coluna destino: border muda para highlight color, background --bg-raised

  Drop zone valido: border var(--accent-green), cursor grab
  Drop zone invalido: border var(--semantic-error), cursor not-allowed
```

---

## Data Model

```sql
-- Novos valores para o enum de status
-- Atual: draft, active, archived, testing
-- Novo:  draft, testing, winner, killed

ALTER TABLE ad_creatives ADD COLUMN IF NOT EXISTS decision_metrics JSONB;
-- { ctr: 3.2, cpa: 18.50, roas: 4.2 }

ALTER TABLE ad_creatives ADD COLUMN IF NOT EXISTS decision_notes TEXT;
-- Learning obrigatorio para KILLED

ALTER TABLE ad_creatives ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ;
-- Quando a decisao foi tomada

ALTER TABLE ad_creatives ADD COLUMN IF NOT EXISTS test_started_at TIMESTAMPTZ;
-- Quando entrou em TEST (para calcular dias)
```

**Status mapping (backward compatible):**

| Status antigo | Status novo | Migracao |
|--------------|------------|----------|
| draft | draft | Mantem |
| testing | testing | Mantem |
| active | winner | Migrar (ativo = estava funcionando) |
| archived | killed | Migrar (arquivado = parou de funcionar) |

---

## Benchmarks Configuraveis

```
Default benchmarks (armazenados em settings ou workspace config):

| Metrica | Default | Operador pode ajustar |
|---------|---------|----------------------|
| CTR min | 1.5% | Sim |
| CPA max | R$25.00 | Sim |
| ROAS min | 2.5x | Sim |

Localizacao: Settings > Criativos > Benchmarks de Decisao
Ou: inline no Decision Modal (gear icon ao lado de "METRICAS DO TESTE")
```

---

## Keyboard Shortcuts

| Acao | Shortcut |
|------|----------|
| Novo criativo | Ctrl+N (no contexto /criativos) |
| Decidir criativo selecionado | D |
| Marcar WINNER (no modal) | Cmd+Enter |
| Marcar KILLED (no modal) | Cmd+Backspace |
| Fechar modal | Escape |

---

## Notas de Implementacao

1. **Componente Kanban:** Reescrever `KanbanBoard.tsx` com 4 colunas (DRAFT, TEST, WINNER, KILLED)
2. **Decision Modal:** `src/features/creatives/components/DecisionModal.tsx`
3. **Hook:** `useCreativeDecision()` — calcula recomendacao, valida, submete
4. **DnD:** Manter lib existente (se dnd-kit ou react-beautiful-dnd) — adicionar gate para TEST→WINNER/KILLED
5. **Migration:** Novos campos em `ad_creatives` (decision_metrics, decision_notes, decided_at, test_started_at)
6. **Backward compat:** active→winner, archived→killed na migration

---

*Uma — todo criativo merece um veredito, todo fracasso merece uma licao*
