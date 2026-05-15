import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/hero-section";
import { RecommendationGrid } from "@/components/recommendation-grid";
import { ResourceMiniCard } from "@/components/resource-mini-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  getHomeSections,
  getResourcesByPlacement,
  getSiteSettings,
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

function EmptyCmsBlock({ title, href }: { title: string; href: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        后台暂未发布内容到这个位置。进入管理后台选择对应发布位置后，这里会自动出现内容。
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex rounded-md border border-cyan-300/25 bg-cyan-300/8 px-3 py-2 text-sm font-semibold text-cyan-100"
      >
        查看页面
      </Link>
    </div>
  );
}

export default async function Home() {
  const [settings, homeSections, featuredResources, hotResources, latestResources] =
    await Promise.all([
      getSiteSettings(),
      getHomeSections(),
      getResourcesByPlacement("home-featured"),
      getResourcesByPlacement("home-hot"),
      getResourcesByPlacement("home-latest"),
    ]);

  return (
    <div className="min-h-screen bg-[#070914] text-slate-100">
      <SiteHeader />
      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
        <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />

        <div className="space-y-8">
          <HeroSection settings={settings} />
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
            {featuredResources.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {featuredResources.slice(0, 4).map((resource) => (
                  <ResourceMiniCard key={resource.id} resource={resource} />
                ))}
              </div>
            ) : (
              <EmptyCmsBlock title="首页精选暂无内容" href="/resources" />
            )}
          </section>

          {hotResources.length > 0 ? (
            <section>
              <div className="mb-4">
                <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.28em] text-pink-300/70">
                  Hot
                </p>
                <h2 className="text-lg font-semibold text-slate-50">热门内容</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {hotResources.slice(0, 6).map((resource) => (
                  <ResourceMiniCard key={resource.id} resource={resource} />
                ))}
              </div>
            </section>
          ) : null}

          {latestResources.length > 0 ? (
            <section>
              <div className="mb-4">
                <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.28em] text-emerald-300/70">
                  Latest
                </p>
                <h2 className="text-lg font-semibold text-slate-50">最新发布</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {latestResources.slice(0, 6).map((resource) => (
                  <ResourceMiniCard key={resource.id} resource={resource} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
