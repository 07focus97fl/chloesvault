export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "michael" | "chloe";
export type MessageType = "text" | "voice" | "image" | "gif";
export type MessageStatus = "sent" | "delivered" | "read";
export type RecCategory = "movie" | "book" | "song" | "show" | "podcast" | "other";
export interface QuoteCategory {
  id: string;
  value: string;
  label: string;
  emoji: string;
  created_at: string;
}

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
          media_url: string | null;
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
          media_url?: string | null;
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
          media_url?: string | null;
          duration?: number | null;
          status?: MessageStatus;
          is_pinned?: boolean;
          pinned_at?: string | null;
          pinned_by?: UserRole | null;
          created_at?: string;
        };
        Relationships: [];
      };
      quote_categories: {
        Row: {
          id: string;
          value: string;
          label: string;
          emoji: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          value: string;
          label: string;
          emoji?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          value?: string;
          label?: string;
          emoji?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      quotes: {
        Row: {
          id: string;
          text: string;
          author: string;
          category: string;
          month: string;
          added_by: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          author: string;
          category: string;
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
          link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category: RecCategory;
          from_user: UserRole;
          emoji: string;
          done?: boolean;
          link?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: RecCategory;
          from_user?: UserRole;
          emoji?: string;
          done?: boolean;
          link?: string | null;
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
      message_notes: {
        Row: {
          id: string;
          message_id: string;
          text: string;
          added_by: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          text: string;
          added_by: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          text?: string;
          added_by?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      vault_notes: {
        Row: {
          id: string;
          text: string;
          added_by: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          added_by: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          added_by?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      icks: {
        Row: {
          id: string;
          text: string;
          about: UserRole;
          added_by: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          about: UserRole;
          added_by: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          about?: UserRole;
          added_by?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      poems: {
        Row: {
          id: string;
          title: string;
          text: string;
          type: string;
          from_user: UserRole;
          to_user: UserRole;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          text: string;
          type: string;
          from_user: UserRole;
          to_user: UserRole;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          text?: string;
          type?: string;
          from_user?: UserRole;
          to_user?: UserRole;
          date?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      nightmares: {
        Row: {
          id: string;
          text: string;
          about: UserRole;
          added_by: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          text: string;
          about: UserRole;
          added_by: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          text?: string;
          about?: UserRole;
          added_by?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_role: UserRole;
          endpoint: string;
          keys_p256dh: string;
          keys_auth: string;
          device_label: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_role: UserRole;
          endpoint: string;
          keys_p256dh: string;
          keys_auth: string;
          device_label?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_role?: UserRole;
          endpoint?: string;
          keys_p256dh?: string;
          keys_auth?: string;
          device_label?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      activity: {
        Row: {
          id: string;
          emoji: string;
          text: string;
          href: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          emoji: string;
          text: string;
          href?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          emoji?: string;
          text?: string;
          href?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      message_folders: {
        Row: {
          id: string;
          name: string;
          emoji: string;
          created_by: UserRole;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          emoji: string;
          created_by: UserRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          emoji?: string;
          created_by?: UserRole;
          created_at?: string;
        };
        Relationships: [];
      };
      message_folder_items: {
        Row: {
          id: string;
          folder_id: string;
          message_id: string;
          added_by: UserRole;
          added_at: string;
        };
        Insert: {
          id?: string;
          folder_id: string;
          message_id: string;
          added_by: UserRole;
          added_at?: string;
        };
        Update: {
          id?: string;
          folder_id?: string;
          message_id?: string;
          added_by?: UserRole;
          added_at?: string;
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
export type MessageNote = Database["chloesvault"]["Tables"]["message_notes"]["Row"];
export type Ick = Database["chloesvault"]["Tables"]["icks"]["Row"];
export type Poem = Database["chloesvault"]["Tables"]["poems"]["Row"];
export type Nightmare = Database["chloesvault"]["Tables"]["nightmares"]["Row"];
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
