export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          user_id: string | null
          name: string
          is_predefined: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          is_predefined?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          is_predefined?: boolean
          created_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          name: string
          description: string | null
          frequency: 'daily' | 'weekly'
          archived_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          name: string
          description?: string | null
          frequency: 'daily' | 'weekly'
          archived_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          name?: string
          description?: string | null
          frequency?: 'daily' | 'weekly'
          archived_at?: string | null
          created_at?: string
        }
      }
      habit_days: {
        Row: {
          habit_id: string
          day_of_week: number
        }
        Insert: {
          habit_id: string
          day_of_week: number
        }
        Update: {
          habit_id?: string
          day_of_week?: number
        }
      }
      check_ins: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          checked_date: string
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          checked_date: string
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          checked_date?: string
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
