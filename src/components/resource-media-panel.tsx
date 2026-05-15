import { Download, FileText, Play } from "lucide-react";
import type { Resource } from "@/lib/supabase";

export function ResourceMediaPanel({ resource }: { resource: Resource }) {
  if (!resource.media_url || resource.media_type === "none") {
    return null;
  }

  if (resource.media_type === "video") {
    return (
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-100">
          <Play size={16} />
          视频内容
          {resource.media_file_name ? (
            <span className="font-normal text-slate-500">· {resource.media_file_name}</span>
          ) : null}
        </div>
        <video
          src={resource.media_url}
          controls
          playsInline
          preload="metadata"
          className="max-h-[min(70vh,520px)] w-full rounded-md bg-black"
        >
          您的浏览器不支持内嵌视频播放。
        </video>
      </section>
    );
  }

  const label =
    resource.media_type === "file"
      ? resource.media_file_name || "下载附件"
      : "外部资源链接";

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-100">
        <FileText size={16} />
        {resource.media_type === "file" ? "附件文件" : "资源链接"}
      </div>
      <a
        href={resource.media_url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-md border border-cyan-300/25 bg-cyan-300/8 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/40"
      >
        <Download size={15} />
        {label}
      </a>
    </section>
  );
}
