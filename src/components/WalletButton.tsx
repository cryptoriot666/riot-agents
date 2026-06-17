'use client'

import { useSuiet } from '@/lib/suiet-shim'

export function WalletButton() {
  const { connected, address, connect, disconnect } = useSuiet()

  if (connected && address) {
    const short = `${address.slice(0, 6)}...${address.slice(-4)}`

    return (
      <button
        onClick={disconnect}
        className="punk-btn text-sm flex items-center gap-2"
      >
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        {short}
        <span className="text-highlight">DISCONNECT</span>
      </button>
    )
  }

  return (
    <button onClick={connect} className="punk-btn">
      CONNECT WALLET
    </button>
  )
}
