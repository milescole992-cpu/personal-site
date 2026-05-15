import Link from "next/link";
import type { Resource } from "@/lib/supabase";
import { getResourceSlug } from "@/lib/slug";

export function ResourceMiniCard({
  resource,
  showFeaturedBadge = true,
}: {
  resource: Resource;
  showFeaturedBadge?: boolean;
}) {
  return (
    <Link
      href={`/resources/${getResourceSlug(resource)}`}
      className="block rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:border-cyan-300/35 hover:bg-white/[0.06]"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-cyan-300/8 px-2 py-1 text-xs text-cyan-100">
          {resource.category}
        </span>
        <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-500">
          推荐 {resource.rating}/5
        </span>
        {showFeaturedBadge && resource.is_featured ? (
          <span className="rounded-md bg-amber-300/8 px-2 py-1 text-xs text-amber-100">
            推荐
          </span>
        ) : null}
      </div>
      <h3 className="text-base font-semibold text-white">{resource.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
        {resource.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {resource.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="text-xs text-slate-500">
            #{tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
