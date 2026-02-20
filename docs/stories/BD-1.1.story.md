# Story BD-1.1: Replace All iOS Emojis with Lucide Icons
**Epic:** EPIC-BD | **Sprint:** 1 | **Status:** Ready | **Estimate:** 2h | **Priority:** CRITICO

---

## Descricao
Emojis iOS presentes em headers, tabs, badges e labels por toda a interface tornam o sistema "amador". REGRA do CLAUDE.md: "NUNCA usar emojis iOS na interface, SEMPRE icones Lucide React".

## Acceptance Criteria
- [ ] Zero emojis iOS em qualquer parte da interface
- [ ] Todos substituidos por icones Lucide React equivalentes
- [ ] Visual consistente: icone + texto em todas as labels

## Arquivos a Modificar (estimativa)
- [ ] src/pages/SpyRadar.tsx (header, tabs)
- [ ] src/pages/Dashboard.tsx (cards, stats)
- [ ] src/pages/Ofertas.tsx (filtros, cards)
- [ ] src/pages/CriativosPage.tsx (kanban labels)
- [ ] src/pages/SpyOfferDetail.tsx (tab labels)
- [ ] src/components/spy/TrafficIntelligenceView.tsx
- [ ] Qualquer outro arquivo com emojis unicode

## Tasks
- [ ] 1. Grep por emojis unicode em todo src/ (pattern: [\u{1F300}-\u{1FAD6}])
- [ ] 2. Substituir cada um por Lucide icon equivalente
- [ ] 3. Verificar visual em todas as paginas
