import { cn } from "@/lib/utils";

type CardShellProps = {
  children: React.ReactNode;
  className?: string;
  glow?: "cyan" | "violet" | "pink" | "emerald" | "none";
  id?: string;
};

const glowMap = {
  cyan: "hover:border-cyan-300/45 hover:shadow-[0_0_34px_rgba(34,211,238,0.12)]",
  violet:
    "hover:border-violet-300/45 hover:shadow-[0_0_34px_rgba(167,139,250,0.12)]",
  pink: "hover:border-pink-300/45 hover:shadow-[0_0_34px_rgba(244,114,182,0.12)]",
  emerald:
    "hover:border-emerald-300/45 hover:shadow-[0_0_34px_rgba(52,211,153,0.12)]",
  none: "",
};

export function CardShell({
  children,
  className,
  glow = "cyan",
  id,
}: CardShellProps) {
  return (
    <div
      id={id}
      className={cn(
        "group rounded-lg border border-white/10 bg-slate-950/58 p-5 shadow-2xl shadow-black/20 backdrop-blur-md transition duration-300",
        glowMap[glow],
        className,
      )}
    >
      {children}
    </div>
  );
}
