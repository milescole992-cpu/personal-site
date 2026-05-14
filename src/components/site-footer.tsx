export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          © 2026 AI资源工作台。当前内容为占位，后期替换为真实资源、评测和教程。
        </p>
        <div className="flex gap-4">
          <a href="#" className="transition hover:text-cyan-100">
            RSS
          </a>
          <a href="#" className="transition hover:text-cyan-100">
            Sitemap
          </a>
          <a href="#" className="transition hover:text-cyan-100">
            About
          </a>
        </div>
      </div>
    </footer>
  );
}
