import { CalendarDays, Download, Heart, Sparkles, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type React from "react";
import { CardShell } from "@/components/card-shell";
import { getCreatorProfile } from "@/lib/data";
import { getResourceSlug } from "@/lib/slug";

type CreatorPageProps = {
  params: Promise<{
    username: string;
  }>;
};

export async function generateMetadata({ params }: CreatorPageProps) {
  const { username } = await params;
  const { user } = await getCreatorProfile(username);

  if (!user) {
    return {
      title: "创作者未找到",
    };
  }

  return {
    title: `${user.name || user.username || "创作者"} | 创作者主页`,
    description: user.bio || "AI资源工作台创作者主页。",
  };
}

export default async function CreatorPage({ params }: CreatorPageProps) {
  const { username } = await params;
  const { configured, user, resources, stats } = await getCreatorProfile(username);

  if (configured && !user) {
    notFound();
  }

  return (
    <main className="relative min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />

      <div className="mx-auto max-w-5xl space-y-6">
        {!configured ? (
          <CardShell glow="pink">
            <h1 className="text-lg font-semibold text-white">Supabase 尚未配置</h1>
          </CardShell>
        ) : null}

        {user ? (
          <>
            <CardShell className="overflow-hidden p-0">
              {user.profile_banner_url ? (
                <div className="relative h-36 w-full">
                  <Image
                    src={user.profile_banner_url}
                    alt={user.name || user.username || "Creator banner"}
                    fill
                    unoptimized
                    className="object-cover opacity-75"
                  />
                </div>
              ) : (
                <div className="h-28 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(168,85,247,0.12),rgba(15,23,42,0.4))]" />
              )}
              <div className="p-6">
                <div className="-mt-14 mb-5 flex items-end gap-4">
                  <span
                    className="grid size-20 place-items-center rounded-xl border border-white/10 bg-slate-900 text-2xl font-semibold text-cyan-100 shadow-2xl"
                    style={
                      user.avatar_url
                        ? {
                            backgroundImage: `url(${user.avatar_url})`,
                            backgroundPosition: "center",
                            backgroundSize: "cover",
                          }
                        : undefined
                    }
                  >
                    {user.avatar_url ? "" : (user.name || user.email).slice(0, 1).toUpperCase()}
                  </span>
                  <div className="pb-2">
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
                      Creator Profile
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold text-white">
                      {user.name || user.username || user.email.split("@")[0]}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">@{user.username}</p>
                  </div>
                </div>
                <p className="max-w-3xl text-sm leading-7 text-slate-400">
                  {user.bio || "这个创作者还没有填写简介。"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1.5">
                    <CalendarDays size={13} />
                    加入于 {new Date(user.created_at).toLocaleDateString("zh-CN")}
                  </span>
                  <span className="rounded-md bg-white/5 px-2.5 py-1.5">
                    贡献值 {stats.score}
                  </span>
                </div>
              </div>
            </CardShell>

            <div className="grid gap-3 sm:grid-cols-5">
              <Stat label="投稿" value={stats.submissions} />
              <Stat label="通过" value={stats.approved} />
              <Stat label="资源" value={resources.length} />
              <Stat label="被收藏" value={stats.favorites} icon={<Heart size={14} />} />
              <Stat label="被下载" value={stats.downloads} icon={<Download size={14} />} />
            </div>

            <CardShell>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
                    Contributions
                  </p>
                  <h2 className="text-lg font-semibold text-white">贡献资源</h2>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1.5 text-xs text-slate-500">
                  <ThumbsUp size={13} />
                  {stats.likes} 点赞
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {resources.map((resource) => (
                  <Link
                    key={resource.id}
                    href={`/resources/${getResourceSlug(resource)}`}
                    className="rounded-md border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/35"
                  >
                    <p className="mb-2 text-xs text-slate-500">{resource.category}</p>
                    <h3 className="text-base font-semibold text-white">{resource.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {resource.description}
                    </p>
                  </Link>
                ))}
                {resources.length === 0 ? (
                  <p className="text-sm text-slate-500">暂无公开贡献资源。</p>
                ) : null}
              </div>
            </CardShell>
          </>
        ) : null}
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-2 flex items-center gap-2 text-cyan-200">
        {icon ?? <Sparkles size={14} />}
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="font-mono text-2xl text-white">{value}</p>
    </div>
  );
}
