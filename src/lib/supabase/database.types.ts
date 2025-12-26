export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      binder_pages: {
        Row: {
          binder_id: string
          created_at: string | null
          id: string
          page_number: number
        }
        Insert: {
          binder_id: string
          created_at?: string | null
          id?: string
          page_number: number
        }
        Update: {
          binder_id?: string
          created_at?: string | null
          id?: string
          page_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "binder_pages_binder_id_fkey"
            columns: ["binder_id"]
            isOneToOne: false
            referencedRelation: "binders"
            referencedColumns: ["id"]
          },
        ]
      }
      binder_slots: {
        Row: {
          content_type: Database["public"]["Enums"]["slot_content_type"]
          created_at: string | null
          crop_data: Json | null
          custom_image_url: string | null
          id: string
          page_id: string
          position: number
          span_cols: number
          span_rows: number
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          content_type?: Database["public"]["Enums"]["slot_content_type"]
          created_at?: string | null
          crop_data?: Json | null
          custom_image_url?: string | null
          id?: string
          page_id: string
          position: number
          span_cols?: number
          span_rows?: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          content_type?: Database["public"]["Enums"]["slot_content_type"]
          created_at?: string | null
          crop_data?: Json | null
          custom_image_url?: string | null
          id?: string
          page_id?: string
          position?: number
          span_cols?: number
          span_rows?: number
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "binder_slots_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "binder_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "binder_slots_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "card_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      binder_templates: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_premium: boolean
          layout_data: Json
          name: string
          preview_image_url: string | null
          slot_config: Database["public"]["Enums"]["slot_config"]
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_premium?: boolean
          layout_data?: Json
          name: string
          preview_image_url?: string | null
          slot_config?: Database["public"]["Enums"]["slot_config"]
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_premium?: boolean
          layout_data?: Json
          name?: string
          preview_image_url?: string | null
          slot_config?: Database["public"]["Enums"]["slot_config"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "binder_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      binders: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_curated: boolean | null
          is_public: boolean | null
          master_set_id: string | null
          name: string
          slot_config: Database["public"]["Enums"]["slot_config"]
          template_id: string | null
          type: Database["public"]["Enums"]["binder_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_curated?: boolean | null
          is_public?: boolean | null
          master_set_id?: string | null
          name: string
          slot_config?: Database["public"]["Enums"]["slot_config"]
          template_id?: string | null
          type?: Database["public"]["Enums"]["binder_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_curated?: boolean | null
          is_public?: boolean | null
          master_set_id?: string | null
          name?: string
          slot_config?: Database["public"]["Enums"]["slot_config"]
          template_id?: string | null
          type?: Database["public"]["Enums"]["binder_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "binders_master_set_id_fkey"
            columns: ["master_set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "binders_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "binder_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "binders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      card_colors: {
        Row: {
          brightness: number
          card_id: string
          created_at: string | null
          dominant_hex: string
          dominant_hsl: Json
          id: string
          palette: Json
          saturation: number
          warmth: number
        }
        Insert: {
          brightness: number
          card_id: string
          created_at?: string | null
          dominant_hex: string
          dominant_hsl: Json
          id?: string
          palette?: Json
          saturation: number
          warmth: number
        }
        Update: {
          brightness?: number
          card_id?: string
          created_at?: string | null
          dominant_hex?: string
          dominant_hsl?: Json
          id?: string
          palette?: Json
          saturation?: number
          warmth?: number
        }
        Relationships: [
          {
            foreignKeyName: "card_colors_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: true
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_variants: {
        Row: {
          card_id: string
          created_at: string | null
          id: string
          image_url: string | null
          variant_type: Database["public"]["Enums"]["variant_type"]
        }
        Insert: {
          card_id: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          variant_type?: Database["public"]["Enums"]["variant_type"]
        }
        Update: {
          card_id?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          variant_type?: Database["public"]["Enums"]["variant_type"]
        }
        Relationships: [
          {
            foreignKeyName: "card_variants_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          artist: string | null
          created_at: string | null
          generation: number | null
          hp: number | null
          id: string
          image_large: string | null
          image_small: string | null
          is_legendary: boolean | null
          is_mythical: boolean | null
          is_premium: boolean | null
          is_promo: boolean | null
          name: string
          national_dex_numbers: number[] | null
          number: string
          rarity: string | null
          set_id: string
          subtypes: string[] | null
          supertype: string
          types: string[] | null
          updated_at: string | null
        }
        Insert: {
          artist?: string | null
          created_at?: string | null
          generation?: number | null
          hp?: number | null
          id: string
          image_large?: string | null
          image_small?: string | null
          is_legendary?: boolean | null
          is_mythical?: boolean | null
          is_premium?: boolean | null
          is_promo?: boolean | null
          name: string
          national_dex_numbers?: number[] | null
          number: string
          rarity?: string | null
          set_id: string
          subtypes?: string[] | null
          supertype: string
          types?: string[] | null
          updated_at?: string | null
        }
        Update: {
          artist?: string | null
          created_at?: string | null
          generation?: number | null
          hp?: number | null
          id?: string
          image_large?: string | null
          image_small?: string | null
          is_legendary?: boolean | null
          is_mythical?: boolean | null
          is_premium?: boolean | null
          is_promo?: boolean | null
          name?: string
          national_dex_numbers?: number[] | null
          number?: string
          rarity?: string | null
          set_id?: string
          subtypes?: string[] | null
          supertype?: string
          types?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_images: {
        Row: {
          file_size: number
          height: number | null
          id: string
          mime_type: string
          original_filename: string
          storage_path: string
          uploaded_at: string | null
          user_id: string
          width: number | null
        }
        Insert: {
          file_size: number
          height?: number | null
          id?: string
          mime_type?: string
          original_filename: string
          storage_path: string
          uploaded_at?: string | null
          user_id: string
          width?: number | null
        }
        Update: {
          file_size?: number
          height?: number | null
          id?: string
          mime_type?: string
          original_filename?: string
          storage_path?: string
          uploaded_at?: string | null
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_images_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      master_set_preferences: {
        Row: {
          created_at: string | null
          id: string
          include_promos: boolean | null
          include_reverse_holos: boolean | null
          set_id: string
          slot_config: Database["public"]["Enums"]["slot_config"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          include_promos?: boolean | null
          include_reverse_holos?: boolean | null
          set_id: string
          slot_config?: Database["public"]["Enums"]["slot_config"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          include_promos?: boolean | null
          include_reverse_holos?: boolean | null
          set_id?: string
          slot_config?: Database["public"]["Enums"]["slot_config"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_set_preferences_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_set_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sets: {
        Row: {
          created_at: string | null
          era: string
          has_reverse_holos: boolean | null
          id: string
          logo_url: string | null
          name: string
          printed_total: number
          release_date: string | null
          series: string
          symbol_url: string | null
          total: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          era: string
          has_reverse_holos?: boolean | null
          id: string
          logo_url?: string | null
          name: string
          printed_total: number
          release_date?: string | null
          series: string
          symbol_url?: string | null
          total: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          era?: string
          has_reverse_holos?: boolean | null
          id?: string
          logo_url?: string | null
          name?: string
          printed_total?: number
          release_date?: string | null
          series?: string
          symbol_url?: string | null
          total?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_collections: {
        Row: {
          acquired_date: string | null
          condition: string | null
          created_at: string | null
          id: string
          notes: string | null
          quantity: number
          updated_at: string | null
          user_id: string
          variant_id: string
        }
        Insert: {
          acquired_date?: string | null
          condition?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          updated_at?: string | null
          user_id: string
          variant_id: string
        }
        Update: {
          acquired_date?: string | null
          condition?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          updated_at?: string | null
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_collections_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "card_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          chromadex_reset_date: string
          chromadex_uses_this_month: number
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          tier: Database["public"]["Enums"]["user_tier"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          chromadex_reset_date?: string
          chromadex_uses_this_month?: number
          created_at?: string | null
          display_name?: string | null
          email: string
          id: string
          tier?: Database["public"]["Enums"]["user_tier"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          chromadex_reset_date?: string
          chromadex_uses_this_month?: number
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          tier?: Database["public"]["Enums"]["user_tier"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      binder_type: "CUSTOM" | "MASTER_SET" | "CHROMADEX" | "MICHI"
      slot_config: "NINE" | "TWELVE" | "SIXTEEN"
      slot_content_type: "CARD" | "CUSTOM_IMAGE" | "EMPTY" | "MERGED"
      user_tier: "GUEST" | "FREE" | "PRO"
      variant_type:
        | "NORMAL"
        | "REVERSE_HOLO"
        | "FIRST_EDITION"
        | "SHADOWLESS"
        | "UNLIMITED"
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
    Enums: {
      binder_type: ["CUSTOM", "MASTER_SET", "CHROMADEX", "MICHI"],
      slot_config: ["NINE", "TWELVE", "SIXTEEN"],
      slot_content_type: ["CARD", "CUSTOM_IMAGE", "EMPTY", "MERGED"],
      user_tier: ["GUEST", "FREE", "PRO"],
      variant_type: [
        "NORMAL",
        "REVERSE_HOLO",
        "FIRST_EDITION",
        "SHADOWLESS",
        "UNLIMITED",
      ],
    },
  },
} as const
