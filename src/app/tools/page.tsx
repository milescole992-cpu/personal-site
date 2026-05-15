import type { Metadata } from "next";
import { Search, Wrench } from "lucide-react";
import { CardShell } from "@/components/card-shell";
import { ResourceMiniCard } from "@/components/resource-mini-card";
import { getResourcesByView } from "@/lib/data";
import { absoluteUrl, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI 工具库",
  description: "从资源库中按工具视角筛选可用的海外 AI 工具、创作工具、搜索工具和开发资源。",
  alternates: { canonical: absoluteUrl("/tools") },
  openGraph: {
    title: `AI 工具库 | ${siteName}`,
    description: "按场景筛选可长期使用的 AI 工具。",
    url: absoluteUrl("/tools"),
    siteName,
  },
};

export const dynamic = "force-dynamic";

export default async function ToolsPage() {
  const tools = await getResourcesByView("tools");
  const categories = Array.from(new Set(tools.map((item) => item.category)));

  return (
    <main className="min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <CardShell className="p-6 sm:p-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 font-mono text-xs text-cyan-100">
            <Wrench size={14} />
            AI TOOL LIBRARY
          </div>
          <h1 className="text-3xl font-semibold text-white">AI 工具库</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            这是资源库的工具视角，优先筛选通用助手、AI 搜索、知识库、设计、图片、视频、音频和开发类工具。
            点击卡片进入详情页，再完成收藏、下载或访问。
          </p>
        </CardShell>

        {tools.length > 0 ? (
        <CardShell className="p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <Search size={17} className="text-cyan-200" />
              当前收录 {tools.length} 个工具，后续会扩展免费/付费、地区门槛和替代方案筛选。
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </CardShell>
        ) : null}

        {tools.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tools.map((resource) => (
              <ResourceMiniCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <CardShell>
            <h2 className="text-lg font-semibold text-white">工具内容暂无发布</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              在后台新增内容，并选择发布位置“AI工具页”后，这里会自动展示。
            </p>
          </CardShell>
        )}
      </div>
    </main>
  );
}
