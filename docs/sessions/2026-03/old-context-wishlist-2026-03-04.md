# Wishlist — Features dos Contextos Antigos (2026-03-04)

> **Source:** 4 arquivos de contexto antigos do usuario
> **Objetivo:** Identificar desejos/preferencias que podem nao ter sido implementados ainda
> **Nota:** Algumas coisas JA foram implementadas e melhoradas. Esta lista e para revisao.

---

## CATEGORIA 1: Ofertas Proprias (modulo /ofertas)

| # | Feature | Status Provavel | Contexto Original |
|---|---------|----------------|-------------------|
| 1.1 | Exportar ofertas em Markdown (.md) | NAO implementado | "quero conseguir exportar as ofertas em Markdown" |
| 1.2 | Importar/exportar ofertas (bulk) | NAO implementado | "ofertas precisam ter opcao de serem exportadas ou importadas" |
| 1.3 | Status "Produzindo" para ofertas proprias | VERIFICAR | "preciso de um status de produzindo ou algo do tipo" |
| 1.4 | Clicar no card inteiro para abrir (nao so no nome) | VERIFICAR | "so consigo abrir clicando no nome, quero poder clicar no card" |
| 1.5 | Dados completos de funil na oferta propria (upsells, downsells, precos, mecanismo unico) | PARCIAL | "precisamos de lugar para outros dados: upsells, downsells, precos, mecanismo unico" |

## CATEGORIA 2: Avatar & Research

| # | Feature | Status Provavel | Contexto Original |
|---|---------|----------------|-------------------|
| 2.1 | Exportar avatar em Markdown (.md) | NAO implementado | "avatar tambem exportar em .md" |
| 2.2 | Importar avatares | NAO implementado | "avatar precisa poder ser importado e exportado" |
| 2.3 | Copiar todos os dados do avatar de uma vez | VERIFICAR | "preciso que tenha uma forma de copiar tudo de uma vez" |
| 2.4 | Campos compativeis com prompt de avatar extraction | VERIFICAR | Referencia ao arquivo O Parasita - Avatar Extraction.md |
| 2.5 | Receber outputs de agente AI de avatar | NAO implementado | "preparado pra receber outputs vindos de um agente meu especifico" |

## CATEGORIA 3: Criativos

| # | Feature | Status Provavel | Contexto Original |
|---|---------|----------------|-------------------|
| 3.1 | Etapa "Teste" no Kanban antes de "Ativo" | VERIFICAR | "no Kanban precisa ter antes de ativo, Teste" |
| 3.2 | Opcao de duplicar criativo | VERIFICAR | "quero a opcao de duplicar" |
| 3.3 | Auto-naming de criativos (sequencial + oferta + angulo) | VERIFICAR | "automaticamente pre-preenchido nome considerando numero, oferta e angulo" |
| 3.4 | Pivotagem rapida de hook/body/CTA para videos | NAO implementado | "algo que faca sentido pensando em pivotagem rapida de hook, body e CTA" |

## CATEGORIA 4: Spy Radar — Features Avancadas

| # | Feature | Status Provavel | Contexto Original |
|---|---------|----------------|-------------------|
| 4.1 | Preview de screenshot na lista do Radar | NAO implementado | "pre-visualizar screenshot com hover e click para ampliar" |
| 4.2 | Preview de notas na lista do Radar (hover + click) | NAO implementado | "mostrar parte das notas na lista, hover para ler mais, click para editar" |
| 4.3 | Alterar status inline na lista (click no status) | VERIFICAR | "clicar no status atual ali na lista e alterar por ali mesmo" |
| 4.4 | Bulk action bar sticky (acompanha scroll) | NAO implementado | "nao quero precisar subir la em cima para clicar em alterar status" |
| 4.5 | Bau/Vault para dominios irrelevantes (ex: Hotmart) | PARCIAL (status Vault existe) | "guardar em um bau, escondido, mas recebendo dados quando atualizar" |
| 4.6 | Cores nos labels do grafico de comparacao | VERIFICAR | "aparecer retangulo arredondado com nome do dominio e a cor" |
| 4.7 | Desenho visual do funil (estilo Funnelytics) | NAO implementado | "desenhar melhor o funil do cara, algo como funnelytics" |
| 4.8 | Pipeline automatizado semanal (PublicWWW → Import → Curadoria) | NAO implementado | "workflow automatizado semanal/mensal" |

## CATEGORIA 5: Sistema Geral

| # | Feature | Status Provavel | Contexto Original |
|---|---------|----------------|-------------------|
| 5.1 | Drag-and-drop upload em TODO o sistema | PARCIAL | "upar fotos e videos apenas arrastando para o webapp, nao vale apenas para criativos" |
| 5.2 | Tooltips explicativos em TODOS os elementos interativos | PARCIAL (implementados nos principais) | "passar mouse e manter parado, explicacao daquilo" |
| 5.3 | Fix RLS de storage (BUG-001) | PENDENTE deploy | "Erro no upload: row-level security policy" |
| 5.4 | Acesso facil a Footprints/Keywords/Dorks durante espionagem | IMPLEMENTADO (Arsenal module) | "lugar facil de acessar footprints, keywords, google dorks" |
| 5.5 | CSV delimiter selector com auto-deteccao | VERIFICAR se foi mantido | "selecionar separador de casas ao importar csv" |
| 5.6 | Centralizacao total: prompts, workflows, canvas, whiteboards | PARCIAL (fora do escopo webapp) | "centralizar tudo em um software" |

## CATEGORIA 6: Preferencias Esteticas/UX Confirmadas

Estas NAO sao features, sao preferencias que devem guiar todas as decisoes:

1. **NUNCA emojis iOS** — sempre Lucide React icons
2. **Dark mode only** — sem toggle light/dark
3. **Visual premium** — "aparencia de software caro", "tecnologico", "profissional"
4. **Velocidade** — sistema deve ser rapido em tudo, principio Finch
5. **SimilarWeb = primary** para trafego total, SEMrush = organic only
6. **Markdown em notas** — sempre suportar formatacao completa
7. **Opcoes numeradas** — sempre apresentar escolhas como 1, 2, 3

---

## Notas

- Items marcados "VERIFICAR" precisam de checagem no codigo atual
- Items "PARCIAL" tem implementacao incompleta
- Items "NAO implementado" sao candidatos a inclusao no backlog
- Usuario deixou claro que ESPIONAGEM e a prioridade #1 sempre
