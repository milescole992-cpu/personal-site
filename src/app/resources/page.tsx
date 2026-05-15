import type { Metadata } from "next";
import { auth } from "@/auth";
import { SectionContentPage } from "@/components/section-content-page";
import {
  getContentPageBySlug,
  getOrCreateUser,
  getResourcesByPlacement,
} from "@/lib/data";
import { absoluteUrl, siteName } from "@/lib/seo";

type ResourcesPageProps = {
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
  const page = await getContentPageBySlug("resources");
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
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
    },
  };
}

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const [session, page, params] = await Promise.all([
    auth(),
    getContentPageBySlug("resources"),
    searchParams,
  ]);
  const user = session?.user ? await getOrCreateUser(session.user) : null;
  const resources = await getResourcesByPlacement(page.placement_slug, user);

  return (
    <SectionContentPage
      page={page}
      resources={resources}
      searchParams={(await params) ?? {}}
      variant="resource-library"
    />
  );
}
