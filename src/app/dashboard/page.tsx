import { Bookmark, Download, LogOut, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { CardShell } from "@/components/card-shell";
import { isAdminEmail } from "@/lib/auth-utils";
import { getDashboardData, getOrCreateUser } from "@/lib/data";

export const metadata = {
  title: "用户中心 | AI资源工作台",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const user = await getOrCreateUser(session.user);
  const { configured, favorites, downloads } = await getDashboardData(user);
  const name = session.user.name || session.user.email || "已登录用户";
  const isAdmin = isAdminEmail(session.user.email);

  return (
    <main className="relative min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />

      <div className="mx-auto max-w-5xl space-y-6">
        <CardShell className="p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 font-mono text-xs text-cyan-100">
                <Sparkles size={14} />
                DASHBOARD
              </div>
              <h1 className="text-2xl font-semibold text-white">
                欢迎回来，{name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                这里展示你的账户信息、收藏资源和下载记录。第一次 GitHub 登录会自动同步到
                Supabase `users` 表。
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-md bg-white/5 px-2.5 py-1.5">
                  权限：{isAdmin ? "管理员" : "普通用户"}
                </span>
                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="rounded-md border border-emerald-300/20 bg-emerald-300/8 px-2.5 py-1.5 text-emerald-100 transition hover:border-emerald-300/40"
                  >
                    进入管理后台
                  </Link>
                ) : null}
              </div>
            </div>

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/6 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/40 hover:bg-white/10"
              >
                <LogOut size={16} />
                退出登录
              </button>
            </form>
          </div>
        </CardShell>

        {!configured ? (
          <CardShell glow="pink">
            <h2 className="text-lg font-semibold text-white">
              Supabase 尚未配置
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              配置 Supabase 后，这里会显示真实收藏和下载记录。
            </p>
          </CardShell>
        ) : null}

        <CardShell>
          <UserRound className="mb-4 text-cyan-200" size={22} />
          <h2 className="text-lg font-semibold text-white">我的账户信息</h2>
          <div className="mt-3 grid gap-2 text-sm text-slate-400">
            <p>邮箱：{session.user.email || "未提供"}</p>
            <p>昵称：{session.user.name || "未提供"}</p>
            <p>站内用户 ID：{user?.id || "等待 Supabase 同步"}</p>
          </div>
        </CardShell>

        <div className="grid gap-4 md:grid-cols-2">
          <CardShell glow="cyan">
            <Bookmark className="mb-4 text-cyan-200" size={22} />
            <h2 className="text-lg font-semibold text-white">我的收藏</h2>
            <div className="mt-3 space-y-3">
              {favorites.map((item) => (
                <div key={item.id} className="rounded-md bg-white/5 p-3">
                  <p className="text-sm font-medium text-white">
                    {item.resource?.title || "资源已删除"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleString("zh-CN")}
                  </p>
                </div>
              ))}
              {favorites.length === 0 ? (
                <p className="text-sm text-slate-500">暂无收藏。</p>
              ) : null}
            </div>
            <Link
              href="/resources"
              className="mt-4 inline-flex rounded-md bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              浏览资源下载
            </Link>
          </CardShell>
          <CardShell glow="violet">
            <Download className="mb-4 text-violet-200" size={22} />
            <h2 className="text-lg font-semibold text-white">我的下载记录</h2>
            <div className="mt-3 space-y-3">
              {downloads.map((item) => (
                <div key={item.id} className="rounded-md bg-white/5 p-3">
                  <p className="text-sm font-medium text-white">
                    {item.resource?.title || "资源已删除"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleString("zh-CN")}
                  </p>
                </div>
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
