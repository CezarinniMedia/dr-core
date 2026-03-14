# ADHD Design Principles — DR OPS

> **Autor:** Uma (@ux-design-expert) | **Data:** 2026-03-02
> **Fontes:**
> - `docs/vision/context-brief.md` sec 1 (Perfil Neuropsicologico)
> - `docs/analyst-output/04-pain-points-inventory.md` sec 7 (Padroes ADHD-Specific)
> - `docs/vision/aesthetic-profile.md` sec 5 (Mood e Atmosfera)
> **Proposito:** Checklist de validacao para TODA decisao de componente nas fases audit, wireframe, build, a11y
> **Status:** FINAL

---

## Perfil de Referencia

| Metrica | Valor | Implicacao |
|---------|-------|------------|
| Atencao Concentrada | Percentil 20 (Inferior) | Qualquer pausa visual = risco de perder o usuario |
| Atencao Dividida | Percentil 30 (Medio Inferior) | Multiplas demandas simultaneas = sobrecarga |
| Memoria Visual | Percentil 90 (Superior) | Graficos, cores e icones > texto |
| Hab. Visuoconstrutivas | Percentil 100 (Superior) | Layouts grid, charts comparativos, dashboards visuais |
| QI Total | 118 (Medio Superior) | Complexidade e aceita se for visualmente organizada |
| Medicacao | Venvanse 70mg/dia | Janela produtiva estabilizada, mas nao infinita |

---

## Principios

### ADHD-UX-01: Zero Telas Mortas

**Regra:** Todo estado de loading, espera ou transicao DEVE ter feedback visual ativo (skeleton, shimmer, progress bar ou spinner com contexto).

**Evidencia:** Atencao concentrada P20 — uma tela sem movimento por >300ms e interpretada como "quebrou" e dispara context switch mental. Pain point PP-UX-04 (sem skeleton loaders) e PP-PERF-02 (CSV congela main thread) confirmam perda de foco durante espera.

**Checklist de validacao:**
- [ ] Componente exibe skeleton/shimmer durante fetch de dados?
- [ ] Progress bars mostram porcentagem ou contagem real (nao indeterminado)?
- [ ] Nenhuma tela fica completamente estatica por mais de 300ms durante transicao?
- [ ] Imports de longa duracao mostram "X de Y processados" em tempo real?

---

### ADHD-UX-02: Visual-First Information

**Regra:** Priorizar SEMPRE representacao grafica sobre textual. Hierarquia: sparkline > numero com cor > badge > texto puro.

**Evidencia:** Memoria visual P90, habilidades visuoconstrutivas P100 — o operador processa informacao visual 4-5x mais rapido que textual. Principio P2 da Vision Architecture: "Graficos > tabelas > texto". Aesthetic profile: data-dense-but-organized, "cada metrica e um ponto de luz em uma constelacao".

**Checklist de validacao:**
- [ ] Tendencias sao apresentadas como sparklines (nao apenas numeros)?
- [ ] Status usa badges coloridos com icone (nao apenas texto)?
- [ ] Comparativos usam chart (nao tabela de numeros lado a lado)?
- [ ] KPIs grandes usam tipografia display (48px bold) com trend indicator visual?
- [ ] Cores semanticas estao aplicadas (green=positivo, red=negativo, orange=spike)?

---

### ADHD-UX-03: Acao Unica por Contexto

**Regra:** Cada view, modal ou card DEVE ter UMA acao primaria visualmente dominante. Acoes secundarias existem mas nao competem.

**Evidencia:** Atencao dividida P30 — multiplas opcoes com peso visual igual causam paralisia de decisao. Pain point: dificuldade em iniciar tarefas (sec 7). Stealth wealth: a interface padrao e limpa, momentos de impacto visual sao reservados.

**Checklist de validacao:**
- [ ] Existe exatamente 1 botao primario (accent color) por view/modal?
- [ ] Botoes secundarios usam variant ghost ou outline (nao solid)?
- [ ] CTA primario esta posicionado no ponto de maior atencao (topo-direita ou center)?
- [ ] Hover/focus do CTA primario tem glow effect diferenciado?

---

### ADHD-UX-04: Flow Ininterrupto

**Regra:** NUNCA interromper o estado de hiperfoco com modais bloqueantes, confirmacoes desnecessarias ou navegacao forcada.

**Evidencia:** Hiperfoco quando engajado — o TDAH trabalha em bursts de alta concentracao. Interromper este estado tem custo cognitivo de 15-25 minutos para retomar (pesquisa em TDAH). Atmospheric principle: "Forward momentum — tudo aponta para acao".

**Checklist de validacao:**
- [ ] Toasts sao usados para feedback (nao modais de confirmacao)?
- [ ] Acoes nao-destrutivas executam imediatamente (sem "Tem certeza?")?
- [ ] Inline edit e preferido sobre "abrir modal para editar"?
- [ ] Notificacoes nao bloqueiam a interacao atual (toast auto-dismiss 4s)?
- [ ] Navegacao entre ofertas nao requer voltar ao radar (prev/next no detail)?

---

### ADHD-UX-05: Feedback Instantaneo em Toda Acao

**Regra:** Toda interacao do usuario DEVE produzir resposta visual em <100ms — mudanca de estado, ripple, glow, ou confirmacao.

**Evidencia:** Necessidade de satisfacao imediata (context-brief). Pain point: "Necessidade de feedback visual → sem micro-interactions → glow, pulse, transitions" (sec 7). Atmospheric: "Warm Glow in Darkness — light as precious thing".

**Checklist de validacao:**
- [ ] Click em botao produz feedback visual imediato (ripple, color change, scale)?
- [ ] Toggle de status muda visualmente antes da resposta do servidor (optimistic UI)?
- [ ] Drag-and-drop mostra ghost element durante arraste?
- [ ] Hover states tem transicao de border-glow (200ms ease)?
- [ ] Acoes completadas mostram micro-celebracao (checkmark animado, glow pulse)?

---

### ADHD-UX-06: Ancoragem Temporal Sempre Visivel

**Regra:** Todo dado temporal DEVE incluir referencia de tempo relativo ("ha 3 dias", "atualizado 2h atras") alem do absoluto.

**Evidencia:** Time blindness severa — o operador nao percebe passagem de tempo. Pain point: "Sem timer/reminder → checklist de rotina" (sec 7). Context-brief: "Timestamps visiveis, indicadores de 'quanto tempo faz'".

**Checklist de validacao:**
- [ ] Datas de criacao/atualizacao mostram tempo relativo (ha X minutos/horas/dias)?
- [ ] Imports mostram "ultima importacao: ha 3 dias" (nao apenas data)?
- [ ] Ofertas sem atividade recente tem indicator visual de stale (opacity reduzida)?
- [ ] Pipeline/spikes mostram "detectado ha Xh" com urgencia visual?

---

### ADHD-UX-07: Sistema como Organizador

**Regra:** O sistema DEVE organizar automaticamente — auto-classificar CSVs, auto-agrupar ofertas, auto-sugerir status. O operador DECIDE, nao organiza.

**Evidencia:** "Organizacao dificil de manter → o sistema DEVE ser o organizador" (context-brief). Com 12k+ ofertas, organizacao manual e impossivel mesmo sem TDAH. Pain point PP-FRAG-01: dados em 5 locais porque o sistema nao centraliza.

**Checklist de validacao:**
- [ ] Import CSV detecta tipo automaticamente (sem pedir ao usuario)?
- [ ] Novas ofertas recebem status padrao (RADAR) sem input adicional?
- [ ] Ofertas sem atividade >90 dias sao sugeridas para VAULT/archive?
- [ ] Filtros "salvos" restauram estado completo com 1 click?
- [ ] Busca global (Cmd+K) encontra em todos os modulos sem especificar onde?

---

### ADHD-UX-08: Impulsividade Protegida

**Regra:** Acoes destrutivas DEVEM ter safety net (soft-delete, undo 10s, confirmacao visual com glow red). Acoes construtivas NUNCA devem ter confirmacao.

**Evidencia:** Impulsividade alta (context-brief). O operador age rapido — isso e vantagem competitiva para acoes construtivas, mas risco para destrutivas. Stealth wealth: delete usa "red glow sutil, nao red background agressivo" (aesthetic-profile sec 9.8).

**Checklist de validacao:**
- [ ] Delete tem undo toast (10s) antes de efetivar?
- [ ] Soft-delete e padrao (campo deleted_at, nao DELETE real)?
- [ ] Bulk delete mostra contagem + lista resumida antes de confirmar?
- [ ] Confirmacao de delete usa border-glow-red (nao background vermelho agressivo)?
- [ ] Criar/editar/mover NUNCA pedem confirmacao?

---

### ADHD-UX-09: Painel Unico de Controle

**Regra:** Minimizar context switches a ZERO. Tudo que o operador precisa para decidir DEVE estar na mesma tela ou a 1 click de distancia.

**Evidencia:** "Distracao por context switch → 6+ ferramentas externas" (sec 7). O operador perde ~9h/semana em friccao (pain-points sec 3). Archetype "Command Center": "dark multi-monitor office as sanctuary" — o DR OPS e o cockpit, nao uma janela entre muitas.

**Checklist de validacao:**
- [ ] SpyRadar mostra sparkline + status + dominio + trafego na MESMA linha?
- [ ] Offer detail tem TODAS as informacoes em tabs (sem links externos obrigatorios)?
- [ ] Arsenal abre links externos em nova aba (nao redireciona fora do app)?
- [ ] Criativo mostra metricas de performance inline (nao "va ver na planilha")?
- [ ] Daily briefing consolida todas as pendencias em uma unica tela?

---

### ADHD-UX-10: Direcao Clara — "O Que Fazer Agora"

**Regra:** Toda tela DEVE comunicar qual e a proxima acao recomendada. Empty states, dashboards e listas devem ter call-to-action contextual.

**Evidencia:** "Dificuldade em iniciar tarefas → sem daily briefing" (sec 7). "Forward momentum — tudo aponta para acao, para 'o que fazer agora'" (aesthetic-profile sec 5.3). O TDAH paralisa sem direcao clara.

**Checklist de validacao:**
- [ ] Empty states tem CTA descritivo ("Importe seu primeiro CSV" com icone + botao)?
- [ ] Dashboard mostra "X ofertas precisam de atencao" com link direto?
- [ ] Ofertas com spike >100% tem badge pulsante (glow orange) que convida a clicar?
- [ ] Criativos em TEST >72h mostram "Decisao pendente" com acao WIN/KILL?
- [ ] Listas vazias nunca mostram apenas "Nenhum resultado" sem sugestao de acao?

---

### ADHD-UX-11: Luz Quente como Recompensa

**Regra:** Usar warm glow (amber/gold) como feedback de sucesso e conquista. Reservar glow effects para momentos que MERECEM atencao — nunca decorativo.

**Evidencia:** LED strip lighting como signature pessoal (aesthetic-profile sec 7.3 — "linhas finas de luz contra escuridao"). "Motivacao por resultado visivel → dashboard zerado" (sec 7). Formula atmosferica: "Warm Glow in Darkness — light as precious thing".

**Checklist de validacao:**
- [ ] Import concluido com sucesso mostra ambient glow green/amber momentaneo?
- [ ] Spike detectado pulsa com glow orange (2s infinite, ease-in-out)?
- [ ] Card de oferta HOT tem border-glow-warm sutil permanente?
- [ ] Glow effects sao reservados para max 3-5 elementos por tela (nao todos)?
- [ ] Glow NUNCA e usado em elementos estaticos sem significado (decorativo puro)?

---

### ADHD-UX-12: Densidade Hierarquica

**Regra:** Muitos dados sao bem-vindos — mas organizados em hierarquia visual rigida: KPI hero > chart principal > tabela detalhada > metadata.

**Evidencia:** Habilidades visuoconstrutivas P100 + QI 118 — o operador QUER densidade, desde que organizada. "Dense-but-Organized: a metafora e a mega-mansion — vista de fora clean, vista de dentro 4 andares" (aesthetic-profile sec 8). 12k+ ofertas exigem information density.

**Checklist de validacao:**
- [ ] Pagina segue hierarquia KPI row → chart area → data table?
- [ ] KPIs usam tipografia display (48px bold) claramente separada do body?
- [ ] Secoes tem headings de 18px semi-bold com spacing de 24px entre elas?
- [ ] Tabelas com 10+ linhas tem header fixo (sticky) durante scroll?
- [ ] Metadata/labels usam 12px `--text-secondary` (nao competem com dados)?

---

### ADHD-UX-13: Keyboard-First, Mouse-Optional

**Regra:** Toda acao frequente DEVE ter atalho de teclado. Navegacao entre itens deve funcionar com j/k, acoes com 1-letter shortcuts.

**Evidencia:** "Operador solo = keyboard-first" (context-brief P7). "Hiperfoco quando engajado → sistema nao deve interromper flow — atalhos keyboard" (context-brief). Pain point PP-UX-02: tabela nao navegavel por teclado. Hook `useKeyboardShortcuts` existe mas NAO implementado.

**Checklist de validacao:**
- [ ] Cmd+K abre command palette global?
- [ ] j/k navegam entre linhas na tabela do radar?
- [ ] Enter abre detalhe da oferta selecionada?
- [ ] Escape fecha modal/popover/detalhe?
- [ ] Atalhos estao documentados em tooltip (ex: "Status [S]")?
- [ ] Focus ring e visivel (2px solid `--accent-primary`) em todos os elementos focaveis?

---

### ADHD-UX-14: Memoria Contextual Vinculada

**Regra:** Toda informacao (nota, log, metrica, screenshot) DEVE estar vinculada a entidade pai (oferta, criativo, avatar). Nada solto, nada orfao.

**Evidencia:** "Memoria de curto prazo fraca → notas dispersas → tudo vinculado a oferta" (sec 7). Pain point PP-FRAG-01: dados em 5 locais. O operador esquece ONDE salvou algo — o sistema deve lembrar POR ELE.

**Checklist de validacao:**
- [ ] Notas estao dentro da tab Notes da oferta (nao em pagina separada)?
- [ ] Changelog de acoes aparece na timeline da oferta?
- [ ] Screenshots estao vinculados ao dominio (nao a uma galeria generica)?
- [ ] Criativos estao vinculados a oferta + angulo (nao lista flat)?
- [ ] Busca global retorna resultados com contexto ("Nota em [Oferta X]")?

---

### ADHD-UX-15: Celebracao de Progresso

**Regra:** Marcos de progresso DEVEM ser visualmente celebrados — imports concluidos, ofertas promovidas, criativos WINNER. O sistema deve gerar motivacao, nao apenas funcionar.

**Evidencia:** "Motivacao por resultado visivel" (sec 7). Dashboard zerado = "sistema nao funciona" feeling. Stealth wealth com "display controlado": momentos de impacto reservados para dados criticos. "No Money, No Funny" — resultados visiveis sao combustivel motivacional.

**Checklist de validacao:**
- [ ] Import concluido mostra resumo com numeros grandes ("14,283 registros importados")?
- [ ] Oferta promovida para HOT tem transicao visual diferenciada (badge pulse)?
- [ ] Dashboard mostra tendencia positiva com seta verde animada (nao apenas numero)?
- [ ] Criativo marcado WINNER recebe tratamento visual premium (gold badge + glow)?
- [ ] Contadores de progresso mostram evolucao ("Radar: 12,483 → 14,283 ofertas")?

---

## Matriz de Aplicacao por Componente

| Componente | Principios Prioritarios |
|-----------|------------------------|
| SpyRadar (tabela) | UX-02, UX-09, UX-12, UX-13 |
| Offer Detail (7 tabs) | UX-09, UX-14, UX-12, UX-04 |
| Import Modal | UX-01, UX-05, UX-07, UX-15 |
| Dashboard | UX-10, UX-02, UX-06, UX-15 |
| Command Palette | UX-13, UX-07, UX-04 |
| Criativos Kanban | UX-03, UX-05, UX-11, UX-08 |
| Sidebar Navigation | UX-03, UX-13, UX-11 |
| Modais/Dialogs | UX-04, UX-03, UX-08 |
| Data Metric Cards | UX-02, UX-12, UX-11 |
| Empty States | UX-10, UX-01, UX-15 |

---

## Como Usar Este Documento

1. **Audit (`*audit`):** Verificar cada componente existente contra os checklists aplicaveis
2. **Wireframe (`*wireframe`):** Incluir anotacoes ADHD-UX-XX em cada tela
3. **Build (`*build`):** Validar checklist ANTES de marcar componente como completo
4. **QA Gate:** Qualquer componente que falhe em 2+ principios prioritarios = REJECT

---

*Uma — desenhando com empatia para quem pensa em imagens e vive em velocidade*
