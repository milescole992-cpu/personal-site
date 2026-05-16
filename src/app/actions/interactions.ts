"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/auth-utils";
import { getOrCreateUser, getResourceById } from "@/lib/data";
import { getResourceSlug } from "@/lib/slug";
import { getSupabaseServiceClient } from "@/lib/supabase";

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function cleanText(value: string, max = 2000) {
  return value.replace(/\0/g, "").trim().slice(0, max);
}

function cleanUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

async function requireUser(callbackUrl = "/dashboard") {
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const user = await getOrCreateUser(session.user);

  if (!user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return { session, user };
}

function revalidateResource(resourceSlug: string) {
  revalidatePath(`/resources/${resourceSlug}`);
  revalidatePath("/resources");
  revalidatePath("/");
}

export async function toggleLikeResourceAction(resourceId: string) {
  const resource = await getResourceById(resourceId);
  const callbackUrl = resource ? `/resources/${getResourceSlug(resource)}` : "/resources";
  const { user } = await requireUser(callbackUrl);
  const supabase = getSupabaseServiceClient();

  if (!supabase || !resource) {
    redirect("/resources");
  }

  const { data: existing } = await supabase
    .from("resource_likes")
    .select("resource_id")
    .eq("user_id", user.id)
    .eq("resource_id", resource.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("resource_likes")
      .delete()
      .eq("user_id", user.id)
      .eq("resource_id", resource.id);
  } else {
    await supabase.from("resource_likes").insert({
      user_id: user.id,
      resource_id: resource.id,
    });
  }

  revalidateResource(getResourceSlug(resource));
}

export async function createCommentAction(resourceId: string, formData: FormData) {
  const resource = await getResourceById(resourceId);
  const callbackUrl = resource ? `/resources/${getResourceSlug(resource)}` : "/resources";
  const { user } = await requireUser(callbackUrl);
  const supabase = getSupabaseServiceClient();
  const content = cleanText(formText(formData, "content"));

  if (!supabase || !resource || !content) {
    redirect(callbackUrl);
  }

  await supabase.from("resource_comments").insert({
    resource_id: resource.id,
    user_id: user.id,
    content,
  });

  revalidateResource(getResourceSlug(resource));
  redirect(`${callbackUrl}#comments`);
}

export async function deleteCommentAction(formData: FormData) {
  const { session, user } = await requireUser("/dashboard");
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");
  const resourceId = formText(formData, "resource_id");

  if (!supabase || !id || !resourceId) {
    redirect("/resources");
  }

  const resource = await getResourceById(resourceId);
  const isAdmin = isAdminEmail(session.user?.email) || user.role === "admin";

  const query = supabase.from("resource_comments").update({ is_deleted: true }).eq("id", id);

  if (!isAdmin) {
    query.eq("user_id", user.id);
  }

  await query;

  if (resource) {
    revalidateResource(getResourceSlug(resource));
    redirect(`/resources/${getResourceSlug(resource)}#comments`);
  }

  redirect("/resources");
}

export async function updateProfileAction(formData: FormData) {
  const { user } = await requireUser("/dashboard");
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    redirect("/dashboard?status=profile-failed");
  }

  const username = cleanUsername(formText(formData, "username"));
  const name = cleanText(formText(formData, "name"), 80);
  const bio = cleanText(formText(formData, "bio"), 300);
  const avatarUrl = formText(formData, "avatar_url");
  const bannerUrl = formText(formData, "profile_banner_url");

  if (!username || username.length < 3) {
    redirect("/dashboard?status=profile-invalid");
  }

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .neq("id", user.id)
    .maybeSingle();

  if (existing) {
    redirect("/dashboard?status=username-taken");
  }

  const { error } = await supabase
    .from("users")
    .update({
      username,
      name: name || user.name,
      bio: bio || null,
      avatar_url: avatarUrl || user.avatar_url,
      profile_banner_url: bannerUrl || null,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Failed to update profile", error.message);
    redirect("/dashboard?status=profile-failed");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/u/${username}`);
  redirect("/dashboard?status=profile-saved");
}
