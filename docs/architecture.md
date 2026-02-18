# Arquitetura - DR OPS

## Stack confirmada
- **Frontend:** React 18 + Vite + TypeScript
- **UI:** TailwindCSS + shadcn/ui + Lucide React icons
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions + RLS)
- **State management:** React Query (TanStack Query) para server state
- **Routing:** React Router DOM
- **Charts:** Recharts
- **Drag & Drop:** @dnd-kit (usado no Kanban de criativos)
- **Deploy:** Hostinger (auto-deploy via GitHub webhook)
- **Dev tools:** Lovable (prototipagem visual) + Claude Code CLI (dev local)

## Autenticacao
- Supabase Auth com email/password
- Login: marcoscezarinni@gmail.com
- RLS policies baseadas em user_id e workspace_id
- Cada usuario pertence a um workspace

## Modelo de dados do SPY (modulo principal)

```
spied_offers (oferta espionada)
├── offer_domains (1:N) - dominios vinculados
├── offer_traffic_data (1:N) - trafego historico por dominio/mes
├── offer_ad_libraries (1:N) - bibliotecas de anuncios
├── offer_funnel_steps (1:N) - etapas do funil
│   └── domain_id (FK) - vinculo opcional com offer_domains
├── ad_creatives (1:N) - criativos salvos
└── notas (campo texto Markdown na propria tabela)
```

## Fluxo de importacao CSV

```
1. Upload (drag-drop ou paste) → detecta delimitador automaticamente
2. Classificacao → csvClassifier.ts identifica tipo (9 tipos suportados)
3. Matching → compara dominios com ofertas existentes (match por main_domain + offer_domains)
4. Importacao → cria/atualiza ofertas, dominios, dados de trafego
```

### Tipos de CSV suportados:
1. `publicwww` - URL + ranking + footprint/script
2. `semrush_bulk` - Target + target_type + Visits (+ headers PT: Destino/Visitas)
3. `semrush_geo` - Destino + Pais + Proporcao de trafego
4. `semrush_pages` - Destino + Pagina + Proporcao de trafego
5. `semrush_subdomains` - Destino + Subdominio + Visitas
6. `semrush_subfolders` - Destino + Subpasta + Proporcao
7. `semrush_traffic_trend` - Data (coluna 1) + dominios como colunas (transposto)
8. `semrush_summary` - Destino + Periodo + Visitas
9. `semrush_bulk_historical` - Dominio + colunas com headers de data

### Regra hierarquica (Destino→filhos):
Quando coluna "Destino" esta vazia, a linha pertence ao ultimo Destino preenchido. Aplica-se a todos os tipos Semrush com coluna Destino.

## Decisoes de design
- **Oferta-centric (nao competitor-centric):** Uma oferta espionada pode ter multiplos dominios, bibliotecas, etc.
- **Status lifecycle:** Radar → Analyzing → Hot → Scaling → Dying → Dead → Cloned
- **Prioridade 0-10:** Slider no formulario de oferta
- **N/A em trafego:** Importado como 0 visitas, exibido como "0" no grafico
- **Geo multi-pais:** Se pais principal >=80%, so ele. Se secundarios >=15%, ambos. Formato: "BR, US"
- **Dark mode only:** O sistema usa dark theme como padrao (toggle existe mas dark e o principal)
