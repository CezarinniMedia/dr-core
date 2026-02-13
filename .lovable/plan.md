

# Plano: Importador Inteligente de CSVs + Integração Funil-Domínios

## Resumo

Este plano reestrutura o sistema de importação para ser um **importador universal inteligente** que identifica automaticamente o tipo de CSV (PublicWWW, Semrush Bulk, Semrush Geo, Semrush Páginas, Semrush Subdomínios, Semrush Tendência de Tráfego, etc.) e roteia os dados para os campos corretos. Também conecta Funil e Domínios, e adiciona campos de data de criação.

---

## 1. Alterações no Banco de Dados

### 1.1 Novos campos em `offer_domains`
- `first_seen DATE` -- data em que o domínio foi detectado pela primeira vez
- `discovery_source VARCHAR(100)` -- de onde veio (publicwww, semrush_pages, manual)
- `discovery_query TEXT` -- query/script usado para encontrar

### 1.2 Novos campos em `spied_offers`
- `domain_created_at DATE` -- data de criação do domínio principal (WHOIS ou manual)

### 1.3 Novo campo em `offer_funnel_steps`
- `domain_id UUID REFERENCES offer_domains(id) ON DELETE SET NULL` -- vincula o step a um domínio existente

### 1.4 Novo campo em `offer_domains`
- `traffic_share DECIMAL(5,2)` -- proporção de tráfego (para dados do Semrush Páginas)

---

## 2. Classificador Inteligente de CSV (sem IA)

Arquivo: `src/lib/csvClassifier.ts`

O sistema analisa os headers do CSV para classificar automaticamente o tipo. Regras determinísticas:

| Headers contém... | Tipo detectado |
|---|---|
| Coluna 1 = URL/domínio + colunas numéricas sem header de data + sem "Destino" | `publicwww` |
| "Target", "target_type", "Visits" | `semrush_bulk` |
| "Destino", "País", "Proporção de tráfego" | `semrush_geo` |
| "Destino", "Página", "Proporção de tráfego" OU "Página", "Proporção de tráfego" (sem Destino) | `semrush_pages` |
| "Destino", "Subdomínio", "Visitas" OU "Subdomínio", "Visitas" | `semrush_subdomains` |
| "Destino", "Subpasta", "Proporção de tráfego" | `semrush_subfolders` |
| "Data" na coluna 1 + domínios como headers das colunas restantes | `semrush_traffic_trend` |
| "Destino", "Período", "Visitas" | `semrush_summary` |
| Coluna 1 = domínio + colunas com headers de data (Oct 2024, Nov 2024...) | `semrush_bulk_historical` (formato antigo) |

### Extração do footprint/query do PublicWWW

O título do CSV do PublicWWW contém a query usada (ex: `cdn.utmify.com.br`). Como esse dado vem no nome do arquivo e no conteúdo da coluna "script src", o sistema:
1. Pega o valor da 3a coluna (footprint/script src) da primeira linha de dados
2. Extrai o domínio/path core removendo prefixos como `script src=\`, aspas, `https://`
3. Compara com o nome do arquivo (se disponível) para validação cruzada
4. Armazena como `discovery_query` nos domínios importados

### Extração de data do nome do arquivo (Semrush Bulk)

O nome do arquivo `Bulk Analysis_Jan 2026_Worldwide_All devices.csv` é parseado com regex para extrair mês/ano. O sistema mapeia nomes em inglês e português (jan./jan, fev./feb, etc.).

---

## 3. Processadores por Tipo de CSV

### 3.1 `publicwww` (Etapa 1)
- Extrai: domínio (coluna 1), visitas (coluna 2), footprint/script (coluna 3)
- Para cada domínio: verifica se já existe em `spied_offers.main_domain` ou `offer_domains.domain`
- Se existe: ignora criação, mas adiciona `discovery_query` se ausente
- Se não existe: cria nova `spied_offer` com `discovery_source = 'publicwww'` e `discovery_query` = footprint extraído
- Visitas vão para `offer_traffic_data` com `period_date` = mês atual, `source = 'publicwww'`

### 3.2 `semrush_bulk` (Etapa 2)
- Extrai: Target (domínio), Visits, Unique Visitors, Pages/Visits, Avg Visit Duration, Bounce Rate
- Data do período: extraída do nome do arquivo (ex: `Jan 2026`)
- Se `target_type = "subfolder"`: a URL completa é adicionada como domínio (tipo `other`), o domínio raiz é o pai
- Para cada domínio: match com existente, upsert em `offer_traffic_data` com todos os campos extras (unique_visitors, pages_per_visit, avg_visit_duration, bounce_rate)
- Ignora domínios com `visits = "n/a"`

### 3.3 `semrush_geo` (Etapa 3.1)
- Formato "Destino" multi-linha: quando coluna "Destino" está vazia, pertence ao último destino preenchido
- Extrai: país + proporção de tráfego + visitas por dispositivo
- Lógica de geo automatico:
  - Se um país tem 80%+ do tráfego: `spied_offers.geo` = código desse país
  - Se 2+ países com 15%+: preenche geo com o principal, mas registra todos
- Dados completos (todos os países + percentuais + data) vao para `spied_offers.notas` em formato markdown
- Ignora: proporção de computadores e dispositivos móveis

### 3.4 `semrush_pages` (Etapa 3.2 e 4.1)
- Formato com ou sem "Destino": se tem "Destino", agrupa por destino; se não, o domínio é identificado pelo campo "Página"
- Extrai: URL completa da página
- Adiciona cada URL como `offer_domain` (tipo inferido pelo path: /checkout = checkout, /obrigado ou /thankyou = thank_you, etc.)
- Nota do domínio: proporção de tráfego
- Ignora: "Exibições de página únicas" e "Exclusivo"

### 3.5 `semrush_subdomains` (Etapa 3.3 e 4.2)
- Extrai: subdomínio como novo domínio
- Verifica se já existe em `offer_domains`; se não, adiciona
- Ignora: visitas, computador, móvel

### 3.6 `semrush_subfolders` (Etapa 3.4)
- Extrai: subpasta completa como URL/domínio
- Mesmo tratamento que subdomains: se a URL não existe, adiciona como domínio
- Ignora: proporção de tráfego, exibições, exclusivo

### 3.7 `semrush_traffic_trend` (Etapa 3.5)
- Formato TRANSPOSTO: coluna 1 = "Data" com meses nas linhas, colunas 2+ = domínios com visitas
- Parse de datas PT: "ago. de 2025" -> 2025-08-01, "jan. de 2026" -> 2026-01-01
- Para cada domínio-coluna: gera registros de tráfego (`offer_traffic_data`)
- Match de domínio: cada header de coluna é um domínio, vincula ao `spied_offer` correspondente

### 3.8 `semrush_summary`
- Formato com "Destino" multi-linha + "Período"
- Extrai: Visitas e período para upsert em `offer_traffic_data`
- Também extrai: Páginas/Visita, Duração, Bounce Rate para enriquecer dados existentes
- Ignora: colunas de "diferença" (variação percentual)

---

## 4. Integração Funil <-> Domínios

### No formulário "Adicionar Step do Funil":
- Adiciona toggle no topo: "Selecionar domínio existente" vs "Preencher manualmente"
- **Selecionar existente**: dropdown com todos os `offer_domains` da oferta. Ao selecionar, `page_url` é preenchido automaticamente com a URL do domínio, e o campo `domain_id` é salvo
- **Preencher manualmente**: campos atuais (URL, título, etc.). Ao salvar, se a URL contém um domínio que não existe em `offer_domains`, o sistema cria automaticamente o domínio com `domain_type` inferido do `step_type` (CHECKOUT -> checkout, VSL_PAGE -> landing_page, etc.)

---

## 5. UI do Importador Universal

Substitui o modal `SemrushImportModal` atual por um **ImportadorUniversal** que:

### Step 1 - Upload
- Dropzone para arquivo(s) CSV (aceita multiplos)
- OU textarea para colar
- Seletor de delimitador (auto + manual)
- Campo "Query/Footprint usado" (pré-preenchido se detectado do CSV)

### Step 2 - Classificação
- Para cada arquivo: mostra o tipo detectado automaticamente com badge colorido
- Permite override manual do tipo se detecção errar
- Preview das primeiras 5 linhas parseadas
- Para Semrush Bulk: mostra o período extraído do nome do arquivo, permite editar

### Step 3 - Matching e Preview
- Tabela mostrando cada domínio encontrado
- Colunas: Domínio | Tipo CSV | Já no Radar? | Ação a realizar | Dados extraídos
- Para domínios existentes: mostra o que será atualizado/enriquecido
- Para domínios novos: mostra que será criado

### Step 4 - Confirmação e Importação
- Resumo: X domínios novos, Y atualizados, Z registros de tráfego
- Botão "Importar"
- Progress bar durante importação
- Toast com resultado final

---

## 6. Campos de Data nos Domínios

### Na tab "Domínios":
- Novo campo `first_seen` (date picker) no formulário de adicionar domínio
- Exibido na tabela como coluna "Detectado em"
- Quando importado via CSV, `first_seen` = data da importação (ou data do período do CSV se disponível)

### No formulário da oferta:
- Novo campo `domain_created_at` na seção de dados básicos
- Label: "Data de criação do domínio principal"

---

## 7. Detalhes Tecnicoss

### Arquivos a criar:
- `src/lib/csvClassifier.ts` -- classificador de tipo de CSV + processadores
- `src/components/spy/UniversalImportModal.tsx` -- novo modal unificado

### Arquivos a modificar:
- `src/lib/parseSemrushCSV.ts` -- adicionar parsers para formatos transpostos e multi-destino
- `src/components/spy/tabs/SpyFunnelTab.tsx` -- integração com domínios
- `src/components/spy/tabs/SpyDomainsTab.tsx` -- campo first_seen
- `src/hooks/useSpiedOffers.ts` -- novos hooks para upsert enriquecido
- `src/pages/SpyRadar.tsx` -- trocar SemrushImportModal + PublicWWWPipeline por UniversalImportModal
- `src/pages/SpyOfferDetail.tsx` -- passar domínios para FunnelTab

### Migração SQL:
```sql
ALTER TABLE offer_domains
  ADD COLUMN IF NOT EXISTS first_seen DATE,
  ADD COLUMN IF NOT EXISTS discovery_source VARCHAR(100),
  ADD COLUMN IF NOT EXISTS discovery_query TEXT,
  ADD COLUMN IF NOT EXISTS traffic_share DECIMAL(5,2);

ALTER TABLE spied_offers
  ADD COLUMN IF NOT EXISTS domain_created_at DATE;

ALTER TABLE offer_funnel_steps
  ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES offer_domains(id) ON DELETE SET NULL;
```

### Regras de matching de domínio (sempre aplicadas):
1. Extrai domínio raiz de qualquer URL (remove protocolo, path, porta)
2. Compara lowercase contra `spied_offers.main_domain`
3. Compara contra `offer_domains.domain`
4. Se `app.megadedicados.com.br` e `megadedicados.com.br` pertencem a mesma oferta, ambos devem linkar ao mesmo `spied_offer`
5. Subpastas como `aogosto.com.br/delivery/` sao tratadas como domínios separados mas vinculadas ao mesmo spied_offer do domínio raiz

