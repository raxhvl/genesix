"use client";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, anvil } from "wagmi/chains";

const APP_NAME = "Genesix";

export const chainConfig = getDefaultConfig({
  appName: APP_NAME,
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  // @ts-ignore
  chains:
    process.env.NODE_ENV === "development"
      ? [mainnet, sepolia, anvil] // anvil only for local development
      : [mainnet, sepolia],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
