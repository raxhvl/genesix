"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useAccount, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { Address } from "viem";
import Home from "@/app/page";
import { betaTesters, abi, getContractAddress } from "@/lib/config";

interface Web3ContextType {
  chainId: number;
  playerAddress: Address;
  isConnected: boolean;
  isReviewer: boolean;
  isBetaTester: boolean;
  isOwner: boolean;
  deadline: number; // Add this line
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: ReactNode }) {
  const { address, chainId, isConnected } = useAccount();
  const router = useRouter();
  const [isReviewer, setIsReviewer] = useState(false);
  const contractAddress = chainId ? getContractAddress(chainId) : undefined;

  // Add owner check
  const { data: ownerAddress } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "owner",
  });

  const isOwner = Boolean(address && ownerAddress && address === ownerAddress);

  // Query contract for reviewer status
  const { data: isContractReviewer } = useReadContract({
    address: chainId ? getContractAddress(chainId) : undefined,
    abi,
    functionName: "isApprover",
    args: [address as Address],
  });

  // Add deadline read
  const { data: deadline } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "deadline",
  });

  // Check both static list and contract for reviewer status
  useEffect(() => {
    if (address) {
      setIsReviewer(!!isContractReviewer);
    } else {
      setIsReviewer(false);
    }
  }, [address, isContractReviewer]);

  const isBetaTester = address ? betaTesters.includes(address) : false;

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
        isReviewer,
        isBetaTester,
        isOwner,
        deadline: deadline ? Number(deadline) : 0,
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
