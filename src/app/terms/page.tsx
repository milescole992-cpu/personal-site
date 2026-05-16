import { CardShell } from "@/components/card-shell";

export const metadata = {
  title: "用户协议 | AI资源工作台",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <CardShell className="p-6 sm:p-7">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
            Terms
          </p>
          <h1 className="text-2xl font-semibold text-white">用户协议</h1>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-400">
            <p>你需要对自己提交的内容、链接和附件负责，并确保拥有必要的使用或分享权限。</p>
            <p>平台会对用户投稿进行审核。审核通过不代表平台对第三方服务、文件或外链作出担保。</p>
            <p>如果内容存在安全、版权或合规风险，管理员可以拒绝、隐藏或删除相关内容。</p>
          </div>
        </CardShell>
      </div>
    </main>
  );
}
