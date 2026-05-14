import { Compass, Cpu, Sparkles, Zap } from "lucide-react";
import { CardShell } from "./card-shell";
import { SectionHeader } from "./section-header";

const focusCards = [
  {
    title: "普通人也能用",
    description: "把复杂工具翻译成能直接上手的步骤，不堆术语，不制造焦虑。",
    icon: Sparkles,
  },
  {
    title: "海外AI工具筛选",
    description: "关注真实可用性：注册门槛、价格、中文场景、替代方案和风险。",
    icon: Compass,
  },
  {
    title: "创作者工作流",
    description: "围绕选题、脚本、视觉、剪辑、发布，沉淀可复用的流程模板。",
    icon: Cpu,
  },
  {
    title: "副业执行视角",
    description: "从工具收藏转向具体交付，帮你判断哪些AI玩法值得投入时间。",
    icon: Zap,
  },
];

export function FocusSection() {
  return (
    <section id="resources">
      <SectionHeader eyebrow="Positioning" title="这个站解决什么问题" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {focusCards.map((item) => {
          const Icon = item.icon;
          return (
            <CardShell key={item.title} className="p-4" glow="emerald">
              <div className="mb-4 grid size-10 place-items-center rounded-md border border-emerald-300/20 bg-emerald-300/8 text-emerald-100">
                <Icon size={18} />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {item.description}
              </p>
            </CardShell>
          );
        })}
      </div>
    </section>
  );
}
