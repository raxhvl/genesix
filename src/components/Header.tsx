"use client";

import { isRootPage } from "@/lib/ui";

export default function Header() {
  if (isRootPage()) return null;
  return <header className="header">Header</header>;
}
