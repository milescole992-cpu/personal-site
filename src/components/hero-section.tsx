import { ArrowRight, Orbit, Search, Sparkles } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(8,12,26,0.88)_48%,rgba(22,8,36,0.82))] p-6 shadow-2xl shadow-black/30 sm:p-8">
      <div className="absolute inset-0 cyber-grid opacity-45" />
      <div className="absolute -right-24 -top-28 size-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute -bottom-28 left-1/3 size-72 rounded-full bg-fuchsia-400/10 blur-3xl" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_280px] lg:items-end">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 font-mono text-xs text-cyan-100">
            <Sparkles size={14} />
            AI RESOURCE / GLOBAL TOOL / WORKFLOW
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
            AI资源分享与海外AI工具筛选
            <span className="block text-cyan-200">把能落地的工作流讲清楚</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            面向普通人、内容创作者、AI 工具玩家和副业创业者，持续筛选海外 AI 工具、
            整理可直接访问的资源入口，并把真实可复用的 AI 工作流拆成教程。
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/resources"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              进入 AI 资源库 <ArrowRight size={16} />
            </Link>
            <a
              href="#articles"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/12 bg-white/6 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-fuchsia-300/40 hover:bg-white/10"
            >
              看工作流教程 <Orbit size={16} />
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/24 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">
            Quick Search
          </p>
          <div className="mt-3 flex items-center gap-3 rounded-md border border-cyan-300/20 bg-slate-950/70 px-3 py-3">
            <Search size={17} className="text-cyan-200" />
            <span className="text-sm text-slate-400">
              搜索AI资源 / 海外工具 / 工作流
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {["资源库", "工具筛选", "工作流"].map((item, index) => (
              <div key={item} className="rounded-md bg-white/5 px-2 py-3">
                <span className="block font-mono text-lg text-white">
                  0{index + 1}
                </span>
                <span className="text-xs text-slate-500">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
