# Tarefas - DR OPS
**Ultima atualizacao:** 2026-02-17

## FASE 1: Estabilizar SPY (prioridade maxima)

### 1.1 Performance
- [ ] Diagnosticar gargalo de importacao CSV (frontend? Supabase? RLS?)
- [ ] Implementar importacao em batch (chunks de 100-500 registros)
- [ ] Progress bar real com % e tempo estimado na importacao
- [ ] Testar com arquivo de 14k+ linhas

### 1.2 Bugs criticos do SPY
- [ ] Corrigir graficos que nao respeitam filtros de data (BUG-003)
- [ ] Verificar parsing hierarquico (Destino→filhos) em todos os tipos CSV
- [ ] Verificar matching de dominios (subdominos, subpastas vinculados a oferta correta)
- [ ] Corrigir deteccao de duplicados na importacao

### 1.3 Polish do SPY
- [ ] Substituir emojis por icones Lucide no modulo SPY
- [ ] Adicionar tooltips em todos os elementos do SPY
- [ ] Quick Add para espionagem manual rapida (form compacto)
- [ ] Inline edit de status na lista (clicar direto no badge)
- [ ] "Bau"/archive para esconder dominios irrelevantes (ex: hotmart.com)
- [ ] Badges coloridos no grafico comparativo (cor = identificacao do dominio)
- [ ] Trend sparkline respeitar periodo selecionado

## FASE 2: Bugs globais

- [ ] Fix RLS em upload de arquivos (BUG-001)
- [ ] Fix sidebar collapse CSS (BUG-004)
- [ ] Dashboard atualizar com dados reais (BUG-005)
- [ ] Substituir emojis por icones Lucide em TODO o sistema (BUG-008)

## FASE 3: Polir modulos existentes

### Ofertas
- [ ] Expandir campos (upsells, downsells, precos, mecanismo unico)
- [ ] Cards clicaveis (inteiro, nao so o nome)
- [ ] Filtros maiores e mais opcoes de visualizacao
- [ ] Status "Produzindo" adicionado
- [ ] Export/Import em Markdown
- [ ] Ordenacao por parametros

### Avatar
- [ ] Alinhar campos com output do agente de extracao
- [ ] Import/export Markdown
- [ ] Permitir criacao manual completa

### Criativos
- [ ] Fix card nao reabre (BUG-006)
- [ ] Fix delay drag (BUG-007)
- [ ] Adicionar "Teste" antes de "Ativo" no Kanban
- [ ] Duplicar card
- [ ] Nomenclatura automatica
- [ ] Fix upload RLS

## FASE 4: Novos modulos (futuro)
- [ ] PLAN 06: Paginas (funil visual tipo Funnelytics)
- [ ] PLAN 07: Analytics (dados VTurb, FB Ads, Google Ads, historico de modificacoes)
- [ ] PLAN 08: Prompts & Agents
- [ ] PLAN 09: Canvas & Whiteboard
- [ ] PLANs 10-12: Automacoes, Search, Mobile
