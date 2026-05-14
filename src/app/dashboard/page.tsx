import { Bookmark, Compass, LogOut, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { CardShell } from "@/components/card-shell";

export const metadata = {
  title: "用户中心 | AI资源工作台",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const name = session.user.name || session.user.email || "已登录用户";

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
                这里是用户中心占位。后续可以扩展 AI资源收藏、工具订阅记录、
                工作流学习进度和会员权益。
              </p>
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

        <div className="grid gap-4 md:grid-cols-2">
          <CardShell glow="cyan">
            <Bookmark className="mb-4 text-cyan-200" size={22} />
            <h2 className="text-lg font-semibold text-white">我的资源收藏</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              这里预留给 AI资源、提示词、工具评测文章的收藏列表。
            </p>
          </CardShell>
          <CardShell glow="violet">
            <Compass className="mb-4 text-violet-200" size={22} />
            <h2 className="text-lg font-semibold text-white">我的学习路线</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              这里预留给 AI工作流教程进度、已完成步骤和下一步建议。
            </p>
          </CardShell>
        </div>
      </div>
    </main>
  );
}
