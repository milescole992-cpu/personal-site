type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  action?: string;
};

export function SectionHeader({ eyebrow, title, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-300/70">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-lg font-semibold text-slate-50">{title}</h2>
      </div>
      {action ? (
        <a
          href="#"
          className="text-sm text-slate-400 transition hover:text-cyan-200"
        >
          {action}
        </a>
      ) : null}
    </div>
  );
}
