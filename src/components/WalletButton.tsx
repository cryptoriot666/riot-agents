'use client'

import { useSuiet } from '@/lib/suiet-shim'
import { useState } from 'react'

export function WalletButton() {
  const { connected, address, connect, disconnect } = useSuiet()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (connected) {
      await disconnect()
    } else {
      setLoading(true)
      try { await connect() } catch {}
      setLoading(false)
    }
  }

  const shortAddr = address
    ? address.slice(0, 6) + '...' + address.slice(-4)
    : ''

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        backgroundColor: connected ? '#2EC4B6' : '#E63946',
        color: 'white',
        fontFamily: 'var(--font-display), sans-serif',
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        border: '3px solid #111111',
        padding: '8px 24px',
        borderRadius: '0',
        cursor: loading ? 'wait' : 'pointer',
        boxShadow: '4px 4px 0 #E63946',
        transition: 'all 0.15s',
      }}
    >
      {loading ? 'WAIT...' : connected ? shortAddr : 'CONNECT WALLET'}
    </button>
  )
}
