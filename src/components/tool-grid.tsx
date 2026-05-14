import { ArrowUpRight } from "lucide-react";
import { tools } from "@/data/mock";
import { CardShell } from "./card-shell";
import { SectionHeader } from "./section-header";

export function ToolGrid() {
  return (
    <section id="tools">
      <SectionHeader
        eyebrow="Toolbox"
        title="海外AI工具导航"
        action="进入资源库"
        actionHref="/resources"
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <a key={tool.name} href="/resources">
              <CardShell className="h-full p-4" glow="violet">
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-md border border-violet-300/20 bg-violet-300/8 text-violet-100">
                    <Icon size={18} />
                  </span>
                  <ArrowUpRight
                    size={15}
                    className="text-slate-600 transition group-hover:text-cyan-200"
                  />
                </div>
                <h3 className="text-sm font-semibold text-slate-100">
                  {tool.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {tool.description}
                </p>
              </CardShell>
            </a>
          );
        })}
      </div>
    </section>
  );
}
