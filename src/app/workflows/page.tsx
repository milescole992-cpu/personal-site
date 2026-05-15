import type { Metadata } from "next";
import { Workflow } from "lucide-react";
import { CardShell } from "@/components/card-shell";
import { ResourceMiniCard } from "@/components/resource-mini-card";
import { getResourcesByView } from "@/lib/data";
import { absoluteUrl, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI 工作流",
  description: "沉淀 AI 内容创作、资料整理、自动化发布和工程数字化的可复用工作流。",
  alternates: { canonical: absoluteUrl("/workflows") },
  openGraph: {
    title: `AI 工作流 | ${siteName}`,
    description: "AI 工作流内容入口。",
    url: absoluteUrl("/workflows"),
    siteName,
  },
};

export default async function WorkflowsPage() {
  const workflows = await getResourcesByView("workflows");

  return (
    <main className="min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <CardShell className="p-6 sm:p-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 font-mono text-xs text-cyan-100">
            <Workflow size={14} />
            WORKFLOWS
          </div>
          <h1 className="text-3xl font-semibold text-white">AI 工作流</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            当前优先展示资源库中与工作流、自动化和内容生产有关的条目。
            第二阶段会扩展独立工作流模型和分步骤教程内容。
          </p>
        </CardShell>
        {workflows.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workflows.map((resource) => (
              <ResourceMiniCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <CardShell>
            <h2 className="text-lg font-semibold text-white">工作流内容正在搭建</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              后台可以先把资源类型设置为 `workflow`，页面会自动展示。
            </p>
          </CardShell>
        )}
      </div>
    </main>
  );
}
