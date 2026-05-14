import {
  ArrowUpRight,
  Download,
  FileText,
  Heart,
  Lock,
  Sparkles,
} from "lucide-react";
import { auth } from "@/auth";
import {
  downloadResourceAction,
  favoriteResourceAction,
} from "@/app/actions/resources";
import { CardShell } from "@/components/card-shell";
import { getOrCreateUser, getResourcesForUser } from "@/lib/data";

export const metadata = {
  title: "资源下载 | AI资源工作台",
  description: "AI资源、海外AI工具筛选表和AI工作流教程下载页。",
};

export default async function ResourcesPage() {
  const session = await auth();
  const user = session?.user ? await getOrCreateUser(session.user) : null;
  const isLoggedIn = Boolean(session?.user);
  const loginHref = "/login?callbackUrl=/resources";
  const { configured, resources } = await getResourcesForUser(user);

  return (
    <main className="relative min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />

      <div className="mx-auto max-w-7xl space-y-6">
        <CardShell className="p-6 sm:p-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 font-mono text-xs text-cyan-100">
            <Sparkles size={14} />
            RESOURCE LIBRARY
          </div>
          <h1 className="text-3xl font-semibold text-white">AI资源下载</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            访客可以浏览资源介绍；登录后可以收藏资源、查看下载链接，并记录下载行为。
            当前是 Supabase 最小可用版本，后期可以继续接文件存储和付费权限。
          </p>
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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

              <h2 className="text-base font-semibold text-white">
                {resource.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">
                {resource.description}
              </p>

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
                  查看详情 <ArrowUpRight size={15} />
                </a>
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
