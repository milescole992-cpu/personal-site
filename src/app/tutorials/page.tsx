import type { Metadata } from "next";
import { BookOpenText } from "lucide-react";
import { CardShell } from "@/components/card-shell";
import { ResourceMiniCard } from "@/components/resource-mini-card";
import { getResourcesByView } from "@/lib/data";
import { absoluteUrl, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI 教程",
  description: "AI 工具教程、TikTok AI 运营、工程 AI 应用和产品化实验的内容入口。",
  alternates: { canonical: absoluteUrl("/tutorials") },
  openGraph: {
    title: `AI 教程 | ${siteName}`,
    description: "AI 教程内容入口。",
    url: absoluteUrl("/tutorials"),
    siteName,
  },
};

export const dynamic = "force-dynamic";

export default async function TutorialsPage() {
  const tutorials = await getResourcesByView("tutorials");

  return (
    <main className="min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <CardShell className="p-6 sm:p-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 font-mono text-xs text-cyan-100">
            <BookOpenText size={14} />
            TUTORIALS
          </div>
          <h1 className="text-3xl font-semibold text-white">AI 教程</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            这里只展示后台发布到“教程页”的内容。后续可以扩展为文章、视频、附件和工作流步骤混合的 CMS 内容页。
          </p>
        </CardShell>
        {tutorials.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tutorials.map((resource) => (
              <ResourceMiniCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <CardShell>
            <h2 className="text-lg font-semibold text-white">教程内容正在搭建</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              在后台新增内容，并选择发布位置“教程页”后，这里会自动展示。
            </p>
          </CardShell>
        )}
      </div>
    </main>
  );
}
