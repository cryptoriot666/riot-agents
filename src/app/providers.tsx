'use client'

import { SuietWalletProvider } from '@/lib/suiet-shim'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SuietWalletProvider>
      {children}
    </SuietWalletProvider>
  )
}
