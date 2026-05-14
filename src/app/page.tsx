import { ArticleList } from "@/components/article-list";
import { FocusSection } from "@/components/focus-section";
import { HeroSection } from "@/components/hero-section";
import { RecommendationGrid } from "@/components/recommendation-grid";
import { SearchPanel } from "@/components/search-panel";
import { Sidebar } from "@/components/sidebar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ToolGrid } from "@/components/tool-grid";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#070914] text-slate-100">
      <SiteHeader />
      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
        <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-8">
            <HeroSection />
            <FocusSection />
            <RecommendationGrid />
            <SearchPanel />
            <ToolGrid />
            <ArticleList />
          </div>
          <Sidebar />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
