"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Address } from "viem";
import Home from "@/app/page";

interface Web3ContextType {
  chainId: number;
  playerAddress: Address;
  isConnected: boolean;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const { address, chainId, isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  if (!isConnected || !address || !chainId) {
    return <Home />;
  }

  return (
    <Web3Context.Provider
      value={{
        chainId,
        playerAddress: address,
        isConnected,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3Context() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3Context must be used within Web3Provider");
  }
  return context;
}
