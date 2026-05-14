import { ArrowUpRight, Download, FileText, Lock, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { CardShell } from "@/components/card-shell";
import { resources } from "@/data/mock";

export const metadata = {
  title: "资源下载 | AI资源工作台",
  description: "AI资源、海外AI工具筛选表和AI工作流教程下载页。",
};

export default async function ResourcesPage() {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const loginHref = "/login?callbackUrl=/resources";

  return (
    <main className="relative min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />

      <div className="mx-auto max-w-7xl space-y-6">
        <CardShell className="p-6 sm:p-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 font-mono text-xs text-cyan-100">
            <Sparkles size={14} />
            RESOURCE LIBRARY
          </div>
          <h1 className="text-3xl font-semibold text-white">AI资源下载</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            这里是对外开放的AI资源库占位。访客可以查看资源介绍；
            登录后可以看到模拟下载入口。后期可以接数据库、对象存储和真实下载统计。
          </p>
        </CardShell>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
            <CardShell key={resource.id} className="flex h-full flex-col p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/8 text-cyan-100">
                  <FileText size={18} />
                </span>
                <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-400">
                  {resource.category}
                </span>
              </div>

              <h2 className="text-base font-semibold text-white">
                {resource.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">
                {resource.description}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-500">
                <span className="rounded-md bg-white/5 px-2 py-2">
                  {resource.format}
                </span>
                <span className="rounded-md bg-white/5 px-2 py-2">
                  {resource.level}
                </span>
                <span className="rounded-md bg-white/5 px-2 py-2">
                  {resource.updatedAt}
                </span>
              </div>

              <div className="mt-5 flex gap-2">
                <a
                  href="#"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/6 px-3 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/40 hover:bg-white/10"
                >
                  查看详情 <ArrowUpRight size={15} />
                </a>
                {isLoggedIn ? (
                  <a
                    href={resource.downloadUrl}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  >
                    模拟下载 <Download size={15} />
                  </a>
                ) : (
                  <a
                    href={loginHref}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  >
                    登录下载 <Lock size={15} />
                  </a>
                )}
              </div>
            </CardShell>
          ))}
        </div>
      </div>
    </main>
  );
}
