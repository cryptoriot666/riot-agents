'use client'

import { SuietWalletProvider } from '@suiet/suiet-kit'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SuietWalletProvider>
      {children}
    </SuietWalletProvider>
  )
}
