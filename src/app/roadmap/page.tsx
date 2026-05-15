import type { Metadata } from "next";
import { ArrowRight, Route } from "lucide-react";
import Link from "next/link";
import { CardShell } from "@/components/card-shell";
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

const lanes = [
  {
    title: "AI 新手基础路径",
    items: ["通用助手", "AI 搜索", "知识库", "提示词与模板", "个人工作流"],
  },
  {
    title: "TikTok AI 运营路径",
    items: ["选题研究", "脚本生成", "素材生产", "发布复盘", "商业转化"],
  },
  {
    title: "工程 AI 应用路径",
    items: ["工程资料", "造价辅助", "投标文档", "项目管理", "垂直工具"],
  },
  {
    title: "SaaS 实验路径",
    items: ["痛点验证", "MVP", "自动化", "支付与权限", "产品化运营"],
  },
];

export default function RoadmapPage() {
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
            这里先作为 CMS 化路线入口，后续第二阶段可以升级为 `roadmap_items` 表，
            用后台维护每个阶段、关联资源、教程和完成状态。
          </p>
        </CardShell>

        <div className="grid gap-4 md:grid-cols-2">
          {lanes.map((lane) => (
            <CardShell key={lane.title} className="p-5">
              <h2 className="text-lg font-semibold text-white">{lane.title}</h2>
              <div className="mt-4 space-y-3">
                {lane.items.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] px-3 py-3"
                  >
                    <span className="grid size-7 place-items-center rounded-md bg-cyan-300/10 font-mono text-xs text-cyan-100">
                      {index + 1}
                    </span>
                    <span className="text-sm text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </CardShell>
          ))}
        </div>

        <CardShell id="saas" className="p-5">
          <h2 className="text-lg font-semibold text-white">未来 SaaS 产品入口</h2>
          <p className="mt-2 text-sm leading-7 text-slate-400">
            这里预留 AI 造价、投标辅助、内容自动化、工程资料管理等垂直产品入口。
            当前先沉淀内容与资源，等需求明确后再接产品页、订阅和权限。
          </p>
          <Link
            href="/resources"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950"
          >
            先看资源库 <ArrowRight size={15} />
          </Link>
        </CardShell>
      </div>
    </main>
  );
}
