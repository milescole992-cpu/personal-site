import { Flame, TrendingUp } from "lucide-react";
import { hotArticles } from "@/data/mock";
import { CardShell } from "./card-shell";
import { SectionHeader } from "./section-header";

export function HotList() {
  return (
    <section>
      <SectionHeader eyebrow="Ranking" title="热门文章" />
      <CardShell className="p-0">
        <ol className="divide-y divide-white/8">
          {hotArticles.map((article, index) => (
            <li key={article.id}>
              <a
                href="#"
                className="flex gap-3 px-4 py-3 transition hover:bg-white/5"
              >
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-white/6 font-mono text-xs text-cyan-200">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-100">
                    {article.title}
                  </span>
                  <span className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Flame size={12} />
                      {article.views} 阅读
                    </span>
                    <span>{article.date}</span>
                  </span>
                </span>
                <TrendingUp size={15} className="mt-1 text-slate-600" />
              </a>
            </li>
          ))}
        </ol>
      </CardShell>
    </section>
  );
}
