export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      books: {
        Row: {
          id: string
          profile_id: string
          title: string
          description: string | null
          cover_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          title: string
          description?: string | null
          cover_data?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          title?: string
          description?: string | null
          cover_data?: any
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      cover_photos: {
        Row: {
          id: string
          profile_id: string
          high_res_url: string
          preview_url: string
          width: number
          height: number
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          high_res_url: string
          preview_url: string
          width: number
          height: number
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          high_res_url?: string
          preview_url?: string
          width?: number
          height?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cover_photos_profile_id_fkey"
            columns: ["profile_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 