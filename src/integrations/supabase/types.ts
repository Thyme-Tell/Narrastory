export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      book_covers: {
        Row: {
          cover_data: Json
          created_at: string
          id: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          cover_data?: Json
          created_at?: string
          id?: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          cover_data?: Json
          created_at?: string
          id?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_covers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      book_purchases: {
        Row: {
          amount_paid: number | null
          book_id: string | null
          created_at: string | null
          id: string
          is_from_credits: boolean | null
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          book_id?: string | null
          created_at?: string | null
          id?: string
          is_from_credits?: boolean | null
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          book_id?: string | null
          created_at?: string | null
          id?: string
          is_from_credits?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_purchases_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "storybooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deleted_stories: {
        Row: {
          content: string
          created_at: string
          deleted_at: string
          id: string
          original_id: string
          profile_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string
          id?: string
          original_id: string
          profile_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string
          id?: string
          original_id?: string
          profile_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deleted_stories_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deleted_stories_profile_id_fkey1"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      encryption_keys: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: number
          key_type: string
          key_value: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: number
          key_type?: string
          key_value: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: number
          key_type?: string
          key_value?: string
        }
        Relationships: []
      }
      memoir_batches: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          open_slots: number
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          open_slots?: number
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          open_slots?: number
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      memoir_signups: {
        Row: {
          batch_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          updated_at?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memoir_signups_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "memoir_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          profile_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          profile_id: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          profile_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_tokens_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          elevenlabs_voice_id: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          password: string
          phone_number: string
          synthflow_voice_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          elevenlabs_voice_id?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          password?: string
          phone_number: string
          synthflow_voice_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          elevenlabs_voice_id?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          password?: string
          phone_number?: string
          synthflow_voice_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          content: string
          created_at: string
          id: string
          profile_id: string
          share_token: string | null
          summary: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          profile_id: string
          share_token?: string | null
          summary?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          profile_id?: string
          share_token?: string | null
          summary?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stories_richard: {
        Row: {
          created_at: string | null
          first_name: string
          id: number
          last_name: string
          media: string | null
          story_content: string
          story_date: string
          story_title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          first_name: string
          id?: number
          last_name: string
          media?: string | null
          story_content: string
          story_date?: string
          story_title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string
          id?: number
          last_name?: string
          media?: string | null
          story_content?: string
          story_date?: string
          story_title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      story_audio: {
        Row: {
          audio_type: string | null
          audio_url: string
          created_at: string
          duration_seconds: number | null
          id: string
          language: string | null
          last_played_at: string | null
          playback_count: number | null
          story_id: string | null
          voice_id: string | null
        }
        Insert: {
          audio_type?: string | null
          audio_url: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          language?: string | null
          last_played_at?: string | null
          playback_count?: number | null
          story_id?: string | null
          voice_id?: string | null
        }
        Update: {
          audio_type?: string | null
          audio_url?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          language?: string | null
          last_played_at?: string | null
          playback_count?: number | null
          story_id?: string | null
          voice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_audio_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_media: {
        Row: {
          caption: string | null
          content_type: string
          created_at: string
          file_name: string
          file_path: string
          id: string
          story_id: string | null
        }
        Insert: {
          caption?: string | null
          content_type: string
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          story_id?: string | null
        }
        Update: {
          caption?: string | null
          content_type?: string
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          story_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_media_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      storybook_members: {
        Row: {
          added_at: string
          added_by: string
          id: string
          profile_id: string
          role: Database["public"]["Enums"]["storybook_role"]
          storybook_id: string
        }
        Insert: {
          added_at?: string
          added_by: string
          id?: string
          profile_id: string
          role: Database["public"]["Enums"]["storybook_role"]
          storybook_id: string
        }
        Update: {
          added_at?: string
          added_by?: string
          id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["storybook_role"]
          storybook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storybook_members_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storybook_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storybook_members_storybook_id_fkey"
            columns: ["storybook_id"]
            isOneToOne: false
            referencedRelation: "storybooks"
            referencedColumns: ["id"]
          },
        ]
      }
      storybook_stories: {
        Row: {
          added_at: string
          added_by: string
          id: string
          story_id: string
          storybook_id: string
        }
        Insert: {
          added_at?: string
          added_by: string
          id?: string
          story_id: string
          storybook_id: string
        }
        Update: {
          added_at?: string
          added_by?: string
          id?: string
          story_id?: string
          storybook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storybook_stories_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storybook_stories_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storybook_stories_storybook_id_fkey"
            columns: ["storybook_id"]
            isOneToOne: false
            referencedRelation: "storybooks"
            referencedColumns: ["id"]
          },
        ]
      }
      storybooks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          book_credits: number | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          is_lifetime: boolean | null
          lifetime_purchase_date: string | null
          minutes_used: number | null
          plan_type: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          book_credits?: number | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          is_lifetime?: boolean | null
          lifetime_purchase_date?: string | null
          minutes_used?: number | null
          plan_type: string
          status: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          book_credits?: number | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          is_lifetime?: boolean | null
          lifetime_purchase_date?: string | null
          minutes_used?: number | null
          plan_type?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          call_duration: number
          call_timestamp: string | null
          id: string
          user_id: string
        }
        Insert: {
          call_duration: number
          call_timestamp?: string | null
          id?: string
          user_id: string
        }
        Update: {
          call_duration?: number
          call_timestamp?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      encrypted_fields_status: {
        Row: {
          column_name: unknown | null
          status: string | null
          table_name: unknown | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_storybook_member: {
        Args: {
          _storybook_id: string
          _email: string
          _role: string
        }
        Returns: boolean
      }
      can_add_storybook_member: {
        Args: {
          _storybook_id: string
          _profile_id: string
          _added_by: string
        }
        Returns: boolean
      }
      can_modify_storybook_members: {
        Args: {
          _storybook_id: string
        }
        Returns: boolean
      }
      can_view_storybook_members: {
        Args: {
          _storybook_id: string
        }
        Returns: boolean
      }
      create_storybook_with_owner: {
        Args: {
          _title: string
          _description: string
          _profile_id: string
        }
        Returns: Json
      }
      decrypt_text: {
        Args: {
          encrypted_text: string
        }
        Returns: string
      }
      encrypt_text: {
        Args: {
          text_to_encrypt: string
        }
        Returns: string
      }
      generate_encryption_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_active_key: {
        Args: {
          key_type?: string
        }
        Returns: string
      }
      get_storybook_member_role: {
        Args: {
          _storybook_id: string
          _profile_id: string
        }
        Returns: string
      }
      get_storybook_members: {
        Args: {
          _storybook_id: string
        }
        Returns: {
          profile_id: string
          role: string
          first_name: string
          last_name: string
          email: string
        }[]
      }
      get_user_storybooks: {
        Args: {
          _profile_id: string
        }
        Returns: {
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
        }[]
      }
      remove_storybook_member: {
        Args: {
          _storybook_id: string
          _profile_id: string
        }
        Returns: boolean
      }
      rotate_encryption_key: {
        Args: {
          key_type?: string
        }
        Returns: boolean
      }
      update_storybook_member_role: {
        Args: {
          _storybook_id: string
          _profile_id: string
          _new_role: string
        }
        Returns: boolean
      }
    }
    Enums: {
      storybook_role: "owner" | "contributor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
