"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrCreateUser, getResourceById } from "@/lib/data";
import { isAdminEmail } from "@/lib/auth-utils";
import { createSlug, getResourceSlug } from "@/lib/slug";
import { getSupabaseServiceClient } from "@/lib/supabase";

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseTags(value: string) {
  return value
    .split(",")
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

  await syncResourcePlacements(data.id, getPlacementIds(formData), payload.sort_order);

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

  const { error } = await supabase
    .from("resources")
    .update({
      slug: createSlug(slug || payload.title),
      ...payload,
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update resource", error.message);
    adminRedirect("resource-update-failed");
  }

  await syncResourcePlacements(id, getPlacementIds(formData), payload.sort_order);
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
