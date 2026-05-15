import type { MetadataRoute } from "next";
import { getAllResources, getContentPages } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";
import { getResourceSlug } from "@/lib/slug";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const resources = await getAllResources();
  const contentPages = await getContentPages();
  const now = new Date();

  return [
    {
      url: absoluteUrl(),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...contentPages.map((page) => ({
      url: absoluteUrl(page.page_path),
      lastModified: page.updated_at ? new Date(page.updated_at) : now,
      changeFrequency: page.slug === "resources" ? ("daily" as const) : ("weekly" as const),
      priority: page.slug === "resources" ? 0.9 : 0.75,
    })),
    ...resources.map((resource) => ({
      url: absoluteUrl(`/resources/${getResourceSlug(resource)}`),
      lastModified: new Date(resource.updated_at || resource.published_at),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  ];
}
