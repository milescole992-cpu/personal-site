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

export async function updateSiteSettingsAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    redirect("/admin?status=supabase-not-configured");
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
    redirect("/admin?status=settings-failed");
  }

  revalidateCmsPaths();
  redirect("/admin?status=settings-saved#site-settings");
}

export async function createHomeSectionAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    redirect("/admin?status=supabase-not-configured");
  }

  const title = formText(formData, "title");
  const description = formText(formData, "description");
  const href = formText(formData, "href");

  if (!title || !description || !href) {
    redirect("/admin?status=home-section-missing#home-sections");
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
    redirect("/admin?status=home-section-failed#home-sections");
  }

  revalidateCmsPaths();
  redirect("/admin?status=home-section-created#home-sections");
}

export async function updateHomeSectionAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    redirect("/admin?status=supabase-not-configured");
  }

  const id = formText(formData, "id");

  if (!id) {
    redirect("/admin?status=home-section-missing-id#home-sections");
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
    redirect("/admin?status=home-section-update-failed#home-sections");
  }

  revalidateCmsPaths();
  redirect("/admin?status=home-section-updated#home-sections");
}

export async function createContentTypeAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    redirect("/admin?status=supabase-not-configured#content-types");
  }

  const name = formText(formData, "name");
  const slug = formText(formData, "slug");

  if (!name || !slug) {
    redirect("/admin?status=content-type-missing#content-types");
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
    redirect("/admin?status=content-type-failed#content-types");
  }

  revalidateCmsPaths();
  redirect("/admin?status=content-type-created#content-types");
}

export async function updateContentTypeAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");

  if (!supabase || !id) {
    redirect("/admin?status=content-type-update-failed#content-types");
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
    redirect("/admin?status=content-type-update-failed#content-types");
  }

  revalidateCmsPaths();
  redirect("/admin?status=content-type-updated#content-types");
}

export async function deleteContentTypeAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");

  if (!supabase || !id) {
    redirect("/admin?status=content-type-delete-failed#content-types");
  }

  const { error } = await supabase.from("content_types").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete content type", error.message);
    redirect("/admin?status=content-type-delete-failed#content-types");
  }

  revalidateCmsPaths();
  redirect("/admin?status=content-type-deleted#content-types");
}

export async function createPlacementAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    redirect("/admin?status=supabase-not-configured#placements");
  }

  const name = formText(formData, "name");
  const slug = formText(formData, "slug");
  const pagePath = formText(formData, "page_path");
  const placementKey = formText(formData, "placement_key");

  if (!name || !slug || !pagePath || !placementKey) {
    redirect("/admin?status=placement-missing#placements");
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
    redirect("/admin?status=placement-failed#placements");
  }

  revalidateCmsPaths();
  redirect("/admin?status=placement-created#placements");
}

export async function updatePlacementAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");

  if (!supabase || !id) {
    redirect("/admin?status=placement-update-failed#placements");
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
    redirect("/admin?status=placement-update-failed#placements");
  }

  revalidateCmsPaths();
  redirect("/admin?status=placement-updated#placements");
}

export async function deletePlacementAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");

  if (!supabase || !id) {
    redirect("/admin?status=placement-delete-failed#placements");
  }

  const { error } = await supabase.from("content_placements").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete placement", error.message);
    redirect("/admin?status=placement-delete-failed#placements");
  }

  revalidateCmsPaths();
  redirect("/admin?status=placement-deleted#placements");
}
