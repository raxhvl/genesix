"use client";
import { useAppContext } from "../app/context/AppContext";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export default function Header() {
  const { points } = useAppContext();

  return (
    <header className="bg-accent text-accent-foreground p-4 flex justify-between items-center">
      <div className="flex items-center">
        <Star className="h-6 w-6 text-yellow-400 mr-2" />
        <span className="text-lg font-semibold glow">{points} Points</span>
      </div>
      <Button variant="outline">Connect Wallet</Button>
    </header>
  );
}
