import { GitBranch, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { CardShell } from "@/components/card-shell";

export const metadata = {
  title: "登录 | AI资源工作台",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl || "/dashboard";

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />

      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <CardShell className="w-full p-6 sm:p-7">
          <div className="mb-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 font-mono text-xs text-cyan-100">
              <Sparkles size={14} />
              SIGN IN
            </div>
            <h1 className="text-2xl font-semibold text-white">
              登录 AI资源工作台
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              使用 GitHub 账号登录。第一次登录会自动创建站内用户，
              暂不开放邮箱密码注册；Google 登录后续再开启。
            </p>
          </div>

          <div className="space-y-3">
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: callbackUrl });
              }}
            >
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-md border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/40 hover:bg-white/10"
              >
                <GitBranch size={18} />
                使用 GitHub 登录
              </button>
            </form>
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-500">
            登录后会进入用户中心。后续可以在这里扩展收藏、会员、资源下载记录等功能。
          </p>
        </CardShell>
      </div>
    </main>
  );
}
