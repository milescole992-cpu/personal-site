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
    <ul className="divide-y divide-white/8">
      {visibleItems.map((resource, index) => (
        <li key={resource.id}>
          <Link
            href={`/resources/${getResourceSlug(resource)}`}
            className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-2 py-2 text-xs transition hover:bg-white/[0.04]"
          >
            <span className="font-mono text-[10px] text-slate-600">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 truncate font-medium text-slate-200 hover:text-cyan-100">
              {resource.title}
            </span>
            <span className="shrink-0 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500">
              {resource.category}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
