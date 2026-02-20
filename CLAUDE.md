# DR OPS - Webapp de Direct Response Marketing

## Stack
- React 18 + Vite + TypeScript
- Supabase (auth, database, storage, RLS)
- TailwindCSS + shadcn/ui
- Deploy: GitHub (CezarinniMedia/dr-core) → Hostinger (auto-deploy from main)

## Estrutura do Projeto
```
src/
├── components/
│   ├── spy/           # Modulo Espionagem (Radar de Ofertas) - PRIORITARIO
│   │   ├── tabs/      # SpyOverviewTab, SpyDomainsTab, SpyLibrariesTab, SpyCreativesTab, SpyFunnelTab, SpyTrafficTab, SpyNotesTab
│   │   ├── UniversalImportModal.tsx    # Importador CSV universal (PublicWWW + Semrush)
│   │   ├── TrafficIntelligenceView.tsx # Graficos comparativos multi-dominio
│   │   ├── TrafficChart.tsx            # Graficos de trafego individual
│   │   ├── MonthRangePicker.tsx        # Seletor de periodo estilo Semrush
│   │   ├── FullOfferFormModal.tsx      # Modal de oferta completa
│   │   └── QuickAddOfferModal.tsx      # Quick add para espionagem rapida
│   ├── ofertas/       # Modulo Ofertas proprias
│   ├── avatar/        # Modulo Avatar & Research
│   ├── criativos/     # Modulo Criativos (Kanban)
│   ├── layout/        # AppLayout, Sidebar, Header
│   └── ui/            # shadcn/ui components
├── hooks/
│   ├── useSpiedOffers.ts  # Hooks para ofertas espionadas (CRUD, trafego, dominios)
│   ├── useOfertas.ts      # Hooks para ofertas proprias
│   ├── useAvatares.ts     # Hooks para avatares
│   ├── useCriativos.ts    # Hooks para criativos
│   └── useAuth.tsx        # Hook de autenticacao
├── lib/
│   ├── csvClassifier.ts   # Classificador inteligente de CSV (9 tipos)
│   ├── parseSemrushCSV.ts # Parsers para formatos Semrush
│   ├── utils.ts           # Utilitarios gerais
│   ├── storage.ts         # Upload de arquivos (Supabase Storage)
│   ├── logger.ts          # Sistema de logging
│   └── analytics.ts       # Eventos de analytics
├── pages/
│   ├── SpyRadar.tsx       # Pagina principal do Radar de Ofertas
│   ├── SpyOfferDetail.tsx # Detalhe de oferta espionada (tabs)
│   ├── Ofertas.tsx        # Lista de ofertas proprias
│   ├── Dashboard.tsx      # Dashboard principal
│   └── ...
├── integrations/supabase/
│   ├── client.ts          # Supabase client config
│   └── types.ts           # Tipos gerados do banco (Database type)
supabase/
├── migrations/            # Migracoes SQL do banco
├── functions/             # Edge functions
└── config.toml
```

## Banco de Dados (tabelas principais)
- `spied_offers` - Ofertas espionadas no Radar (main_domain, nome, status, vertical, geo, prioridade, notas)
- `offer_domains` - Dominios vinculados a oferta (domain, url, domain_type, first_seen, discovery_source, discovery_query)
- `offer_traffic_data` - Dados historicos de trafego por dominio/mes (visits, period_date, source)
- `offer_ad_libraries` - Bibliotecas de anuncios (plataforma, pagina, link, qtd_anuncios)
- `offer_funnel_steps` - Etapas do funil (tipo, url, produto, preco, promessa, cloaker, domain_id)
- `ad_bibliotecas` - Bibliotecas de ads (alternativa/legacy)
- `offers` - Ofertas proprias do usuario
- `avatars` - Perfis de avatar/publico-alvo
- `ad_creatives` - Criativos salvos
- `profiles` - Perfis de usuario
- `workspaces` - Workspaces (multi-tenant)

## Modulo Prioritario: Espionagem (Radar de Ofertas)
O modulo SPY e o mais importante e mais desenvolvido. Inclui:
- Importador Universal CSV que detecta tipo automaticamente (PublicWWW, Semrush Bulk/Geo/Pages/Subdomains/Subfolders/Traffic Trend)
- Inteligencia de Trafego com sparklines, graficos comparativos multi-dominio, ordenacao, filtros
- Workflow: PublicWWW (footprints) → Semrush Bulk (trafego mensal) → Curadoria → Analise detalhada
- Detalhe de oferta com 7 tabs: Overview, Dominios, Bibliotecas, Ad Creatives, Funil, Trafego, Notas

## Comandos
- Dev: `npm run dev`
- Build: `npm run build`
- Typecheck: `npx tsc --noEmit`
- Test: `npx vitest run`

## Git Branching Strategy

### Branch Structure
- **main** - Production. Auto-deploys to Hostinger. Protected (PR required).
- **dev** - Staging. Base for all feature branches. Requires PR to merge.
- **feature/*** - Development branches. Created from dev.
- **lovable/*** - Lovable.dev branches only. Never commit to main directly.

### Workflow

#### Starting Work
```bash
git checkout dev
git pull origin dev
git checkout -b feature/bd-X-Y-description
```

#### Finishing Work
```bash
git add <files>
git commit -m "feat: description [BD-X.Y]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
# Push handled by @devops agent or manual
```

#### Merge Flow
```
feature/* → PR → dev → PR → main (auto-deploy)
lovable/* → PR → dev (never direct to main)
```

### Rules
1. NEVER commit directly to main or dev
2. ALWAYS create feature branches from dev
3. ALWAYS include Co-Authored-By footer in commits
4. Lovable MUST use lovable/* branches only
5. Run build + typecheck before pushing

## Regras de Comportamento do Agente

### NUNCA
- Implementar sem mostrar opcoes primeiro (sempre formato 1, 2, 3)
- Deletar/remover conteudo sem perguntar primeiro
- Deletar qualquer coisa criada nos ultimos 7 dias sem aprovacao explicita
- Alterar algo que ja estava funcionando
- Fingir que o trabalho esta concluido quando nao esta
- Processar batch sem validar um primeiro
- Adicionar funcionalidades que nao foram solicitadas
- Usar mock data quando existem dados reais no banco
- Explicar/justificar ao receber criticas (apenas corrigir)
- Confiar em output de AI/subagente sem verificacao
- Criar do zero quando algo similar existe em squads/

### SEMPRE
- Apresentar opcoes no formato "1. X, 2. Y, 3. Z"
- Usar AskUserQuestion tool para esclarecimentos
- Verificar squads/ e componentes existentes antes de criar novos
- Ler o schema COMPLETO antes de propor mudancas no banco
- Investigar causa raiz quando erro persiste
- Commitar antes de passar para a proxima tarefa
- Criar handoff em `docs/sessions/YYYY-MM/` ao final da sessao

## Regras de Codigo
- NUNCA usar emojis iOS na interface, SEMPRE icones Lucide React
- Dark mode e o tema padrao (dark background, light text)
- Performance e critica: sistema lida com 14k+ registros no radar
- Supabase RLS deve estar correto em todas as operacoes
- Todas as queries via React Query hooks (useQuery/useMutation)
- Campo de notas sempre suporta Markdown completo
- Upload via drag-and-drop em todo o sistema
- Tooltips descritivos em todos os elementos interativos
- NUNCA estimar trafego futuro automaticamente
- Manter compatibilidade com importacao CSV existente (nao quebrar parsers)
- Componentes usam shadcn/ui como base
- Ao adicionar campo novo ao banco: atualizar types.ts (ou avisar para rodar supabase gen types)

## Bugs Conhecidos (ver docs/bugs.md para lista completa)
- Upload de arquivos falha com RLS policy error (FIX: BD-0.1 migration pendente deploy)
- Sidebar collapse deixa lacuna a direita
- Graficos de trafego nao respeitam todos os filtros de data
- Dashboard mostra dados zerados
- Importacao de CSV grande (14k+) muito lenta sem feedback adequado

## Contexto de Negocio
Este e um sistema privado para operacao de Direct Response Marketing. O usuario espiona concorrentes (via PublicWWW + Semrush), monitora trafego, identifica sudden spikes, clona ofertas promissoras e gerencia sua operacao. Velocidade e volume sao prioridades (principio Finch: "quem espiona rapido, lanca rapido").

## Documentacao adicional
- `docs/project-state.md` - Estado atual do projeto
- `docs/tasks.md` - Tarefas pendentes
- `docs/bugs.md` - Bugs detalhados
- `docs/architecture.md` - Decisoes de arquitetura
- `docs/changelog.md` - Historico de mudancas
