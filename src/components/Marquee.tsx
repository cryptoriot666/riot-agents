'use client'

import { useEffect, useState } from 'react'

export function Marquee({
  children,
  speed = 20
}: {
  children: React.ReactNode
  speed?: number
}) {
  return (
    <div className="overflow-hidden whitespace-nowrap bg-ink text-cream py-2">
      <div
        className="inline-block font-display text-sm tracking-[0.3em] uppercase"
        style={{ animation: `marquee ${speed}s linear infinite` }}
      >
        <span className="mr-8">{children}</span>
        <span className="mr-8">{children}</span>
        <span className="mr-8">{children}</span>
        <span>{children}</span>
      </div>
    </div>
  )
}
