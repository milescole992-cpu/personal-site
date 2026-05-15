import type { MetadataRoute } from "next";
import { getAllResources } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";
import { getResourceSlug } from "@/lib/slug";

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
    {
      url: absoluteUrl("/tools"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/roadmap"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: absoluteUrl("/workflows"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: absoluteUrl("/tutorials"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    ...resources.map((resource) => ({
      url: absoluteUrl(`/resources/${getResourceSlug(resource)}`),
      lastModified: new Date(resource.updated_at || resource.published_at),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
  ];
}
