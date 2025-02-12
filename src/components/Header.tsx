"use client";

import { isRootPage } from "@/lib/ui";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Blocks, ScrollText, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useWeb3Context } from "@/lib/context/Web3Context";
import { CountdownTimer } from "./CountdownTimer";

export default function Header() {
  const { isReviewer, isOwner, deadline } = useWeb3Context();

  if (isRootPage()) return null;
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 items-center">
        <Link
          href="/"
          className="font-geist-sans font-bold text-xl md:text-2xl tracking-tight text-primary mr-4 md:mr-6"
        >
          🌌 Genesix
        </Link>
        <div className="flex items-center gap-2 md:gap-6">
          <Link href="/challenges">
            <Button variant="ghost" className="flex items-center gap-2">
              <Blocks className="h-4 w-4" />
              <span className="hidden md:inline">Challenges</span>
            </Button>
          </Link>
          {isReviewer && (
            <Link href="/review">
              <Button variant="ghost" className="flex items-center gap-2">
                <ScrollText className="h-4 w-4" />
                <span className="hidden md:inline">Review</span>
              </Button>
            </Link>
          )}
          {isOwner && (
            <Link href="/settings">
              <Button variant="ghost" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">Settings</span>
              </Button>
            </Link>
          )}
        </div>
        <div className="mx-auto">
          <CountdownTimer deadline={deadline} />
        </div>
        <div className="ml-auto">
          <ConnectButton />
        </div>
      </nav>
    </header>
  );
}
