export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          guest_token: string;
          auth_id: string | null;
          nickname: string;
          email: string | null;
          is_guest: boolean;
          league_tier: string;
          points: number;
          quiz_combo: number;
          emoji: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guest_token?: string;
          auth_id?: string | null;
          nickname?: string;
          email?: string | null;
          is_guest?: boolean;
          league_tier?: string;
          points?: number;
          quiz_combo?: number;
          emoji?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          guest_token?: string;
          auth_id?: string | null;
          nickname?: string;
          email?: string | null;
          is_guest?: boolean;
          league_tier?: string;
          points?: number;
          quiz_combo?: number;
          emoji?: string;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
      };
      daily_missions: {
        Row: {
          id: string;
          user_id: string;
          mission_id: 'm1' | 'm3';
          date: string;
          current: number;
          is_rewarded: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          mission_id: 'm1' | 'm3';
          date?: string;
          current?: number;
          is_rewarded?: boolean;
        };
        Update: {
          current?: number;
          is_rewarded?: boolean;
        };
        Relationships: [];
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
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      words: {
        Row: {
          id: number;
          word: string;
          meaning: string;
          detailed_meaning: string;
          news_example: string;
          hint: string;
          related_words: string[] | null;
        };
        Insert: {
          id: number;
          word: string;
          meaning: string;
          detailed_meaning: string;
          news_example: string;
          hint: string;
          related_words?: string[] | null;
        };
        Update: {
          id?: number;
          word?: string;
          meaning?: string;
          detailed_meaning?: string;
          news_example?: string;
          hint?: string;
          related_words?: string[] | null;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          level: string;
          title: string;
          description: string;
          category: string;
        };
        Insert: {
          id: string;
          level: string;
          title: string;
          description: string;
          category: string;
        };
        Update: {
          id?: string;
          level?: string;
          title?: string;
          description?: string;
          category?: string;
        };
        Relationships: [];
      };
      course_words: {
        Row: {
          course_id: string;
          word_id: number;
          position: number;
        };
        Insert: {
          course_id: string;
          word_id: number;
          position: number;
        };
        Update: {
          course_id?: string;
          word_id?: number;
          position?: number;
        };
        Relationships: [];
      };
      league_tiers: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
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
        Relationships: [];
      };
    };
    Functions: {
      link_guest_to_auth: {
        Args: {
          p_guest_token: string;
          p_auth_user_id: string;
          p_email: string;
        };
        Returns: undefined;
      };
      submit_quiz_answer: {
        Args: {
          p_word_id: number;
          p_answer: string;
          p_mode: 'mc' | 'typed';
          p_used_hint?: boolean;
          p_session_start?: boolean;
        };
        Returns: {
          correct: boolean;
          earned: number;
          combo: number;
          points: number;
          m3_current: number;
        };
      };
      claim_mission_reward: {
        Args: {
          p_mission_id: string;
          p_date?: string;
        };
        Returns: {
          points: number;
        };
      };
      checkin: {
        Args: {
          p_date?: string;
        };
        Returns: {
          ok: boolean;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
