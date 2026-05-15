import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { SectionContentPage } from "@/components/section-content-page";
import {
  getContentPageByPath,
  getOrCreateUser,
  getResourcesByPlacement,
  normalizeContentPagePath,
} from "@/lib/data";
import { absoluteUrl, siteName } from "@/lib/seo";

type DynamicContentPageProps = {
  params: Promise<{
    contentPath: string[];
  }>;
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

function pathFromSegments(segments: string[]) {
  return normalizeContentPagePath(segments.join("/"));
}

export async function generateMetadata({
  params,
}: DynamicContentPageProps): Promise<Metadata> {
  const { contentPath } = await params;
  const pagePath = pathFromSegments(contentPath);
  const page = await getContentPageByPath(pagePath);

  if (!page) {
    return {};
  }

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

export default async function DynamicContentPage({
  params,
  searchParams,
}: DynamicContentPageProps) {
  const [{ contentPath }, query, session] = await Promise.all([
    params,
    searchParams,
    auth(),
  ]);
  const pagePath = pathFromSegments(contentPath);
  const page = await getContentPageByPath(pagePath);

  if (!page) {
    notFound();
  }

  const user = session?.user ? await getOrCreateUser(session.user) : null;
  const resources = await getResourcesByPlacement(page.placement_slug, user);

  return (
    <SectionContentPage
      page={page}
      resources={resources}
      searchParams={query ?? {}}
    />
  );
}
