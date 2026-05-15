import type { HomeSection, SiteSettings } from "@/lib/supabase";
import { CardShell } from "./card-shell";
import { IconBadge } from "./icon-badge";
import { SectionHeader } from "./section-header";

export function RecommendationGrid({
  sections,
  settings,
}: {
  sections: HomeSection[];
  settings: SiteSettings;
}) {
  return (
    <section>
      <SectionHeader
        eyebrow="Start Here"
        title="核心入口"
        action={settings.homepage_featured_title}
        actionHref="/resources"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((item) => (
            <CardShell key={item.id} glow="cyan">
              <a href={item.href} className="block">
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-md border border-white/10 bg-white/6 text-cyan-200">
                    <IconBadge name={item.icon} />
                  </span>
                  <span className="font-mono text-xs text-slate-600">
                    {item.badge || item.section_type}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>
              </a>
            </CardShell>
        ))}
      </div>
    </section>
  );
}
