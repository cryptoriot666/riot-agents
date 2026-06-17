'use client'

import { SuietWalletProvider } from '@/lib/suiet-shim'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SuietWalletProvider>
      {children}
    </SuietWalletProvider>
  )
}
