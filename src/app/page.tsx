"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

export default function Page() {
  const { address, isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (address) {
      router.push("/challenges");
    }
  }, [isConnected]);

  return (
    <div>
      <h1>Welcome!</h1>
      {!isConnected && <ConnectButton />}
    </div>
  );
}
