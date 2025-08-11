export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      abuse_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_id: string | null
          status: string
          treat_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_id?: string | null
          status?: string
          treat_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string | null
          status?: string
          treat_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "abuse_reports_treat_id_fkey"
            columns: ["treat_id"]
            isOneToOne: false
            referencedRelation: "public_treats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abuse_reports_treat_id_fkey"
            columns: ["treat_id"]
            isOneToOne: false
            referencedRelation: "treats"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_treats: {
        Row: {
          added_at: string
          collection_id: string
          id: string
          treat_id: string
        }
        Insert: {
          added_at?: string
          collection_id: string
          id?: string
          treat_id: string
        }
        Update: {
          added_at?: string
          collection_id?: string
          id?: string
          treat_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_treats_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "treat_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_treats_treat_id_fkey"
            columns: ["treat_id"]
            isOneToOne: false
            referencedRelation: "public_treats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_treats_treat_id_fkey"
            columns: ["treat_id"]
            isOneToOne: false
            referencedRelation: "treats"
            referencedColumns: ["id"]
          },
        ]
      }
      cover_art_uploads: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          treat_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          treat_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          treat_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_treat_id_fkey"
            columns: ["treat_id"]
            isOneToOne: false
            referencedRelation: "public_treats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_treat_id_fkey"
            columns: ["treat_id"]
            isOneToOne: false
            referencedRelation: "treats"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_suggestions: {
        Row: {
          created_at: string
          id: string
          occasion: string | null
          recipient_context: string | null
          suggested_amount: number | null
          suggested_message: string | null
          treat_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          occasion?: string | null
          recipient_context?: string | null
          suggested_amount?: number | null
          suggested_message?: string | null
          treat_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          occasion?: string | null
          recipient_context?: string | null
          suggested_amount?: number | null
          suggested_message?: string | null
          treat_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      integration_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          platform: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          platform: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          platform?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      popular_templates: {
        Row: {
          cover_art_content: string
          cover_art_type: string
          created_at: string
          font_id: string
          header_text: string
          id: string
          is_featured: boolean
          name: string
          theme: string
          treat_type: string
          usage_count: number
        }
        Insert: {
          cover_art_content: string
          cover_art_type: string
          created_at?: string
          font_id: string
          header_text: string
          id?: string
          is_featured?: boolean
          name: string
          theme: string
          treat_type: string
          usage_count?: number
        }
        Update: {
          cover_art_content?: string
          cover_art_type?: string
          created_at?: string
          font_id?: string
          header_text?: string
          id?: string
          is_featured?: boolean
          name?: string
          theme?: string
          treat_type?: string
          usage_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
          venmo_handle: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
          venmo_handle?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          venmo_handle?: string | null
        }
        Relationships: []
      }
      treat_collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      treat_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          treat_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type: string
          treat_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          treat_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treat_reactions_treat_id_fkey"
            columns: ["treat_id"]
            isOneToOne: false
            referencedRelation: "public_treats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treat_reactions_treat_id_fkey"
            columns: ["treat_id"]
            isOneToOne: false
            referencedRelation: "treats"
            referencedColumns: ["id"]
          },
        ]
      }
      treat_reminders: {
        Row: {
          created_at: string
          id: string
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          treat_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reminder_type: string
          scheduled_for: string
          sent_at?: string | null
          treat_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          treat_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treat_reminders_treat_id_fkey"
            columns: ["treat_id"]
            isOneToOne: false
            referencedRelation: "public_treats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treat_reminders_treat_id_fkey"
            columns: ["treat_id"]
            isOneToOne: false
            referencedRelation: "treats"
            referencedColumns: ["id"]
          },
        ]
      }
      treat_sharing_stats: {
        Row: {
          id: string
          platform: string
          shared_at: string
          treat_id: string
        }
        Insert: {
          id?: string
          platform: string
          shared_at?: string
          treat_id: string
        }
        Update: {
          id?: string
          platform?: string
          shared_at?: string
          treat_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treat_sharing_stats_treat_id_fkey"
            columns: ["treat_id"]
            isOneToOne: false
            referencedRelation: "public_treats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treat_sharing_stats_treat_id_fkey"
            columns: ["treat_id"]
            isOneToOne: false
            referencedRelation: "treats"
            referencedColumns: ["id"]
          },
        ]
      }
      treat_views: {
        Row: {
          id: string
          ip_address: unknown | null
          referrer: string | null
          treat_id: string
          user_agent: string | null
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          referrer?: string | null
          treat_id: string
          user_agent?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          referrer?: string | null
          treat_id?: string
          user_agent?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treat_views_treat_id_fkey"
            columns: ["treat_id"]
            isOneToOne: false
            referencedRelation: "public_treats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treat_views_treat_id_fkey"
            columns: ["treat_id"]
            isOneToOne: false
            referencedRelation: "treats"
            referencedColumns: ["id"]
          },
        ]
      }
      treats: {
        Row: {
          amount: number | null
          background_color: string | null
          cover_art_content: string
          cover_art_type: string
          created_at: string
          expires_at: string | null
          font_id: string
          header_text: string
          id: string
          is_public: boolean
          message: string | null
          recipient_name: string
          sender_name: string
          slug: string
          theme: string
          treat_type: string
          updated_at: string
          user_id: string | null
          venmo_handle: string | null
          voice_memo_url: string | null
        }
        Insert: {
          amount?: number | null
          background_color?: string | null
          cover_art_content?: string
          cover_art_type?: string
          created_at?: string
          expires_at?: string | null
          font_id?: string
          header_text?: string
          id?: string
          is_public?: boolean
          message?: string | null
          recipient_name: string
          sender_name: string
          slug: string
          theme?: string
          treat_type?: string
          updated_at?: string
          user_id?: string | null
          venmo_handle?: string | null
          voice_memo_url?: string | null
        }
        Update: {
          amount?: number | null
          background_color?: string | null
          cover_art_content?: string
          cover_art_type?: string
          created_at?: string
          expires_at?: string | null
          font_id?: string
          header_text?: string
          id?: string
          is_public?: boolean
          message?: string | null
          recipient_name?: string
          sender_name?: string
          slug?: string
          theme?: string
          treat_type?: string
          updated_at?: string
          user_id?: string | null
          venmo_handle?: string | null
          voice_memo_url?: string | null
        }
        Relationships: []
      }
      user_treat_history: {
        Row: {
          action_type: string
          created_at: string
          id: string
          treat_id: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          treat_id: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          treat_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_treat_history_treat_id_fkey"
            columns: ["treat_id"]
            isOneToOne: false
            referencedRelation: "public_treats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_treat_history_treat_id_fkey"
            columns: ["treat_id"]
            isOneToOne: false
            referencedRelation: "treats"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_memo_uploads: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_treats: {
        Row: {
          amount: number | null
          background_color: string | null
          cover_art_content: string | null
          cover_art_type: string | null
          created_at: string | null
          expires_at: string | null
          font_id: string | null
          header_text: string | null
          id: string | null
          is_public: boolean | null
          message: string | null
          recipient_name: string | null
          sender_name: string | null
          slug: string | null
          theme: string | null
          treat_type: string | null
          updated_at: string | null
          voice_memo_url: string | null
        }
        Insert: {
          amount?: number | null
          background_color?: string | null
          cover_art_content?: string | null
          cover_art_type?: string | null
          created_at?: string | null
          expires_at?: string | null
          font_id?: string | null
          header_text?: string | null
          id?: string | null
          is_public?: boolean | null
          message?: string | null
          recipient_name?: string | null
          sender_name?: string | null
          slug?: string | null
          theme?: string | null
          treat_type?: string | null
          updated_at?: string | null
          voice_memo_url?: string | null
        }
        Update: {
          amount?: number | null
          background_color?: string | null
          cover_art_content?: string | null
          cover_art_type?: string | null
          created_at?: string | null
          expires_at?: string | null
          font_id?: string | null
          header_text?: string | null
          id?: string | null
          is_public?: boolean | null
          message?: string | null
          recipient_name?: string | null
          sender_name?: string | null
          slug?: string | null
          theme?: string | null
          treat_type?: string | null
          updated_at?: string | null
          voice_memo_url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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
