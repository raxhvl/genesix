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
  mainnet: "0x6768DB43De54E23823f0507216eA327b887dE681" as Address,
  sepolia: "0x5E715f0b429EEAbbc30f6AB56b2067f35df2b071" as Address,
  anvil: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as Address,
};

export const getContractAddress = (chainId: number): Address => {
  switch (chainId) {
    case mainnet.id:
      return contractAddresses.mainnet;
    case sepolia.id:
      return contractAddresses.sepolia;
    case anvil.id:
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

export const betaTesters: Address[] = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Allows submissions on testnets
  "0x5a9d681201fedb563B29D3099628c2c6fA1BBDD8",
];

export const openseaConfig = {
  mainnet: "https://opensea.io/assets/ethereum",
  sepolia: "https://testnets.opensea.io/assets/sepolia",
  anvil: "https://testnets.opensea.io/assets/sepolia", // This URL Points to sepolia, its okay.
} as const;

export const audioConfig = {
  celebrationSound: "/audio/celebration.mp3",
} as const;

export const getOpenseaUrl = (
  chainId: number,
  contractAddress: string,
  tokenId: number
): string => {
  switch (chainId) {
    case mainnet.id:
      return `${openseaConfig.mainnet}/${contractAddress}/${tokenId}`;
    case sepolia.id:
      return `${openseaConfig.sepolia}/${contractAddress}/${tokenId}`;
    case anvil.id:
      return `${openseaConfig.anvil}/${contractAddress}/${tokenId}`;
    default:
      throw new Error(`Unsupported chainId for OpenSea: ${chainId}`);
  }
};
