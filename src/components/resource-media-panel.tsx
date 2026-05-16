import { FileText, ImageIcon, Play } from "lucide-react";
import Image from "next/image";
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

  if (resource.media_type === "image") {
    return (
      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-100">
          <ImageIcon size={16} />
          图片预览
          {resource.media_file_name ? (
            <span className="font-normal text-slate-500">· {resource.media_file_name}</span>
          ) : null}
        </div>
        <Image
          src={resource.media_url}
          alt={resource.title}
          width={1200}
          height={800}
          unoptimized
          className="max-h-[min(70vh,560px)] w-full rounded-md object-contain"
        />
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-cyan-100">
        <FileText size={16} />
        附件文件
      </div>
      <div className="rounded-md border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-400">
        {resource.media_file_name || "附件已上传"}
      </div>
    </section>
  );
}
