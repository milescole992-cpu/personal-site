"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrCreateUser } from "@/lib/data";
import { isAdminEmail } from "@/lib/auth-utils";
import { resolveResourceMediaFromForm } from "@/lib/media-storage";
import { createSlug } from "@/lib/slug";
import { getSupabaseServiceClient } from "@/lib/supabase";

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formTexts(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function cleanText(value: string, max = 8000) {
  return value.replace(/\0/g, "").trim().slice(0, max);
}

function safeUrl(value: string) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function submissionType(value: string) {
  const allowed = new Set(["tool", "workflow", "tutorial", "resource", "prompt", "experience"]);
  return (allowed.has(value) ? value : "resource") as
    | "tool"
    | "workflow"
    | "tutorial"
    | "resource"
    | "prompt"
    | "experience";
}

async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/submit");
  }

  const user = await getOrCreateUser(session.user);

  if (!user) {
    redirect("/login?callbackUrl=/submit");
  }

  const bannedUntil = user.banned_until ? new Date(user.banned_until) : null;
  const isBanned =
    user.status === "banned" || Boolean(bannedUntil && bannedUntil > new Date());

  if (isBanned || !user.can_submit) {
    redirect("/dashboard?status=submission-restricted");
  }

  return user;
}

async function requireAdmin() {
  const session = await auth();
  const user = await getOrCreateUser(session?.user);

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!isAdminEmail(session.user.email) && user?.role !== "admin") {
    redirect("/");
  }

  return user;
}

function revalidateSubmissionPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/resources");
  revalidatePath("/tools");
  revalidatePath("/workflows");
  revalidatePath("/tutorials");
  revalidatePath("/roadmap");
}

function submissionRedirect(status: string): never {
  redirect(`/dashboard?status=${status}`);
}

function adminReviewRedirect(status: string): never {
  redirect(`/admin?section=review&status=${status}`);
}

export async function createSubmissionAction(formData: FormData) {
  const user = await requireUser();
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    submissionRedirect("submission-failed");
  }

  if (formData.get("accept_rules") !== "on") {
    redirect("/submit?status=rules-required");
  }

  const title = cleanText(formText(formData, "title"), 160);
  const summary = cleanText(formText(formData, "summary"), 600);

  if (!title || !summary) {
    redirect("/submit?status=missing-fields");
  }

  const selectedSubmissionType = submissionType(formText(formData, "submission_type"));
  const payload = {
    user_id: user.id,
    submission_type: selectedSubmissionType,
    title,
    slug: createSlug(formText(formData, "slug") || title),
    summary,
    content: cleanText(formText(formData, "content"), 20000) || null,
    content_json: null,
    category: cleanText(formText(formData, "category"), 80) || "AI资源",
    tags: formTexts(formData, "tags"),
    resource_url: safeUrl(formText(formData, "resource_url")) || null,
    cover_image_url: safeUrl(formText(formData, "cover_image_url")) || null,
    media_type: "none" as const,
    media_url: null,
    media_file_name: null,
    status: "pending" as const,
    review_status: "pending" as const,
    risk_level: "unknown" as const,
  };

  const { data, error } = await supabase
    .from("user_submissions")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Failed to create submission", error.message);
    submissionRedirect("submission-failed");
  }

  try {
    const media = await resolveResourceMediaFromForm(formData, `submission-${data.id}`);
    if (media.media_url && media.media_type !== "none") {
      await supabase.from("user_submissions").update(media).eq("id", data.id);
      await supabase.from("submission_assets").insert({
        submission_id: data.id,
        asset_type:
          media.media_type === "video"
            ? "video"
            : media.media_type === "image"
              ? "image"
              : "attachment",
        url: media.media_url,
        file_name: media.media_file_name,
        sort_order: 100,
        is_public: false,
      });
    }
  } catch (uploadError) {
    console.error("Failed to upload submission media", uploadError);
    await supabase.from("user_submissions").delete().eq("id", data.id);
    submissionRedirect("submission-failed");
  }

  revalidateSubmissionPaths();
  submissionRedirect("submission-created");
}

export async function approveSubmissionAction(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");

  if (!supabase || !id || !admin) {
    adminReviewRedirect("submission-review-failed");
  }

  const { data: submission, error: loadError } = await supabase
    .from("user_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (loadError || !submission || submission.review_status === "approved") {
    adminReviewRedirect("submission-review-failed");
  }

  const { data: resource, error: resourceError } = await supabase
    .from("resources")
    .insert({
      title: submission.title,
      slug: createSlug(submission.slug || submission.title),
      description: submission.summary,
      content: submission.content,
      category: submission.category,
      tags: submission.tags,
      official_url: submission.resource_url,
      source_url: submission.resource_url,
      cover_image_url: submission.cover_image_url,
      media_type: submission.media_type,
      media_url: submission.media_url,
      media_file_name: submission.media_file_name,
      resource_type: submission.submission_type === "tool" ? "tool" : "resource",
      is_published: true,
      requires_login: true,
      rating: 3,
      sort_order: 100,
      published_at: new Date().toISOString(),
      source_submission_id: submission.id,
      contributor_user_id: submission.user_id,
    })
    .select()
    .single();

  if (resourceError) {
    console.error("Failed to publish submission", resourceError.message);
    adminReviewRedirect("submission-review-failed");
  }

  const { error } = await supabase
    .from("user_submissions")
    .update({
      status: "approved",
      review_status: "approved",
      review_reason: null,
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
      published_resource_id: resource.id,
    })
    .eq("id", submission.id);

  if (error) {
    console.error("Failed to approve submission", error.message);
    adminReviewRedirect("submission-review-failed");
  }

  await supabase
    .from("users")
    .update({ reputation: 1 })
    .eq("id", submission.user_id)
    .lt("reputation", 1);

  revalidateSubmissionPaths();
  adminReviewRedirect("submission-approved");
}

export async function rejectSubmissionAction(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");
  const reason = cleanText(formText(formData, "review_reason"), 1000);

  if (!supabase || !id || !admin) {
    adminReviewRedirect("submission-review-failed");
  }

  const { error } = await supabase
    .from("user_submissions")
    .update({
      status: "rejected",
      review_status: "rejected",
      review_reason: reason || "内容暂不符合收录标准。",
      reviewed_by: admin.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to reject submission", error.message);
    adminReviewRedirect("submission-review-failed");
  }

  revalidateSubmissionPaths();
  adminReviewRedirect("submission-rejected");
}

export async function deleteSubmissionAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const id = formText(formData, "id");

  if (!supabase || !id) {
    adminReviewRedirect("submission-review-failed");
  }

  const { error } = await supabase
    .from("user_submissions")
    .update({ status: "deleted" })
    .eq("id", id);

  if (error) {
    console.error("Failed to delete submission", error.message);
    adminReviewRedirect("submission-review-failed");
  }

  revalidateSubmissionPaths();
  adminReviewRedirect("submission-deleted");
}

export async function restrictSubmissionUserAction(formData: FormData) {
  await requireAdmin();
  const supabase = getSupabaseServiceClient();
  const userId = formText(formData, "user_id");

  if (!supabase || !userId) {
    adminReviewRedirect("submission-review-failed");
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  const { error } = await supabase
    .from("users")
    .update({
      status: "restricted",
      can_submit: false,
      violation_count: (user?.violation_count ?? 0) + 1,
    })
    .eq("id", userId);

  if (error) {
    console.error("Failed to restrict user", error.message);
    adminReviewRedirect("submission-review-failed");
  }

  revalidateSubmissionPaths();
  adminReviewRedirect("submission-user-restricted");
}
