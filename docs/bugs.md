# Bugs Conhecidos - DR OPS
**Ultima atualizacao:** 2026-02-17

## CRITICOS (bloqueiam uso ou corrompem dados)

### BUG-001: Upload de arquivos falha com RLS
- **Onde:** Todo o sistema (criativos, avatares, etc.)
- **Erro:** "new row violates row-level security policy"
- **Impacto:** Impossivel upar fotos e videos
- **Causa provavel:** Storage bucket RLS policies nao configuradas para o usuario autenticado

### ~~BUG-002: Importacao de CSV grande extremamente lenta~~ (CORRIGIDO)
- **Onde:** Radar de Ofertas → Importar CSV
- **Correcao:** Reescrito para usar operacoes batch (chunks de 500) em vez de insercao 1-por-1. Domain matching usa batch queries (.in()) em vez de queries individuais. Progress bar granular com label descritivo por fase (criando ofertas, inserindo dominios, importando trafego).

### BUG-003: Graficos de trafego nao respeitam filtros de data
- **Onde:** Oferta individual → aba Trafego + Inteligencia de Trafego
- **Comportamento:** Ao selecionar periodo personalizado, grafico nem sempre atualiza
- **Impacto:** Visualizacao incorreta de dados

## IMPORTANTES (afetam UX significativamente)

### BUG-004: Sidebar collapse deixa lacuna direita
- **Onde:** Layout global
- **Comportamento:** Ao esconder sidebar, conteudo vai todo pra esquerda com espaco vazio a direita
- **Causa provavel:** CSS do conteudo principal nao faz flex-grow ou nao recalcula largura

### BUG-005: Dashboard mostra dados zerados
- **Onde:** Dashboard
- **Comportamento:** Ofertas Ativas: 0, Avatares: 0, Criativos: 0 (mesmo com dados no sistema)
- **Causa provavel:** Queries do dashboard nao consultam as tabelas corretas ou nao contam registros do radar

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

## MENORES (incomodam mas nao bloqueiam)

### BUG-009: Filtros de ofertas (modulo Ofertas) muito pequenos
- **Onde:** Ofertas (nao Radar)
- **Comportamento:** Botoes Research/Testando/Ativas/Pausadas/Mortas com tamanho muito pequeno

### BUG-010: Ofertas - so abre clicando no nome, nao no card
- **Onde:** Ofertas
- **Comportamento:** Clicar na area do card nao abre, so o texto do nome

### BUG-011: Tooltips ausentes
- **Onde:** Sistema inteiro
- **Comportamento:** Nenhum elemento tem tooltip explicativo ao hover
- **Impacto:** Usuario precisa adivinhar o que cada coisa significa

### BUG-012: Trend sparkline nao acompanha periodo selecionado
- **Onde:** Inteligencia de Trafego
- **Comportamento:** Mini-grafico de trend sempre mostra periodo completo, mesmo com filtro ativo
