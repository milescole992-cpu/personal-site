import { getSupabaseServiceClient } from "@/lib/supabase";

const BUCKET = "resource-media";
const MAX_BYTES = 50 * 1024 * 1024;

const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
]);

export type ResourceMediaType = "none" | "file" | "video" | "image" | "link";

export function inferMediaTypeFromMime(mimeType: string): ResourceMediaType {
  if (VIDEO_TYPES.has(mimeType)) {
    return "video";
  }
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  return "file";
}

export function sanitizeMediaFileName(name: string) {
  return name.replace(/[^\w.\-()+\u4e00-\u9fff]/g, "_").slice(0, 120);
}

export async function uploadResourceMediaFile(file: File, resourceId: string) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    throw new Error("Supabase 未配置，无法上传文件");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("文件不能超过 50MB");
  }

  const extension = file.name.includes(".")
    ? file.name.split(".").pop()?.toLowerCase()
    : "bin";
  const safeName = sanitizeMediaFileName(file.name);
  const path = `${resourceId}/${Date.now()}-${safeName || `file.${extension}`}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || undefined,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return {
    media_url: data.publicUrl,
    media_file_name: file.name,
    media_type: inferMediaTypeFromMime(file.type || "") as ResourceMediaType,
  };
}

export type ResolvedResourceMedia = {
  media_type: ResourceMediaType;
  media_url: string | null;
  media_file_name: string | null;
};

export async function resolveResourceMediaFromForm(
  formData: FormData,
  resourceId: string,
  current?: {
    media_type?: string | null;
    media_url?: string | null;
    media_file_name?: string | null;
  },
): Promise<ResolvedResourceMedia> {
  const file = formData.get("media_file");
  const clearMedia = formData.get("clear_media") === "on";
  const mediaTypeField = formData.get("media_type");

  if (clearMedia) {
    return {
      media_type: "none" as const,
      media_url: null,
      media_file_name: null,
    };
  }

  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadResourceMediaFile(file, resourceId);
    if (
      mediaTypeField === "video" ||
      mediaTypeField === "image" ||
      mediaTypeField === "file"
    ) {
      return { ...uploaded, media_type: mediaTypeField };
    }
    return uploaded;
  }

  const selectedType =
    typeof mediaTypeField === "string" ? mediaTypeField.trim() : "none";

  if (selectedType === "link") {
    const linkUrl = formData.get("media_url");
    const url = typeof linkUrl === "string" ? linkUrl.trim() : "";
    if (!url) {
      return {
        media_type: "none" as const,
        media_url: null,
        media_file_name: null,
      };
    }
    return {
      media_type: "link" as const,
      media_url: url,
      media_file_name: current?.media_file_name ?? null,
    };
  }

  if (selectedType === "none") {
    return {
      media_type: "none" as const,
      media_url: null,
      media_file_name: null,
    };
  }

  return {
    media_type: (current?.media_type as ResourceMediaType) || "none",
    media_url: current?.media_url ?? null,
    media_file_name: current?.media_file_name ?? null,
  };
}
