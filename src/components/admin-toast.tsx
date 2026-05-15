"use client";

import { useEffect, useState } from "react";

type AdminToastProps = {
  message: string;
};

export function AdminToast({ message }: AdminToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 4200);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 max-w-sm rounded-lg border border-emerald-300/25 bg-emerald-950/90 px-4 py-3 text-sm text-emerald-50 shadow-2xl shadow-black/30 backdrop-blur">
      {message}
    </div>
  );
}
