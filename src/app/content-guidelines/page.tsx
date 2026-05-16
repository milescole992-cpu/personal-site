import { CardShell } from "@/components/card-shell";

export const metadata = {
  title: "内容规范 | AI资源工作台",
};

export default function ContentGuidelinesPage() {
  return (
    <main className="min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <CardShell className="p-6 sm:p-7">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
            Content Guidelines
          </p>
          <h1 className="text-2xl font-semibold text-white">内容规范</h1>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-400">
            <p>推荐写清楚工具用途、适合人群、使用步骤、费用情况、替代方案和真实限制。</p>
            <p>教程和工作流应尽量可复现，避免只写空泛结论。外链请使用 HTTPS，附件请上传常见安全格式。</p>
            <p>第一阶段正文使用纯文本保存，数据库已预留富文本结构，后续可以升级到 Markdown 或块编辑器。</p>
          </div>
        </CardShell>
      </div>
    </main>
  );
}
