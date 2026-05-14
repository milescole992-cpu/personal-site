import { tags } from "@/data/mock";
import { CardShell } from "./card-shell";
import { SectionHeader } from "./section-header";

export function TagCloud() {
  return (
    <section>
      <SectionHeader eyebrow="Tags" title="标签云" />
      <CardShell>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <a
              key={tag}
              href="#"
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/8 hover:text-cyan-100"
              style={{ opacity: 0.72 + (index % 4) * 0.07 }}
            >
              #{tag}
            </a>
          ))}
        </div>
      </CardShell>
    </section>
  );
}
