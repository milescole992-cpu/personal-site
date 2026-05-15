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
  content: string | null;
  content_type_id: string | null;
  category_id: string | null;
  category: string;
  tags: string[];
  source_url: string | null;
  official_url: string | null;
  download_url: string | null;
  cover_image_url: string | null;
  audience: string;
  target_audience: string | null;
  use_cases: string;
  pros: string | null;
  cons: string | null;
  beginner_friendly_level: number | null;
  resource_type: string;
  is_featured: boolean;
  is_hot: boolean;
  is_published: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  requires_login: boolean;
  published_at: string;
  rating: number;
  created_at: string;
  updated_at: string;
};

export type ContentType = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ContentPlacement = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  page_path: string;
  placement_key: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ContentPlacementRelation = {
  id: string;
  resource_id: string;
  placement_id: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SiteSettings = {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  primary_cta_text: string;
  primary_cta_href: string;
  secondary_cta_text: string;
  secondary_cta_href: string;
  site_tagline: string;
  seo_title: string;
  seo_description: string;
  brand_name: string;
  footer_description: string;
  homepage_featured_title: string;
  homepage_featured_description: string;
  created_at: string;
  updated_at: string;
};

export type HomeSection = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: string | null;
  badge: string | null;
  sort_order: number;
  is_active: boolean;
  section_type: string;
  image_url: string | null;
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
      content_types: {
        Row: ContentType;
        Insert: Omit<Partial<ContentType>, "id" | "created_at" | "updated_at"> & {
          name: string;
          slug: string;
        };
        Update: Partial<ContentType>;
        Relationships: [];
      };
      content_placements: {
        Row: ContentPlacement;
        Insert: Omit<
          Partial<ContentPlacement>,
          "id" | "created_at" | "updated_at"
        > & {
          name: string;
          slug: string;
          page_path: string;
          placement_key: string;
        };
        Update: Partial<ContentPlacement>;
        Relationships: [];
      };
      content_placement_relations: {
        Row: ContentPlacementRelation;
        Insert: Omit<
          Partial<ContentPlacementRelation>,
          "id" | "created_at" | "updated_at"
        > & {
          resource_id: string;
          placement_id: string;
        };
        Update: Partial<ContentPlacementRelation>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettings;
        Insert: Partial<SiteSettings>;
        Update: Partial<SiteSettings>;
        Relationships: [];
      };
      home_sections: {
        Row: HomeSection;
        Insert: Omit<Partial<HomeSection>, "id" | "created_at" | "updated_at"> & {
          title: string;
          description: string;
          href: string;
        };
        Update: Partial<HomeSection>;
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
