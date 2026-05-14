import type { Session } from "next-auth";
import {
  getSupabaseServiceClient,
  isSupabaseConfigured,
  type DbUser,
  type Download,
  type Favorite,
  type Resource,
} from "@/lib/supabase";
import { getResourceSlug } from "@/lib/slug";

export type ResourceWithState = Resource & {
  isFavorite: boolean;
};

export type ActivityItem = {
  id: string;
  created_at: string;
  resource: Resource | null;
};

export async function syncUserFromSession(
  sessionUser: Session["user"] | undefined,
  provider?: string,
  providerAccountId?: string,
) {
  const email = sessionUser?.email;
  const supabase = getSupabaseServiceClient();

  if (!email || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        email,
        name: sessionUser.name,
        avatar_url: sessionUser.image,
        provider,
        provider_account_id: providerAccountId,
      },
      { onConflict: "email" },
    )
    .select()
    .single();

  if (error) {
    console.error("Failed to sync user", error.message);
    return null;
  }

  return data;
}

export async function getUserByEmail(email?: string | null) {
  const supabase = getSupabaseServiceClient();

  if (!email || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("Failed to load user", error.message);
    return null;
  }

  return data;
}

export async function getOrCreateUser(sessionUser: Session["user"] | undefined) {
  const existing = await getUserByEmail(sessionUser?.email);
  return existing ?? syncUserFromSession(sessionUser);
}

export async function getResourcesForUser(user?: DbUser | null) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return {
      configured: false,
      resources: [] as ResourceWithState[],
    };
  }

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Failed to load resources", error.message);
    return { configured: isSupabaseConfigured(), resources: [] };
  }

  let favoriteIds = new Set<string>();

  if (user) {
    const { data: favorites, error: favoriteError } = await supabase
      .from("favorites")
      .select("resource_id")
      .eq("user_id", user.id);

    if (favoriteError) {
      console.error("Failed to load favorites", favoriteError.message);
    } else {
      favoriteIds = new Set(favorites?.map((item) => item.resource_id) ?? []);
    }
  }

  return {
    configured: true,
    resources: (data ?? []).map((resource) => ({
      ...resource,
      isFavorite: favoriteIds.has(resource.id),
    })),
  };
}

export async function getResourceById(id: string) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load resource", error.message);
    return null;
  }

  return data;
}

export async function getResourceBySlug(slug: string, user?: DbUser | null) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return {
      configured: false,
      resource: null as ResourceWithState | null,
      related: [] as Resource[],
    };
  }

  const { data: resources, error } = await supabase
    .from("resources")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Failed to load resource by slug", error.message);
    return { configured: true, resource: null, related: [] };
  }

  const resource =
    resources?.find((item) => getResourceSlug(item) === slug) ?? null;

  if (!resource) {
    return { configured: true, resource: null, related: [] };
  }

  let isFavorite = false;

  if (user) {
    const { data: favorite, error: favoriteError } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("resource_id", resource.id)
      .maybeSingle();

    if (favoriteError) {
      console.error("Failed to load favorite state", favoriteError.message);
    } else {
      isFavorite = Boolean(favorite);
    }
  }

  const related = (resources ?? [])
    .filter(
      (item) => item.id !== resource.id && item.category === resource.category,
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return {
    configured: true,
    resource: { ...resource, isFavorite },
    related,
  };
}

export async function getAllResources() {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return [] as Resource[];
  }

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Failed to load all resources", error.message);
    return [];
  }

  return data ?? [];
}

export async function getDashboardData(user: DbUser | null) {
  const supabase = getSupabaseServiceClient();

  if (!user || !supabase) {
    return {
      configured: Boolean(supabase),
      favorites: [] as ActivityItem[],
      downloads: [] as ActivityItem[],
    };
  }

  const [{ data: favorites }, { data: downloads }] = await Promise.all([
    supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("downloads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const resourceIds = [
    ...new Set(
      [
        ...((favorites as Favorite[] | null)?.map((item) => item.resource_id) ??
          []),
        ...((downloads as Download[] | null)?.map((item) => item.resource_id) ??
          []),
      ].filter(Boolean),
    ),
  ];

  const resourceMap = new Map<string, Resource>();

  if (resourceIds.length > 0) {
    const { data: resources } = await supabase
      .from("resources")
      .select("*")
      .in("id", resourceIds);

    for (const resource of resources ?? []) {
      resourceMap.set(resource.id, resource);
    }
  }

  return {
    configured: true,
    favorites: ((favorites as Favorite[] | null) ?? []).map((item) => ({
      id: item.id,
      created_at: item.created_at,
      resource: resourceMap.get(item.resource_id) ?? null,
    })),
    downloads: ((downloads as Download[] | null) ?? []).map((item) => ({
      id: item.id,
      created_at: item.created_at,
      resource: resourceMap.get(item.resource_id) ?? null,
    })),
  };
}

export async function getAdminData() {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return {
      configured: false,
      users: [] as DbUser[],
      resources: [] as Resource[],
      downloads: [] as Download[],
    };
  }

  const [{ data: users }, { data: resources }, { data: downloads }] =
    await Promise.all([
      supabase.from("users").select("*").order("created_at", {
        ascending: false,
      }),
      supabase.from("resources").select("*").order("published_at", {
        ascending: false,
      }),
      supabase.from("downloads").select("*").order("created_at", {
        ascending: false,
      }),
    ]);

  return {
    configured: true,
    users: users ?? [],
    resources: resources ?? [],
    downloads: downloads ?? [],
  };
}
