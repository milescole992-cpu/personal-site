import { CardShell } from "@/components/card-shell";

export const metadata = {
  title: "社区规则 | AI资源工作台",
};

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <CardShell className="p-6 sm:p-7">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
            Community Rules
          </p>
          <h1 className="text-2xl font-semibold text-white">社区规则</h1>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-400">
            <p>请提交真实、有帮助、可验证的 AI 工具、教程、工作流、资源或经验内容。</p>
            <p>禁止提交恶意链接、侵权资源、诱导下载、虚假宣传、违法内容或危险文件。</p>
            <p>普通用户投稿默认进入审核，管理员可以拒绝、删除违规内容，并限制违规账号继续投稿。</p>
          </div>
        </CardShell>
      </div>
    </main>
  );
}
