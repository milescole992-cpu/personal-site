import { recommendedLinks } from "@/data/mock";
import { CardShell } from "./card-shell";
import { SectionHeader } from "./section-header";

export function RecommendationGrid() {
  return (
    <section>
      <SectionHeader eyebrow="Start Here" title="核心入口" action="全部资源" />
      <div className="grid gap-4 sm:grid-cols-2">
        {recommendedLinks.map((item) => {
          const Icon = item.icon;
          return (
            <CardShell key={item.title} glow={item.accent as never}>
              <a href={item.href} className="block">
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-md border border-white/10 bg-white/6 text-cyan-200">
                    <Icon size={19} />
                  </span>
                  <span className="font-mono text-xs text-slate-600">FOCUS</span>
                </div>
                <h3 className="text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>
              </a>
            </CardShell>
          );
        })}
      </div>
    </section>
  );
}
