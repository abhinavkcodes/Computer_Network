"use client";

import { useState } from "react";

export function UserAvatar({
  src,
  name,
  className = "h-10 w-10",
}: {
  src?: string | null;
  name?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const initial = (name?.trim().charAt(0) || "U").toUpperCase();

  if (src && !failed) {
    return <img src={src} alt={`${name ?? "User"} profile`} referrerPolicy="no-referrer" onError={() => setFailed(true)} className={`${className} rounded-full object-cover`} />;
  }

  return <span aria-label={`${name ?? "User"} profile`} className={`${className} flex items-center justify-center rounded-full text-sm font-semibold`} style={{ background: "var(--accent-light)", color: "var(--text-primary)" }}>{initial}</span>;
}
