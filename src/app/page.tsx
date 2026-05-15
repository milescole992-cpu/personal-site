import type { Metadata } from "next";
import { HeroSection } from "@/components/hero-section";
import { HomePreviewSection } from "@/components/home-preview-section";
import { RecommendationGrid } from "@/components/recommendation-grid";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  HOME_PREVIEW_LIMIT,
  getContentPages,
  getContentPlacements,
  getHomeSections,
  getResourcesByPlacement,
  getSiteSettings,
  resolvePlacementMoreHref,
} from "@/lib/data";
import { absoluteUrl, siteDescription, siteName } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: settings.seo_title || "海外 AI 资源筛选与 AI 工作流分享站",
    description: settings.seo_description || siteDescription,
    alternates: {
      canonical: absoluteUrl(),
    },
    openGraph: {
      title: settings.seo_title,
      description: settings.seo_description,
      url: absoluteUrl(),
      siteName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seo_title,
      description: settings.seo_description,
    },
  };
}

export const dynamic = "force-dynamic";

function previewMoreHref(
  placementSlug: string,
  contentPages: Awaited<ReturnType<typeof getContentPages>>,
  contentPlacements: Awaited<ReturnType<typeof getContentPlacements>>,
) {
  return resolvePlacementMoreHref(placementSlug, contentPages, contentPlacements);
}

export default async function Home() {
  const [
    settings,
    homeSections,
    contentPages,
    contentPlacements,
    featuredResources,
    hotResources,
    latestResources,
  ] = await Promise.all([
    getSiteSettings(),
    getHomeSections(),
    getContentPages(),
    getContentPlacements(),
    getResourcesByPlacement("home-featured"),
    getResourcesByPlacement("home-hot"),
    getResourcesByPlacement("home-latest"),
  ]);

  const featuredPreview = featuredResources.slice(0, HOME_PREVIEW_LIMIT);
  const hotPreview = hotResources.slice(0, HOME_PREVIEW_LIMIT);
  const latestPreview = latestResources.slice(0, HOME_PREVIEW_LIMIT);

  const featuredMoreHref = previewMoreHref(
    "home-featured",
    contentPages,
    contentPlacements,
  );
  const hotMoreHref = previewMoreHref("home-hot", contentPages, contentPlacements);
  const latestMoreHref = previewMoreHref(
    "home-latest",
    contentPages,
    contentPlacements,
  );

  const showFeatured =
    settings.show_homepage_featured && featuredPreview.length > 0;
  const showHot = settings.show_homepage_hot && hotPreview.length > 0;
  const showLatest = settings.show_homepage_latest && latestPreview.length > 0;

  return (
    <div className="min-h-screen bg-[#070914] text-slate-100">
      <SiteHeader />
      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
        <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />

        <div className="space-y-10">
          <HeroSection settings={settings} />
          <RecommendationGrid sections={homeSections} />

          {(showFeatured || showHot || showLatest) ? (
            <div className="flex max-w-3xl flex-col gap-10">
              {showFeatured ? (
                <HomePreviewSection
                  eyebrow="Featured"
                  title={settings.homepage_featured_title}
                  description={settings.homepage_featured_description}
                  resources={featuredPreview}
                  moreHref={featuredMoreHref}
                  variant="card"
                />
              ) : null}

              {showHot ? (
                <HomePreviewSection
                  eyebrow="Hot"
                  title="热门内容"
                  resources={hotPreview}
                  moreHref={hotMoreHref}
                  variant="list"
                  eyebrowClassName="text-pink-300/70"
                />
              ) : null}

              {showLatest ? (
                <HomePreviewSection
                  eyebrow="Latest"
                  title="最新发布"
                  resources={latestPreview}
                  moreHref={latestMoreHref}
                  variant="list"
                  eyebrowClassName="text-emerald-300/70"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
