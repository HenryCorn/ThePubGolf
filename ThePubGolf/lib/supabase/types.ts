export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: { id: string; name: string; captain_id: string | null; created_at: string }
        Insert: { id?: string; name: string; captain_id?: string | null; created_at?: string }
        Update: { id?: string; name?: string; captain_id?: string | null; created_at?: string }
        Relationships: []
      }
      players: {
        Row: { id: string; name: string; emoji: string; team_id: string | null; is_admin: boolean; created_at: string }
        Insert: { id?: string; name: string; emoji: string; team_id?: string | null; is_admin?: boolean; created_at?: string }
        Update: { id?: string; name?: string; emoji?: string; team_id?: string | null; is_admin?: boolean; created_at?: string }
        Relationships: []
      }
      stops: {
        Row: { id: string; position: number; pub_name: string; location: string; lat: number | null; lng: number | null; drink: string; mini_game: string; is_web_game: boolean; game_enabled: boolean; created_at: string }
        Insert: { id?: string; position: number; pub_name: string; location: string; lat?: number | null; lng?: number | null; drink: string; mini_game: string; is_web_game?: boolean; game_enabled?: boolean; created_at?: string }
        Update: { id?: string; position?: number; pub_name?: string; location?: string; lat?: number | null; lng?: number | null; drink?: string; mini_game?: string; is_web_game?: boolean; game_enabled?: boolean; created_at?: string }
        Relationships: []
      }
      scores: {
        Row: { id: string; team_id: string; stop_id: string; sips: number; penalties: number; penalty_reason: string | null; updated_at: string }
        Insert: { id?: string; team_id: string; stop_id: string; sips: number; penalties?: number; penalty_reason?: string | null; updated_at?: string }
        Update: { id?: string; team_id?: string; stop_id?: string; sips?: number; penalties?: number; penalty_reason?: string | null; updated_at?: string }
        Relationships: []
      }
      minigame_results: {
        Row: { id: string; player_id: string; stop_id: string; round_times_ms: number[]; avg_ms: number; created_at: string }
        Insert: { id?: string; player_id: string; stop_id: string; round_times_ms: number[]; avg_ms: number; created_at?: string }
        Update: { id?: string; player_id?: string; stop_id?: string; round_times_ms?: number[]; avg_ms?: number; created_at?: string }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Team = Database['public']['Tables']['teams']['Row']
export type Player = Database['public']['Tables']['players']['Row']
export type Stop = Database['public']['Tables']['stops']['Row']
export type Score = Database['public']['Tables']['scores']['Row']
export type MinigameResult = Database['public']['Tables']['minigame_results']['Row']

export type TeamWithPlayers = Team & { players: Player[] }

export type LeaderboardEntry = {
  team: Team
  players: Player[]
  totalSips: number
  totalPenalties: number
  totalScore: number
  scores: { team_id: string; stop_id: string; sips: number; penalties: number }[]
}
