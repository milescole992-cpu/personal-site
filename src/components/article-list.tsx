import { CalendarDays, Eye, Timer } from "lucide-react";
import { latestArticles } from "@/data/mock";
import { CardShell } from "./card-shell";
import { SectionHeader } from "./section-header";

export function ArticleList() {
  return (
    <section id="articles">
      <SectionHeader eyebrow="Latest" title="最新文章" action="查看更多" />
      <div className="space-y-3">
        {latestArticles.map((article) => (
          <CardShell key={article.id} className="p-4" glow="none">
            <a
              href="#"
              className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-cyan-300/20 bg-cyan-300/8 px-2 py-1 text-xs text-cyan-100">
                    {article.category}
                  </span>
                  <span className="font-mono text-xs text-slate-600">
                    {article.id.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-100 transition group-hover:text-cyan-100">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {article.excerpt}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-500 sm:justify-end">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={13} />
                  {article.date}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Timer size={13} />
                  {article.readTime}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye size={13} />
                  {article.views}
                </span>
              </div>
            </a>
          </CardShell>
        ))}
      </div>
    </section>
  );
}
