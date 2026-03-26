export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          email: string | null;
          is_guest: boolean;
          league_tier: string;
          points: number;
          emoji: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nickname?: string;
          email?: string | null;
          is_guest?: boolean;
          league_tier?: string;
          points?: number;
          emoji?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nickname?: string;
          email?: string | null;
          is_guest?: boolean;
          league_tier?: string;
          points?: number;
          emoji?: string;
          updated_at?: string;
        };
      };
      word_progress: {
        Row: {
          id: string;
          user_id: string;
          word_id: number;
          status: 'known' | 'unknown';
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          word_id: number;
          status: 'known' | 'unknown';
          updated_at?: string;
        };
        Update: {
          status?: 'known' | 'unknown';
          updated_at?: string;
        };
      };
      daily_missions: {
        Row: {
          id: string;
          user_id: string;
          mission_id: 'm1' | 'm2' | 'm3';
          date: string;
          current: number;
          is_rewarded: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          mission_id: 'm1' | 'm2' | 'm3';
          date?: string;
          current?: number;
          is_rewarded?: boolean;
        };
        Update: {
          current?: number;
          is_rewarded?: boolean;
        };
      };
      attendance: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: {
      league_rankings: {
        Row: {
          id: string;
          nickname: string;
          emoji: string;
          points: number;
          league_tier: string;
          rank: number;
        };
      };
    };
  };
}
