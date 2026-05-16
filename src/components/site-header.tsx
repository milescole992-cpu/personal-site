import { Menu } from "lucide-react";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { isAdminEmail } from "@/lib/auth-utils";
import { getSiteSettings } from "@/lib/data";

export async function SiteHeader() {
  const session = await auth();
  const settings = await getSiteSettings();
  const user = session?.user;
  const displayName = user?.name || user?.email || "用户";
  const isAdmin = isAdminEmail(user?.email);
  const navItems = [
    { label: "首页", href: "/" },
    { label: "资源库", href: "/resources" },
    { label: "工具", href: "/tools" },
    { label: "路线", href: "/roadmap" },
    { label: "工作流", href: "/workflows" },
    { label: "教程", href: "/tutorials" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070914]/82 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 font-mono text-sm font-bold text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.18)]">
            AI
          </span>
          <span>
            <span className="block text-sm font-semibold text-white">
              {settings.brand_name}
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">
              AI Lab & CMS
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/8 hover:text-cyan-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="hidden rounded-md border border-emerald-300/20 bg-emerald-300/8 px-3 py-2 text-sm text-emerald-100 transition hover:border-emerald-300/40 hover:bg-emerald-300/12 lg:inline-flex"
                >
                  管理
                </Link>
              ) : null}
              <Link
                href="/submit"
                className="hidden rounded-md border border-cyan-300/20 bg-cyan-300/8 px-3 py-2 text-sm text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/12 lg:inline-flex"
              >
                投稿
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100"
              >
                <span
                  className="grid size-6 place-items-center rounded-md bg-cyan-300/12 text-xs font-semibold text-cyan-100"
                  style={
                    user.image
                      ? {
                          backgroundImage: `url(${user.image})`,
                          backgroundPosition: "center",
                          backgroundSize: "cover",
                        }
                      : undefined
                  }
                >
                  {user.image ? "" : displayName.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden max-w-24 truncate md:inline">
                  {displayName}
                </span>
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-100"
                >
                  退出
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex rounded-md bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              登录
            </Link>
          )}
          <details className="relative md:hidden">
            <summary className="grid size-9 cursor-pointer list-none place-items-center rounded-md border border-white/10 bg-white/5 text-slate-300 [&::-webkit-details-marker]:hidden">
              <Menu size={17} />
            </summary>
            <div className="absolute right-0 mt-2 grid w-40 gap-1 rounded-lg border border-white/10 bg-[#0c1020] p-2 shadow-2xl">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/8 hover:text-cyan-100"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
