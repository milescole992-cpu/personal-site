import Link from "next/link";
import type { Resource } from "@/lib/supabase";
import { HOME_PREVIEW_LIMIT } from "@/lib/data";
import { getResourceSlug } from "@/lib/slug";

export function HomeResourceLinkList({
  resources,
  maxItems = HOME_PREVIEW_LIMIT,
}: {
  resources: Resource[];
  /** 首页预览最多条数，默认 4 */
  maxItems?: number;
}) {
  const visibleItems = resources.slice(0, maxItems);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <ul className="max-w-2xl divide-y divide-white/8 rounded-md border border-white/10 bg-white/[0.02]">
      {visibleItems.map((resource) => (
        <li key={resource.id}>
          <Link
            href={`/resources/${getResourceSlug(resource)}`}
            className="flex items-baseline justify-between gap-3 px-3 py-1.5 text-xs transition hover:bg-white/[0.04]"
          >
            <span className="min-w-0 truncate font-medium text-cyan-100 hover:underline">
              {resource.title}
            </span>
            <span className="shrink-0 text-[10px] text-slate-500">{resource.category}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
