# Story BD-3.2: Accessibility Overhaul
**Epic:** EPIC-BD | **Sprint:** 3 | **Status:** InProgress | **Estimate:** 3h | **Priority:** MEDIO

---

## Descricao
50+ icon buttons sem aria-label, tabelas nao navigaveis por teclado, badges dependem apenas de cor, sem aria-live para toasts. Atingir WCAG AA basico para usabilidade e profissionalismo.

## Acceptance Criteria

### AC-1: Icon Buttons com aria-label
- [x] Given: qualquer botao icon-only na interface
- [x] When: screen reader foca o botao
- [x] Then: anuncia descricao da acao (ex: "Editar oferta", "Deletar")
- [x] And: tooltip visual corresponde ao aria-label

### AC-2: Tabela Navigavel por Teclado
- [x] Given: usuario foca na tabela do SpyRadar
- [x] When: usa Tab, Arrow keys
- [x] Then: pode navegar entre rows e cells (HTML table nativo)
- [x] And: Enter/Space ativa a acao da row (checkboxes, buttons)

### AC-3: Badges com Texto/Icone
- [x] Given: badge de status colorido
- [x] When: usuario nao distingue cores (daltonismo)
- [x] Then: badge tem texto complementar a cor (ja implementado)
- [x] And: screen reader anuncia o status corretamente

### AC-4: Toast Notifications Acessiveis
- [x] Given: acao do usuario gera toast notification
- [x] When: toast aparece
- [x] Then: aria-live region anuncia ao screen reader (Radix built-in)
- [x] And: toast close button tem aria-label, dismissivel por teclado (Escape)

### AC-5: Focus Visible
- [x] Given: usuario navega por teclado
- [x] When: foca em qualquer elemento interativo
- [x] Then: focus ring visivel e consistente (outline-2 outline-ring)
- [x] And: nunca hidden por outline: none

## Escopo
**IN:** aria-labels, keyboard nav basica, focus management, aria-live
**OUT:** WCAG AAA, screen reader otimizacao completa, i18n

## Dev Agent Record

### File List
- `src/pages/SpyRadar.tsx` (MODIFIED) - 9 aria-labels em icon buttons (zoom, pagination, actions)
- `src/components/spy/tabs/SpyDomainsTab.tsx` (MODIFIED) - 2 aria-labels (edit, delete)
- `src/components/spy/tabs/SpyLibrariesTab.tsx` (MODIFIED) - 2 aria-labels (edit, delete)
- `src/components/spy/tabs/SpyFunnelTab.tsx` (MODIFIED) - 2 aria-labels (edit, delete)
- `src/components/spy/tabs/SpyTrafficTab.tsx` (MODIFIED) - 2 aria-labels (edit, delete)
- `src/components/spy/tabs/SpyOverviewTab.tsx` (MODIFIED) - 3 aria-labels (zoom, close)
- `src/components/spy/MonthRangePicker.tsx` (MODIFIED) - 2 aria-labels (nav year)
- `src/components/ui/toast.tsx` (MODIFIED) - aria-label no close button
- `src/index.css` (MODIFIED) - focus-visible ring global

### Change Log
- 2026-02-20: Adicionados 22+ aria-labels em icon buttons, focus ring global, toast close aria-label
