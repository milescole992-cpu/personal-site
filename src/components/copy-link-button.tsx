"use client";

import { useState } from "react";

type CopyLinkButtonProps = {
  href: string;
  className?: string;
};

export function CopyLinkButton({ href, className }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        const url = new URL(href, window.location.origin).toString();
        await window.navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }}
    >
      {copied ? "已复制" : "复制链接"}
    </button>
  );
}
