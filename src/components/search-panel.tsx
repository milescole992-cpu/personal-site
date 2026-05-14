import { Command, Hash, Search } from "lucide-react";
import { tags } from "@/data/mock";
import { CardShell } from "./card-shell";

export function SearchPanel() {
  return (
    <CardShell className="p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-3 rounded-md border border-white/10 bg-black/24 px-4 py-3">
          <Search size={18} className="text-cyan-200" />
          <input
            aria-label="搜索"
            placeholder="搜索占位：输入 ChatGPT、AI搜索、图片生成、工作流教程"
            className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />
          <Command size={16} className="hidden text-slate-600 sm:block" />
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 5).map((tag) => (
            <a
              key={tag}
              href="#"
              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-100"
            >
              <Hash size={12} />
              {tag}
            </a>
          ))}
        </div>
      </div>
    </CardShell>
  );
}
