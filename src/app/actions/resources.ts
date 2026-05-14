"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrCreateUser, getResourceById } from "@/lib/data";
import { isAdminEmail } from "@/lib/auth-utils";
import { createSlug } from "@/lib/slug";
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

export async function createResourceAction(formData: FormData) {
  const session = await auth();
  const supabase = getSupabaseServiceClient();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!isAdminEmail(session.user.email)) {
    redirect("/");
  }

  if (!supabase) {
    redirect("/admin?status=supabase-not-configured");
  }

  const title = formText(formData, "title");
  const slug = formText(formData, "slug");
  const description = formText(formData, "description");
  const category = formText(formData, "category") || "AI资源";
  const sourceUrl = formText(formData, "source_url");
  const downloadUrl = formText(formData, "download_url");
  const audience = formText(formData, "audience");
  const useCases = formText(formData, "use_cases");
  const rating = Number(formData.get("rating") || 3);

  if (!title || !description) {
    redirect("/admin?status=missing-resource-fields");
  }

  const { error } = await supabase.from("resources").insert({
    slug: createSlug(slug || title),
    title,
    description,
    category,
    tags: parseTags(formText(formData, "tags")),
    source_url: sourceUrl || null,
    download_url: downloadUrl || null,
    audience,
    use_cases: useCases,
    requires_login: formData.get("requires_login") === "on",
    rating: Number.isFinite(rating) ? Math.min(Math.max(rating, 1), 5) : 3,
    published_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to create resource", error.message);
    redirect("/admin?status=create-resource-failed");
  }

  revalidatePath("/admin");
  revalidatePath("/resources");
  revalidatePath("/sitemap.xml");
  redirect("/admin?status=resource-created");
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
  if (resource?.slug) {
    revalidatePath(`/resources/${resource.slug}`);
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
