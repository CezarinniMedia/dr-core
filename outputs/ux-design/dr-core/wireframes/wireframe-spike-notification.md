# Wireframe 5/5 — Spike Notification System

> **Autor:** Uma (@ux-design-expert) | **Data:** 2026-03-03
> **Fase:** 3 (Wireframes) | **Fidelidade:** Mid-fi (estrutura + tokens + specs)
> **Refs Vision:** aesthetic-profile sec 2.4 (`--semantic-spike`), sec 9.4 (glow-pulse animation), sec 6.1 (Data Metric Card), sec 7.4 (Display Controlado)
> **Principios ADHD:** UX-04 (flow ininterrupto), UX-05 (feedback instantaneo), UX-06 (ancoragem temporal), UX-10 (direcao clara), UX-11 (warm glow como recompensa)
> **Infra existente:** `spike_alerts` tabela, `detect_spikes()` RPC, `mv_spike_detection` MV, Supabase Realtime
> **Status:** FINAL

---

## Conceito

O DR OPS ja tem o backend de spike detection (tabela `spike_alerts`, RPC `detect_spikes()`, Materialized View `mv_spike_detection` com refresh a cada 2h). O que FALTA e a camada de UI: o operador nao e notificado quando um spike acontece.

O Spike Notification System tem 3 camadas:
1. **Badge no header** — numero de spikes nao vistos (sempre visivel)
2. **Dropdown** — lista de spikes recentes com contexto
3. **Toast realtime** — notificacao instantanea quando spike novo e detectado

Os spikes sao a informacao mais time-sensitive do sistema. Um spike de trafego pode significar uma oferta nascendo — o operador que age primeiro, ganha (principio Finch).

---

## Layout ASCII — Componente 1: Header Badge

```
+------------------------------------------------------------------+
| [Logo] DR OPS        [Cmd+K]    [Bell+badge]   [Avatar]          |
+------------------------------------------------------------------+
                                       ^
                                       |
                        +-----+
                        | [Bell icon]  |
                        | [7]          |  ← badge com numero
                        +-----+

Badge specs:
  Container (bell area):
    width: 36px
    height: 36px
    display: flex
    align-items: center
    justify-content: center
    border-radius: var(--radius-md)
    cursor: pointer
    position: relative

    Hover:
      background: var(--bg-raised)

  Bell icon:
    icon: Bell (Lucide, 18px)
    color: var(--text-secondary)

    Quando spikes > 0:
      color: var(--semantic-spike) = #F97316

  Notification count badge:
    position: absolute
    top: -2px
    right: -2px
    min-width: 18px
    height: 18px
    background: var(--semantic-spike) = #F97316
    color: var(--bg-base) = #0A0A0A (texto escuro)
    font: var(--text-caption) = 11px
    weight: 700
    border-radius: 9px (pill)
    padding: 0 5px
    display: flex
    align-items: center
    justify-content: center
    border: 2px solid var(--bg-base)  /* ring para separar do bg */

    Quando spikes > 0:
      animation: glow-pulse 2s ease-in-out infinite
      box-shadow: 0 0 8px rgba(249, 115, 22, 0.4)

    Quando spikes == 0:
      display: none (badge some completamente)

    Numero > 99:
      content: "99+"
```

**ADHD-UX-05 (feedback instantaneo):** Badge pulsa com orange glow — visivel de qualquer tela sem bloquear nada.
**ADHD-UX-04 (flow ininterrupto):** Badge e passivo — nao interrompe, apenas informa. Operador decide quando olhar.

---

## Layout ASCII — Componente 2: Spike Dropdown

```
Click no Bell icon abre dropdown:

+------------------------------------------------------------------+
| [Logo] DR OPS        [Cmd+K]    [Bell+badge]   [Avatar]          |
+------------------------------------------------------------------+
                                       |
                                       v
                        +----------------------------------+
                        | SPIKES RECENTES        [Mark all]|
                        |                        as seen   |
                        +----------------------------------+
                        | NEW                              |
                        | +------------------------------+ |
                        | | [pulse] NutraVida Plus       | |
                        | | nutravida.com      +342%     | |
                        | | 12,400 → 54,800    ha 6h     | |
                        | +------------------------------+ |
                        | | [pulse] SlimFast BR          | |
                        | | slimfast.com.br    +187%     | |
                        | | 8,200 → 23,534    ha 14h    | |
                        | +------------------------------+ |
                        |                                  |
                        | EARLIER                          |
                        | +------------------------------+ |
                        | | KetoMax                      | |
                        | | ketomax.shop       +124%     | |
                        | | 4,100 → 9,184     ha 1d     | |
                        | +------------------------------+ |
                        | | FitPro Ultra                 | |
                        | | fitpro.com.br      +108%     | |
                        | | 6,300 → 13,104    ha 2d     | |
                        | +------------------------------+ |
                        |                                  |
                        | [See all spikes →]               |
                        +----------------------------------+
```

---

### Dropdown — Specs

```
Container:
  width: 380px
  max-height: 480px
  overflow-y: auto
  position: absolute
  top: calc(header height + 8px)
  right: 16px

  background: var(--bg-elevated) = #1A1A1A
  border: 1px solid var(--border-subtle) = #2D2D2D
  border-radius: var(--radius-lg) = 12px
  box-shadow:
    0 16px 48px rgba(0, 0, 0, 0.5),
    0 0 32px rgba(249, 115, 22, 0.03)  /* sutil orange ambient */

  animation: fade-in 100ms ease-out + slide down 4px

Header:
  display: flex
  justify-content: space-between
  align-items: center
  padding: 12px 16px
  border-bottom: 1px solid var(--border-default)

  Titulo: "SPIKES RECENTES"
    font: var(--text-label) = 12px
    weight: 600
    color: var(--text-muted)
    text-transform: uppercase
    letter-spacing: 0.05em

  "Mark all as seen" link:
    font: var(--text-caption) = 11px
    color: var(--accent-primary)
    cursor: pointer
    hover: underline

Section labels ("NEW", "EARLIER"):
  font: var(--text-caption) = 11px
  weight: 600
  color: var(--text-muted)
  text-transform: uppercase
  padding: 8px 16px 4px
  background: var(--bg-surface) = #141414
  border-top: 1px solid var(--border-default) (exceto primeiro)

  "NEW": spikes nao vistos (created_at > last_seen_at)
  "EARLIER": spikes ja vistos mas recentes (ultimos 7 dias)
```

---

### Spike Item — Specs

```
Container:
  display: flex
  gap: 12px
  padding: 12px 16px
  cursor: pointer
  border-bottom: 1px solid var(--border-default)
  transition: background 100ms ease

  Hover:
    background: var(--bg-raised) = #1E1E2E

  Click: navega para /spy/offer/{offer_id} e fecha dropdown

Layout interno:

  Left: Glow dot indicator
    width: 8px
    height: 8px
    border-radius: 50%
    margin-top: 6px  /* alinhar com primeira linha de texto */
    flex-shrink: 0

    Se NEW (nao visto):
      background: var(--semantic-spike) = #F97316
      box-shadow: 0 0 6px rgba(249, 115, 22, 0.5)
      animation: glow-pulse 2s ease-in-out infinite

    Se EARLIER (ja visto):
      background: var(--text-muted) = #6B7280
      animation: none
      box-shadow: none

  Center:
    flex: 1

    Row 1: Nome da oferta
      font: var(--text-body-size) = 14px
      weight: 500
      color: var(--text-primary)

      Se NEW: weight 600 (bold para enfatizar)

    Row 2: Dominio + % variacao
      display: flex
      justify-content: space-between

      Dominio:
        font: var(--text-label) = 12px
        font-family: var(--font-mono)
        color: var(--text-secondary)

      % variacao:
        font: var(--text-label) = 12px
        weight: 700
        color: var(--semantic-spike) = #F97316
        content: "+342%"

    Row 3: Visits antes → depois + timestamp relativo
      display: flex
      justify-content: space-between

      Visits:
        font: var(--text-caption) = 11px
        color: var(--text-muted)
        content: "12,400 → 54,800"

      Timestamp:
        font: var(--text-caption) = 11px
        color: var(--text-muted)
        content: "ha 6h"
```

**ADHD-UX-06 (ancoragem temporal):** "ha Xh" em cada spike — urgencia temporal visivel.
**ADHD-UX-10 (direcao clara):** Click navega direto para oferta — zero ambiguidade.
**LED strip:** Glow dot pulsante = LED indicator de atividade (aesthetic-profile sec 7.3).

---

### Footer do Dropdown

```
Container:
  padding: 12px 16px
  border-top: 1px solid var(--border-default)
  text-align: center

Link "See all spikes →":
  font: var(--text-body-size) = 14px
  color: var(--accent-primary)
  hover: underline
  click: navega para /spy?filter=spikes (Radar filtrado por spikes)
```

---

## Layout ASCII — Componente 3: Toast Realtime

```
Quando spike novo detectado via Supabase Realtime (pg_notify):

                                    +----------------------------------+
                                    | [Zap orange] Spike detectado!    |
                                    |                                  |
                                    | NutraVida Plus                   |
                                    | nutravida.com          +342%     |
                                    | 12,400 → 54,800 visits          |
                                    |                                  |
                                    |                  [Ver Oferta →]  |
                                    +----------------------------------+
                                    ^
                                    Canto inferior direito
```

---

### Toast — Specs

```
Container:
  position: fixed
  bottom: 24px
  right: 24px
  width: 360px
  z-index: 50

  background: var(--bg-elevated) = #1A1A1A
  border: 1px solid var(--semantic-spike) = #F97316
  border-left: 4px solid var(--semantic-spike)  /* LED strip */
  border-radius: var(--radius-lg) = 12px
  padding: 16px

  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 24px rgba(249, 115, 22, 0.08)  /* orange ambient glow */

  /* Entrance animation */
  animation:
    slide-in-right 200ms ease,
    glow-pulse 2s ease-in-out 1;  /* 1 ciclo de glow, nao infinito */

Header row:
  display: flex
  align-items: center
  gap: 8px
  margin-bottom: 8px

  Icon: Zap (Lucide, 16px, var(--semantic-spike))
  Titulo: "Spike detectado!"
    font: var(--text-body-size) = 14px
    weight: 600
    color: var(--semantic-spike)

  Close [X]:
    position: top-right
    icon: X (Lucide, 14px, var(--text-muted))
    hover: var(--text-primary)

Content:
  Nome oferta:
    font: var(--text-body-size) = 14px
    weight: 500
    color: var(--text-primary)

  Dominio + %:
    display: flex
    justify-content: space-between
    Dominio: 12px, mono, --text-secondary
    %: 12px, bold, --semantic-spike

  Visits:
    font: var(--text-caption) = 11px
    color: var(--text-muted)
    "12,400 → 54,800 visits"

Footer:
  margin-top: 8px
  text-align: right

  "Ver Oferta →" link:
    font: var(--text-label) = 12px
    color: var(--accent-primary)
    hover: underline
    click: navega para /spy/offer/{offer_id}

Auto-dismiss: 8s (mais longo que toasts padrao — spike e importante)
Empilhamento: max 3 toasts simultaneos, stacked com gap de 8px
  Segundo toast: bottom + toast_height + 8px
  Terceiro toast: idem
  Quarto+: substitui o mais antigo
```

**ADHD-UX-04 (flow ininterrupto):** Toast nao bloqueia — aparece no canto, auto-dismiss. Operador pode ignorar se esta em hiperfoco.
**ADHD-UX-05 (feedback instantaneo):** Spike detectado → toast em <1s (realtime via pg_notify).
**ADHD-UX-11 (warm glow):** Orange glow pulse por 1 ciclo = atencao sem agressividade.
**LED strip:** border-left 4px solid orange = LED lateral de alerta.

---

## Flow Completo

```
1. Backend: mv_spike_detection refresh (a cada 2h via pg_cron)
   → INSERT em spike_alerts se novo spike encontrado
   → pg_notify('spike_detected', payload)

2. Frontend: Supabase Realtime subscription em spike_alerts
   → Novo registro detectado

3. UI updates simultaneos:
   a. Badge: incrementa count, inicia glow-pulse se era 0
   b. Toast: aparece no canto inferior direito com dados do spike
   c. Dropdown: novo item aparece em "NEW" section

4. Operador interacao:
   a. Click no toast "Ver Oferta" → navega para SpyOfferDetail
   b. Click no badge → abre dropdown → click item → navega
   c. Ignora → toast auto-dismiss 8s, badge permanece

5. "Mark all as seen":
   → UPDATE spike_alerts SET seen_at = now() WHERE workspace_id = X AND seen_at IS NULL
   → Badge count reseta para 0, glow para
   → Items movem de "NEW" para "EARLIER"
```

---

## Data Sources

```sql
-- Badge count (spikes nao vistos)
SELECT count(*)
FROM spike_alerts
WHERE workspace_id = :workspace_id
  AND seen_at IS NULL
  AND created_at > now() - interval '7 days';

-- Dropdown items (recentes, max 20)
SELECT
  sa.*,
  so.nome as offer_name,
  so.main_domain,
  od.domain
FROM spike_alerts sa
JOIN spied_offers so ON sa.offer_id = so.id
LEFT JOIN offer_domains od ON sa.domain_id = od.id
WHERE sa.workspace_id = :workspace_id
  AND sa.created_at > now() - interval '7 days'
ORDER BY sa.created_at DESC
LIMIT 20;

-- Mark all as seen
UPDATE spike_alerts
SET seen_at = now()
WHERE workspace_id = :workspace_id
  AND seen_at IS NULL;
```

**Novo campo necessario:**
```sql
ALTER TABLE spike_alerts ADD COLUMN IF NOT EXISTS seen_at TIMESTAMPTZ;
-- NULL = nao visto, timestamp = quando foi visto
```

---

## Realtime Subscription

```typescript
// Hook: useSpikNotifications()
const channel = supabase
  .channel('spike-alerts')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'spike_alerts',
      filter: `workspace_id=eq.${workspaceId}`
    },
    (payload) => {
      // 1. Incrementar badge count
      // 2. Mostrar toast com dados do spike
      // 3. Adicionar ao topo da lista do dropdown
      // 4. Invalidar React Query cache de spike_alerts
    }
  )
  .subscribe();
```

---

## States

### Sem spikes (badge hidden)

```
Badge: hidden (display none)
Dropdown: empty state

  +----------------------------------+
  | SPIKES RECENTES                  |
  +----------------------------------+
  |                                  |
  | [Radar icon, 32px, --text-muted] |
  |                                  |
  | Nenhum spike nos ultimos 7 dias  |
  | Continue monitorando o radar.    |
  |                                  |
  +----------------------------------+
```

### Muitos spikes (>10 nao vistos)

```
Badge: "10+" com glow mais intenso
  box-shadow: 0 0 12px rgba(249, 115, 22, 0.6)  /* glow maior */

Dropdown: scroll interno, max 20 items
Toast: empilha max 3, depois substitui mais antigo
```

---

## Keyboard Shortcuts

| Acao | Shortcut |
|------|----------|
| Abrir dropdown de spikes | Alt+S |
| Fechar dropdown | Escape |
| Navegar entre spikes | Arrow Up/Down |
| Abrir spike selecionado | Enter |
| Mark all as seen | Alt+Shift+S |

---

## Notas de Implementacao

1. **Badge:** Integrar no `AppHeader.tsx` existente
2. **Dropdown:** `src/shared/components/layout/SpikeNotificationDropdown.tsx`
3. **Toast:** Usar sistema de toast existente (`use-toast`) com variante customizada para spike
4. **Hook:** `src/shared/hooks/useSpikeNotifications.ts` — subscription realtime + badge count + dropdown data
5. **Migration:** `seen_at` TIMESTAMPTZ na tabela `spike_alerts`
6. **Performance:** Badge count via React Query (staleTime 30s), dropdown lazy load (so busca ao abrir)
7. **Realtime:** Supabase channel subscription — ativar ao montar AppHeader, cleanup ao desmontar

---

## Integracao com Daily Briefing

O Spike Notification System alimenta a secao "SPIKES QUE PRECISAM DE ATENCAO" do Daily Briefing (Wireframe 1). Mesma fonte de dados (`spike_alerts`), mesma apresentacao (% variacao, timestamp relativo, nome da oferta). A diferenca:

| Contexto | Spike Notification | Daily Briefing |
|----------|-------------------|----------------|
| Onde | Header (global, todas as telas) | Pagina /briefing |
| Quando | Realtime (instantaneo) | Ao abrir a pagina |
| Quantidade | Badge count + top 20 dropdown | Top 3 + "ver todos" |
| Proposito | Alertar | Contextualizar no briefing diario |

---

*Uma — cada spike e uma oportunidade. O sistema nunca deixa passar.*
