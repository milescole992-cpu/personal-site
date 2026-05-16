import { FileText, Filter, Search, Sparkles, Target, UsersRound } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { CardShell } from "@/components/card-shell";
import { ResourceMiniCard } from "@/components/resource-mini-card";
import type { ContentPage } from "@/lib/supabase";
import type { ResourceWithState } from "@/lib/data";
import { getResourceSlug } from "@/lib/slug";

type SectionSearchParams = {
  q?: string;
  category?: string;
  tag?: string;
  audience?: string;
  use_case?: string;
  type?: string;
  flag?: string;
};

export function filterSectionResources(
  resources: ResourceWithState[],
  params: SectionSearchParams,
) {
  const q = (params.q || "").trim().toLowerCase();

  return resources.filter((resource) => {
    const text = [
      resource.title,
      resource.description,
      resource.category,
      resource.audience,
      resource.use_cases,
      resource.tags.join(" "),
      resource.resource_type,
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!q || text.includes(q)) &&
      (!params.category || resource.category === params.category) &&
      (!params.tag || resource.tags.includes(params.tag)) &&
      (!params.type || resource.resource_type === params.type) &&
      (!params.audience || resource.audience.includes(params.audience)) &&
      (!params.use_case || resource.use_cases.includes(params.use_case)) &&
      (!params.flag ||
        (params.flag === "featured" && resource.is_featured) ||
        (params.flag === "hot" && resource.is_hot))
    );
  });
}

export function SectionContentPage({
  page,
  resources,
  searchParams,
  variant = "compact",
}: {
  page: ContentPage;
  resources: ResourceWithState[];
  searchParams: SectionSearchParams;
  variant?: "compact" | "resource-library";
}) {
  const filteredResources = filterSectionResources(resources, searchParams);
  const categories = Array.from(
    new Set(resources.map((resource) => resource.category).filter(Boolean)),
  );
  const tags = Array.from(new Set(resources.flatMap((resource) => resource.tags)));
  const resourceTypes = Array.from(
    new Set(resources.map((resource) => resource.resource_type || "resource")),
  );
  const featured = resources.filter((resource) => resource.is_featured);
  const hot = resources.filter((resource) => resource.is_hot);
  const lastUpdated = resources
    .map((resource) => resource.updated_at || resource.published_at)
    .sort()
    .at(-1);
  const disabled = !page.is_active;
  const primaryCtaHref = page.primary_cta_href?.startsWith("/admin")
    ? "/submit"
    : page.primary_cta_href;
  const primaryCtaText = page.primary_cta_href?.startsWith("/admin")
    ? "投稿内容"
    : page.primary_cta_text;

  return (
    <main className="relative min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />

      <div className="mx-auto max-w-7xl space-y-6">
        <CardShell className="p-6 sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 font-mono text-xs text-cyan-100">
                <Sparkles size={14} />
                {page.hero_subtitle || page.title}
              </div>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                {page.hero_title || page.title}
              </h1>
              {page.hero_description ? (
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                  {page.hero_description}
                </p>
              ) : null}
              {primaryCtaText && primaryCtaHref ? (
                <Link
                  href={primaryCtaHref}
                  className="mt-5 inline-flex rounded-md border border-cyan-300/25 bg-cyan-300/10 px-4 py-2.5 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/50"
                >
                  {primaryCtaText}
                </Link>
              ) : null}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="内容" value={resources.length} />
              <Stat label="推荐" value={featured.length} />
              <Stat label="热门" value={hot.length} />
            </div>
          </div>
          {lastUpdated ? (
            <p className="mt-4 text-xs text-slate-600">
              最近更新：{new Date(lastUpdated).toLocaleDateString("zh-CN")}
            </p>
          ) : null}
        </CardShell>

        {disabled ? (
          <CardShell>
            <h2 className="text-lg font-semibold text-white">
              {page.empty_state_title || "栏目暂未启用"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {page.empty_state_description || "这个栏目正在整理中，请稍后再来。"}
            </p>
          </CardShell>
        ) : null}

        {!disabled && resources.length > 0 ? (
          <CardShell className="p-4">
            <form className="grid gap-4 lg:grid-cols-[1fr_auto]" action={page.page_path}>
              <label className="flex items-center gap-3 rounded-md border border-white/10 bg-black/24 px-4 py-3">
                <Search size={17} className="text-cyan-200" />
                <input
                  name="q"
                  defaultValue={searchParams.q}
                  placeholder="搜索标题、场景、标签、适合人群"
                  className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />
              </label>
              <button
                type="submit"
                className="rounded-md bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                搜索
              </button>
            </form>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/8 text-cyan-100">
                  <Filter size={17} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-white">筛选当前栏目</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    内容来自后台发布位置：{page.placement_slug}
                  </p>
                </div>
              </div>
              <FilterLinks
                pagePath={page.page_path}
                categories={categories}
                tags={tags}
                resourceTypes={resourceTypes}
              />
            </div>
          </CardShell>
        ) : null}

        {!disabled && resources.length === 0 ? (
          <CardShell>
            <h2 className="text-lg font-semibold text-white">
              {page.empty_state_title || "内容正在整理中"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {page.empty_state_description || "管理员发布内容到对应栏目后，这里会自动展示。"}
            </p>
          </CardShell>
        ) : null}

        {!disabled && resources.length > 0 && filteredResources.length === 0 ? (
          <CardShell>
            <h2 className="text-lg font-semibold text-white">没有匹配内容</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              换一个关键词、分类或标签再试试。
            </p>
          </CardShell>
        ) : null}

        {!disabled && variant === "resource-library" ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredResources.map((resource) => (
              <CardShell key={resource.id} className="flex h-full flex-col p-5">
                <div className="mb-4 flex flex-wrap items-start gap-2">
                  <span className="grid size-10 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/8 text-cyan-100">
                    <FileText size={18} />
                  </span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-400">
                    {resource.category}
                  </span>
                  {resource.is_featured ? (
                    <span className="rounded-md border border-amber-300/20 bg-amber-300/8 px-2.5 py-1 text-xs text-amber-100">
                      推荐
                    </span>
                  ) : null}
                  {resource.is_hot ? (
                    <span className="rounded-md border border-pink-300/20 bg-pink-300/8 px-2.5 py-1 text-xs text-pink-100">
                      热门
                    </span>
                  ) : null}
                </div>
                <ResourceMiniCard resource={resource} />
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <InfoBox icon={<UsersRound size={14} />} title="适合人群" text={resource.audience || "待补充"} />
                  <InfoBox icon={<Target size={14} />} title="使用场景" text={resource.use_cases || "待补充"} />
                </div>
              </CardShell>
            ))}
          </div>
        ) : null}

        {!disabled && variant === "compact" ? (
          <SectionResourceDirectory resources={filteredResources} />
        ) : null}
      </div>
    </main>
  );
}

function SectionResourceDirectory({
  resources,
}: {
  resources: ResourceWithState[];
}) {
  if (resources.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,720px)_1fr]">
      <CardShell className="p-4">
        <div className="mb-3 flex items-end justify-between gap-4 border-b border-white/8 pb-3">
          <div>
            <p className="mb-0.5 font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300/70">
              Directory
            </p>
            <h2 className="text-lg font-semibold text-white">内容目录</h2>
          </div>
          <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-500">
            {resources.length} 条
          </span>
        </div>
        <ul className="divide-y divide-white/8">
          {resources.map((resource, index) => (
            <li key={resource.id}>
              <Link
                href={`/resources/${getResourceSlug(resource)}`}
                className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-2 py-2.5 text-sm transition hover:bg-white/[0.04]"
              >
                <span className="font-mono text-[11px] text-slate-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 truncate font-medium text-slate-100">
                  {resource.title}
                </span>
                <span className="shrink-0 rounded bg-white/5 px-2 py-1 text-[11px] text-slate-500">
                  {resource.category || resource.resource_type}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardShell>

      <CardShell className="hidden p-4 lg:block" glow="none">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-600">
          Browse
        </p>
        <h3 className="mt-2 text-base font-semibold text-white">点击标题进入详情</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          二层栏目只做内容导航和筛选，具体介绍、收藏、下载和访问按钮放在三层详情页处理。
        </p>
      </CardShell>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 px-3 py-3">
      <p className="font-mono text-xl text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function FilterLinks({
  pagePath,
  categories,
  tags,
  resourceTypes,
}: {
  pagePath: string;
  categories: string[];
  tags: string[];
  resourceTypes: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={pagePath}
        className="rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-2 text-xs text-cyan-100"
      >
        全部
      </Link>
      {categories.map((category) => (
        <Link
          key={category}
          href={`${pagePath}?category=${encodeURIComponent(category)}`}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
        >
          {category}
        </Link>
      ))}
      {resourceTypes.map((type) => (
        <Link
          key={type}
          href={`${pagePath}?type=${encodeURIComponent(type)}`}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
        >
          {type}
        </Link>
      ))}
      {tags.slice(0, 8).map((tag) => (
        <Link
          key={tag}
          href={`${pagePath}?tag=${encodeURIComponent(tag)}`}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}

function InfoBox({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/5 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-cyan-100">
        {icon}
        {title}
      </div>
      <p className="text-xs leading-5 text-slate-400">{text}</p>
    </div>
  );
}
