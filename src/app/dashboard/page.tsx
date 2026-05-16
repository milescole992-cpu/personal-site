import {
  Bookmark,
  Download,
  FilePlus2,
  LogOut,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { updateProfileAction } from "@/app/actions/interactions";
import { auth, signOut } from "@/auth";
import { CardShell } from "@/components/card-shell";
import { isAdminEmail } from "@/lib/auth-utils";
import { getDashboardData, getOrCreateUser } from "@/lib/data";

export const metadata = {
  title: "用户中心 | AI资源工作台",
};

type DashboardPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

const statusMessages: Record<string, string> = {
  "submission-created": "投稿已提交，当前状态为待审核。",
  "submission-failed": "投稿提交失败，请稍后重试或联系管理员。",
  "submission-restricted": "当前账号不能投稿，请查看账号状态。",
  "profile-saved": "个人资料已保存。",
  "profile-invalid": "用户名至少 3 个字符，只能包含英文、数字、短横线和下划线。",
  "username-taken": "这个用户名已经被占用，请换一个。",
  "profile-failed": "个人资料保存失败。",
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const [session, params] = await Promise.all([auth(), searchParams]);

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const user = await getOrCreateUser(session.user);
  const { configured, favorites, downloads, submissions, likes, contribution } =
    await getDashboardData(user);
  const name = session.user.name || session.user.email || "已登录用户";
  const isAdmin = isAdminEmail(session.user.email) || user?.role === "admin";
  const userStatus = user?.status ?? "active";
  const canSubmit = user?.can_submit !== false && userStatus !== "banned";

  return (
    <main className="relative min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />

      <div className="mx-auto max-w-5xl space-y-6">
        {params?.status && statusMessages[params.status] ? (
          <CardShell glow="cyan" className="p-4">
            <p className="text-sm text-cyan-100">{statusMessages[params.status]}</p>
          </CardShell>
        ) : null}

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
                这里展示你的账户、收藏、下载记录和投稿状态。普通用户可以投稿，但投稿会先进入审核，审核通过后才会出现在前台。
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-md bg-white/5 px-2.5 py-1.5">
                  权限：{isAdmin ? "管理员" : "普通用户"}
                </span>
                <span className="rounded-md bg-white/5 px-2.5 py-1.5">
                  状态：{userStatus === "active" ? "正常" : userStatus === "restricted" ? "限制投稿" : "封禁"}
                </span>
                <span className="rounded-md bg-white/5 px-2.5 py-1.5">
                  贡献值：{contribution.score}
                </span>
                {user?.username ? (
                  <Link
                    href={`/u/${user.username}`}
                    className="rounded-md border border-cyan-300/20 bg-cyan-300/8 px-2.5 py-1.5 text-cyan-100 transition hover:border-cyan-300/40"
                  >
                    查看主页
                  </Link>
                ) : null}
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

        {canSubmit ? (
          <CardShell glow="cyan" className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 text-xs text-cyan-100">
                  <FilePlus2 size={14} />
                  投稿入口
                </div>
                <h2 className="text-lg font-semibold text-white">分享 AI 工具、教程、工作流或经验</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  投稿不会直接公开，会进入管理员审核。通过后会转成正式内容并保留你的贡献来源。
                </p>
              </div>
              <Link
                href="/submit"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                去投稿
              </Link>
            </div>
          </CardShell>
        ) : (
          <CardShell glow="pink" className="p-5">
            <h2 className="text-lg font-semibold text-white">当前账号不能投稿</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              账号处于限制或封禁状态时，仍可查看自己的收藏和下载记录，但不能继续提交内容。
            </p>
          </CardShell>
        )}

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
          <h2 className="text-lg font-semibold text-white">我的资料</h2>
          <form action={updateProfileAction} className="mt-4 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                昵称
                <input
                  name="name"
                  defaultValue={user?.name ?? session.user.name ?? ""}
                  className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/50"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                用户名
                <input
                  name="username"
                  defaultValue={user?.username ?? ""}
                  placeholder="例如 miles-ai"
                  className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/50"
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm text-slate-300">
              个人简介
              <textarea
                name="bio"
                rows={3}
                defaultValue={user?.bio ?? ""}
                placeholder="一句话介绍你关注的 AI 工具、工作流或内容方向。"
                className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-sm leading-6 text-slate-100 outline-none focus:border-cyan-300/50"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-300">
                头像 URL
                <input
                  name="avatar_url"
                  defaultValue={user?.avatar_url ?? session.user.image ?? ""}
                  placeholder="https://..."
                  className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/50"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                主页横幅 URL
                <input
                  name="profile_banner_url"
                  defaultValue={user?.profile_banner_url ?? ""}
                  placeholder="https://..."
                  className="rounded-md border border-white/10 bg-black/24 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/50"
                />
              </label>
            </div>
            <div className="grid gap-2 text-sm text-slate-400">
              <p>邮箱：{session.user.email || "未提供"}</p>
              <p>投稿权限：{canSubmit ? "可投稿" : "已限制"}</p>
            </div>
            <button className="w-fit rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
              保存资料
            </button>
          </form>
        </CardShell>

        <CardShell>
          <Sparkles className="mb-4 text-cyan-200" size={22} />
          <h2 className="text-lg font-semibold text-white">我的贡献</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-5">
            <MiniStat label="贡献值" value={contribution.score} />
            <MiniStat label="通过投稿" value={contribution.approvedSubmissions} />
            <MiniStat label="发布资源" value={contribution.contributedResources} />
            <MiniStat label="被收藏" value={contribution.receivedFavorites} />
            <MiniStat label="被下载" value={contribution.receivedDownloads} />
          </div>
        </CardShell>

        <CardShell>
          <ShieldCheck className="mb-4 text-cyan-200" size={22} />
          <h2 className="text-lg font-semibold text-white">我的投稿</h2>
          <div className="mt-3 space-y-3">
            {submissions.map((item) => (
              <div key={item.id} className="rounded-md bg-white/5 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.submission_type} · {new Date(item.created_at).toLocaleString("zh-CN")}
                    </p>
                    {item.review_reason ? (
                      <p className="mt-2 text-xs leading-5 text-amber-100">
                        处理说明：{item.review_reason}
                      </p>
                    ) : null}
                  </div>
                  <span className="w-fit rounded-md border border-white/10 bg-black/20 px-2.5 py-1.5 text-xs text-slate-300">
                    {item.review_status === "pending"
                      ? "待审核"
                      : item.review_status === "approved"
                        ? "已通过"
                        : "已拒绝"}
                  </span>
                </div>
              </div>
            ))}
            {submissions.length === 0 ? (
              <p className="text-sm text-slate-500">暂无投稿。你可以从上方入口提交第一条内容。</p>
            ) : null}
          </div>
        </CardShell>

        <div className="grid gap-4 md:grid-cols-2">
          <CardShell glow="cyan">
            <Bookmark className="mb-4 text-cyan-200" size={22} />
            <h2 className="text-lg font-semibold text-white">我的收藏</h2>
            <p className="mt-1 text-sm text-slate-500">共 {favorites.length} 条收藏</p>
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
            <p className="mt-1 text-sm text-slate-500">共 {downloads.length} 条下载</p>
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
        <CardShell>
          <h2 className="text-lg font-semibold text-white">我的点赞</h2>
          <div className="mt-3 space-y-3">
            {likes.map((item) => (
              <div key={item.id} className="rounded-md bg-white/5 p-3">
                <p className="text-sm font-medium text-white">
                  {item.resource?.title || "资源已删除"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(item.created_at).toLocaleString("zh-CN")}
                </p>
              </div>
            ))}
            {likes.length === 0 ? (
              <p className="text-sm text-slate-500">暂无点赞。</p>
            ) : null}
          </div>
        </CardShell>
      </div>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.035] p-3">
      <p className="font-mono text-xl text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}
