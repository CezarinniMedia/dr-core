export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_bibliotecas: {
        Row: {
          biblioteca_url: string | null
          created_at: string | null
          id: string
          links_destino: Json | null
          notas: string | null
          oferta_id: string | null
          pagina_id: string | null
          pagina_nome: string | null
          pagina_url: string | null
          plataforma: string
          primeira_detecao: string | null
          status: string | null
          total_anuncios: number | null
          total_anuncios_historico: number | null
          ultima_verificacao: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          biblioteca_url?: string | null
          created_at?: string | null
          id?: string
          links_destino?: Json | null
          notas?: string | null
          oferta_id?: string | null
          pagina_id?: string | null
          pagina_nome?: string | null
          pagina_url?: string | null
          plataforma: string
          primeira_detecao?: string | null
          status?: string | null
          total_anuncios?: number | null
          total_anuncios_historico?: number | null
          ultima_verificacao?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          biblioteca_url?: string | null
          created_at?: string | null
          id?: string
          links_destino?: Json | null
          notas?: string | null
          oferta_id?: string | null
          pagina_id?: string | null
          pagina_nome?: string | null
          pagina_url?: string | null
          plataforma?: string
          primeira_detecao?: string | null
          status?: string | null
          total_anuncios?: number | null
          total_anuncios_historico?: number | null
          ultima_verificacao?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_bibliotecas_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_bibliotecas_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_creatives: {
        Row: {
          angulo: string | null
          comments: number | null
          competitor_id: string | null
          copy_body: string | null
          copy_headline: string | null
          created_at: string | null
          cta_text: string | null
          file_url: string
          first_seen: string
          id: string
          last_seen: string | null
          likes: number | null
          platform: string
          shares: number | null
          status: string | null
          tags: Json | null
          thumbnail_url: string | null
          tipo: string
          workspace_id: string
        }
        Insert: {
          angulo?: string | null
          comments?: number | null
          competitor_id?: string | null
          copy_body?: string | null
          copy_headline?: string | null
          created_at?: string | null
          cta_text?: string | null
          file_url: string
          first_seen: string
          id?: string
          last_seen?: string | null
          likes?: number | null
          platform: string
          shares?: number | null
          status?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          tipo: string
          workspace_id: string
        }
        Update: {
          angulo?: string | null
          comments?: number | null
          competitor_id?: string | null
          copy_body?: string | null
          copy_headline?: string | null
          created_at?: string | null
          cta_text?: string | null
          file_url?: string
          first_seen?: string
          id?: string
          last_seen?: string | null
          likes?: number | null
          platform?: string
          shares?: number | null
          status?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          tipo?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_creatives_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_creatives_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_name: string
          id: string
          properties: Json | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_name: string
          id?: string
          properties?: Json | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_name?: string
          id?: string
          properties?: Json | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      app_logs: {
        Row: {
          created_at: string | null
          id: string
          level: string
          message: string
          metadata: Json | null
          stack_trace: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level: string
          message: string
          metadata?: Json | null
          stack_trace?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: string
          message?: string
          metadata?: Json | null
          stack_trace?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      arsenal_dorks: {
        Row: {
          created_at: string | null
          dork_query: string
          eficacia: string | null
          exemplo_resultado: string | null
          ferramenta: string | null
          id: string
          is_favorito: boolean | null
          nome: string
          notas: string | null
          objetivo: string | null
          tags: Json | null
          tipo: string
          updated_at: string | null
          url_ferramenta: string | null
          vezes_usado: number | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          dork_query: string
          eficacia?: string | null
          exemplo_resultado?: string | null
          ferramenta?: string | null
          id?: string
          is_favorito?: boolean | null
          nome: string
          notas?: string | null
          objetivo?: string | null
          tags?: Json | null
          tipo: string
          updated_at?: string | null
          url_ferramenta?: string | null
          vezes_usado?: number | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          dork_query?: string
          eficacia?: string | null
          exemplo_resultado?: string | null
          ferramenta?: string | null
          id?: string
          is_favorito?: boolean | null
          nome?: string
          notas?: string | null
          objetivo?: string | null
          tags?: Json | null
          tipo?: string
          updated_at?: string | null
          url_ferramenta?: string | null
          vezes_usado?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arsenal_dorks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      arsenal_footprints: {
        Row: {
          categoria: string
          combina_com: Json | null
          created_at: string | null
          eficacia: string | null
          ferramenta: string
          footprint: string
          id: string
          is_favorito: boolean | null
          nome: string
          notas: string | null
          plataforma: string | null
          query_google_dorks: string | null
          query_publicwww: string | null
          regiao: string | null
          resultados_tipicos: number | null
          tags: Json | null
          ultima_verificacao: string | null
          updated_at: string | null
          vezes_usado: number | null
          workspace_id: string | null
        }
        Insert: {
          categoria: string
          combina_com?: Json | null
          created_at?: string | null
          eficacia?: string | null
          ferramenta: string
          footprint: string
          id?: string
          is_favorito?: boolean | null
          nome: string
          notas?: string | null
          plataforma?: string | null
          query_google_dorks?: string | null
          query_publicwww?: string | null
          regiao?: string | null
          resultados_tipicos?: number | null
          tags?: Json | null
          ultima_verificacao?: string | null
          updated_at?: string | null
          vezes_usado?: number | null
          workspace_id?: string | null
        }
        Update: {
          categoria?: string
          combina_com?: Json | null
          created_at?: string | null
          eficacia?: string | null
          ferramenta?: string
          footprint?: string
          id?: string
          is_favorito?: boolean | null
          nome?: string
          notas?: string | null
          plataforma?: string | null
          query_google_dorks?: string | null
          query_publicwww?: string | null
          regiao?: string | null
          resultados_tipicos?: number | null
          tags?: Json | null
          ultima_verificacao?: string | null
          updated_at?: string | null
          vezes_usado?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arsenal_footprints_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      arsenal_keywords: {
        Row: {
          combinacoes: Json | null
          created_at: string | null
          eficacia: string | null
          id: string
          idioma: string | null
          is_favorito: boolean | null
          keyword: string
          nichos: Json | null
          notas: string | null
          plataforma: string | null
          tags: Json | null
          tipo: string
          ultima_verificacao: string | null
          updated_at: string | null
          vezes_usado: number | null
          workspace_id: string | null
        }
        Insert: {
          combinacoes?: Json | null
          created_at?: string | null
          eficacia?: string | null
          id?: string
          idioma?: string | null
          is_favorito?: boolean | null
          keyword: string
          nichos?: Json | null
          notas?: string | null
          plataforma?: string | null
          tags?: Json | null
          tipo: string
          ultima_verificacao?: string | null
          updated_at?: string | null
          vezes_usado?: number | null
          workspace_id?: string | null
        }
        Update: {
          combinacoes?: Json | null
          created_at?: string | null
          eficacia?: string | null
          id?: string
          idioma?: string | null
          is_favorito?: boolean | null
          keyword?: string
          nichos?: Json | null
          notas?: string | null
          plataforma?: string | null
          tags?: Json | null
          tipo?: string
          ultima_verificacao?: string | null
          updated_at?: string | null
          vezes_usado?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arsenal_keywords_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      avatares: {
        Row: {
          created_at: string | null
          demographics: Json | null
          desire_matrix: Json
          estado_atual: string | null
          estado_desejado: string | null
          gatilhos_emocionais: Json | null
          id: string
          linguagem_avatar: string | null
          nome: string
          notas: string | null
          objecoes: Json | null
          oferta_id: string | null
          pain_matrix: Json
          search_1_framework: Json | null
          updated_at: string | null
          versao: number | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          demographics?: Json | null
          desire_matrix?: Json
          estado_atual?: string | null
          estado_desejado?: string | null
          gatilhos_emocionais?: Json | null
          id?: string
          linguagem_avatar?: string | null
          nome: string
          notas?: string | null
          objecoes?: Json | null
          oferta_id?: string | null
          pain_matrix?: Json
          search_1_framework?: Json | null
          updated_at?: string | null
          versao?: number | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          demographics?: Json | null
          desire_matrix?: Json
          estado_atual?: string | null
          estado_desejado?: string | null
          gatilhos_emocionais?: Json | null
          id?: string
          linguagem_avatar?: string | null
          nome?: string
          notas?: string | null
          objecoes?: Json | null
          oferta_id?: string | null
          pain_matrix?: Json
          search_1_framework?: Json | null
          updated_at?: string | null
          versao?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avatares_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avatares_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          created_at: string | null
          dominio: string | null
          estimated_monthly_revenue: number | null
          fb_page_url: string | null
          id: string
          ig_handle: string | null
          last_active_date: string | null
          nome: string
          notas: string | null
          oferta_id: string | null
          status_tracking: string | null
          tiktok_handle: string | null
          traffic_score: number | null
          updated_at: string | null
          vertical: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          dominio?: string | null
          estimated_monthly_revenue?: number | null
          fb_page_url?: string | null
          id?: string
          ig_handle?: string | null
          last_active_date?: string | null
          nome: string
          notas?: string | null
          oferta_id?: string | null
          status_tracking?: string | null
          tiktok_handle?: string | null
          traffic_score?: number | null
          updated_at?: string | null
          vertical?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          dominio?: string | null
          estimated_monthly_revenue?: number | null
          fb_page_url?: string | null
          id?: string
          ig_handle?: string | null
          last_active_date?: string | null
          nome?: string
          notas?: string | null
          oferta_id?: string | null
          status_tracking?: string | null
          tiktok_handle?: string | null
          traffic_score?: number | null
          updated_at?: string | null
          vertical?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitors_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitors_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      criativos: {
        Row: {
          angulo: string | null
          copy_body: string | null
          created_at: string | null
          cta: string | null
          file_url: string | null
          hook_text: string
          id: string
          nome: string
          oferta_id: string | null
          performance_metrics: Json | null
          plataforma: string | null
          shot_list: Json | null
          status: string | null
          tags: Json | null
          thumbnail_url: string | null
          tipo: string
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          angulo?: string | null
          copy_body?: string | null
          created_at?: string | null
          cta?: string | null
          file_url?: string | null
          hook_text: string
          id?: string
          nome: string
          oferta_id?: string | null
          performance_metrics?: Json | null
          plataforma?: string | null
          shot_list?: Json | null
          status?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          tipo: string
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          angulo?: string | null
          copy_body?: string | null
          created_at?: string | null
          cta?: string | null
          file_url?: string | null
          hook_text?: string
          id?: string
          nome?: string
          oferta_id?: string | null
          performance_metrics?: Json | null
          plataforma?: string | null
          shot_list?: Json | null
          status?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          tipo?: string
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "criativos_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "criativos_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      fontes_captura: {
        Row: {
          created_at: string | null
          data_captura: string | null
          footprint_categoria: string | null
          footprint_usado: string | null
          id: string
          keyword_usada: string | null
          metodo: string
          notas: string | null
          oferta_id: string | null
          quantidade_resultados: number | null
          query_usada: string | null
          resultado_bruto: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_captura?: string | null
          footprint_categoria?: string | null
          footprint_usado?: string | null
          id?: string
          keyword_usada?: string | null
          metodo: string
          notas?: string | null
          oferta_id?: string | null
          quantidade_resultados?: number | null
          query_usada?: string | null
          resultado_bruto?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_captura?: string | null
          footprint_categoria?: string | null
          footprint_usado?: string | null
          id?: string
          keyword_usada?: string | null
          metodo?: string
          notas?: string | null
          oferta_id?: string | null
          quantidade_resultados?: number | null
          query_usada?: string | null
          resultado_bruto?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fontes_captura_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fontes_captura_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      funil_paginas: {
        Row: {
          created_at: string | null
          html_arquivo_url: string | null
          html_completo: string | null
          id: string
          nome: string | null
          notas: string | null
          oferta_id: string | null
          ordem: number
          preco: number | null
          preco_parcelado: string | null
          produto_nome: string | null
          produto_promessa: string | null
          screenshot_url: string | null
          stack_detectado: Json | null
          tipo_pagina: string
          updated_at: string | null
          url: string | null
          url_real: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          html_arquivo_url?: string | null
          html_completo?: string | null
          id?: string
          nome?: string | null
          notas?: string | null
          oferta_id?: string | null
          ordem: number
          preco?: number | null
          preco_parcelado?: string | null
          produto_nome?: string | null
          produto_promessa?: string | null
          screenshot_url?: string | null
          stack_detectado?: Json | null
          tipo_pagina: string
          updated_at?: string | null
          url?: string | null
          url_real?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          html_arquivo_url?: string | null
          html_completo?: string | null
          id?: string
          nome?: string | null
          notas?: string | null
          oferta_id?: string | null
          ordem?: number
          preco?: number | null
          preco_parcelado?: string | null
          produto_nome?: string | null
          produto_promessa?: string | null
          screenshot_url?: string | null
          stack_detectado?: Json | null
          tipo_pagina?: string
          updated_at?: string | null
          url?: string | null
          url_real?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funil_paginas_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funil_paginas_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_maps: {
        Row: {
          aov_estimate: number | null
          checkout_provider: string | null
          competitor_id: string | null
          created_at: string | null
          id: string
          nome: string
          notas: string | null
          steps: Json
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          aov_estimate?: number | null
          checkout_provider?: string | null
          competitor_id?: string | null
          created_at?: string | null
          id?: string
          nome: string
          notas?: string | null
          steps?: Json
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          aov_estimate?: number | null
          checkout_provider?: string | null
          competitor_id?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          notas?: string | null
          steps?: Json
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnel_maps_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funnel_maps_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_steps: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          nome: string | null
          oferta_id: string
          preco: number | null
          step_order: number
          step_type: string | null
          url_page: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string | null
          oferta_id: string
          preco?: number | null
          step_order: number
          step_type?: string | null
          url_page?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string | null
          oferta_id?: string
          preco?: number | null
          step_order?: number
          step_type?: string | null
          url_page?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_steps_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
        ]
      }
      hooks: {
        Row: {
          angulo: string | null
          created_at: string | null
          id: string
          oferta_id: string | null
          performance_score: number | null
          status: string | null
          texto: string
          used_in_creative_id: string | null
          workspace_id: string
        }
        Insert: {
          angulo?: string | null
          created_at?: string | null
          id?: string
          oferta_id?: string | null
          performance_score?: number | null
          status?: string | null
          texto: string
          used_in_creative_id?: string | null
          workspace_id: string
        }
        Update: {
          angulo?: string | null
          created_at?: string | null
          id?: string
          oferta_id?: string | null
          performance_score?: number | null
          status?: string | null
          texto?: string
          used_in_creative_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hooks_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hooks_used_in_creative_id_fkey"
            columns: ["used_in_creative_id"]
            isOneToOne: false
            referencedRelation: "criativos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hooks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          arquivo_nome: string | null
          arquivo_url: string | null
          completed_at: string | null
          contexto: Json | null
          created_at: string | null
          erro_msg: string | null
          id: string
          linhas_erro: number | null
          linhas_ignoradas: number | null
          linhas_importadas: number | null
          ofertas_existentes_atualizadas: number | null
          ofertas_novas_criadas: number | null
          status: string | null
          tipo: string
          total_linhas: number | null
          workspace_id: string | null
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          completed_at?: string | null
          contexto?: Json | null
          created_at?: string | null
          erro_msg?: string | null
          id?: string
          linhas_erro?: number | null
          linhas_ignoradas?: number | null
          linhas_importadas?: number | null
          ofertas_existentes_atualizadas?: number | null
          ofertas_novas_criadas?: number | null
          status?: string | null
          tipo: string
          total_linhas?: number | null
          workspace_id?: string | null
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_url?: string | null
          completed_at?: string | null
          contexto?: Json | null
          created_at?: string | null
          erro_msg?: string | null
          id?: string
          linhas_erro?: number | null
          linhas_ignoradas?: number | null
          linhas_importadas?: number | null
          ofertas_existentes_atualizadas?: number | null
          ofertas_novas_criadas?: number | null
          status?: string | null
          tipo?: string
          total_linhas?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      oferta_dominios: {
        Row: {
          created_at: string | null
          dominio: string
          hosting_provider: string | null
          id: string
          ip_address: string | null
          is_principal: boolean | null
          notas: string | null
          oferta_id: string | null
          tipo: string | null
          trafego_fonte: string | null
          trafego_ultimo: number | null
          updated_at: string | null
          whois_criado_em: string | null
          whois_expira_em: string | null
          whois_nameservers: string[] | null
          whois_registrant: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string | null
          dominio: string
          hosting_provider?: string | null
          id?: string
          ip_address?: string | null
          is_principal?: boolean | null
          notas?: string | null
          oferta_id?: string | null
          tipo?: string | null
          trafego_fonte?: string | null
          trafego_ultimo?: number | null
          updated_at?: string | null
          whois_criado_em?: string | null
          whois_expira_em?: string | null
          whois_nameservers?: string[] | null
          whois_registrant?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string | null
          dominio?: string
          hosting_provider?: string | null
          id?: string
          ip_address?: string | null
          is_principal?: boolean | null
          notas?: string | null
          oferta_id?: string | null
          tipo?: string | null
          trafego_fonte?: string | null
          trafego_ultimo?: number | null
          updated_at?: string | null
          whois_criado_em?: string | null
          whois_expira_em?: string | null
          whois_nameservers?: string[] | null
          whois_registrant?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oferta_dominios_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oferta_dominios_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ofertas: {
        Row: {
          aov_target: number | null
          checkout_provider: string | null
          cpa_target: number | null
          created_at: string | null
          data_lancamento: string | null
          dominio_principal: string | null
          id: string
          idioma: string | null
          mecanismo_unico: string | null
          mercado: string | null
          nicho: string | null
          nome: string
          notas_spy: string | null
          pais_alvo: string | null
          plataforma_quiz: string | null
          prioridade: string | null
          promessa_principal: string | null
          roas_target: number | null
          score_potencial: number | null
          slug: string
          status: string | null
          status_spy: string | null
          sub_nicho: string | null
          tags: Json | null
          tem_cloaker: boolean | null
          tem_quiz: boolean | null
          ticket_front: number | null
          trafego_atual: number | null
          trafego_atualizado_em: string | null
          trafego_tendencia: number | null
          updated_at: string | null
          vertical: string | null
          vsl_player: string | null
          workspace_id: string
        }
        Insert: {
          aov_target?: number | null
          checkout_provider?: string | null
          cpa_target?: number | null
          created_at?: string | null
          data_lancamento?: string | null
          dominio_principal?: string | null
          id?: string
          idioma?: string | null
          mecanismo_unico?: string | null
          mercado?: string | null
          nicho?: string | null
          nome: string
          notas_spy?: string | null
          pais_alvo?: string | null
          plataforma_quiz?: string | null
          prioridade?: string | null
          promessa_principal?: string | null
          roas_target?: number | null
          score_potencial?: number | null
          slug: string
          status?: string | null
          status_spy?: string | null
          sub_nicho?: string | null
          tags?: Json | null
          tem_cloaker?: boolean | null
          tem_quiz?: boolean | null
          ticket_front?: number | null
          trafego_atual?: number | null
          trafego_atualizado_em?: string | null
          trafego_tendencia?: number | null
          updated_at?: string | null
          vertical?: string | null
          vsl_player?: string | null
          workspace_id: string
        }
        Update: {
          aov_target?: number | null
          checkout_provider?: string | null
          cpa_target?: number | null
          created_at?: string | null
          data_lancamento?: string | null
          dominio_principal?: string | null
          id?: string
          idioma?: string | null
          mecanismo_unico?: string | null
          mercado?: string | null
          nicho?: string | null
          nome?: string
          notas_spy?: string | null
          pais_alvo?: string | null
          plataforma_quiz?: string | null
          prioridade?: string | null
          promessa_principal?: string | null
          roas_target?: number | null
          score_potencial?: number | null
          slug?: string
          status?: string | null
          status_spy?: string | null
          sub_nicho?: string | null
          tags?: Json | null
          tem_cloaker?: boolean | null
          tem_quiz?: boolean | null
          ticket_front?: number | null
          trafego_atual?: number | null
          trafego_atualizado_em?: string | null
          trafego_tendencia?: number | null
          updated_at?: string | null
          vertical?: string | null
          vsl_player?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ofertas_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ofertas_brief: {
        Row: {
          angulos_testados: Json | null
          created_at: string | null
          desejos_principais: Json | null
          dores_principais: Json | null
          id: string
          notas: string | null
          objecoes_principais: Json | null
          oferta_id: string
          publico_alvo: string | null
        }
        Insert: {
          angulos_testados?: Json | null
          created_at?: string | null
          desejos_principais?: Json | null
          dores_principais?: Json | null
          id?: string
          notas?: string | null
          objecoes_principais?: Json | null
          oferta_id: string
          publico_alvo?: string | null
        }
        Update: {
          angulos_testados?: Json | null
          created_at?: string | null
          desejos_principais?: Json | null
          dores_principais?: Json | null
          id?: string
          notas?: string | null
          objecoes_principais?: Json | null
          oferta_id?: string
          publico_alvo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ofertas_brief_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: true
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          nome_completo: string | null
          preferences: Json | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          nome_completo?: string | null
          preferences?: Json | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome_completo?: string | null
          preferences?: Json | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      research_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          insights: Json | null
          oferta_id: string | null
          relevance_score: number | null
          source_url: string | null
          tags: Json | null
          tipo: string | null
          workspace_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          insights?: Json | null
          oferta_id?: string | null
          relevance_score?: number | null
          source_url?: string | null
          tags?: Json | null
          tipo?: string | null
          workspace_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          insights?: Json | null
          oferta_id?: string | null
          relevance_score?: number | null
          source_url?: string | null
          tags?: Json | null
          tipo?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_notes_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_notes_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      trafego_historico: {
        Row: {
          avg_visit_duration: number | null
          bounce_rate: number | null
          created_at: string | null
          dominio: string
          fonte_dados: string
          id: string
          import_batch_id: string | null
          oferta_id: string | null
          pages_per_visit: number | null
          pageviews: number | null
          pais_principal: string | null
          pct_direct: number | null
          pct_display: number | null
          pct_email: number | null
          pct_paid: number | null
          pct_pais_principal: number | null
          pct_referral: number | null
          pct_search: number | null
          pct_social: number | null
          periodo_data: string
          periodo_tipo: string
          visitas: number | null
          visitas_unicas: number | null
          workspace_id: string | null
        }
        Insert: {
          avg_visit_duration?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          dominio: string
          fonte_dados: string
          id?: string
          import_batch_id?: string | null
          oferta_id?: string | null
          pages_per_visit?: number | null
          pageviews?: number | null
          pais_principal?: string | null
          pct_direct?: number | null
          pct_display?: number | null
          pct_email?: number | null
          pct_paid?: number | null
          pct_pais_principal?: number | null
          pct_referral?: number | null
          pct_search?: number | null
          pct_social?: number | null
          periodo_data: string
          periodo_tipo: string
          visitas?: number | null
          visitas_unicas?: number | null
          workspace_id?: string | null
        }
        Update: {
          avg_visit_duration?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          dominio?: string
          fonte_dados?: string
          id?: string
          import_batch_id?: string | null
          oferta_id?: string | null
          pages_per_visit?: number | null
          pageviews?: number | null
          pais_principal?: string | null
          pct_direct?: number | null
          pct_display?: number | null
          pct_email?: number | null
          pct_paid?: number | null
          pct_pais_principal?: number | null
          pct_referral?: number | null
          pct_search?: number | null
          pct_social?: number | null
          periodo_data?: string
          periodo_tipo?: string
          visitas?: number | null
          visitas_unicas?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trafego_historico_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trafego_historico_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          owner_id: string
          settings: Json | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          owner_id: string
          settings?: Json | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          owner_id?: string
          settings?: Json | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_oferta_workspace_member: {
        Args: { _oferta_id: string; _user_id: string }
        Returns: boolean
      }
      is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
