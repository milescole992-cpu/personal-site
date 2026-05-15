import type { Metadata } from "next";
import { ArticleList } from "@/components/article-list";
import { FocusSection } from "@/components/focus-section";
import { HeroSection } from "@/components/hero-section";
import { RecommendationGrid } from "@/components/recommendation-grid";
import { SearchPanel } from "@/components/search-panel";
import { Sidebar } from "@/components/sidebar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ToolGrid } from "@/components/tool-grid";
import {
  getAllResources,
  getHomeSections,
  getSiteSettings,
} from "@/lib/data";
import { absoluteUrl, siteDescription, siteName } from "@/lib/seo";
import { getResourceSlug } from "@/lib/slug";

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

export default async function Home() {
  const [settings, homeSections, resources] = await Promise.all([
    getSiteSettings(),
    getHomeSections(),
    getAllResources(),
  ]);
  const featuredResources = resources
    .filter((resource) => resource.is_featured || resource.rating >= 5)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#070914] text-slate-100">
      <SiteHeader />
      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
        <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-8">
            <HeroSection settings={settings} />
            <FocusSection />
            <RecommendationGrid sections={homeSections} settings={settings} />
            <section>
              <div className="mb-4">
                <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-300/70">
                  Featured
                </p>
                <h2 className="text-lg font-semibold text-slate-50">
                  {settings.homepage_featured_title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {settings.homepage_featured_description}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {featuredResources.map((resource) => (
                  <a
                    key={resource.id}
                    href={`/resources/${getResourceSlug(resource)}`}
                    className="rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:border-cyan-300/35 hover:bg-white/[0.06]"
                  >
                    <span className="text-xs text-cyan-200">
                      {resource.category}
                    </span>
                    <h3 className="mt-2 text-base font-semibold text-white">
                      {resource.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                      {resource.description}
                    </p>
                  </a>
                ))}
              </div>
            </section>
            <SearchPanel />
            <ToolGrid />
            <ArticleList />
          </div>
          <Sidebar />
        </div>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
