import { Activity, MapPin, Radio, UserRound } from "lucide-react";
import { profileLinks, stats } from "@/data/mock";
import { CardShell } from "./card-shell";
import { HotList } from "./hot-list";
import { TagCloud } from "./tag-cloud";

export function Sidebar() {
  return (
    <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <ProfileCard />
      <StatsCard />
      <HotList />
      <TagCloud />
    </aside>
  );
}

function ProfileCard() {
  return (
    <CardShell glow="pink">
      <div className="flex items-start gap-4">
        <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-cyan-300/25 bg-[radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.28),rgba(168,85,247,0.18)_42%,rgba(15,23,42,0.95))]">
          <UserRound size={30} className="text-cyan-100" />
          <span className="absolute inset-x-0 bottom-0 h-px bg-cyan-200/60" />
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
            Operator
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            昵称占位
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            这里是个人简介占位。可以写技术方向、兴趣、站点说明或一句长期签名。
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        {profileLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href="#"
              className="flex items-center justify-between rounded-md border border-white/8 bg-white/5 px-3 py-2.5 text-sm text-slate-300 transition hover:border-cyan-300/35 hover:text-cyan-100"
            >
              <span className="inline-flex items-center gap-2">
                <Icon size={15} />
                {link.label}
              </span>
              <span className="font-mono text-xs text-slate-600">GO</span>
            </a>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1.5">
          <MapPin size={12} />
          位置占位
        </span>
        <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2.5 py-1.5">
          <Radio size={12} />
          在线占位
        </span>
      </div>
    </CardShell>
  );
}

function StatsCard() {
  return (
    <CardShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-300/70">
            Site Status
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">网站统计</h2>
        </div>
        <Activity size={18} className="text-emerald-200" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-md bg-white/5 p-3">
              <div className="mb-3 flex items-center justify-between">
                <Icon size={15} className="text-slate-500" />
                <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" />
              </div>
              <p className="font-mono text-xl text-white">{item.value}</p>
              <p className="mt-1 text-xs text-slate-500">{item.label}</p>
            </div>
          );
        })}
      </div>
    </CardShell>
  );
}
