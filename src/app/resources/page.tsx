import {
  Filter,
  FileText,
  Search,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { CardShell } from "@/components/card-shell";
import { getOrCreateUser, getResourcesByPlacement } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase";
import { absoluteUrl, siteName } from "@/lib/seo";
import { getResourceSlug } from "@/lib/slug";

const resourcesDescription =
  "收录海外 AI 工具、AI 搜索、知识库、图片视频生成、语音配音和工作流资源，适合普通人、创作者和副业创业者长期收藏。";

export const metadata: Metadata = {
  title: "AI 资源库",
  description: resourcesDescription,
  alternates: {
    canonical: absoluteUrl("/resources"),
  },
  openGraph: {
    title: `AI 资源库 | ${siteName}`,
    description: resourcesDescription,
    url: absoluteUrl("/resources"),
    siteName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `AI 资源库 | ${siteName}`,
    description: resourcesDescription,
  },
};

type ResourcesPageProps = {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    audience?: string;
    use_case?: string;
    type?: string;
  }>;
};

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const session = await auth();
  const user = session?.user ? await getOrCreateUser(session.user) : null;
  const params = (await searchParams) ?? {};
  const q = (params.q || "").trim().toLowerCase();
  const resources = await getResourcesByPlacement("resources", user);
  const configured = isSupabaseConfigured();
  const categories = Array.from(
    new Set(resources.map((resource) => resource.category)),
  );
  const tags = Array.from(new Set(resources.flatMap((resource) => resource.tags)));
  const resourceTypes = Array.from(
    new Set(resources.map((resource) => resource.resource_type || "resource")),
  );
  const filteredResources = resources.filter((resource) => {
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
      (!params.use_case || resource.use_cases.includes(params.use_case))
    );
  });
  const featuredCount = resources.filter((resource) => resource.rating >= 5).length;

  return (
    <main className="relative min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />

      <div className="mx-auto max-w-7xl space-y-6">
        <CardShell className="p-6 sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 font-mono text-xs text-cyan-100">
                <Sparkles size={14} />
                CURATED AI RESOURCE LIBRARY
              </div>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                海外 AI 资源筛选库
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                这里不是简单堆链接，而是按普通人、内容创作者、AI 工具玩家和副业创业者的真实场景，
                筛选可上手的 AI 工具、知识库、创作工具和工作流入口。
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md border border-white/10 bg-white/5 px-3 py-3">
                <p className="font-mono text-xl text-white">{resources.length}</p>
                <p className="mt-1 text-xs text-slate-500">已收录</p>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 px-3 py-3">
                <p className="font-mono text-xl text-white">{categories.length}</p>
                <p className="mt-1 text-xs text-slate-500">分类</p>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 px-3 py-3">
                <p className="font-mono text-xl text-white">{featuredCount}</p>
                <p className="mt-1 text-xs text-slate-500">高推荐</p>
              </div>
            </div>
          </div>
        </CardShell>

        {!configured ? (
          <CardShell glow="pink">
            <h2 className="text-lg font-semibold text-white">
              Supabase 尚未配置
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              请在 Vercel 添加 `SUPABASE_URL`、`SUPABASE_ANON_KEY`、
              `SUPABASE_SERVICE_ROLE_KEY`，并执行 `supabase/schema.sql`。
            </p>
          </CardShell>
        ) : null}

        {configured && resources.length === 0 ? (
          <CardShell>
            <h2 className="text-lg font-semibold text-white">暂无资源</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              管理员可以进入 `/admin` 新增第一条 AI 资源。
            </p>
          </CardShell>
        ) : null}

        {configured && resources.length > 0 ? (
          <CardShell className="p-4">
            <form className="grid gap-4 lg:grid-cols-[1fr_auto]" action="/resources">
              <label className="flex items-center gap-3 rounded-md border border-white/10 bg-black/24 px-4 py-3">
                <Search size={17} className="text-cyan-200" />
                <input
                  name="q"
                  defaultValue={params.q}
                  placeholder="搜索工具、场景、标签、适合人群"
                  className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />
              </label>
              <button
                type="submit"
                className="rounded-md bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                搜索资源
              </button>
            </form>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/8 text-cyan-100">
                  <Filter size={17} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    当前资源索引
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    支持按分类、标签和资源类型浏览；列表页只做站内详情跳转。
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/resources"
                  className="rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-2 text-xs text-cyan-100"
                >
                  全部
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category}
                    href={`/resources?category=${encodeURIComponent(category)}`}
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
                  >
                    {category}
                  </Link>
                ))}
                {resourceTypes.map((type) => (
                  <Link
                    key={type}
                    href={`/resources?type=${encodeURIComponent(type)}`}
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
                  >
                    {type}
                  </Link>
                ))}
                {tags.slice(0, 8).map((tag) => (
                  <Link
                    key={tag}
                    href={`/resources?tag=${encodeURIComponent(tag)}`}
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </CardShell>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          {filteredResources.map((resource) => (
            <CardShell key={resource.id} className="flex h-full flex-col p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/8 text-cyan-100">
                  <FileText size={18} />
                </span>
                <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-400">
                  {resource.category}
                </span>
                {resource.is_featured || resource.rating >= 5 ? (
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

              <Link
                href={`/resources/${getResourceSlug(resource)}`}
                className="group"
              >
                <h2 className="text-base font-semibold text-white transition group-hover:text-cyan-100">
                  {resource.title}
                </h2>
              </Link>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">
                {resource.description}
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-cyan-100">
                    <UsersRound size={14} />
                    适合人群
                  </div>
                  <p className="text-xs leading-5 text-slate-400">
                    {resource.audience || "待补充"}
                  </p>
                </div>
                <div className="rounded-md border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-pink-100">
                    <Target size={14} />
                    使用场景
                  </div>
                  <p className="text-xs leading-5 text-slate-400">
                    {resource.use_cases || "待补充"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-500"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-500">
                <span className="rounded-md bg-white/5 px-2 py-2">
                  推荐 {resource.rating}/5
                </span>
                <span className="rounded-md bg-white/5 px-2 py-2">
                  {resource.requires_login ? "登录下载" : "公开下载"}
                </span>
                <span className="rounded-md bg-white/5 px-2 py-2">
                  {new Date(resource.published_at).toLocaleDateString("zh-CN")}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/resources/${getResourceSlug(resource)}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  资源详情 <FileText size={15} />
                </Link>
              </div>
            </CardShell>
          ))}
        </div>
      </div>
    </main>
  );
}
