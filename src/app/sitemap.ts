import type { MetadataRoute } from "next";
import { getAllResources } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const resources = await getAllResources();
  const now = new Date();

  return [
    {
      url: absoluteUrl(),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/resources"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...resources
      .filter((resource) => resource.slug)
      .map((resource) => ({
        url: absoluteUrl(`/resources/${resource.slug}`),
        lastModified: new Date(resource.updated_at || resource.published_at),
        changeFrequency: "weekly" as const,
        priority: 0.75,
      })),
  ];
}
