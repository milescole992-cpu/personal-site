import Link from "next/link";
import type { HomeSectionWithPage } from "@/lib/supabase";
import { HOME_PREVIEW_LIMIT } from "@/lib/data";
import { CardShell } from "./card-shell";
import { IconBadge } from "./icon-badge";

function EntryCard({ item }: { item: HomeSectionWithPage }) {
  const body = (
    <>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="grid size-9 place-items-center rounded-md border border-white/10 bg-white/6 text-cyan-200">
          <IconBadge name={item.icon} />
        </span>
        {item.badge ? (
          <span className="font-mono text-[10px] text-slate-600">{item.badge}</span>
        ) : null}
      </div>
      <h3 className="line-clamp-1 text-base font-semibold text-white">{item.title}</h3>
      <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
        {item.description}
      </p>
      {!item.linked_page_path ? (
        <p className="mt-2 text-[10px] leading-4 text-amber-200/80">
          请在第二层挂载栏目页
        </p>
      ) : null}
    </>
  );

  if (item.linked_page_path) {
    return (
      <CardShell className="!p-4">
        <Link href={item.linked_page_path} className="block">
          {body}
        </Link>
      </CardShell>
    );
  }

  return <CardShell className="!p-4 opacity-80">{body}</CardShell>;
}

export function RecommendationGrid({
  sections,
}: {
  sections: HomeSectionWithPage[];
}) {
  const entries = sections.slice(0, HOME_PREVIEW_LIMIT);

  return (
    <section>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
        <p className="mb-0.5 font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/70">
          Start Here
        </p>
        <h2 className="text-lg font-semibold text-slate-50">核心入口</h2>
        <p className="mt-1 text-xs text-slate-500">
          点击进入对应栏目，更多内容在二级页面查看。
        </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {entries.map((item) => (
          <EntryCard key={item.id} item={item} />
        ))}
        {entries.length === 0 ? (
          <CardShell className="col-span-2 !p-3 lg:col-span-4">
            <h3 className="text-sm font-semibold text-white">首页入口尚未配置</h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              请先在第一层创建入口，再在第二层挂载栏目页。
            </p>
          </CardShell>
        ) : null}
      </div>
    </section>
  );
}
