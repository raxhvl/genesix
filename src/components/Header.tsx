"use client";

import { isRootPage } from "@/lib/ui";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Blocks, ScrollText, Settings2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useWeb3Context } from "@/lib/context/Web3Context";

export default function Header() {
  const { isReviewer } = useWeb3Context();

  if (isRootPage()) return null;
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 items-center gap-6">
        <Link
          href="/"
          className="font-geist-sans font-bold text-2xl tracking-tight text-primary mx-6"
        >
          🌌 Genesix
        </Link>
        <Link href="/challenges">
          <Button variant="ghost" className="flex items-center gap-2">
            <Blocks className="h-4 w-4" />
            Challenges
          </Button>
        </Link>
        {isReviewer && (
          <Link href="/review">
            <Button variant="ghost" className="flex items-center gap-2">
              <ScrollText className="h-4 w-4" />
              Review
            </Button>
          </Link>
        )}
        <div className="ml-auto">
          <ConnectButton />
        </div>
      </nav>
    </header>
  );
}
