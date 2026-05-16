import {
  ArrowLeft,
  Download,
  Heart,
  Lock,
  MessageSquare,
  Sparkles,
  Star,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import {
  createCommentAction,
  deleteCommentAction,
  toggleLikeResourceAction,
} from "@/app/actions/interactions";
import {
  downloadResourceAction,
  favoriteResourceAction,
} from "@/app/actions/resources";
import { CardShell } from "@/components/card-shell";
import { ResourceMediaPanel } from "@/components/resource-media-panel";
import { getOrCreateUser, getResourceBySlug } from "@/lib/data";
import { absoluteUrl, siteName } from "@/lib/seo";
import { getResourceSlug } from "@/lib/slug";

type ResourceDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ResourceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { resource } = await getResourceBySlug(slug);

  if (!resource) {
    return {
      title: "资源未找到",
    };
  }

  const title = resource.seo_title || `${resource.title} | AI资源详情`;
  const description = resource.seo_description || resource.description;
  const url = absoluteUrl(`/resources/${getResourceSlug(resource)}`);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: "article",
      publishedTime: resource.published_at,
      tags: resource.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ResourceDetailPage({
  params,
}: ResourceDetailPageProps) {
  const { slug } = await params;
  const session = await auth();
  const user = session?.user ? await getOrCreateUser(session.user) : null;
  const isLoggedIn = Boolean(session?.user);
  const { configured, resource, related, comments } = await getResourceBySlug(slug, user);

  if (configured && !resource) {
    notFound();
  }

  const loginHref = `/login?callbackUrl=/resources/${slug}`;

  return (
    <main className="relative min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />

      <div className="mx-auto max-w-6xl space-y-6">
        <Link
          href="/resources"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-100"
        >
          <ArrowLeft size={16} />
          返回资源库
        </Link>

        {!configured ? (
          <CardShell glow="pink">
            <h1 className="text-lg font-semibold text-white">
              Supabase 尚未配置
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              请先配置 Supabase 环境变量后再访问资源详情页。
            </p>
          </CardShell>
        ) : null}

        {resource ? (
          <>
            <CardShell className="p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-1.5 font-mono text-xs text-cyan-100">
                  <Sparkles size={14} />
                  AI RESOURCE DETAIL
                </span>
                <span className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                  {resource.category}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-300/20 bg-amber-300/8 px-3 py-1.5 text-xs text-amber-100">
                  <Star size={13} />
                  推荐 {resource.rating}/5
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                  <ThumbsUp size={13} />
                  {resource.likeCount ?? 0} 点赞
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                  <MessageSquare size={13} />
                  {resource.commentCount ?? 0} 评论
                </span>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1fr_240px] lg:items-start">
                <div>
                  <h1 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
                    {resource.title}
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                    {resource.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {resource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-white/5 px-2.5 py-1.5 text-xs text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {resource.contributor ? (
                    <div className="mt-4 inline-flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400">
                      <span
                        className="grid size-7 place-items-center rounded-md bg-cyan-300/12 text-[11px] font-semibold text-cyan-100"
                        style={
                          resource.contributor.avatar_url
                            ? {
                                backgroundImage: `url(${resource.contributor.avatar_url})`,
                                backgroundPosition: "center",
                                backgroundSize: "cover",
                              }
                            : undefined
                        }
                      >
                        {resource.contributor.avatar_url
                          ? ""
                          : (resource.contributor.name || resource.contributor.email)
                              .slice(0, 1)
                              .toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <UserRound size={13} className="text-cyan-200" />
                        由{" "}
                        <span className="font-medium text-slate-200">
                          {resource.contributor.name ||
                            resource.contributor.email.split("@")[0]}
                        </span>
                        投稿
                      </span>
                      <span className="hidden text-slate-600 sm:inline">
                        贡献值 {resource.contributor.reputation}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-3 rounded-md border border-white/10 bg-black/24 p-4">
                  {isLoggedIn ? (
                    <>
                      <form action={toggleLikeResourceAction.bind(null, resource.id)}>
                        <button
                          type="submit"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40"
                        >
                          <ThumbsUp size={15} />
                          {resource.isLiked ? "已点赞" : "点赞资源"} · {resource.likeCount ?? 0}
                        </button>
                      </form>
                      <form
                        action={favoriteResourceAction.bind(null, resource.id)}
                      >
                        <button
                          type="submit"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-pink-300/20 bg-pink-300/8 px-3 py-2.5 text-sm font-semibold text-pink-100 transition hover:border-pink-300/40"
                        >
                          <Heart size={15} />
                          {resource.isFavorite ? "已收藏" : "收藏资源"} · {resource.favoriteCount ?? 0}
                        </button>
                      </form>
                      {resource.media_type === "file" && resource.media_url ? (
                        <form action={downloadResourceAction.bind(null, resource.id)}>
                          <button
                            type="submit"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                          >
                            下载 <Download size={15} />
                          </button>
                        </form>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <Link
                        href={loginHref}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40"
                      >
                        登录后点赞 <Lock size={15} />
                      </Link>
                      <Link
                        href={loginHref}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-pink-300/20 bg-pink-300/8 px-3 py-2.5 text-sm font-semibold text-pink-100 transition hover:border-pink-300/40"
                      >
                        登录后收藏 <Lock size={15} />
                      </Link>
                      {resource.media_type === "file" && resource.media_url ? (
                        <Link
                          href={loginHref}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                        >
                          登录后下载 <Lock size={15} />
                        </Link>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </CardShell>

            {resource.media_type === "video" ? <ResourceMediaPanel resource={resource} /> : null}

            {resource.cover_image_url ? (
              <CardShell className="p-4">
                <Image
                  src={resource.cover_image_url}
                  alt={resource.title}
                  width={1200}
                  height={800}
                  unoptimized
                  className="max-h-[min(70vh,560px)] w-full rounded-md object-contain"
                />
              </CardShell>
            ) : null}

            {resource.media_type === "image" ? <ResourceMediaPanel resource={resource} /> : null}

            {resource.media_type === "file" ? <ResourceMediaPanel resource={resource} /> : null}

            {resource.content ? (
              <CardShell className="p-5">
                <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-300/70">
                  Content
                </p>
                <h2 className="text-lg font-semibold text-white">内容详情</h2>
                <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-400">
                  {resource.content}
                </div>
              </CardShell>
            ) : null}

            <CardShell id="comments" className="p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-300/70">
                    Discussion
                  </p>
                  <h2 className="text-lg font-semibold text-white">
                    评论与使用反馈 · {comments.length}
                  </h2>
                </div>
              </div>
              {isLoggedIn ? (
                <form action={createCommentAction.bind(null, resource.id)} className="mb-5 grid gap-3">
                  <textarea
                    name="content"
                    required
                    rows={3}
                    maxLength={2000}
                    placeholder="分享使用体验、补充信息或反馈问题。"
                    className="rounded-md border border-white/10 bg-black/24 px-3 py-2.5 text-sm leading-7 text-slate-100 outline-none transition focus:border-cyan-300/50"
                  />
                  <button className="w-fit rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
                    发表评论
                  </button>
                </form>
              ) : (
                <Link
                  href={loginHref}
                  className="mb-5 inline-flex rounded-md border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-50"
                >
                  登录后参与评论
                </Link>
              )}
              <div className="space-y-3">
                {comments.map((comment) => {
                  const canDelete =
                    user?.id === comment.user_id ||
                    user?.role === "admin" ||
                    user?.email === process.env.ADMIN_EMAILS;
                  const commentName =
                    comment.user?.name ||
                    comment.user?.username ||
                    comment.user?.email?.split("@")[0] ||
                    "用户";

                  return (
                    <div key={comment.id} className="rounded-md border border-white/10 bg-white/[0.035] p-4">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="grid size-8 place-items-center rounded-md bg-cyan-300/12 text-xs font-semibold text-cyan-100"
                            style={
                              comment.user?.avatar_url
                                ? {
                                    backgroundImage: `url(${comment.user.avatar_url})`,
                                    backgroundPosition: "center",
                                    backgroundSize: "cover",
                                  }
                                : undefined
                            }
                          >
                            {comment.user?.avatar_url ? "" : commentName.slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-white">{commentName}</p>
                            <p className="text-xs text-slate-600">
                              {new Date(comment.created_at).toLocaleString("zh-CN")}
                            </p>
                          </div>
                        </div>
                        {canDelete ? (
                          <form action={deleteCommentAction}>
                            <input type="hidden" name="id" value={comment.id} />
                            <input type="hidden" name="resource_id" value={resource.id} />
                            <button className="text-xs text-slate-500 transition hover:text-pink-100">
                              删除
                            </button>
                          </form>
                        ) : null}
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-400">
                        {comment.content}
                      </p>
                    </div>
                  );
                })}
                {comments.length === 0 ? (
                  <p className="rounded-md border border-dashed border-white/10 bg-white/[0.025] p-4 text-sm text-slate-500">
                    暂无评论。登录后可以补充使用体验或反馈资源问题。
                  </p>
                ) : null}
              </div>
            </CardShell>

            {related.length > 0 ? (
              <CardShell className="p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-300/70">
                      Related
                    </p>
                    <h2 className="text-lg font-semibold text-white">相关推荐</h2>
                  </div>
                  <Link href="/resources" className="text-sm text-slate-500 transition hover:text-cyan-100">
                    查看更多
                  </Link>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/resources/${getResourceSlug(item)}`}
                      className="rounded-md border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/35"
                    >
                      <p className="mb-2 text-xs text-slate-500">{item.category}</p>
                      <h3 className="line-clamp-2 text-sm font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </CardShell>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}
