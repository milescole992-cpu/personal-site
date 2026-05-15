import type { Metadata } from "next";
import { Route } from "lucide-react";
import { CardShell } from "@/components/card-shell";
import { ResourceMiniCard } from "@/components/resource-mini-card";
import { getResourcesByPlacement } from "@/lib/data";
import { absoluteUrl, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI 新手路线",
  description: "面向 AI 新手、TikTok AI 运营、工程 AI 应用和未来 SaaS 实验的学习路线入口。",
  alternates: { canonical: absoluteUrl("/roadmap") },
  openGraph: {
    title: `AI 新手路线 | ${siteName}`,
    description: "把 AI 学习和应用路径拆成可执行阶段。",
    url: absoluteUrl("/roadmap"),
    siteName,
  },
};

export const dynamic = "force-dynamic";

export default async function RoadmapPage() {
  const roadmapItems = await getResourcesByPlacement("roadmap");
  const saasItems = await getResourcesByPlacement("saas-products");

  return (
    <main className="min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <CardShell className="p-6 sm:p-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 font-mono text-xs text-cyan-100">
            <Route size={14} />
            ROADMAP
          </div>
          <h1 className="text-3xl font-semibold text-white">AI 新手路线</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            这个页面只展示后台发布到“新手路线页”的内容。后续可以升级为独立 roadmap_items 模型。
          </p>
        </CardShell>

        {roadmapItems.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {roadmapItems.map((resource) => (
              <ResourceMiniCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <CardShell>
            <h2 className="text-lg font-semibold text-white">路线内容暂无发布</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              在后台新增内容，并选择发布位置“新手路线页”后，这里会自动展示。
            </p>
          </CardShell>
        )}

        <CardShell id="saas" className="p-5">
          <h2 className="text-lg font-semibold text-white">未来 SaaS 产品入口</h2>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            这里读取后台发布到“SaaS产品区”的内容；没有发布内容时只保留产品入口空状态。
          </p>
          {saasItems.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {saasItems.map((resource) => (
                <ResourceMiniCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-500">
              暂无 SaaS 产品内容。
            </p>
          )}
        </CardShell>
      </div>
    </main>
  );
}
