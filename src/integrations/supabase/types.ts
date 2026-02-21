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
      ad_creatives: {
        Row: {
          ad_library_id_external: string | null
          angulo: string | null
          comments: number | null
          competitor_id: string | null
          copy_body: string | null
          copy_headline: string | null
          created_at: string | null
          cta_text: string | null
          discovery_query: string | null
          discovery_source: string | null
          file_url: string
          first_seen: string
          id: string
          last_seen: string | null
          library_id: string | null
          likes: number | null
          oferta_id: string | null
          platform: string
          shares: number | null
          spied_offer_id: string | null
          status: string | null
          tags: Json | null
          thumbnail_url: string | null
          tipo: string
          workspace_id: string
        }
        Insert: {
          ad_library_id_external?: string | null
          angulo?: string | null
          comments?: number | null
          competitor_id?: string | null
          copy_body?: string | null
          copy_headline?: string | null
          created_at?: string | null
          cta_text?: string | null
          discovery_query?: string | null
          discovery_source?: string | null
          file_url: string
          first_seen: string
          id?: string
          last_seen?: string | null
          library_id?: string | null
          likes?: number | null
          oferta_id?: string | null
          platform: string
          shares?: number | null
          spied_offer_id?: string | null
          status?: string | null
          tags?: Json | null
          thumbnail_url?: string | null
          tipo: string
          workspace_id: string
        }
        Update: {
          ad_library_id_external?: string | null
          angulo?: string | null
          comments?: number | null
          competitor_id?: string | null
          copy_body?: string | null
          copy_headline?: string | null
          created_at?: string | null
          cta_text?: string | null
          discovery_query?: string | null
          discovery_source?: string | null
          file_url?: string
          first_seen?: string
          id?: string
          last_seen?: string | null
          library_id?: string | null
          likes?: number | null
          oferta_id?: string | null
          platform?: string
          shares?: number | null
          spied_offer_id?: string | null
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
            foreignKeyName: "ad_creatives_library_id_fkey"
            columns: ["library_id"]
            isOneToOne: false
            referencedRelation: "offer_ad_libraries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_creatives_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_creatives_spied_offer_id_fkey"
            columns: ["spied_offer_id"]
            isOneToOne: false
            referencedRelation: "spied_offers"
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
      comparacao_batches: {
        Row: {
          data_criacao: string | null
          dominios: string[]
          id: string
          nome: string | null
          notas: string | null
          workspace_id: string | null
        }
        Insert: {
          data_criacao?: string | null
          dominios: string[]
          id?: string
          nome?: string | null
          notas?: string | null
          workspace_id?: string | null
        }
        Update: {
          data_criacao?: string | null
          dominios?: string[]
          id?: string
          nome?: string | null
          notas?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comparacao_batches_workspace_id_fkey"
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
          config: Json | null
          contexto: Json | null
          created_at: string | null
          dominios_novos: number | null
          erro_mensagem: string | null
          erro_msg: string | null
          id: string
          linhas_erro: number | null
          linhas_ignoradas: number | null
          linhas_importadas: number | null
          linhas_processadas: number | null
          ofertas_atualizadas: number | null
          ofertas_criadas: number | null
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
          config?: Json | null
          contexto?: Json | null
          created_at?: string | null
          dominios_novos?: number | null
          erro_mensagem?: string | null
          erro_msg?: string | null
          id?: string
          linhas_erro?: number | null
          linhas_ignoradas?: number | null
          linhas_importadas?: number | null
          linhas_processadas?: number | null
          ofertas_atualizadas?: number | null
          ofertas_criadas?: number | null
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
          config?: Json | null
          contexto?: Json | null
          created_at?: string | null
          dominios_novos?: number | null
          erro_mensagem?: string | null
          erro_msg?: string | null
          id?: string
          linhas_erro?: number | null
          linhas_ignoradas?: number | null
          linhas_importadas?: number | null
          linhas_processadas?: number | null
          ofertas_atualizadas?: number | null
          ofertas_criadas?: number | null
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
      ofertas: {
        Row: {
          aov_target: number | null
          checkout_provider: string | null
          cpa_target: number | null
          created_at: string | null
          data_lancamento: string | null
          dominio_principal: string | null
          escalada: boolean | null
          fb_pages: Json | null
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
          reclame_aqui_termo: string | null
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
          urls_sites: Json | null
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
          escalada?: boolean | null
          fb_pages?: Json | null
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
          reclame_aqui_termo?: string | null
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
          urls_sites?: Json | null
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
          escalada?: boolean | null
          fb_pages?: Json | null
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
          reclame_aqui_termo?: string | null
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
          urls_sites?: Json | null
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
      offer_ad_libraries: {
        Row: {
          ad_count: number | null
          created_at: string | null
          discovered_at: string | null
          id: string
          is_scaled: boolean | null
          library_url: string | null
          notas: string | null
          page_id: string | null
          page_name: string | null
          page_url: string | null
          platform: string
          sites_found: Json | null
          spied_offer_id: string
          workspace_id: string
        }
        Insert: {
          ad_count?: number | null
          created_at?: string | null
          discovered_at?: string | null
          id?: string
          is_scaled?: boolean | null
          library_url?: string | null
          notas?: string | null
          page_id?: string | null
          page_name?: string | null
          page_url?: string | null
          platform?: string
          sites_found?: Json | null
          spied_offer_id: string
          workspace_id: string
        }
        Update: {
          ad_count?: number | null
          created_at?: string | null
          discovered_at?: string | null
          id?: string
          is_scaled?: boolean | null
          library_url?: string | null
          notas?: string | null
          page_id?: string | null
          page_name?: string | null
          page_url?: string | null
          platform?: string
          sites_found?: Json | null
          spied_offer_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_ad_libraries_spied_offer_id_fkey"
            columns: ["spied_offer_id"]
            isOneToOne: false
            referencedRelation: "spied_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_ad_libraries_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_domains: {
        Row: {
          created_at: string | null
          discovery_query: string | null
          discovery_source: string | null
          domain: string
          domain_type: string | null
          first_seen: string | null
          hosting_provider: string | null
          id: string
          ip_address: string | null
          is_main: boolean | null
          notas: string | null
          spied_offer_id: string
          tech_stack: Json | null
          traffic_share: number | null
          url: string | null
          whois_expiry: string | null
          whois_registrar: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string | null
          discovery_query?: string | null
          discovery_source?: string | null
          domain: string
          domain_type?: string | null
          first_seen?: string | null
          hosting_provider?: string | null
          id?: string
          ip_address?: string | null
          is_main?: boolean | null
          notas?: string | null
          spied_offer_id: string
          tech_stack?: Json | null
          traffic_share?: number | null
          url?: string | null
          whois_expiry?: string | null
          whois_registrar?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string | null
          discovery_query?: string | null
          discovery_source?: string | null
          domain?: string
          domain_type?: string | null
          first_seen?: string | null
          hosting_provider?: string | null
          id?: string
          ip_address?: string | null
          is_main?: boolean | null
          notas?: string | null
          spied_offer_id?: string
          tech_stack?: Json | null
          traffic_share?: number | null
          url?: string | null
          whois_expiry?: string | null
          whois_registrar?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_domains_spied_offer_id_fkey"
            columns: ["spied_offer_id"]
            isOneToOne: false
            referencedRelation: "spied_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_domains_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_funnel_steps: {
        Row: {
          cloaker_type: string | null
          created_at: string | null
          currency: string | null
          domain_id: string | null
          html_source: string | null
          id: string
          is_cloaker: boolean | null
          notas: string | null
          page_title: string | null
          page_url: string | null
          price: number | null
          product_name: string | null
          product_promise: string | null
          screenshot_url: string | null
          spied_offer_id: string
          step_order: number
          step_type: string
          workspace_id: string
        }
        Insert: {
          cloaker_type?: string | null
          created_at?: string | null
          currency?: string | null
          domain_id?: string | null
          html_source?: string | null
          id?: string
          is_cloaker?: boolean | null
          notas?: string | null
          page_title?: string | null
          page_url?: string | null
          price?: number | null
          product_name?: string | null
          product_promise?: string | null
          screenshot_url?: string | null
          spied_offer_id: string
          step_order: number
          step_type: string
          workspace_id: string
        }
        Update: {
          cloaker_type?: string | null
          created_at?: string | null
          currency?: string | null
          domain_id?: string | null
          html_source?: string | null
          id?: string
          is_cloaker?: boolean | null
          notas?: string | null
          page_title?: string | null
          page_url?: string | null
          price?: number | null
          product_name?: string | null
          product_promise?: string | null
          screenshot_url?: string | null
          spied_offer_id?: string
          step_order?: number
          step_type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_funnel_steps_domain_id_fkey"
            columns: ["domain_id"]
            isOneToOne: false
            referencedRelation: "offer_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_funnel_steps_spied_offer_id_fkey"
            columns: ["spied_offer_id"]
            isOneToOne: false
            referencedRelation: "spied_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_funnel_steps_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_traffic_data: {
        Row: {
          avg_visit_duration: number | null
          bounce_rate: number | null
          created_at: string | null
          domain: string
          id: string
          pages_per_visit: number | null
          period_date: string
          period_type: string | null
          source: string | null
          spied_offer_id: string
          unique_visitors: number | null
          visits: number | null
          workspace_id: string
        }
        Insert: {
          avg_visit_duration?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          domain: string
          id?: string
          pages_per_visit?: number | null
          period_date: string
          period_type?: string | null
          source?: string | null
          spied_offer_id: string
          unique_visitors?: number | null
          visits?: number | null
          workspace_id: string
        }
        Update: {
          avg_visit_duration?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          domain?: string
          id?: string
          pages_per_visit?: number | null
          period_date?: string
          period_type?: string | null
          source?: string | null
          spied_offer_id?: string
          unique_visitors?: number | null
          visits?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_traffic_data_spied_offer_id_fkey"
            columns: ["spied_offer_id"]
            isOneToOne: false
            referencedRelation: "spied_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_traffic_data_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
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
      spied_offers: {
        Row: {
          checkout_provider: string | null
          checkout_url: string | null
          created_at: string | null
          discovered_at: string | null
          discovery_query: string | null
          discovery_source: string | null
          discovery_tool_detail: string | null
          domain_created_at: string | null
          estimated_monthly_revenue: number | null
          estimated_monthly_traffic: number | null
          geo: string | null
          id: string
          main_domain: string | null
          nome: string
          notas: string | null
          oferta_id: string | null
          operator_name: string | null
          operator_network: string | null
          priority: number | null
          product_currency: string | null
          product_name: string | null
          product_promise: string | null
          product_ticket: number | null
          status: string | null
          subnicho: string | null
          traffic_trend: string | null
          updated_at: string | null
          vertical: string | null
          vsl_duration: string | null
          vsl_player: string | null
          vsl_url: string | null
          workspace_id: string
          screenshot_url: string | null
        }
        Insert: {
          checkout_provider?: string | null
          checkout_url?: string | null
          created_at?: string | null
          discovered_at?: string | null
          discovery_query?: string | null
          discovery_source?: string | null
          discovery_tool_detail?: string | null
          domain_created_at?: string | null
          estimated_monthly_revenue?: number | null
          estimated_monthly_traffic?: number | null
          geo?: string | null
          id?: string
          main_domain?: string | null
          nome: string
          notas?: string | null
          oferta_id?: string | null
          operator_name?: string | null
          operator_network?: string | null
          priority?: number | null
          product_currency?: string | null
          product_name?: string | null
          product_promise?: string | null
          product_ticket?: number | null
          status?: string | null
          subnicho?: string | null
          traffic_trend?: string | null
          updated_at?: string | null
          vertical?: string | null
          vsl_duration?: string | null
          vsl_player?: string | null
          vsl_url?: string | null
          workspace_id: string
          screenshot_url?: string | null
        }
        Update: {
          checkout_provider?: string | null
          checkout_url?: string | null
          created_at?: string | null
          discovered_at?: string | null
          discovery_query?: string | null
          discovery_source?: string | null
          discovery_tool_detail?: string | null
          domain_created_at?: string | null
          estimated_monthly_revenue?: number | null
          estimated_monthly_traffic?: number | null
          geo?: string | null
          id?: string
          main_domain?: string | null
          nome?: string
          notas?: string | null
          oferta_id?: string | null
          operator_name?: string | null
          operator_network?: string | null
          priority?: number | null
          product_currency?: string | null
          product_name?: string | null
          product_promise?: string | null
          product_ticket?: number | null
          status?: string | null
          subnicho?: string | null
          traffic_trend?: string | null
          updated_at?: string | null
          vertical?: string | null
          vsl_duration?: string | null
          vsl_player?: string | null
          vsl_url?: string | null
          workspace_id?: string
          screenshot_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spied_offers_oferta_id_fkey"
            columns: ["oferta_id"]
            isOneToOne: false
            referencedRelation: "ofertas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spied_offers_workspace_id_fkey"
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
      mv_offer_traffic_summary: {
        Row: {
          spied_offer_id: string
          domain_count: number
          total_visits: number
          latest_period: string | null
          earliest_period: string | null
          latest_sw_visits: number | null
          latest_sr_visits: number | null
          avg_monthly_visits: number | null
        }
      }
      mv_dashboard_stats: {
        Row: {
          workspace_id: string
          total_offers: number
          unique_domains: number
          active_offers: number
          potential_offers: number
          last_updated: string | null
        }
      }
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
