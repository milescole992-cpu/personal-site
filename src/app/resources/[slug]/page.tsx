import {
  ArrowLeft,
  ArrowUpRight,
  Download,
  Heart,
  Lock,
  Sparkles,
  Star,
  Target,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import {
  downloadResourceAction,
  favoriteResourceAction,
} from "@/app/actions/resources";
import { CardShell } from "@/components/card-shell";
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

  const title = `${resource.title} | AI资源详情`;
  const description = resource.description;
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
  const { configured, resource, related } = await getResourceBySlug(slug, user);

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
            <CardShell className="p-6 sm:p-8">
              <div className="mb-5 flex flex-wrap items-center gap-2">
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
              </div>

              <div className="grid gap-7 lg:grid-cols-[1fr_280px] lg:items-start">
                <div>
                  <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                    {resource.title}
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
                    {resource.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {resource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-white/5 px-2.5 py-1.5 text-xs text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-md border border-white/10 bg-black/24 p-4">
                  <a
                    href={resource.source_url || "#"}
                    target={resource.source_url ? "_blank" : undefined}
                    rel={resource.source_url ? "noreferrer" : undefined}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/6 px-3 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/40 hover:bg-white/10"
                  >
                    来源链接 <ArrowUpRight size={15} />
                  </a>

                  {isLoggedIn ? (
                    <>
                      <form
                        action={favoriteResourceAction.bind(null, resource.id)}
                      >
                        <button
                          type="submit"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-pink-300/20 bg-pink-300/8 px-3 py-2.5 text-sm font-semibold text-pink-100 transition hover:border-pink-300/40"
                        >
                          <Heart size={15} />
                          {resource.isFavorite ? "已收藏" : "收藏资源"}
                        </button>
                      </form>
                      <form action={downloadResourceAction.bind(null, resource.id)}>
                        <button
                          type="submit"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                        >
                          下载/访问 <Download size={15} />
                        </button>
                      </form>
                    </>
                  ) : (
                    <Link
                      href={loginHref}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                    >
                      登录后下载/访问 <Lock size={15} />
                    </Link>
                  )}
                </div>
              </div>
            </CardShell>

            <div className="grid gap-4 lg:grid-cols-2">
              <CardShell className="p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-100">
                  <UsersRound size={17} />
                  适合人群
                </div>
                <p className="text-sm leading-7 text-slate-400">
                  {resource.audience || "待补充"}
                </p>
              </CardShell>
              <CardShell className="p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-pink-100">
                  <Target size={17} />
                  使用场景
                </div>
                <p className="text-sm leading-7 text-slate-400">
                  {resource.use_cases || "待补充"}
                </p>
              </CardShell>
            </div>

            <CardShell className="p-5">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-300/70">
                    Related
                  </p>
                  <h2 className="text-lg font-semibold text-white">相关推荐</h2>
                </div>
                <Link
                  href="/resources"
                  className="text-sm text-slate-400 transition hover:text-cyan-100"
                >
                  查看全部
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/resources/${getResourceSlug(item)}`}
                    className="rounded-md border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/35 hover:bg-white/8"
                  >
                    <span className="text-xs text-slate-500">
                      {item.category}
                    </span>
                    <h3 className="mt-2 text-sm font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
                      {item.description}
                    </p>
                  </Link>
                ))}
                {related.length === 0 ? (
                  <p className="text-sm text-slate-500">暂无相关推荐。</p>
                ) : null}
              </div>
            </CardShell>
          </>
        ) : null}
      </div>
    </main>
  );
}
