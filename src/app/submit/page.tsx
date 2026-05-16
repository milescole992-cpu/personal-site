import { FilePlus2, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { createSubmissionAction } from "@/app/actions/submissions";
import { TagPicker } from "@/components/admin/tag-picker";
import { CardShell } from "@/components/card-shell";
import { getActiveTaxonomyTerms, getOrCreateUser } from "@/lib/data";

export const metadata = {
  title: "用户投稿 | AI资源工作台",
  description: "提交 AI 工具、教程、工作流、资源、提示词或经验分享，审核通过后进入资源站。",
};

type SubmitPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

const statusMessages: Record<string, string> = {
  "rules-required": "提交前需要同意用户协议、社区规则和内容规范。",
  "missing-fields": "标题和简介是必填项。",
};

const inputClass =
  "rounded-md border border-white/10 bg-black/24 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-cyan-300/50";
const textareaClass =
  "rounded-md border border-white/10 bg-black/24 px-3 py-2.5 text-sm leading-7 text-slate-100 outline-none transition focus:border-cyan-300/50";

export default async function SubmitPage({ searchParams }: SubmitPageProps) {
  const [session, params, taxonomyTerms] = await Promise.all([
    auth(),
    searchParams,
    getActiveTaxonomyTerms(),
  ]);

  if (!session?.user) {
    redirect("/login?callbackUrl=/submit");
  }

  const user = await getOrCreateUser(session.user);
  const isRestricted =
    user?.status === "banned" ||
    user?.status === "restricted" ||
    user?.can_submit === false;
  const tagTerms = taxonomyTerms.filter((term) => term.kind === "tag");
  const categoryTerms = taxonomyTerms.filter((term) => term.kind === "category");

  return (
    <main className="relative min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
      <div className="mx-auto max-w-5xl space-y-6">
        <CardShell className="p-6 sm:p-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 font-mono text-xs text-cyan-100">
            <FilePlus2 size={14} />
            USER SUBMISSION
          </div>
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            提交 AI 工具、教程、工作流或经验
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            投稿会先进入待审核，不会直接公开。管理员通过后，第一阶段会转成正式资源，并保留你的投稿来源，后续可扩展为创作者主页、贡献值和内容社区。
          </p>
        </CardShell>

        {params?.status && statusMessages[params.status] ? (
          <CardShell glow="pink" className="p-4">
            <p className="text-sm text-pink-100">{statusMessages[params.status]}</p>
          </CardShell>
        ) : null}

        {isRestricted ? (
          <CardShell glow="pink" className="p-6">
            <Lock className="mb-4 text-pink-200" size={26} />
            <h2 className="text-lg font-semibold text-white">当前账号暂不能投稿</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              账号处于限制或封禁状态时不能继续提交内容。你仍然可以在用户中心查看历史投稿和审核说明。
            </p>
            <Link href="/dashboard" className="mt-4 inline-flex rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950">
              返回用户中心
            </Link>
          </CardShell>
        ) : (
          <CardShell className="p-6">
            <form action={createSubmissionAction} encType="multipart/form-data" className="grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-slate-300">
                  <span className="font-medium text-white">投稿类型 *</span>
                  <select name="submission_type" className={inputClass} defaultValue="resource">
                    <option value="resource">AI 资源</option>
                    <option value="tool">AI 工具</option>
                    <option value="workflow">AI 工作流</option>
                    <option value="tutorial">教程文章</option>
                    <option value="prompt">AI 提示词</option>
                    <option value="experience">经验分享</option>
                  </select>
                  <span className="text-xs leading-5 text-slate-500">
                    投稿类型独立于正式资源模型，后续可以转成资源、文章或其他内容。
                  </span>
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  <span className="font-medium text-white">Slug</span>
                  <input name="slug" className={inputClass} placeholder="可留空自动生成，例如 chatgpt-guide" />
                  <span className="text-xs leading-5 text-slate-500">
                    审核通过后可作为详情页链接的一部分。
                  </span>
                </label>
              </div>

              <label className="grid gap-2 text-sm text-slate-300">
                <span className="font-medium text-white">标题 *</span>
                <input name="title" required className={inputClass} placeholder="例如：一个适合新手的 AI 搜索工具" />
              </label>

              <label className="grid gap-2 text-sm text-slate-300">
                <span className="font-medium text-white">简介 *</span>
                <textarea
                  name="summary"
                  required
                  rows={3}
                  className={textareaClass}
                  placeholder="用 1-2 句话说明这个内容能解决什么问题。"
                />
              </label>

              <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                <label className="grid gap-2 text-sm text-slate-300">
                  <span className="font-medium text-white">标签</span>
                  {tagTerms.length > 0 ? (
                    <TagPicker
                      name="tags"
                      options={tagTerms.map((term) => ({ id: term.id, name: term.name }))}
                      placeholder="选择标签"
                    />
                  ) : (
                    <div className="rounded-md border border-white/10 bg-black/24 p-3 text-sm text-slate-500">
                      后台还没有维护标签。你可以先提交，管理员后续补充。
                    </div>
                  )}
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  <span className="font-medium text-white">主分类</span>
                  <select name="category" className={inputClass}>
                    <option value="">选择分类</option>
                    {categoryTerms.map((term) => (
                      <option key={term.id} value={term.name}>
                        {term.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="grid gap-2 text-sm text-slate-300">
                <span className="font-medium text-white">正文 / 教程内容</span>
                <textarea
                  name="content"
                  rows={9}
                  className={textareaClass}
                  placeholder="可以写使用步骤、经验、优缺点、注意事项。第一阶段先用纯文本，数据库已预留 content_json 以后接富文本编辑器。"
                />
              </label>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-slate-300">
                  <span className="font-medium text-white">资源 / 官方链接</span>
                  <input name="resource_url" type="url" className={inputClass} placeholder="https://..." />
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  <span className="font-medium text-white">封面图 URL</span>
                  <input name="cover_image_url" type="url" className={inputClass} placeholder="https://..." />
                </label>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-cyan-200" />
                  <h2 className="text-sm font-semibold text-white">附件上传</h2>
                </div>
                <p className="mb-4 text-xs leading-5 text-slate-500">
                  可上传图片、视频、PDF、ZIP 或常见 Office 文档，最大 50MB。上传内容默认不公开，审核通过后才会显示。
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <select name="media_type" defaultValue="none" className={inputClass}>
                    <option value="none">不上传附件</option>
                    <option value="image">图片</option>
                    <option value="video">视频</option>
                    <option value="file">附件文件</option>
                  </select>
                  <input name="media_file" type="file" className={inputClass} />
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-slate-400">
                <input name="accept_rules" type="checkbox" className="mt-1 size-4 accent-cyan-300" />
                <span>
                  我确认内容没有侵权、危险文件或恶意链接，并同意
                  <Link href="/terms" className="text-cyan-100 hover:text-cyan-50"> 用户协议</Link>、
                  <Link href="/rules" className="text-cyan-100 hover:text-cyan-50"> 社区规则</Link> 和
                  <Link href="/content-guidelines" className="text-cyan-100 hover:text-cyan-50"> 内容规范</Link>。
                </span>
              </label>

              <button className="w-fit rounded-md bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
                提交审核
              </button>
            </form>
          </CardShell>
        )}
      </div>
    </main>
  );
}
