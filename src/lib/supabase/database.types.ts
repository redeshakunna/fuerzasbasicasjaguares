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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      academias: {
        Row: {
          created_at: string
          id: string
          name: string
          report_cadence: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          report_cadence?: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          report_cadence?: string
          slug?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          academia_id: string | null
          id: string
          match_id: string | null
          player_id: string
          recorded_at: string
          status: Database["public"]["Enums"]["attendance_status"]
          temporada_id: string | null
          training_id: string | null
        }
        Insert: {
          academia_id?: string | null
          id?: string
          match_id?: string | null
          player_id: string
          recorded_at?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          temporada_id?: string | null
          training_id?: string | null
        }
        Update: {
          academia_id?: string | null
          id?: string
          match_id?: string | null
          player_id?: string
          recorded_at?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          temporada_id?: string | null
          training_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_temporada_id_fkey"
            columns: ["temporada_id"]
            isOneToOne: false
            referencedRelation: "temporadas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_closures: {
        Row: {
          academia_id: string | null
          closed_at: string
          closed_by: string | null
          id: string
          match_id: string | null
          note: string | null
          reason: string
          training_id: string | null
        }
        Insert: {
          academia_id?: string | null
          closed_at?: string
          closed_by?: string | null
          id?: string
          match_id?: string | null
          note?: string | null
          reason?: string
          training_id?: string | null
        }
        Update: {
          academia_id?: string | null
          closed_at?: string
          closed_by?: string | null
          id?: string
          match_id?: string | null
          note?: string | null
          reason?: string
          training_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_closures_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_closures_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_closures_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_closures_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      category_photos: {
        Row: {
          category: string
          photo_url: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          photo_url: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          photo_url?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "category_photos_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_items: {
        Row: {
          created_at: string
          evaluation_id: string
          id: string
          score: number
          skill_id: string
        }
        Insert: {
          created_at?: string
          evaluation_id: string
          id?: string
          score: number
          skill_id: string
        }
        Update: {
          created_at?: string
          evaluation_id?: string
          id?: string
          score?: number
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_items_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          academia_id: string | null
          attitude_score: number | null
          created_at: string
          discipline_score: number | null
          evaluation_date: string
          evaluator_id: string | null
          id: string
          is_standout: boolean
          match_id: string | null
          mental_score: number | null
          notes: string | null
          overall_score: number | null
          physical_score: number | null
          player_id: string
          status: Database["public"]["Enums"]["evaluation_status"]
          tactical_score: number | null
          technical_score: number | null
          temporada_id: string | null
          training_id: string | null
        }
        Insert: {
          academia_id?: string | null
          attitude_score?: number | null
          created_at?: string
          discipline_score?: number | null
          evaluation_date?: string
          evaluator_id?: string | null
          id?: string
          is_standout?: boolean
          match_id?: string | null
          mental_score?: number | null
          notes?: string | null
          overall_score?: number | null
          physical_score?: number | null
          player_id: string
          status?: Database["public"]["Enums"]["evaluation_status"]
          tactical_score?: number | null
          technical_score?: number | null
          temporada_id?: string | null
          training_id?: string | null
        }
        Update: {
          academia_id?: string | null
          attitude_score?: number | null
          created_at?: string
          discipline_score?: number | null
          evaluation_date?: string
          evaluator_id?: string | null
          id?: string
          is_standout?: boolean
          match_id?: string | null
          mental_score?: number | null
          notes?: string | null
          overall_score?: number | null
          physical_score?: number | null
          player_id?: string
          status?: Database["public"]["Enums"]["evaluation_status"]
          tactical_score?: number | null
          technical_score?: number | null
          temporada_id?: string | null
          training_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_temporada_id_fkey"
            columns: ["temporada_id"]
            isOneToOne: false
            referencedRelation: "temporadas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      group_reports: {
        Row: {
          academia_id: string | null
          attendance_pct: number | null
          attitude_score: number | null
          average_score: number | null
          category: string
          comments: string | null
          created_at: string
          id: string
          period: string
          physical_score: number | null
          player_count: number
          reviewed_by: string | null
          send_date: string | null
          sent_at: string | null
          sent_by: string | null
          source: string
          standout_players: string | null
          status: string
          summary: string
          tactical_score: number | null
          technical_score: number | null
          temporada_id: string | null
          updated_at: string
        }
        Insert: {
          academia_id?: string | null
          attendance_pct?: number | null
          attitude_score?: number | null
          average_score?: number | null
          category: string
          comments?: string | null
          created_at?: string
          id?: string
          period: string
          physical_score?: number | null
          player_count?: number
          reviewed_by?: string | null
          send_date?: string | null
          sent_at?: string | null
          sent_by?: string | null
          source?: string
          standout_players?: string | null
          status?: string
          summary: string
          tactical_score?: number | null
          technical_score?: number | null
          temporada_id?: string | null
          updated_at?: string
        }
        Update: {
          academia_id?: string | null
          attendance_pct?: number | null
          attitude_score?: number | null
          average_score?: number | null
          category?: string
          comments?: string | null
          created_at?: string
          id?: string
          period?: string
          physical_score?: number | null
          player_count?: number
          reviewed_by?: string | null
          send_date?: string | null
          sent_at?: string | null
          sent_by?: string | null
          source?: string
          standout_players?: string | null
          status?: string
          summary?: string
          tactical_score?: number | null
          technical_score?: number | null
          temporada_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_reports_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_reports_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_reports_temporada_id_fkey"
            columns: ["temporada_id"]
            isOneToOne: false
            referencedRelation: "temporadas"
            referencedColumns: ["id"]
          },
        ]
      }
      match_callups: {
        Row: {
          call_status: Database["public"]["Enums"]["call_status"]
          created_at: string
          entered_minute: number | null
          goals: number
          id: string
          match_id: string
          minutes_played: number | null
          notes: string | null
          player_id: string
          red_card: boolean
          updated_at: string
          yellow_cards: number
        }
        Insert: {
          call_status?: Database["public"]["Enums"]["call_status"]
          created_at?: string
          entered_minute?: number | null
          goals?: number
          id?: string
          match_id: string
          minutes_played?: number | null
          notes?: string | null
          player_id: string
          red_card?: boolean
          updated_at?: string
          yellow_cards?: number
        }
        Update: {
          call_status?: Database["public"]["Enums"]["call_status"]
          created_at?: string
          entered_minute?: number | null
          goals?: number
          id?: string
          match_id?: string
          minutes_played?: number | null
          notes?: string | null
          player_id?: string
          red_card?: boolean
          updated_at?: string
          yellow_cards?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_callups_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_callups_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      match_rsvp: {
        Row: {
          academia_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          match_id: string | null
          player_id: string
          reason: string | null
          responded_at: string | null
          response: string | null
          token: string
          training_id: string | null
        }
        Insert: {
          academia_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          match_id?: string | null
          player_id: string
          reason?: string | null
          responded_at?: string | null
          response?: string | null
          token?: string
          training_id?: string | null
        }
        Update: {
          academia_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          match_id?: string | null
          player_id?: string
          reason?: string | null
          responded_at?: string | null
          response?: string | null
          token?: string
          training_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_rsvp_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_rsvp_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_rsvp_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_rsvp_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          academia_id: string | null
          callup_sent_at: string | null
          callup_sent_by: string | null
          category: string
          competition: string | null
          created_at: string
          id: string
          is_home: boolean
          location: string | null
          match_date: string
          match_time: string | null
          opponent: string
          opponent_score: number | null
          our_score: number | null
          result: string | null
          status: Database["public"]["Enums"]["match_status"]
          temporada_id: string | null
        }
        Insert: {
          academia_id?: string | null
          callup_sent_at?: string | null
          callup_sent_by?: string | null
          category?: string
          competition?: string | null
          created_at?: string
          id?: string
          is_home?: boolean
          location?: string | null
          match_date: string
          match_time?: string | null
          opponent: string
          opponent_score?: number | null
          our_score?: number | null
          result?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          temporada_id?: string | null
        }
        Update: {
          academia_id?: string | null
          callup_sent_at?: string | null
          callup_sent_by?: string | null
          category?: string
          competition?: string | null
          created_at?: string
          id?: string
          is_home?: boolean
          location?: string | null
          match_date?: string
          match_time?: string | null
          opponent?: string
          opponent_score?: number | null
          our_score?: number | null
          result?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          temporada_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_callup_sent_by_fkey"
            columns: ["callup_sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_temporada_id_fkey"
            columns: ["temporada_id"]
            isOneToOne: false
            referencedRelation: "temporadas"
            referencedColumns: ["id"]
          },
        ]
      }
      obligations: {
        Row: {
          academia_id: string
          amount: number
          concept_id: string
          created_at: string
          description: string | null
          due_date: string
          id: string
          issued_date: string
          player_id: string
          reminder_sent_at: string | null
          status: string
          temporada_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          academia_id: string
          amount: number
          concept_id: string
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          issued_date?: string
          player_id: string
          reminder_sent_at?: string | null
          status?: string
          temporada_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          academia_id?: string
          amount?: number
          concept_id?: string
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          issued_date?: string
          player_id?: string
          reminder_sent_at?: string | null
          status?: string
          temporada_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "obligations_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obligations_concept_id_fkey"
            columns: ["concept_id"]
            isOneToOne: false
            referencedRelation: "payment_concepts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obligations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "obligations_temporada_id_fkey"
            columns: ["temporada_id"]
            isOneToOne: false
            referencedRelation: "temporadas"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_concepts: {
        Row: {
          academia_id: string
          created_at: string
          description: string | null
          id: string
          is_recurring: boolean
          name: string
          status: string
          suggested_amount: number
        }
        Insert: {
          academia_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_recurring?: boolean
          name: string
          status?: string
          suggested_amount?: number
        }
        Update: {
          academia_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_recurring?: boolean
          name?: string
          status?: string
          suggested_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_concepts_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          obligation_id: string
          paid_at: string
          receipt_number: string | null
          registered_by: string | null
          type: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: string
          obligation_id: string
          paid_at?: string
          receipt_number?: string | null
          registered_by?: string | null
          type?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          obligation_id?: string
          paid_at?: string
          receipt_number?: string | null
          registered_by?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_obligation_id_fkey"
            columns: ["obligation_id"]
            isOneToOne: false
            referencedRelation: "obligations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_registered_by_fkey"
            columns: ["registered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_documents: {
        Row: {
          academia_id: string | null
          category: string
          created_at: string
          file_name: string
          file_path: string
          file_type: string
          id: string
          player_id: string
          size_bytes: number | null
          uploaded_by: string | null
        }
        Insert: {
          academia_id?: string | null
          category?: string
          created_at?: string
          file_name: string
          file_path: string
          file_type: string
          id?: string
          player_id: string
          size_bytes?: number | null
          uploaded_by?: string | null
        }
        Update: {
          academia_id?: string | null
          category?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          player_id?: string
          size_bytes?: number | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_documents_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_documents_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_reports: {
        Row: {
          academia_id: string | null
          attendance_pct: number | null
          attitude_notes: string | null
          attitude_score: number | null
          average_score: number | null
          comments: string | null
          created_at: string
          id: string
          period: string
          physical_notes: string | null
          physical_score: number | null
          player_id: string
          previous_tasks: string | null
          recommendation_note: string | null
          recommended_category: string | null
          recommended_group: string | null
          reviewed_by: string | null
          send_date: string | null
          sent_at: string | null
          sent_by: string | null
          source: string
          status: string
          summary: string
          tactical_notes: string | null
          tactical_score: number | null
          tasks: string | null
          technical_notes: string | null
          technical_score: number | null
          temporada_id: string | null
          updated_at: string
        }
        Insert: {
          academia_id?: string | null
          attendance_pct?: number | null
          attitude_notes?: string | null
          attitude_score?: number | null
          average_score?: number | null
          comments?: string | null
          created_at?: string
          id?: string
          period: string
          physical_notes?: string | null
          physical_score?: number | null
          player_id: string
          previous_tasks?: string | null
          recommendation_note?: string | null
          recommended_category?: string | null
          recommended_group?: string | null
          reviewed_by?: string | null
          send_date?: string | null
          sent_at?: string | null
          sent_by?: string | null
          source?: string
          status?: string
          summary: string
          tactical_notes?: string | null
          tactical_score?: number | null
          tasks?: string | null
          technical_notes?: string | null
          technical_score?: number | null
          temporada_id?: string | null
          updated_at?: string
        }
        Update: {
          academia_id?: string | null
          attendance_pct?: number | null
          attitude_notes?: string | null
          attitude_score?: number | null
          average_score?: number | null
          comments?: string | null
          created_at?: string
          id?: string
          period?: string
          physical_notes?: string | null
          physical_score?: number | null
          player_id?: string
          previous_tasks?: string | null
          recommendation_note?: string | null
          recommended_category?: string | null
          recommended_group?: string | null
          reviewed_by?: string | null
          send_date?: string | null
          sent_at?: string | null
          sent_by?: string | null
          source?: string
          status?: string
          summary?: string
          tactical_notes?: string | null
          tactical_score?: number | null
          tasks?: string | null
          technical_notes?: string | null
          technical_score?: number | null
          temporada_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_reports_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_reports_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_reports_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_reports_temporada_id_fkey"
            columns: ["temporada_id"]
            isOneToOne: false
            referencedRelation: "temporadas"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          academia_id: string | null
          address: string | null
          allergies: string | null
          birth_date: string
          birth_place: string | null
          blood_type: string | null
          category: string
          created_at: string
          document_number: string | null
          document_type: string | null
          documents_status: Database["public"]["Enums"]["document_status"]
          dominant_foot: Database["public"]["Enums"]["dominant_foot"] | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          eps_name: string | null
          first_name: string
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          guardian_relationship: string | null
          height_cm: number | null
          id: string
          image_authorization: boolean
          jersey_number: number | null
          joined_at: string
          last_name: string
          last_training_at: string | null
          medical_authorization: boolean
          medical_conditions: string | null
          nickname: string | null
          notes: string | null
          performance_group: string | null
          phone: string | null
          photo_url: string | null
          position: string
          position_group: Database["public"]["Enums"]["position_group"]
          previous_club: string | null
          promotion_ready: boolean
          rating: number | null
          residence_place: string | null
          school_grade: string | null
          school_name: string | null
          status: Database["public"]["Enums"]["player_status"]
          updated_at: string
          weight_kg: number | null
          years_playing: number | null
        }
        Insert: {
          academia_id?: string | null
          address?: string | null
          allergies?: string | null
          birth_date: string
          birth_place?: string | null
          blood_type?: string | null
          category?: string
          created_at?: string
          document_number?: string | null
          document_type?: string | null
          documents_status?: Database["public"]["Enums"]["document_status"]
          dominant_foot?: Database["public"]["Enums"]["dominant_foot"] | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          eps_name?: string | null
          first_name: string
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relationship?: string | null
          height_cm?: number | null
          id?: string
          image_authorization?: boolean
          jersey_number?: number | null
          joined_at?: string
          last_name: string
          last_training_at?: string | null
          medical_authorization?: boolean
          medical_conditions?: string | null
          nickname?: string | null
          notes?: string | null
          performance_group?: string | null
          phone?: string | null
          photo_url?: string | null
          position: string
          position_group: Database["public"]["Enums"]["position_group"]
          previous_club?: string | null
          promotion_ready?: boolean
          rating?: number | null
          residence_place?: string | null
          school_grade?: string | null
          school_name?: string | null
          status?: Database["public"]["Enums"]["player_status"]
          updated_at?: string
          weight_kg?: number | null
          years_playing?: number | null
        }
        Update: {
          academia_id?: string | null
          address?: string | null
          allergies?: string | null
          birth_date?: string
          birth_place?: string | null
          blood_type?: string | null
          category?: string
          created_at?: string
          document_number?: string | null
          document_type?: string | null
          documents_status?: Database["public"]["Enums"]["document_status"]
          dominant_foot?: Database["public"]["Enums"]["dominant_foot"] | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          eps_name?: string | null
          first_name?: string
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relationship?: string | null
          height_cm?: number | null
          id?: string
          image_authorization?: boolean
          jersey_number?: number | null
          joined_at?: string
          last_name?: string
          last_training_at?: string | null
          medical_authorization?: boolean
          medical_conditions?: string | null
          nickname?: string | null
          notes?: string | null
          performance_group?: string | null
          phone?: string | null
          photo_url?: string | null
          position?: string
          position_group?: Database["public"]["Enums"]["position_group"]
          previous_club?: string | null
          promotion_ready?: boolean
          rating?: number | null
          residence_place?: string | null
          school_grade?: string | null
          school_name?: string | null
          status?: Database["public"]["Enums"]["player_status"]
          updated_at?: string
          weight_kg?: number | null
          years_playing?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          academia_id: string | null
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          onboarded_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          academia_id?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          onboarded_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          academia_id?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          onboarded_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
        ]
      }
      temporadas: {
        Row: {
          academia_id: string
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          name: string
          start_date: string
        }
        Insert: {
          academia_id: string
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          name: string
          start_date: string
        }
        Update: {
          academia_id?: string
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "temporadas_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
        ]
      }
      training_templates: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          intensity: Database["public"]["Enums"]["training_intensity"]
          materials: string[]
          objective: string
          players_count: number | null
          special_conditions: string[]
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          intensity?: Database["public"]["Enums"]["training_intensity"]
          materials?: string[]
          objective: string
          players_count?: number | null
          special_conditions?: string[]
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          intensity?: Database["public"]["Enums"]["training_intensity"]
          materials?: string[]
          objective?: string
          players_count?: number | null
          special_conditions?: string[]
          title?: string
        }
        Relationships: []
      }
      trainings: {
        Row: {
          academia_id: string | null
          category: string
          coach_id: string | null
          created_at: string
          creation_mode: Database["public"]["Enums"]["training_creation_mode"]
          end_time: string | null
          id: string
          intensity: Database["public"]["Enums"]["training_intensity"] | null
          location: string | null
          materials: string[]
          notes: string | null
          objective: string | null
          players_count: number | null
          responsible_role: string | null
          session: Json | null
          session_date: string
          special_conditions: string[]
          start_time: string
          temporada_id: string | null
          title: string
        }
        Insert: {
          academia_id?: string | null
          category?: string
          coach_id?: string | null
          created_at?: string
          creation_mode?: Database["public"]["Enums"]["training_creation_mode"]
          end_time?: string | null
          id?: string
          intensity?: Database["public"]["Enums"]["training_intensity"] | null
          location?: string | null
          materials?: string[]
          notes?: string | null
          objective?: string | null
          players_count?: number | null
          responsible_role?: string | null
          session?: Json | null
          session_date: string
          special_conditions?: string[]
          start_time: string
          temporada_id?: string | null
          title: string
        }
        Update: {
          academia_id?: string | null
          category?: string
          coach_id?: string | null
          created_at?: string
          creation_mode?: Database["public"]["Enums"]["training_creation_mode"]
          end_time?: string | null
          id?: string
          intensity?: Database["public"]["Enums"]["training_intensity"] | null
          location?: string | null
          materials?: string[]
          notes?: string | null
          objective?: string | null
          players_count?: number | null
          responsible_role?: string | null
          session?: Json | null
          session_date?: string
          special_conditions?: string[]
          start_time?: string
          temporada_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainings_academia_id_fkey"
            columns: ["academia_id"]
            isOneToOne: false
            referencedRelation: "academias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainings_temporada_id_fkey"
            columns: ["temporada_id"]
            isOneToOne: false
            referencedRelation: "temporadas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_home_stats: {
        Args: never
        Returns: {
          cuerpo_tecnico: number
          entrenamientos_recientes: number
          jugadores_activos: number
          partidos_programados: number
        }[]
      }
      get_public_jugadores_stats: {
        Args: never
        Returns: {
          asistencia_promedio_pct: number
          entrenamientos_recientes: number
          jugadores_activos: number
          partidos_programados: number
        }[]
      }
      get_public_next_match: {
        Args: never
        Returns: {
          is_home: boolean
          location: string
          match_date: string
          match_time: string
          opponent: string
        }[]
      }
      get_public_roster: {
        Args: never
        Returns: {
          category: string
          jersey_number: number
          position: string
          position_group: Database["public"]["Enums"]["position_group"]
        }[]
      }
      rsvp_lookup: {
        Args: { p_token: string }
        Returns: {
          activity_date: string
          activity_kind: string
          activity_location: string
          activity_time: string
          activity_title: string
          current_reason: string
          current_response: string
          is_expired: boolean
          player_first_name: string
          player_nickname: string
          player_photo_url: string
        }[]
      }
      rsvp_match_roster: {
        Args: { p_match_id: string }
        Returns: {
          activity_date: string
          activity_location: string
          activity_time: string
          activity_title: string
          is_expired: boolean
          player_first_name: string
          player_id: string
          player_nickname: string
          player_photo_url: string
          reason: string
          response: string
        }[]
      }
      rsvp_respond: {
        Args: { p_reason?: string; p_response: string; p_token: string }
        Returns: boolean
      }
      rsvp_respond_by_match: {
        Args: {
          p_match_id: string
          p_player_id: string
          p_reason?: string
          p_response: string
        }
        Returns: boolean
      }
      set_player_performance_group: {
        Args: { p_group: string; p_player_id: string }
        Returns: undefined
      }
    }
    Enums: {
      attendance_status: "Presente" | "Ausente" | "Justificado" | "Tarde"
      call_status:
        | "Pendiente"
        | "Confirmado"
        | "No asistirá"
        | "Lesionado"
        | "Suspendido"
      document_status: "Completo" | "Pendiente"
      dominant_foot: "Derecho" | "Izquierdo" | "Ambidiestro"
      evaluation_status: "Pendiente" | "Completada"
      match_status: "Confirmado" | "Por confirmar"
      player_status: "Disponible" | "Suspendido" | "Lesionado"
      position_group:
        | "Arquero"
        | "Defensa"
        | "Volante"
        | "Extremo"
        | "Delantero"
      training_creation_mode: "ia" | "plantilla" | "manual"
      training_intensity: "Baja" | "Media" | "Alta"
      user_role: "entrenador" | "coordinador" | "directivo" | "padre" | "admin"
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
      attendance_status: ["Presente", "Ausente", "Justificado", "Tarde"],
      call_status: [
        "Pendiente",
        "Confirmado",
        "No asistirá",
        "Lesionado",
        "Suspendido",
      ],
      document_status: ["Completo", "Pendiente"],
      dominant_foot: ["Derecho", "Izquierdo", "Ambidiestro"],
      evaluation_status: ["Pendiente", "Completada"],
      match_status: ["Confirmado", "Por confirmar"],
      player_status: ["Disponible", "Suspendido", "Lesionado"],
      position_group: ["Arquero", "Defensa", "Volante", "Extremo", "Delantero"],
      training_creation_mode: ["ia", "plantilla", "manual"],
      training_intensity: ["Baja", "Media", "Alta"],
      user_role: ["entrenador", "coordinador", "directivo", "padre", "admin"],
    },
  },
} as const
