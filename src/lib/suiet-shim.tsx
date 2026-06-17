'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'

interface WalletState {
  connected: boolean
  address: string | null
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  signMessage: (msg: string) => Promise<string>
}

const WalletCtx = createContext<WalletState>({
  connected: false, address: null,
  connect: async () => {}, disconnect: async () => {},
  signMessage: async () => '',
})

export function SuietWalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)

  const connect = useCallback(async () => {
    // Detect any Sui wallet extension
    const win = window as any
    const wallet = win.suiWallet || win.suietWallet || win.sui
    if (!wallet) {
      alert('No Sui wallet detected. Please install Sui Wallet extension.')
      return
    }

    try {
      const resp = await wallet.requestAccounts()
      const accounts = resp?.accounts ?? [resp].filter(Boolean)
      if (accounts.length) setAddress(accounts[0])
    } catch (e) {
      alert('Failed to connect wallet: ' + String(e))
    }
  }, [])

  const disconnect = useCallback(async () => {
    setAddress(null)
  }, [])

  const signMessage = useCallback(async (msg: string): Promise<string> => {
    const win = window as any
    const wallet = win.suiWallet || win.suietWallet || win.sui
    if (!wallet) throw new Error('No wallet')

    const encoded = new TextEncoder().encode(msg)
    const result = await wallet.signPersonalMessage({ message: encoded })
    return result.signature ?? result.signedMessage ?? result
  }, [])

  // Auto-detect already connected
  useEffect(() => {
    const win = window as any
    const wallet = win.suiWallet || win.suietWallet || win.sui
    if (wallet?.accounts?.length) {
      setAddress(wallet.accounts[0])
    }
  }, [])

  return (
    <WalletCtx.Provider value={{ connected: !!address, address, connect, disconnect, signMessage }}>
      {children}
    </WalletCtx.Provider>
  )
}

export function useSuiet()  { return useContext(WalletCtx) }
export function useSuietWallet() { return useContext(WalletCtx) }
export function useWallet() { return useContext(WalletCtx) }
export { SuietWalletProvider as SuietProvider }
