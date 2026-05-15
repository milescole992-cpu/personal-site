import type { Metadata } from "next";
import { SectionContentPage } from "@/components/section-content-page";
import { getContentPageBySlug, getResourcesByPlacement } from "@/lib/data";
import { absoluteUrl, siteName } from "@/lib/seo";

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    audience?: string;
    use_case?: string;
    type?: string;
    flag?: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContentPageBySlug("roadmap");
  const title = page.seo_title || page.hero_title || page.title;
  const description = page.seo_description || page.hero_description || page.description || "";

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(page.page_path) },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: absoluteUrl(page.page_path),
      siteName,
    },
  };
}

export default async function RoadmapPage({ searchParams }: PageProps) {
  const [page, params] = await Promise.all([
    getContentPageBySlug("roadmap"),
    searchParams,
  ]);
  const resources = await getResourcesByPlacement(page.placement_slug);

  return (
    <SectionContentPage
      page={page}
      resources={resources}
      searchParams={params ?? {}}
    />
  );
}
