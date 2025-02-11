"use client";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, anvil } from "wagmi/chains";
import { Abi, Address } from "viem";
import Genesix from "./abi/Genesix.json";

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

export const contractAddresses = {
  mainnet: "0xYourMainnetContractAddress" as Address,
  sepolia: "0xYourSepoliaContractAddress" as Address,
  anvil: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as Address,
};

export const getContractAddress = (chainId: number): Address => {
  switch (chainId) {
    case 1:
      return contractAddresses.mainnet;
    case 2:
      return contractAddresses.sepolia;
    case 31337:
      return contractAddresses.anvil;
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
};

export const abi = Genesix.abi as Abi;

export const imageConfig = {
  maxFiles: 3,
  maxSizeInMB: 3,
  acceptedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
};

export const reviewerAddresses: Address[] = [
  "0x5a9d681201fedb563B29D3099628c2c6fA1BBDD8",
  "0xbb3EAa87E8057f84fD47C16D59dFBD20Ab9B5b2f",
];
