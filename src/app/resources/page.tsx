import {
  ArrowUpRight,
  Download,
  Filter,
  FileText,
  Heart,
  Lock,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import {
  downloadResourceAction,
  favoriteResourceAction,
} from "@/app/actions/resources";
import { CardShell } from "@/components/card-shell";
import { getOrCreateUser, getResourcesForUser } from "@/lib/data";
import { absoluteUrl, siteName } from "@/lib/seo";

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

export default async function ResourcesPage() {
  const session = await auth();
  const user = session?.user ? await getOrCreateUser(session.user) : null;
  const isLoggedIn = Boolean(session?.user);
  const loginHref = "/login?callbackUrl=/resources";
  const { configured, resources } = await getResourcesForUser(user);
  const categories = Array.from(
    new Set(resources.map((resource) => resource.category)),
  );
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
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/8 text-cyan-100">
                  <Filter size={17} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-white">
                    当前资源索引
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    先按分类浏览，后续可以继续扩展搜索、筛选和详情页。
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </CardShell>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          {resources.map((resource) => (
            <CardShell key={resource.id} className="flex h-full flex-col p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-md border border-cyan-300/20 bg-cyan-300/8 text-cyan-100">
                  <FileText size={18} />
                </span>
                <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-400">
                  {resource.category}
                </span>
              </div>

              <Link href={`/resources/${resource.slug}`} className="group">
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

              {isLoggedIn && resource.download_url ? (
                <p className="mt-4 break-all rounded-md border border-cyan-300/15 bg-cyan-300/8 px-3 py-2 text-xs text-cyan-100">
                  下载链接：{resource.download_url}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={resource.source_url || "#"}
                  target={resource.source_url ? "_blank" : undefined}
                  rel={resource.source_url ? "noreferrer" : undefined}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/6 px-3 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/40 hover:bg-white/10"
                >
                  官方来源 <ArrowUpRight size={15} />
                </a>
                <Link
                  href={`/resources/${resource.slug}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40"
                >
                  资源详情 <FileText size={15} />
                </Link>
                {isLoggedIn ? (
                  <>
                    <form action={favoriteResourceAction.bind(null, resource.id)}>
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-md border border-pink-300/20 bg-pink-300/8 px-3 py-2.5 text-sm font-semibold text-pink-100 transition hover:border-pink-300/40"
                      >
                        <Heart size={15} />
                        {resource.isFavorite ? "已收藏" : "收藏"}
                      </button>
                    </form>
                    <form
                      action={downloadResourceAction.bind(null, resource.id)}
                      className="flex-1"
                    >
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                      >
                        下载 <Download size={15} />
                      </button>
                    </form>
                  </>
                ) : (
                  <a
                    href={loginHref}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  >
                    登录下载 <Lock size={15} />
                  </a>
                )}
              </div>
            </CardShell>
          ))}
        </div>
      </div>
    </main>
  );
}
