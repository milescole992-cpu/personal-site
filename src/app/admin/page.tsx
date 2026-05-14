import {
  BarChart3,
  FilePlus2,
  LockKeyhole,
  UploadCloud,
  UsersRound,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CardShell } from "@/components/card-shell";
import { isAdminEmail } from "@/lib/auth-utils";

export const metadata = {
  title: "管理后台 | AI资源工作台",
};

const adminItems = [
  {
    title: "用户列表占位",
    description: "后期接数据库后展示用户邮箱、登录方式、注册时间和权限。",
    icon: UsersRound,
  },
  {
    title: "资源列表占位",
    description: "管理AI资源包、下载权限、文件地址和资源状态。",
    icon: Wrench,
  },
  {
    title: "发布文章入口占位",
    description: "预留给AI工具评测、工作流教程和资源介绍文章发布。",
    icon: FilePlus2,
  },
  {
    title: "上传资源入口占位",
    description: "后期可接对象存储，用于上传PDF、表格、模板和素材包。",
    icon: UploadCloud,
  },
  {
    title: "下载数据统计占位",
    description: "统计资源浏览、登录下载、热门资源和转化数据。",
    icon: BarChart3,
  },
];

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!isAdminEmail(session.user.email)) {
    return (
      <main className="relative min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
        <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center">
          <CardShell className="w-full p-6 text-center sm:p-7" glow="pink">
            <LockKeyhole className="mx-auto mb-4 text-pink-200" size={34} />
            <h1 className="text-2xl font-semibold text-white">无权限访问</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              当前账号不在 `ADMIN_EMAILS` 管理员邮箱列表中。请使用管理员账号登录，
              或联系站点管理员添加邮箱。
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex rounded-md bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              返回首页
            </Link>
          </CardShell>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#070914] px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.11),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(217,70,239,0.10),transparent_28%),linear-gradient(180deg,#070914,#0b1020_48%,#070914)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 scanline opacity-35" />

      <div className="mx-auto max-w-6xl space-y-6">
        <CardShell className="p-6 sm:p-7">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
            ADMIN
          </p>
          <h1 className="text-3xl font-semibold text-white">管理后台</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
            当前是管理员占位后台。后期可以接数据库、文章编辑器、资源上传、
            用户权限和下载数据统计。
          </p>
        </CardShell>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {adminItems.map((item) => {
            const Icon = item.icon;
            return (
              <CardShell key={item.title} className="p-5">
                <Icon className="mb-4 text-cyan-200" size={22} />
                <h2 className="text-base font-semibold text-white">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>
              </CardShell>
            );
          })}
        </div>
      </div>
    </main>
  );
}
