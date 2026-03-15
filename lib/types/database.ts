export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "michael" | "chloe";
export type MessageType = "text" | "voice";
export type MessageStatus = "sent" | "delivered" | "read";
export type RecCategory = "movie" | "book" | "song" | "show" | "podcast" | "other";
export type QuoteCategory = "racist" | "out_of_context" | "libtard";

export interface Database {
  chloesvault: {
    Tables: {
      messages: {
        Row: {
          id: string;
          from_user: UserRole;
          type: MessageType;
          text: string | null;
          voice_url: string | null;
          duration: number | null;
          status: MessageStatus;
          is_pinned: boolean;
          pinned_at: string | null;
          pinned_by: UserRole | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          from_user: UserRole;
          type: MessageType;
          text?: string | null;
          voice_url?: string | null;
          duration?: number | null;
          status?: MessageStatus;
          is_pinned?: boolean;
          pinned_at?: string | null;
          pinned_by?: UserRole | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          from_user?: UserRole;
          type?: MessageType;
          text?: string | null;
          voice_url?: string | null;
          duration?: number | null;
          status?: MessageStatus;
          is_pinned?: boolean;
          pinned_at?: string | null;
          pinned_by?: UserRole | null;
          created_at?: string;
        };
        Relationships: [];
      };
      quotes: {
        Row: {
          id: string;
          text: string;
          author: string;
          category: QuoteCategory;
          month: string;
          added_by: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          author: string;
          category: QuoteCategory;
          month: string;
          added_by: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          author?: string;
          category?: QuoteCategory;
          month?: string;
          added_by?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      moments: {
        Row: {
          id: string;
          title: string;
          date: string;
          emoji: string;
          description: string;
          added_by: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          date: string;
          emoji: string;
          description: string;
          added_by: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          date?: string;
          emoji?: string;
          description?: string;
          added_by?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      recommendations: {
        Row: {
          id: string;
          title: string;
          category: RecCategory;
          from_user: UserRole;
          emoji: string;
          done: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category: RecCategory;
          from_user: UserRole;
          emoji: string;
          done?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: RecCategory;
          from_user?: UserRole;
          emoji?: string;
          done?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      topics: {
        Row: {
          id: string;
          text: string;
          used: boolean;
          added_by: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          used?: boolean;
          added_by: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          used?: boolean;
          added_by?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      collage_photos: {
        Row: {
          id: string;
          url: string;
          caption: string | null;
          added_by: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          caption?: string | null;
          added_by: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          caption?: string | null;
          added_by?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      activity: {
        Row: {
          id: string;
          emoji: string;
          text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          emoji: string;
          text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          emoji?: string;
          text?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Message = Database["chloesvault"]["Tables"]["messages"]["Row"];
export type Quote = Database["chloesvault"]["Tables"]["quotes"]["Row"];
export type Moment = Database["chloesvault"]["Tables"]["moments"]["Row"];
export type Recommendation = Database["chloesvault"]["Tables"]["recommendations"]["Row"];
export type Topic = Database["chloesvault"]["Tables"]["topics"]["Row"];
export type Activity = Database["chloesvault"]["Tables"]["activity"]["Row"];
export type CollagePhoto = Database["chloesvault"]["Tables"]["collage_photos"]["Row"];

export interface MessageFolder {
  id: string;
  name: string;
  emoji: string;
  created_by: UserRole;
  created_at: string;
}

export interface MessageFolderItem {
  id: string;
  folder_id: string;
  message_id: string;
  added_by: UserRole;
  added_at: string;
}
