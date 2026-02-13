

# VERIFICAÇÃO DETALHADA: Implementação do Importador Inteligente + Integração Funil-Domínios

## ✅ O QUE FOI IMPLEMENTADO CORRETAMENTE

### 1. CSV Classifier (`src/lib/csvClassifier.ts`)
- ✅ Detecta 9 tipos de CSV corretamente baseado em headers determinísticos
- ✅ Extrai período do nome do arquivo para Semrush Bulk (ex: `Jan 2026`)
- ✅ Extrai footprint do PublicWWW (coluna 3, limpa prefixos e protocolos)
- ✅ Detecta formato transposto (semrush_traffic_trend) com "Data" na coluna 1
- ✅ Parseia datas em português ("ago. de 2025" → "2025-08-01")
- ✅ Funções de parsing para números, domínios, tipos de domínio por URL
- ✅ Processadores para cada tipo retornam structs de dados extraídos

### 2. Modal Unificado (`src/components/spy/UniversalImportModal.tsx`)
- ✅ 4 steps: Upload → Classificação → Matching → Resultado
- ✅ Dropzone + textarea para paste CSV
- ✅ Seletor de delimitador (auto + manual: , ; \t |)
- ✅ Preview das primeiras 5 linhas
- ✅ Permite override do tipo CSV detectado
- ✅ Campo "Query/Footprint usado" (pré-preenchido)
- ✅ Matching inteligente: verifica main_domain e offer_domains
- ✅ Cria novas ofertas para domínios não encontrados
- ✅ Progress bar e toast de resultado

### 3. Integração Funil-Domínios (`src/components/spy/tabs/SpyFunnelTab.tsx`)
- ✅ Toggle (Tab) "Preencher manualmente" vs "Selecionar domínio"
- ✅ Dropdown com lista de domínios existentes da oferta
- ✅ Ao selecionar domínio, preenche URL automaticamente
- ✅ Salva domain_id quando domínio é selecionado
- ✅ Auto-cria domínio se preencher manualmente + URL válida
- ✅ Infere domain_type a partir do step_type (CHECKOUT → checkout, etc.)

### 4. Tabela de Domínios (`src/components/spy/tabs/SpyDomainsTab.tsx`)
- ✅ Novo campo `first_seen` (date picker) no formulário
- ✅ Exibe data formatada na tabela: "dd/MM/yyyy"
- ✅ Exibe `discovery_source` na tabela
- ✅ Permite adicionar domínio manualmente com data

### 5. Database Schema
- ✅ `offer_domains.first_seen DATE` - adicionado
- ✅ `offer_domains.discovery_source VARCHAR(100)` - adicionado
- ✅ `offer_domains.discovery_query TEXT` - adicionado
- ✅ `offer_domains.traffic_share DECIMAL(5,2)` - adicionado
- ✅ `spied_offers.domain_created_at DATE` - adicionado
- ✅ `offer_funnel_steps.domain_id UUID FK` - adicionado

---

## ❌ FALHAS IDENTIFICADAS (Itens que faltaram ou estão incorretos)

### **FALTA 1: Campo `domain_created_at` não está sendo exibido no formulário da oferta**
**Requisito**: "precisamos de um campo para adicionar também quando o domínio principal foi criado, em qual data"

- O campo foi adicionado ao schema ✅
- **MAS não está sendo renderizado em nenhuma página de edição da oferta**
- Precisa adicionar ao formulário na página `SpyOfferDetail.tsx`

**Impacto**: Usuário não consegue preencher quando o domínio principal foi criado.

---

### **FALTA 2: Campo `discovery_query` não está sendo exibido na tabela de Domínios**
**Requisito**: "Quero também a possibilidade de adicionar o Script src, palavra chave etc."

- O campo foi adicionado ao schema ✅
- O campo é extraído do CSV e salvo ✅
- **MAS não está sendo exibido na tabela da tab "Domínios"**
- Não há campo no formulário para editar manualmente

**Impacto**: Usuário não vê qual foi a query/footprint usado para descobrir o domínio.

---

### **FALTA 3: Lógica de processamento de CSV Geo incompleta**
**Requisito Específico**: "Se o principal país tiver 80% ou mais, apenas ele deve ser preenchido no campo de geolocalização. [...] Se tiver múltiplos países com uma quantidade relevante, como não sei, talvez 15, 20%, ele deverá entender que também está rodando naquele país."

**Implementado ERRADO**:
```typescript
if (sorted[0].share >= 80) {
  geo.mainGeo = countryToCode(sorted[0].country);
} else {
  geo.mainGeo = countryToCode(sorted[0].country); // Sempre retorna o primeiro!
}
```

- Falta lógica para múltiplos países (15%+)
- O `geo` no Supabase é um campo único (string), não um array
- Precisa verificar: o campo deve ser string única ou array?

**Exemplo do seu CSV**: 
- `espiaodecelular.com.br`: 84,85% EUA + 15,15% Países Baixos → deveria marcar como **AMBOS**
- `herculesgames.com.br`: 67,22% BR + 27,81% EUA → deveria marcar como **AMBOS**

**Impacto**: Sistema não identifica corretamente ofertas multi-país.

---

### **FALTA 4: Notas do Geo não estão sendo preenchidas corretamente**
**Requisito**: "Os dados de porcentagem, da data em que essa porcentagem foi extraída, esses dados foram extraídos e quais países. Onde deve ser adicionado isso? No campo de notas"

**Implementado**:
```typescript
const geoNotes = geo.countries
  .map(c => `- ${c.country}: ${c.share}% (${c.visits} visitas)`)
  .join("\n");
```

- ✅ Está sendo salvo
- **MAS falta**: data de quando a análise foi feita
  - Deveria extrair do nome do arquivo (ex: `jan. de 2026`)
  - Deveria incluir na nota: "Análise de jan. de 2026:"

**Impacto**: Usuário não sabe quando foi a coleta de dados de geo.

---

### **FALTA 5: Campo `traffic_share` não está sendo exibido**
**Requisito**: Campos extras de Semrush Pages (proporção de tráfego, dados de páginas)

- O campo foi adicionado ✅
- É extraído do CSV ✅
- **MAS não está sendo salvo NEM exibido em lugar nenhum**
- Não há UI para mostrar proporção de tráfego de cada página

**Impacto**: Usuário não sabe qual página teve maior tráfego.

---

### **FALTA 6: Processador de Subdomínios e Subpastas não está extraindo corretamente**
**Requisito**: "Nesse tipo, deve ser extraído apenas os novos domínios (Com novos domínios, eu quero dizer: as novas URLs de modo geral)"

- Os processadores `processSemrushSubdomains` e `processSemrushSubfolders` existem
- **MAS não há validação para ignorar domínios que JÁ EXISTEM**
- Sistema pode duplicar domínios

**Lógica necessária**:
- Ao processar, verificar se o domínio/URL já existe na oferta
- Se existir, **não adicionar novamente** (apenas atualizar first_seen se for mais antigo)

**Impacto**: Duplicação de domínios ao importar múltiplos CSVs.

---

### **FALTA 7: Não há campo para data de análise (período) no processamento de Geo**
**Requisito**: "Os dados de porcentagem, da data em que essa porcentagem foi extraída..."

- O nome do arquivo tem a data (ex: `jan. de 2026`)
- **MAS o ClassifiedCsv não extrai período para tipos Geo/Pages/etc, apenas para Bulk**

```typescript
let periodDate: string | undefined;
...
if (fileName) periodDate = extractPeriodFromFilename(fileName) ?? undefined;  // Apenas Bulk!
```

Precisa extrair para TODOS os tipos de CSV.

---

### **FALTA 8: Notas de Páginas não estão sendo preenchidas com proporção de tráfego**
**Requisito**: "E na nota daquele domínio ele deve adicionar"

- O processador de Pages extrai dados
- **MAS não está montando notas com o contexto da página**
- Cada página deveria ter uma nota como: "Proporção: 93,07% | Visitas: 10.690"

---

### **FALTA 9: Lógica de matching de domínios muito simplista para subpastas**
**Requisito**: "Se eles estiverem encaminhando para um outro lugar, é um domínio."

Exemplo: `aogosto.com.br/delivery/` é um "subfolder" no CSV Bulk

- Sistema trata como `domain_type = "other"` ✅
- **MAS não vincula automaticamente ao domínio raiz `aogosto.com.br`**
- Precisa de lógica: extrair domínio raiz, verificar se oferece já existe, se sim, vincular

---

### **FALTA 10: Ordem de processo no import confusa**
**Requisito**: Criar ofertas -> Adicionar domínios -> Adicionar tráfego

**Atual**:
```typescript
// 1. Criar ofertas por domain
// 2. Para cada arquivo, inserir tráfego
// 3. Para cada arquivo, inserir domínios
// 4. Para cada arquivo, atualizar geo
```

- Ordem está certa, **MAS há problema**:
  - Tráfego é inserido ANTES dos domínios serem criados
  - Se houver erro ao criar domínios, tráfego já foi inserido
  - Não há vinculação entre tráfego e domínios específicos (apenas à oferta)

---

### **FALTA 11: Não há validação de tipo CSV manual**
**Requisito**: "Permite override manual do tipo se detecção errar"

- UI permite override ✅
- **MAS quando usuário muda o tipo manualmente:**
  - Sistema reprocessa com `processCsv(reclassified)` ✅
  - **MAS period e footprint não são recalculados com base no novo tipo**
  - Se usuário muda para Bulk, período deveria ser re-extraído do arquivo

---

### **FALTA 12: Campo `discovery_source` na oferta**
**Requisito**: Sistema identifica onde o domínio veio ("publicwww", "semrush_bulk", etc.)

- Está sendo salvo em `offer_domains.discovery_source` ✅
- **MAS não em `spied_offers.discovery_source`**
- Quando cria nova oferta, coloca `discovery_source: files[0]?.classified.type`
- Deveria ser uma lógica mais clara

---

## 📋 RESUMO DO QUE FALTOU

| ID | Severidade | Item | Impacto |
|----|-----------|------|--------|
| 1 | 🔴 Alta | `domain_created_at` não está em nenhuma UI | Não consegue registrar quando domínio principal foi criado |
| 2 | 🟡 Média | `discovery_query` não é exibido | Usuário não vê qual script foi usado |
| 3 | 🔴 Alta | Lógica de geo multi-país incompleta | Ofertas multi-país não são identificadas corretamente |
| 4 | 🟡 Média | Data de análise não vai para notas de geo | Não sabe quando dados foram coletados |
| 5 | 🟡 Média | `traffic_share` não é exibido | Não sabe proporção de tráfego de páginas |
| 6 | 🟡 Média | Sem validação de domínios duplicados | Pode duplicar domínios ao importar |
| 7 | 🟡 Média | Período não extraído para todos tipos | Data de análise não é registrada |
| 8 | 🟡 Média | Notas de páginas não preenchidas | Sem contexto de tráfego por página |
| 9 | 🟡 Média | Matching de subpastas não vincula ao domínio raiz | Subpastas não são agrupadas |
| 10 | 🟡 Média | Ordem de processo de import pode gerar inconsistências | Tráfego inserido antes de domínios |
| 11 | 🟡 Média | Override manual de tipo não recalcula período/query | Período pode estar errado após mudança |
| 12 | 🟡 Média | `discovery_source` da oferta não está claro | Histórico de origem confuso |

---

## 🎯 PRÓXIMOS PASSOS RECOMENDADOS

1. **CRÍTICO** (implementar agora):
   - Adicionar `domain_created_at` ao formulário de edição da oferta
   - Corrigir lógica de geo multi-país
   - Extrair período para TODOS os tipos de CSV
   - Preenchimento de notas com data de análise

2. **IMPORTANTE** (próxima sessão):
   - Exibir `discovery_query` na tabela de domínios
   - Validação de domínios duplicados
   - Preenchimento de notas de páginas
   - Matching de subpastas ao domínio raiz

3. **NICE-TO-HAVE**:
   - Melhorar validação de tipos CSV manualmente
   - Verificar e corrigir ordem do processo de import
   - Clarificar `discovery_source` da oferta

