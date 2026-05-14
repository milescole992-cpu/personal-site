import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type DbUser = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  provider: string | null;
  provider_account_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Resource = {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  category: string;
  tags: string[];
  source_url: string | null;
  download_url: string | null;
  audience: string;
  use_cases: string;
  requires_login: boolean;
  published_at: string;
  rating: number;
  created_at: string;
  updated_at: string;
};

export type Download = {
  id: string;
  user_id: string;
  resource_id: string;
  created_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  resource_id: string;
  created_at: string;
};

type Database = {
  public: {
    Tables: {
      users: {
        Row: DbUser;
        Insert: Partial<DbUser> & { email: string };
        Update: Partial<DbUser>;
        Relationships: [];
      };
      resources: {
        Row: Resource;
        Insert: Omit<
          Partial<Resource>,
          "id" | "created_at" | "updated_at"
        > & {
          title: string;
          description: string;
        };
        Update: Partial<Resource>;
        Relationships: [];
      };
      downloads: {
        Row: Download;
        Insert: Omit<Partial<Download>, "id" | "created_at"> & {
          user_id: string;
          resource_id: string;
        };
        Update: Partial<Download>;
        Relationships: [];
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Partial<Favorite>, "id" | "created_at"> & {
          user_id: string;
          resource_id: string;
        };
        Update: Partial<Favorite>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let serviceClient: SupabaseClient<Database> | null = null;
let anonClient: SupabaseClient<Database> | null = null;

export function isSupabaseConfigured() {
  return Boolean(
    process.env.SUPABASE_URL &&
      process.env.SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getSupabaseServiceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  serviceClient ??= createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serviceClient;
}

export function getSupabaseAnonClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  anonClient ??= createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return anonClient;
}
