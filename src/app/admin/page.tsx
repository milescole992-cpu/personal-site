import { BarChart3, FilePlus2, LockKeyhole, UsersRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createResourceAction } from "@/app/actions/resources";
import { CardShell } from "@/components/card-shell";
import { isAdminEmail } from "@/lib/auth-utils";
import { getAdminData } from "@/lib/data";

export const metadata = {
  title: "管理后台 | AI资源工作台",
};

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!isAdminEmail(session.user.email)) {
    return (
      <main className="relative min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
        <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center">
          <CardShell className="w-full p-6 text-center sm:p-7" glow="pink">
            <LockKeyhole className="mx-auto mb-4 text-pink-200" size={34} />
            <h1 className="text-2xl font-semibold text-white">无权限访问</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              当前账号不在 `ADMIN_EMAILS` 管理员邮箱列表中。请使用管理员账号登录，
              或联系站点管理员添加邮箱。
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              返回首页
            </Link>
          </CardShell>
        </div>
      </main>
    );
  }

  const { configured, users, resources, downloads } = await getAdminData();

  return (
    <main className="relative min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />

      <div className="mx-auto max-w-6xl space-y-6">
        <CardShell className="p-6 sm:p-7">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
            ADMIN
          </p>
          <h1 className="text-3xl font-semibold text-white">管理后台</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            当前是内容录入后台。优先把 AI 工具库、资源说明和工作流入口维护起来，
            后续再扩展复杂权限、文件存储和内容发布系统。
          </p>
        </CardShell>

        {!configured ? (
          <CardShell glow="pink">
            <h2 className="text-lg font-semibold text-white">
              Supabase 尚未配置
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              请先在 Vercel 配置 Supabase 三个环境变量，并在 Supabase SQL Editor
              执行 `supabase/schema.sql`。
            </p>
          </CardShell>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <CardShell>
            <UsersRound className="mb-4 text-cyan-200" size={22} />
            <p className="font-mono text-2xl text-white">{users.length}</p>
            <p className="mt-1 text-sm text-slate-400">用户列表占位</p>
          </CardShell>
          <CardShell>
            <FilePlus2 className="mb-4 text-cyan-200" size={22} />
            <p className="font-mono text-2xl text-white">{resources.length}</p>
            <p className="mt-1 text-sm text-slate-400">资源列表</p>
          </CardShell>
          <CardShell>
            <BarChart3 className="mb-4 text-cyan-200" size={22} />
            <p className="font-mono text-2xl text-white">{downloads.length}</p>
            <p className="mt-1 text-sm text-slate-400">下载数据统计占位</p>
          </CardShell>
        </div>

        <CardShell className="p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">新增 AI 资源</h2>
              <p className="mt-1 text-sm text-slate-500">
                建议按“能解决什么问题”来写简介，不只写工具名称。
              </p>
            </div>
            <span className="rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-2 text-xs text-cyan-100">
              标题、简介、链接必填更利于前台展示
            </span>
          </div>
          <form action={createResourceAction} className="mt-5 grid gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                标题
                <input
                  name="title"
                  required
                  placeholder="例如：ChatGPT 官方入口与基础用法"
                  className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300/50"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                Slug
                <input
                  name="slug"
                  placeholder="例如：chatgpt-official-guide，可留空自动生成"
                  className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300/50"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                分类
                <input
                  name="category"
                  defaultValue="AI资源"
                  list="resource-categories"
                  className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300/50"
                />
              </label>
            </div>
            <datalist id="resource-categories">
              <option value="通用助手" />
              <option value="AI搜索" />
              <option value="知识库" />
              <option value="设计创作" />
              <option value="图片生成" />
              <option value="视频创作" />
              <option value="音频创作" />
              <option value="开发资源" />
              <option value="工作流教程" />
            </datalist>
            <label className="grid gap-2 text-sm text-slate-300">
              简介
              <textarea
                name="description"
                required
                rows={3}
                placeholder="一句话说明这个资源解决什么问题、为什么值得收藏。"
                className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300/50"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                标签，英文逗号分隔
                <input
                  name="tags"
                  placeholder="AI助手,写作,工作流"
                  className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300/50"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                推荐指数 1-5
                <input
                  name="rating"
                  type="number"
                  min="1"
                  max="5"
                  defaultValue="3"
                  className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300/50"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                适合人群
                <textarea
                  name="audience"
                  rows={3}
                  placeholder="例如：AI 新手、内容创作者、副业创业者"
                  className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300/50"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                使用场景
                <textarea
                  name="use_cases"
                  rows={3}
                  placeholder="例如：选题调研、脚本生成、资料总结、自动化整理"
                  className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300/50"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                来源链接
                <input
                  name="source_url"
                  type="url"
                  placeholder="官方介绍页或文档链接"
                  className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300/50"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                下载链接
                <input
                  name="download_url"
                  type="url"
                  placeholder="可访问入口、资料下载页或你的资源站内链接"
                  className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-slate-100 outline-none focus:border-cyan-300/50"
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                name="requires_login"
                type="checkbox"
                defaultChecked
                className="size-4 accent-cyan-300"
              />
              需要登录后下载
            </label>
            <button
              type="submit"
              className="w-fit rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              新增资源
            </button>
          </form>
        </CardShell>

        <CardShell className="p-5">
          <h2 className="text-lg font-semibold text-white">资源列表</h2>
          <div className="mt-4 divide-y divide-white/8">
            {resources.map((resource) => (
              <div key={resource.id} className="py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-white">{resource.title}</span>
                  <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-500">
                    {resource.category}
                  </span>
                  <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-500">
                    推荐 {resource.rating}/5
                  </span>
                  {resource.slug ? (
                    <span className="rounded-md bg-white/5 px-2 py-1 text-xs text-slate-500">
                      /{resource.slug}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {resource.description}
                </p>
                <div className="mt-3 grid gap-2 text-xs text-slate-500 md:grid-cols-2">
                  <p className="rounded-md bg-white/5 px-3 py-2">
                    适合：{resource.audience || "待补充"}
                  </p>
                  <p className="rounded-md bg-white/5 px-3 py-2">
                    场景：{resource.use_cases || "待补充"}
                  </p>
                </div>
              </div>
            ))}
            {resources.length === 0 ? (
              <p className="py-3 text-sm text-slate-500">暂无资源。</p>
            ) : null}
          </div>
        </CardShell>

        <div className="grid gap-4 md:grid-cols-2">
          <CardShell>
            <h2 className="text-lg font-semibold text-white">用户列表占位</h2>
            <div className="mt-4 space-y-2">
              {users.slice(0, 6).map((user) => (
                <p key={user.id} className="text-sm text-slate-400">
                  {user.email}
                </p>
              ))}
              {users.length === 0 ? (
                <p className="text-sm text-slate-500">暂无用户。</p>
              ) : null}
            </div>
          </CardShell>
          <CardShell>
            <h2 className="text-lg font-semibold text-white">下载记录占位</h2>
            <div className="mt-4 space-y-2">
              {downloads.slice(0, 6).map((download) => (
                <p key={download.id} className="text-sm text-slate-400">
                  {new Date(download.created_at).toLocaleString("zh-CN")} ·{" "}
                  {download.resource_id}
                </p>
              ))}
              {downloads.length === 0 ? (
                <p className="text-sm text-slate-500">暂无下载记录。</p>
              ) : null}
            </div>
          </CardShell>
        </div>
      </div>
    </main>
  );
}
