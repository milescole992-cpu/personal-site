import Link from "next/link";
import type { Resource } from "@/lib/supabase";
import { getResourceSlug } from "@/lib/slug";

export function HomeResourcePreviewCard({ resource }: { resource: Resource }) {
  return (
    <Link
      href={`/resources/${getResourceSlug(resource)}`}
      className="block rounded-md border border-white/10 bg-white/[0.03] p-3 transition hover:border-cyan-300/30 hover:bg-white/[0.05]"
    >
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="rounded bg-cyan-300/8 px-1.5 py-0.5 text-[10px] text-cyan-100">
          {resource.category}
        </span>
        {resource.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="text-[10px] text-slate-600">
            #{tag}
          </span>
        ))}
      </div>
      <h3 className="line-clamp-1 text-sm font-semibold text-white">{resource.title}</h3>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
        {resource.description}
      </p>
    </Link>
  );
}
