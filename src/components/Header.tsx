"use client";

import { isRootPage } from "@/lib/ui";
import { BoxSelect, ClipboardCheck, Settings } from "lucide-react";
import Link from "next/link";

export default function Header() {
  if (isRootPage()) return null;
  return (
    <header className="flex items-center gap-4 p-4 border-b">
      <nav className="flex gap-4">
        <Link href="/challenges" className="flex items-center gap-1">
          <BoxSelect size={20} className="text-yellow-400" />
          All Challenges
        </Link>
        <Link href="/review" className="flex items-center gap-1">
          <ClipboardCheck size={20} className="text-yellow-400" />
          Review
        </Link>
        <Link href="/admin" className="flex items-center gap-1">
          <Settings size={20} className="text-yellow-400" />
          Admin
        </Link>
      </nav>
    </header>
  );
}
