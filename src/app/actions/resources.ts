"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrCreateUser, getResourceById } from "@/lib/data";
import { isAdminEmail } from "@/lib/auth-utils";
import {
  resolveResourceMediaFromForm,
  type ResolvedResourceMedia,
} from "@/lib/media-storage";
import { createSlug, getResourceSlug } from "@/lib/slug";
import { getSupabaseServiceClient } from "@/lib/supabase";

const HOME_FEATURED_PLACEMENT = "home-featured";
const HOME_HOT_PLACEMENT = "home-hot";
const HOME_FLAG_PLACEMENTS = [HOME_FEATURED_PLACEMENT, HOME_HOT_PLACEMENT];

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseTags(value: string) {
  return value
    .split(/[,，、\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!isAdminEmail(session.user.email)) {
    redirect("/");
  }
}

function revalidateContentPaths() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/resources");
  revalidatePath("/tools");
  revalidatePath("/roadmap");
  revalidatePath("/workflows");
  revalidatePath("/tutorials");
  revalidatePath("/sitemap.xml");
}

function adminRedirect(status: string, section = "content-management"): never {
  redirect(`/admin?section=${section}&status=${status}`);
}

function getPlacementIds(formData: FormData) {
  return formData
    .getAll("placement_ids")
    .filter((value): value is string => typeof value === "string" && Boolean(value));
}

async function syncResourcePlacements(
  resourceId: string,
  placementIds: string[],
  sortOrder: number,
) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return;
  }

  await supabase
    .from("content_placement_relations")
    .delete()
    .eq("resource_id", resourceId);

  if (placementIds.length === 0) {
    return;
  }

  const { error } = await supabase.from("content_placement_relations").insert(
    placementIds.map((placementId) => ({
      resource_id: resourceId,
      placement_id: placementId,
      sort_order: sortOrder,
      is_active: true,
    })),
  );

  if (error) {
    console.error("Failed to sync resource placements", error.message);
  }
}

async function resolvePlacementIds({
  selectedPlacementIds,
  isFeatured,
  isHot,
}: {
  selectedPlacementIds: string[];
  isFeatured: boolean;
  isHot: boolean;
}) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return selectedPlacementIds;
  }

  const { data, error } = await supabase
    .from("content_placements")
    .select("id, slug")
    .in("slug", HOME_FLAG_PLACEMENTS);

  if (error) {
    console.error("Failed to load home placements", error.message);
    return selectedPlacementIds;
  }

  const homePlacementIds = new Set((data ?? []).map((placement) => placement.id));
  const bySlug = new Map((data ?? []).map((placement) => [placement.slug, placement.id]));
  const resolved = selectedPlacementIds.filter((id) => !homePlacementIds.has(id));

  if (isFeatured && bySlug.has(HOME_FEATURED_PLACEMENT)) {
    resolved.push(bySlug.get(HOME_FEATURED_PLACEMENT)!);
  }

  if (isHot && bySlug.has(HOME_HOT_PLACEMENT)) {
    resolved.push(bySlug.get(HOME_HOT_PLACEMENT)!);
  }

  return [...new Set(resolved)];
}

async function getCurrentPlacementIds(resourceId: string) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return [] as string[];
  }

  const { data, error } = await supabase
    .from("content_placement_relations")
    .select("placement_id")
    .eq("resource_id", resourceId)
    .eq("is_active", true);

  if (error) {
    console.error("Failed to load current placements", error.message);
    return [];
  }

  return data?.map((relation) => relation.placement_id) ?? [];
}

function resourcePayload(formData: FormData) {
  const title = formText(formData, "title");
  const description = formText(formData, "description");
  const category = formText(formData, "category") || "AI资源";
  const officialUrl = formText(formData, "official_url") || formText(formData, "source_url");
  const audience = formText(formData, "target_audience") || formText(formData, "audience");
  const rating = Number(formData.get("rating") || 3);
  const sortOrder = Number(formData.get("sort_order") || 100);
  const beginnerLevel = Number(formData.get("beginner_friendly_level") || 3);

  return {
    title,
    description,
    content: formText(formData, "content") || null,
    content_type_id: formText(formData, "content_type_id") || null,
    category,
    category_id: formText(formData, "category_id") || null,
    tags: parseTags(formText(formData, "tags")),
    source_url: officialUrl || null,
    official_url: officialUrl || null,
    download_url: formText(formData, "download_url") || null,
    cover_image_url: formText(formData, "cover_image_url") || null,
    audience,
    target_audience: audience || null,
    use_cases: formText(formData, "use_cases"),
    pros: formText(formData, "pros") || null,
    cons: formText(formData, "cons") || null,
    beginner_friendly_level: Number.isFinite(beginnerLevel)
      ? Math.min(Math.max(beginnerLevel, 1), 5)
      : 3,
    resource_type: formText(formData, "resource_type") || "resource",
    is_featured: formData.get("is_featured") === "on",
    is_hot: formData.get("is_hot") === "on",
    is_published: formData.get("is_published") === "on",
    requires_login: formData.get("requires_login") === "on",
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 100,
    rating: Number.isFinite(rating) ? Math.min(Math.max(rating, 1), 5) : 3,
    seo_title: formText(formData, "seo_title") || null,
    seo_description: formText(formData, "seo_description") || null,
  };
}

export async function createResourceAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    adminRedirect("supabase-not-configured", "content-publish");
  }

  const slug = formText(formData, "slug");
  const payload = resourcePayload(formData);

  if (!payload.title || !payload.description) {
    adminRedirect("missing-resource-fields", "content-publish");
  }

  const resourceInput = {
    slug: createSlug(slug || payload.title),
    ...payload,
    published_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("resources")
    .insert(resourceInput)
    .select()
    .single();

  if (error) {
    console.error("Failed to create resource", error.message);
    adminRedirect("create-resource-failed", "content-publish");
  }

  try {
    const mediaFields = await resolveResourceMediaFromForm(formData, data.id);
    if (
      mediaFields.media_type !== "none" ||
      mediaFields.media_url ||
      mediaFields.media_file_name
    ) {
      await supabase.from("resources").update(mediaFields).eq("id", data.id);
    }
  } catch (uploadError) {
    console.error("Failed to upload resource media", uploadError);
    await supabase.from("resources").delete().eq("id", data.id);
    adminRedirect("create-resource-failed", "content-publish");
  }

  await syncResourcePlacements(
    data.id,
    await resolvePlacementIds({
      selectedPlacementIds: getPlacementIds(formData),
      isFeatured: payload.is_featured,
      isHot: payload.is_hot,
    }),
    payload.sort_order,
  );

  revalidateContentPaths();
  adminRedirect(
    payload.is_published ? "resource-published" : "resource-draft-saved",
    "content-management",
  );
}

export async function updateResourceAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");
  const slug = formText(formData, "slug");
  const payload = resourcePayload(formData);

  if (!supabase || !id) {
    adminRedirect("resource-update-failed");
  }

  const existing = await getResourceById(id);
  let mediaFields: ResolvedResourceMedia = {
    media_type: (existing?.media_type ?? "none") as ResolvedResourceMedia["media_type"],
    media_url: existing?.media_url ?? null,
    media_file_name: existing?.media_file_name ?? null,
  };

  try {
    mediaFields = await resolveResourceMediaFromForm(formData, id, existing ?? undefined);
  } catch (uploadError) {
    console.error("Failed to upload resource media", uploadError);
    adminRedirect("resource-update-failed");
  }

  const { error } = await supabase
    .from("resources")
    .update({
      slug: createSlug(slug || payload.title),
      ...payload,
      ...mediaFields,
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update resource", error.message);
    adminRedirect("resource-update-failed");
  }

  await syncResourcePlacements(
    id,
    await resolvePlacementIds({
      selectedPlacementIds: getPlacementIds(formData),
      isFeatured: payload.is_featured,
      isHot: payload.is_hot,
    }),
    payload.sort_order,
  );
  revalidateContentPaths();
  adminRedirect("resource-updated", "content-management");
}

export async function deleteResourceAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");

  if (!supabase || !id) {
    adminRedirect("resource-delete-failed");
  }

  const { error } = await supabase.from("resources").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete resource", error.message);
    adminRedirect("resource-delete-failed");
  }

  revalidateContentPaths();
  adminRedirect("resource-deleted", "content-management");
}

export async function quickUpdateResourceAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");
  const operation = formText(formData, "operation");

  if (!supabase || !id) {
    adminRedirect("resource-update-failed");
  }

  const payload =
    operation === "publish"
      ? { is_published: true, published_at: new Date().toISOString() }
      : operation === "unpublish"
        ? { is_published: false }
        : operation === "feature"
          ? { is_featured: true }
          : operation === "unfeature"
            ? { is_featured: false }
            : operation === "hot"
              ? { is_hot: true }
              : operation === "unhot"
                ? { is_hot: false }
                : null;

  if (!payload) {
    adminRedirect("resource-update-failed");
  }

  const { error } = await supabase.from("resources").update(payload).eq("id", id);

  if (error) {
    console.error("Failed to quick update resource", error.message);
    adminRedirect("resource-update-failed");
  }

  if (["feature", "unfeature", "hot", "unhot"].includes(operation)) {
    const resource = await getResourceById(id);
    const placementIds = await getCurrentPlacementIds(id);

    if (resource) {
      await syncResourcePlacements(
        id,
        await resolvePlacementIds({
          selectedPlacementIds: placementIds,
          isFeatured:
            operation === "feature"
              ? true
              : operation === "unfeature"
                ? false
                : resource.is_featured,
          isHot:
            operation === "hot"
              ? true
              : operation === "unhot"
                ? false
                : resource.is_hot,
        }),
        resource.sort_order,
      );
    }
  }

  revalidateContentPaths();
  const status =
    operation === "publish"
      ? "resource-published"
      : operation === "unpublish"
        ? "resource-unpublished"
        : "resource-updated";

  adminRedirect(status, "content-management");
}

export async function favoriteResourceAction(resourceId: string) {
  const session = await auth();
  const supabase = getSupabaseServiceClient();

  if (!session?.user) {
    redirect("/login?callbackUrl=/resources");
  }

  const user = await getOrCreateUser(session.user);

  if (!supabase || !user) {
    redirect("/resources?status=favorite-unavailable");
  }

  const { error } = await supabase.from("favorites").upsert(
    {
      user_id: user.id,
      resource_id: resourceId,
    },
    { onConflict: "user_id,resource_id", ignoreDuplicates: true },
  );

  if (error) {
    console.error("Failed to favorite resource", error.message);
  }

  const resource = await getResourceById(resourceId);

  revalidatePath("/resources");
  if (resource) {
    revalidatePath(`/resources/${getResourceSlug(resource)}`);
  }
  revalidatePath("/dashboard");
}

export async function downloadResourceAction(resourceId: string) {
  const session = await auth();
  const supabase = getSupabaseServiceClient();

  if (!session?.user) {
    redirect("/login?callbackUrl=/resources");
  }

  const [user, resource] = await Promise.all([
    getOrCreateUser(session.user),
    getResourceById(resourceId),
  ]);

  if (!supabase || !user || !resource) {
    redirect("/resources?status=download-unavailable");
  }

  const { error } = await supabase.from("downloads").insert({
    user_id: user.id,
    resource_id: resource.id,
  });

  if (error) {
    console.error("Failed to record download", error.message);
  }

  revalidatePath("/dashboard");
  redirect(resource.download_url || `/resources?download=${resource.id}`);
}
