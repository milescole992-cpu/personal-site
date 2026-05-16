import {
  ArrowLeft,
  Download,
  Heart,
  Lock,
  Sparkles,
  Star,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
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
  const { configured, resource } = await getResourceBySlug(slug, user);

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
                </div>

                {isLoggedIn || (resource.media_type === "file" && resource.media_url) ? (
                <div className="space-y-3 rounded-md border border-white/10 bg-black/24 p-4">
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
                  ) : resource.media_type === "file" && resource.media_url ? (
                    <Link
                      href={loginHref}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                    >
                      登录后下载 <Lock size={15} />
                    </Link>
                  ) : null}
                </div>
                ) : null}
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
          </>
        ) : null}
      </div>
    </main>
  );
}
