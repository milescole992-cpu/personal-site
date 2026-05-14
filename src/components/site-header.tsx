import { GitBranch, Menu, MoonStar, Search } from "lucide-react";
import { navItems } from "@/data/mock";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070914]/82 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 font-mono text-sm font-bold text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
            AI
          </span>
          <span>
            <span className="block text-sm font-semibold text-white">
              AI资源工作台
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
              Tools & Workflow
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/8 hover:text-cyan-100"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="搜索"
            className="grid size-9 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-100"
          >
            <Search size={16} />
          </button>
          <button
            type="button"
            aria-label="暗色模式"
            className="hidden size-9 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-100 sm:grid"
          >
            <MoonStar size={16} />
          </button>
          <button
            type="button"
            aria-label="代码仓库"
            className="hidden size-9 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-100 sm:grid"
          >
            <GitBranch size={16} />
          </button>
          <button
            type="button"
            aria-label="菜单"
            className="grid size-9 place-items-center rounded-md border border-white/10 bg-white/5 text-slate-300 md:hidden"
          >
            <Menu size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
