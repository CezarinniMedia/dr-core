# Story BD-3.2: Accessibility Overhaul
**Epic:** EPIC-BD | **Sprint:** 3 | **Status:** Ready | **Estimate:** 3h | **Priority:** MEDIO

---

## Descricao
50+ icon buttons sem aria-label, tabelas nao navigaveis por teclado, badges dependem apenas de cor, sem aria-live para toasts. Atingir WCAG AA basico para usabilidade e profissionalismo.

## Acceptance Criteria

### AC-1: Icon Buttons com aria-label
- [ ] Given: qualquer botao icon-only na interface
- [ ] When: screen reader foca o botao
- [ ] Then: anuncia descricao da acao (ex: "Editar oferta", "Deletar")
- [ ] And: tooltip visual corresponde ao aria-label

### AC-2: Tabela Navigavel por Teclado
- [ ] Given: usuario foca na tabela do SpyRadar
- [ ] When: usa Tab, Arrow keys
- [ ] Then: pode navegar entre rows e cells
- [ ] And: Enter/Space ativa a acao da row

### AC-3: Badges com Texto/Icone
- [ ] Given: badge de status colorido
- [ ] When: usuario nao distingue cores (daltonismo)
- [ ] Then: badge tem icone ou texto complementar a cor
- [ ] And: screen reader anuncia o status corretamente

### AC-4: Toast Notifications Acessiveis
- [ ] Given: acao do usuario gera toast notification
- [ ] When: toast aparece
- [ ] Then: aria-live region anuncia ao screen reader
- [ ] And: toast e focavel e dismissivel por teclado (Escape)

### AC-5: Focus Visible
- [ ] Given: usuario navega por teclado
- [ ] When: foca em qualquer elemento interativo
- [ ] Then: focus ring visivel e consistente
- [ ] And: nunca hidden por outline: none

## Escopo
**IN:** aria-labels, keyboard nav basica, focus management, aria-live
**OUT:** WCAG AAA, screen reader otimizacao completa, i18n

## Arquivos a Modificar
- [ ] src/components/ui/ (Button, Badge, Toast - adicionar aria props)
- [ ] src/pages/SpyRadar.tsx (tabela keyboard nav)
- [ ] src/components/spy/ (todos os icon buttons)
- [ ] src/components/layout/ (sidebar, header keyboard nav)
- [ ] globals.css (focus ring styles)

## Dependencias
- BD-1.1 concluido (emojis ja substituidos por Lucide - facilita aria-labels)
