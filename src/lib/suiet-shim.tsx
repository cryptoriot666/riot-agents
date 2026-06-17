"use client";

// Compatibility shim: @suiet/wallet-kit → @suiet/suiet-kit interface
import { WalletProvider, useWallet as useSuietWallet } from "@suiet/wallet-kit";
import type { ReactNode } from "react";

export function SuietProvider({ children }: { children: ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}

export { SuietProvider as SuietWalletProvider };

export function useSuiet() {
  const wallet = useSuietWallet();
  return {
    connected: wallet.connected,
    address: wallet.address ?? null,
    connect: async () => {
      await wallet.select("Suiet");
    },
    disconnect: async () => {
      await wallet.disconnect();
    },
    wallet,
  };
}

export { useSuietWallet as useWallet, useSuietWallet };
