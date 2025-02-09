// Css
import "./globals.css";

import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import WalletProvider from "@/components/WalletProvider";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Genesix",
  description: "The first six days of your web3 origin story.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-svh bg-background`}
      >
        <WalletProvider>
          <Header />
          <main>{children}</main>
        </WalletProvider>
        <Toaster />
      </body>
    </html>
  );
}
