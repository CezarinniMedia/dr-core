# Context Brief — Vision Architecture

> Documento de intake para a fase de Vision Architecture do DR OPS.
> Gerado por @architect (Aria) em 2026-02-21.
> Este documento sintetiza TODOS os contextos fornecidos pelo operador para informar o redesign do sistema.

---

## 1. Perfil do Operador

### Identidade
- **Nome:** Marcos Vinicius Ferreira de Souza (Marcos Cezarinni)
- **Idade:** 23 anos (nascido 25/03/2002)
- **Localidade:** Campo Grande, MS, Brasil
- **Profissao:** Marketing digital / Direct Response Marketing
- **Setup:** Home office, 3 monitores (2 externos + MacBook)

### Perfil Neuropsicologico (Laudo Clinico — CRP 14/06568-1)
- **Diagnostico:** TDAH subtipo combinado (DSM-5, F90.0)
- **QI Total:** 118 (Medio Superior, percentil 88)
- **Atencao Concentrada:** Percentil 20 (Inferior) — **deficit principal**
- **Atencao Dividida:** Percentil 30 (Medio Inferior)
- **Memoria Visual:** Percentil 90 (Superior)
- **Habilidades Visuoconstrutivas:** Percentil 100 (Superior)
- **Medicacao:** Venvanse 70mg/dia (estabilizado)

### Implicacoes para Design de Sistema

| Caracteristica TDAH | Implicacao para UX/Arquitetura |
|---------------------|-------------------------------|
| Atencao concentrada deficitaria | Feedback visual constante, zero "telas mortas", progress bars em tudo |
| Time blindness severa | Timestamps visiveis, indicadores de "quanto tempo faz", automacao de tarefas repetitivas |
| Necessidade de satisfacao imediata | Resultados visiveis rapidos, quick-add em tudo, zero fricao |
| Hiperfoco quando engajado | Sistema nao deve interromper flow — modals nao-bloqueantes, atalhos keyboard |
| Memoria visual superior (P90) | Priorizar visualizacoes graficas, sparklines, cores, icones (nao texto) |
| Habilidades visuoconstrutivas superiores | Graficos comparativos, dashboards visuais, layouts grid |
| Impulsividade alta | Confirmacoes em acoes destrutivas, undo facil, soft-delete |
| Organizacao dificil de manter | O sistema DEVE ser o organizador — auto-classificacao, auto-tagging |

### Mentalidade (Frases da parede)
- "Nao tenho sonhos, tenho objetivos."
- "Eu vou vencer. Apenas assista."
- "Se voce ainda pode contar seu dinheiro, volte ao trabalho."
- "No Money, No Funny."
- **Livro de cabeceira:** 48 Leis do Poder (Robert Greene)
- **Perfil:** Estrategista pragmatico, orientado a resultado, zero tolerancia a lentidao

---

## 2. Modelo de Negocio

### O que e Direct Response Marketing (DR MKT)
Marcos opera no mercado de Direct Response — compra de trafego pago (Meta Ads, Google Ads) para vender produtos digitais/fisicos com ROI mensuravel. O ciclo e:

```
Espionar concorrentes → Identificar ofertas lucrativas → Clonar/adaptar →
Criar criativos → Rodar trafego → Otimizar → Escalar ou matar
```

### Principios Finch (Thiago Finch — referencia do mercado)
- **Velocidade > Perfeicao:** "Quem espiona rapido, lanca rapido"
- **Volume:** Testar muitas ofertas, matar rapido as perdedoras, escalar as vencedoras
- **Espionagem e o jogo:** Quem tem melhor inteligencia de mercado, ganha
- **Sudden spikes:** Detectar ofertas nascendo/escalando antes da concorrencia

### Workflow Operacional Real

```
1. MINERACAO (PublicWWW)
   Footprints/scripts → Extrair milhares de dominios → CSV

2. TRIAGEM EM MASSA (Semrush Bulk)
   Upload 100 dominios/vez → Ver trafego mensal → Filtrar promissores

3. CURADORIA RAPIDA
   Status: Analyzing → Hot → Scaling → Cloned → Dead
   Sparklines + variacao % + pico = decisao rapida

4. ANALISE PROFUNDA (ofertas selecionadas)
   Semrush detalhado: Geo, Paginas, Subdominios, Subpastas, Tendencia
   Bibliotecas de anuncios (Meta, Google, TikTok)
   Funil completo: Cloaker → VSL → Checkout → Upsell → Downsell

5. CLONE / ADAPTACAO
   Clonar oferta promissora → Adaptar criativos → Lancar
   Objetivo: validar rapido, depois fazer 100x melhor

6. MONITORAMENTO CONTINUO
   Trafego semanal/mensal de TODOS os dominios no radar
   Ninguem fica fora do radar — cobertura total do mercado
```

### Ferramentas Externas Usadas
- **PublicWWW:** Mineracao de dominios por footprints/scripts (ex: cdn.utmify.com.br)
- **Semrush:** Analise de trafego (Bulk, Geo, Paginas, Subdominios, Trend)
- **SimilarWeb:** Trafego total (referencia principal para volume)
- **Meta Ad Library:** Biblioteca de anuncios do Facebook/Instagram
- **Google Ads Transparency:** Biblioteca de anuncios do Google
- **Vturb:** Tecnologia de VSL (Video Sales Letter)
- **Rateios:** Acesso compartilhado a ferramentas premium do mercado

### Volumes de Dados
- **12k+ ofertas** espionadas atualmente no radar
- **87k+ registros** de trafego historico
- **14k sites** por leva de importacao (comum)
- **Meta:** Cobertura total do mercado BR + LATAM (ninguem fora do radar)
- **Projecao:** 500k+ registros de trafego em 6 meses
- **Objetivo:** Atualizacao semanal/mensal automatizada de todos os footprints

---

## 3. Features Sagradas

> Estas funcionalidades DEVEM ser mantidas na visao. Podem (e devem) ser melhoradas, mas a funcao core e intocavel.

### 3.1 Grafico Comparativo Multi-Dominio
- **O que e:** Visualizacao de trafego de N dominios em um unico grafico de linhas
- **Inspiracao:** Semrush Traffic Analytics (mas sem limite de 5 dominios)
- **Cada dominio:** Cor unica na linha + legenda com retangulo colorido + nome
- **Interacao:** Hover mostra valores por ponto, click toggle visibilidade
- **Valor:** E o que torna o sistema "o mais foda de todos" (palavras do operador)
- **Melhorias desejadas:** Legenda com retangulo colorido (hoje falta a cor), remover/adicionar dominios facilmente

### 3.2 Sparkline de Trafego na Lista
- **O que e:** Mini-grafico de tendencia inline em cada linha da tabela de ofertas
- **Regra critica:** DEVE respeitar os meses selecionados no filtro (MonthRangePicker)
- **Valor:** Pre-visualizacao rapida sem abrir detalhe — essencial para triagem em massa
- **Indicadores visuais:** Spike (>100% variacao), tendencia positiva/negativa com cores

### 3.3 Seletor de Periodo Estilo Range
- **O que e:** MonthRangePicker inspirado no Semrush
- **Comportamento:** Selecionar mes A e mes D auto-seleciona B e C (range continuo)
- **No grafico:** TODOS os meses do range aparecem individualmente (nao apenas extremos)
- **Presets:** Ultimo mes, 3 meses, 6 meses, ano atual
- **Meses:** Exibidos em portugues (Jan, Fev, Mar...)

---

## 4. Objetivos e Principios do Sistema Ideal

### Visao do Operador (declaracao direta)
> "ZERO apego ao codigo/interface atual. Objetivo: o sistema de Direct Response mais foda,
> funcional, rapido, automatizado, tecnologico, centralizado e integrado possivel."

> "Se algo pode ser melhor do que ja e, fazer melhor."

### Principios de Design

1. **Speed-First:** Cada interacao deve ser a mais rapida possivel. Zero telas de loading sem feedback. Importar 14k registros nao pode travar.
2. **Visual-First:** Graficos > tabelas > texto. Sparklines, heatmaps, cores. Memoria visual P90 do operador e uma vantagem — explorar isso.
3. **Zero-Friction Capture:** Quick-add em 1 clique durante espionagem manual. Cmd+K para busca global. Drag-and-drop para tudo.
4. **Automation-Ready:** Sistema preparado para receber dados automatizados (dezenas de milhares de sites semanalmente). Dedup inteligente, upsert, nao quebrar.
5. **Total Coverage:** Ninguem fica fora do radar. Todos os footprints, todas as semanas, todos os mercados (BR, LATAM, global).
6. **Professional UI:** Icones Lucide (NUNCA emojis iOS), dark mode only, tooltips descritivos em tudo, interface de ferramenta profissional.
7. **Solo Operator Optimized:** Uma pessoa controla tudo. Sem features de equipe desnecessarias. Keyboard-first, bulk-operations, automacao.
8. **Data Integrity:** Nunca duplicar, nunca perder dados. Upsert inteligente. Soft-delete. Historico preservado.
9. **Export/Import Flexivel:** Exportar ofertas, avatares em Markdown. Importar de qualquer fonte. O operador e dono dos dados.
10. **Extensivel:** Preparado para futuras integracoes (Vturb, FB Ads, Google Ads, inteligencia de dados, agentes IA).

---

## 5. Restricoes Reais

### Operacionais
- **Solo operator:** Marcos faz tudo sozinho — espionagem, criacao, trafego, otimizacao
- **TDAH:** Precisa de resultados visiveis rapidos, zero fricao, o sistema deve "organizar por ele"
- **Urgencia financeira:** Precisa acertar pelo menos 1 oferta para viabilizar transicao de carreira
- **Parceiro temporario:** Cartao de credito compartilhado para testes — precisa de rastreabilidade financeira basica
- **Budget limitado para ferramentas:** ~R$800/mes alem do que ja tem via rateios

### Tecnicas
- **Stack atual:** React 18 + Vite + TypeScript + Supabase + TailwindCSS + shadcn/ui
- **Deploy:** GitHub → Hostinger (auto-deploy de main)
- **Supabase:** Auth, Database, Storage, RLS
- **Performance critica:** 12k+ registros no radar, 14k+ por import, meta 500k+ trafego
- **Sem backend dedicado:** Supabase Edge Functions para logica server-side
- **Zero testes:** 0% coverage atual
- **God components:** SpyRadar 1424 LOC, ImportModal 1161, TrafficView 852

### Conhecidas (Bugs/Dividas)
- **Storage RLS broken:** Blocks all uploads (BUG-001)
- **Sidebar collapse bug:** Gap a direita
- **Dashboard zerado:** Queries erradas
- **CSV import lento:** Sem feedback adequado para 14k+
- **40 dividas tecnicas** identificadas no Brownfield Discovery

---

## 6. Modulos do Sistema (Estado Atual + Visao)

### 6.1 Espionagem / Radar de Ofertas (PRIORIDADE MAXIMA — 80% do valor)
**Estado atual:** Funcional com bugs, e o modulo mais desenvolvido
**Inclui:** Import Universal CSV (9 tipos), Inteligencia de Trafego, sparklines, graficos comparativos, multi-select, bulk edit, MonthRangePicker
**Visao:**
- Pipeline automatizado semanal (footprints → PublicWWW → Semrush → curadoria)
- Cobertura total de mercado (ninguem fora do radar)
- Detecao automatica de sudden spikes
- Clusterizacao de ofertas por vertical/geo/trafego
- "Bau" para esconder dominios irrelevantes (ex: Hotmart) sem perder dados

### 6.2 Ofertas Proprias
**Estado atual:** Basico, campos insuficientes, visual desagradavel
**Visao:**
- Campos completos: upsells, downsells, precos, mecanismo unico, funil detalhado
- Visualizacoes multiplas (cards, tabela, kanban por status)
- Status: Research → Produzindo → Testando → Ativas → Pausadas → Mortas
- Export Markdown, personalizacao de campos visiveis, ordenacao flexivel

### 6.3 Avatar & Research
**Estado atual:** Funcional basico, campos incompletos
**Visao:**
- Compativel com output de agentes IA do operador
- Criacao manual + importacao de agentes
- Export em Markdown
- Campos alinhados com framework de avatar extraction do operador

### 6.4 Criativos (Kanban)
**Estado atual:** Implementado mas com bugs (nao abre apos criar, delay ao arrastar)
**Visao:**
- Nomenclatura automatica (oferta + numero + angulo)
- Pivotagem rapida: hook, body, CTA como blocos independentes
- Duplicacao facil
- Drag-and-drop para upload em toda interface

### 6.5 Dashboard
**Estado atual:** Mostra dados zerados (queries erradas)
**Visao:** Hub central com metricas reais de espionagem, ofertas ativas, alertas de spikes

### 6.6 Inteligencia de Dados (Futuro)
**Visao:** Receber dados Vturb, FB Ads, Google Ads, historico de modificacoes, encontrar gargalos

---

## 7. Principios Tecnicos para o Vision Architecture

### Performance
- Virtualizacao obrigatoria para listas 10k+
- Paginacao server-side com Supabase
- Code splitting agressivo (lazy routes, lazy modals)
- CSV import: Web Workers + streaming + progress real

### Arquitetura
- Service layer entre hooks e Supabase (eliminar acoplamento direto)
- Decomposicao dos God Components
- Tipagem forte end-to-end (database types → components)
- React Query para todas as queries (ja em uso)
- Error boundaries por modulo

### Data
- Upsert inteligente em toda importacao
- Soft-delete com campo deleted_at
- Indices otimizados para queries de trafego (domain + period)
- RLS corrigido em todas as tabelas
- Migracao incremental (nao breaking)

### UX
- Keyboard-first navigation
- Tooltips descritivos em todos os elementos interativos
- Cmd+K (busca global)
- Notificacoes de alerta para sudden spikes
- Dark mode only — sem toggle de tema

---

## 8. Referencia ao Brownfield Discovery

> O Brownfield Discovery foi completado em 2026-02-19 (10 fases, QA Gate APPROVED).
> Identificou 40 dividas tecnicas. Serviu como diagnostico conservador — focou em remediar, nao reinventar.
> A Vision Architecture usa o brownfield como baseline de realidade, mas vai ALEM.

### Documentos de Referencia (nao reprocessados, apenas linkados)
- `docs/brownfield/system-architecture.md` — Arquitetura atual documentada
- `docs/brownfield/SCHEMA.md` — Schema completo do banco (34 tabelas)
- `docs/brownfield/DB-AUDIT.md` — Auditoria do banco de dados
- `docs/brownfield/frontend-spec.md` — Spec do frontend atual
- `docs/brownfield/technical-debt-assessment.md` — 40 dividas tecnicas detalhadas
- `docs/brownfield/technical-debt-DRAFT.md` — Rascunho inicial
- `docs/brownfield/TECHNICAL-DEBT-REPORT.md` — Relatorio executivo
- `docs/brownfield/specialist-reviews.md` — Reviews de especialistas
- `docs/brownfield/qa-review.md` — QA Gate review

### Numeros do Brownfield
- 40 dividas tecnicas: 5 blocking, 12 critical, 15 important, 8 minor
- 17 stories criadas no EPIC-BD (Sprint 0-3)
- Estimativa: ~75h (otimista) / ~110h (realista)
- 34 tabelas no banco (7 legacy sem uso confirmado)

---

## 9. Historico de Construcao (Contexto)

O sistema foi construido em 3 fases:

1. **Chat 1 (Claude):** Planejamento completo — documentacao (SISTEMA-DR-WEBAPP-COMPLETO.md), meta-prompt, 6 PLANs (00-05)
2. **Lovable:** Implementacao dos PLANs + 3 SPY Upgrades + ajustes iterativos diretos
3. **Chat 2 (Claude) + Claude Code CLI:** Ajustes finos, correcoes de bugs, Brownfield Discovery, AIOS framework

A base de codigo acumulou debt de 3 fontes diferentes (Lovable gerando codigo, Claude planejando, Marcos ajustando direto). A Vision Architecture e a oportunidade de definir o que o sistema DEVE ser, independente do que ele e hoje.

---

*Documento gerado por Aria (@architect) como entrada para Phase 2: Vision Architecture Design.*
*Nenhum codigo foi alterado. Nenhuma decisao tecnica foi tomada. Apenas contexto foi processado e estruturado.*
