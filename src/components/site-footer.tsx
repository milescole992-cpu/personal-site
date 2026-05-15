import type { SiteSettings } from "@/lib/supabase";
import Link from "next/link";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-white/10 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          © 2026 {settings.brand_name}。{settings.footer_description}
        </p>
        <div className="flex gap-4">
          <a href="/sitemap.xml" className="transition hover:text-cyan-100">
            Sitemap
          </a>
          <Link href="/resources" className="transition hover:text-cyan-100">
            Resources
          </Link>
        </div>
      </div>
    </footer>
  );
}
