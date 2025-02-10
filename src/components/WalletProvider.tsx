"use client";
import "@rainbow-me/rainbowkit/styles.css";

import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { chainConfig } from "@/lib/config";
import { Web3Provider } from "@/lib/context/Web3Context";

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={chainConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "hsl(var(--primary))",
            accentColorForeground: "hsl(var(--primary-foreground))",
            borderRadius: "small",
            overlayBlur: "small",
          })}
        >
          <Web3Provider>
            <main>{children}</main>
          </Web3Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
