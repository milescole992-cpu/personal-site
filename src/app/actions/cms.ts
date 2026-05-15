"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/auth-utils";
import { defaultSiteSettings } from "@/lib/data";
import { getSupabaseServiceClient } from "@/lib/supabase";

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formNumber(formData: FormData, key: string, fallback = 100) {
  const value = Number(formData.get(key) || fallback);
  return Number.isFinite(value) ? value : fallback;
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

function revalidateCmsPaths() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/resources");
  revalidatePath("/tools");
  revalidatePath("/roadmap");
  revalidatePath("/workflows");
  revalidatePath("/tutorials");
  revalidatePath("/sitemap.xml");
}

function adminRedirect(status: string, section: string): never {
  redirect(`/admin?section=${section}&status=${status}`);
}

export async function updateSiteSettingsAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    adminRedirect("supabase-not-configured", "homepage");
  }

  const payload = {
    hero_title: formText(formData, "hero_title") || defaultSiteSettings.hero_title,
    hero_subtitle:
      formText(formData, "hero_subtitle") || defaultSiteSettings.hero_subtitle,
    hero_description:
      formText(formData, "hero_description") ||
      defaultSiteSettings.hero_description,
    primary_cta_text:
      formText(formData, "primary_cta_text") ||
      defaultSiteSettings.primary_cta_text,
    primary_cta_href:
      formText(formData, "primary_cta_href") ||
      defaultSiteSettings.primary_cta_href,
    secondary_cta_text:
      formText(formData, "secondary_cta_text") ||
      defaultSiteSettings.secondary_cta_text,
    secondary_cta_href:
      formText(formData, "secondary_cta_href") ||
      defaultSiteSettings.secondary_cta_href,
    site_tagline:
      formText(formData, "site_tagline") || defaultSiteSettings.site_tagline,
    seo_title: formText(formData, "seo_title") || defaultSiteSettings.seo_title,
    seo_description:
      formText(formData, "seo_description") ||
      defaultSiteSettings.seo_description,
    brand_name: formText(formData, "brand_name") || defaultSiteSettings.brand_name,
    footer_description:
      formText(formData, "footer_description") ||
      defaultSiteSettings.footer_description,
    homepage_featured_title:
      formText(formData, "homepage_featured_title") ||
      defaultSiteSettings.homepage_featured_title,
    homepage_featured_description:
      formText(formData, "homepage_featured_description") ||
      defaultSiteSettings.homepage_featured_description,
  };

  const existingId = formText(formData, "id");
  const { error } = existingId && existingId !== "default"
    ? await supabase.from("site_settings").update(payload).eq("id", existingId)
    : await supabase.from("site_settings").insert(payload);

  if (error) {
    console.error("Failed to update site settings", error.message);
    adminRedirect("settings-failed", "homepage");
  }

  revalidateCmsPaths();
  adminRedirect("settings-saved", "homepage");
}

export async function createHomeSectionAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    adminRedirect("supabase-not-configured", "homepage");
  }

  const title = formText(formData, "title");
  const description = formText(formData, "description");
  const href = formText(formData, "href");

  if (!title || !description || !href) {
    adminRedirect("home-section-missing", "homepage");
  }

  const { error } = await supabase.from("home_sections").insert({
    title,
    description,
    href,
    icon: formText(formData, "icon") || null,
    badge: formText(formData, "badge") || null,
    sort_order: Number(formData.get("sort_order") || 100),
    section_type: formText(formData, "section_type") || "homepage_entry",
    image_url: formText(formData, "image_url") || null,
    is_active: formData.get("is_active") === "on",
  });

  if (error) {
    console.error("Failed to create home section", error.message);
    adminRedirect("home-section-failed", "homepage");
  }

  revalidateCmsPaths();
  adminRedirect("home-section-created", "homepage");
}

export async function updateHomeSectionAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    adminRedirect("supabase-not-configured", "homepage");
  }

  const id = formText(formData, "id");

  if (!id) {
    adminRedirect("home-section-missing-id", "homepage");
  }

  const { error } = await supabase
    .from("home_sections")
    .update({
      title: formText(formData, "title"),
      description: formText(formData, "description"),
      href: formText(formData, "href"),
      icon: formText(formData, "icon") || null,
      badge: formText(formData, "badge") || null,
      sort_order: Number(formData.get("sort_order") || 100),
      section_type: formText(formData, "section_type") || "homepage_entry",
      image_url: formText(formData, "image_url") || null,
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update home section", error.message);
    adminRedirect("home-section-update-failed", "homepage");
  }

  revalidateCmsPaths();
  adminRedirect("home-section-updated", "homepage");
}

export async function deleteHomeSectionAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");

  if (!supabase || !id) {
    adminRedirect("home-section-delete-failed", "homepage");
  }

  const { error } = await supabase.from("home_sections").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete home section", error.message);
    adminRedirect("home-section-delete-failed", "homepage");
  }

  revalidateCmsPaths();
  adminRedirect("home-section-deleted", "homepage");
}

export async function createContentTypeAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    adminRedirect("supabase-not-configured", "content-types");
  }

  const name = formText(formData, "name");
  const slug = formText(formData, "slug");

  if (!name || !slug) {
    adminRedirect("content-type-missing", "content-types");
  }

  const { error } = await supabase.from("content_types").insert({
    name,
    slug,
    description: formText(formData, "description") || null,
    icon: formText(formData, "icon") || null,
    sort_order: formNumber(formData, "sort_order"),
    is_active: formData.get("is_active") === "on",
  });

  if (error) {
    console.error("Failed to create content type", error.message);
    adminRedirect("content-type-failed", "content-types");
  }

  revalidateCmsPaths();
  adminRedirect("content-type-created", "content-types");
}

export async function updateContentTypeAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");

  if (!supabase || !id) {
    adminRedirect("content-type-update-failed", "content-types");
  }

  const { error } = await supabase
    .from("content_types")
    .update({
      name: formText(formData, "name"),
      slug: formText(formData, "slug"),
      description: formText(formData, "description") || null,
      icon: formText(formData, "icon") || null,
      sort_order: formNumber(formData, "sort_order"),
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update content type", error.message);
    adminRedirect("content-type-update-failed", "content-types");
  }

  revalidateCmsPaths();
  adminRedirect("content-type-updated", "content-types");
}

export async function deleteContentTypeAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");

  if (!supabase || !id) {
    adminRedirect("content-type-delete-failed", "content-types");
  }

  const { error } = await supabase.from("content_types").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete content type", error.message);
    adminRedirect("content-type-delete-failed", "content-types");
  }

  revalidateCmsPaths();
  adminRedirect("content-type-deleted", "content-types");
}

export async function createPlacementAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    adminRedirect("supabase-not-configured", "placements");
  }

  const name = formText(formData, "name");
  const slug = formText(formData, "slug");
  const pagePath = formText(formData, "page_path");
  const placementKey = formText(formData, "placement_key");

  if (!name || !slug || !pagePath || !placementKey) {
    adminRedirect("placement-missing", "placements");
  }

  const { error } = await supabase.from("content_placements").insert({
    name,
    slug,
    description: formText(formData, "description") || null,
    page_path: pagePath,
    placement_key: placementKey,
    sort_order: formNumber(formData, "sort_order"),
    is_active: formData.get("is_active") === "on",
  });

  if (error) {
    console.error("Failed to create placement", error.message);
    adminRedirect("placement-failed", "placements");
  }

  revalidateCmsPaths();
  adminRedirect("placement-created", "placements");
}

export async function updatePlacementAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");

  if (!supabase || !id) {
    adminRedirect("placement-update-failed", "placements");
  }

  const { error } = await supabase
    .from("content_placements")
    .update({
      name: formText(formData, "name"),
      slug: formText(formData, "slug"),
      description: formText(formData, "description") || null,
      page_path: formText(formData, "page_path"),
      placement_key: formText(formData, "placement_key"),
      sort_order: formNumber(formData, "sort_order"),
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to update placement", error.message);
    adminRedirect("placement-update-failed", "placements");
  }

  revalidateCmsPaths();
  adminRedirect("placement-updated", "placements");
}

export async function deletePlacementAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");

  if (!supabase || !id) {
    adminRedirect("placement-delete-failed", "placements");
  }

  const { error } = await supabase.from("content_placements").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete placement", error.message);
    adminRedirect("placement-delete-failed", "placements");
  }

  revalidateCmsPaths();
  adminRedirect("placement-deleted", "placements");
}

function contentPagePayload(formData: FormData) {
  return {
    title: formText(formData, "title"),
    slug: formText(formData, "slug"),
    page_path: formText(formData, "page_path"),
    description: formText(formData, "description") || null,
    hero_title: formText(formData, "hero_title"),
    hero_subtitle: formText(formData, "hero_subtitle") || null,
    hero_description: formText(formData, "hero_description") || null,
    seo_title: formText(formData, "seo_title") || null,
    seo_description: formText(formData, "seo_description") || null,
    empty_state_title: formText(formData, "empty_state_title") || null,
    empty_state_description: formText(formData, "empty_state_description") || null,
    primary_cta_text: formText(formData, "primary_cta_text") || null,
    primary_cta_href: formText(formData, "primary_cta_href") || null,
    placement_slug: formText(formData, "placement_slug"),
    sort_order: formNumber(formData, "sort_order"),
    is_active: formData.get("is_active") === "on",
  };
}

export async function createContentPageAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const payload = contentPagePayload(formData);

  if (
    !supabase ||
    !payload.title ||
    !payload.slug ||
    !payload.page_path ||
    !payload.hero_title ||
    !payload.placement_slug
  ) {
    adminRedirect("content-page-missing", "pages");
  }

  const { error } = await supabase.from("content_pages").insert(payload);

  if (error) {
    console.error("Failed to create content page", error.message);
    if (error.code === "23505") {
      adminRedirect("content-page-duplicate", "pages");
    }
    adminRedirect("content-page-failed", "pages");
  }

  revalidateCmsPaths();
  revalidatePath(payload.page_path);
  adminRedirect("content-page-created", "pages");
}

export async function updateContentPageAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");
  const payload = contentPagePayload(formData);

  if (!supabase || !id || !payload.title || !payload.slug || !payload.page_path) {
    adminRedirect("content-page-update-failed", "pages");
  }

  const { error } = await supabase
    .from("content_pages")
    .update(payload)
    .eq("id", id);

  if (error) {
    console.error("Failed to update content page", error.message);
    adminRedirect("content-page-update-failed", "pages");
  }

  revalidateCmsPaths();
  revalidatePath(payload.page_path);
  adminRedirect("content-page-updated", "pages");
}

export async function deleteContentPageAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");

  if (!supabase || !id) {
    adminRedirect("content-page-delete-failed", "pages");
  }

  const { error } = await supabase.from("content_pages").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete content page", error.message);
    adminRedirect("content-page-delete-failed", "pages");
  }

  revalidateCmsPaths();
  adminRedirect("content-page-deleted", "pages");
}
