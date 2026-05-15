import Link from "next/link";
import type { Resource } from "@/lib/supabase";
import { HOME_PREVIEW_LIMIT } from "@/lib/data";
import { HomeResourceLinkList } from "./home-resource-link-list";
import { HomeResourcePreviewCard } from "./home-resource-preview-card";

const PREVIEW_MAX = HOME_PREVIEW_LIMIT;

type HomePreviewSectionProps = {
  eyebrow: string;
  title: string;
  description?: string;
  resources: Resource[];
  moreHref: string;
  variant: "card" | "list";
  eyebrowClassName?: string;
};

export function HomePreviewSection({
  eyebrow,
  title,
  description,
  resources,
  moreHref,
  variant,
  eyebrowClassName = "text-cyan-300/70",
}: HomePreviewSectionProps) {
  const visibleItems = resources.slice(0, PREVIEW_MAX);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-3xl">
      <div className="mb-2.5 flex items-start justify-between gap-4 border-b border-white/8 pb-2.5">
        <div className="min-w-0 flex-1">
          <p
            className={`mb-0.5 font-mono text-[10px] uppercase tracking-[0.24em] ${eyebrowClassName}`}
          >
            {eyebrow}
          </p>
          <h2 className="text-base font-semibold text-slate-50">{title}</h2>
          {description ? (
            <p className="mt-1 line-clamp-1 text-xs leading-5 text-slate-500">
              {description}
            </p>
          ) : null}
        </div>
        <Link
          href={moreHref}
          className="inline-flex shrink-0 items-center rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15"
        >
          查看更多 →
        </Link>
      </div>

      {variant === "card" ? (
        <div className="grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
          {visibleItems.map((resource) => (
            <HomeResourcePreviewCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <HomeResourceLinkList resources={visibleItems} maxItems={PREVIEW_MAX} />
      )}
    </section>
  );
}
