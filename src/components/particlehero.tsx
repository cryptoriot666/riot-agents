'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; opacity: number; life: number; maxLife: number;
}

export function ParticleHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0
    let particles: Particle[] = []
    let mouseX = 0.5, mouseY = 0.5
    let targetMouseX = 0.5, targetMouseY = 0.5
    let frame = 0

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }

    const createParticle = (): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      life: 0,
      maxLife: 400 + Math.random() * 600,
    })

    const initParticles = () => {
      const count = Math.floor((w * h) / 12000)
      particles = Array.from({ length: count }, createParticle)
    }

    resize()
    initParticles()
    window.addEventListener('resize', () => { resize(); initParticles() })

    const onMove = (e: MouseEvent) => {
      targetMouseX = e.clientX / w
      targetMouseY = e.clientY / h
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    let animId = 0
    const render = () => {
      frame++
      mouseX += (targetMouseX - mouseX) * 0.05
      mouseY += (targetMouseY - mouseY) * 0.05

      ctx.clearRect(0, 0, w, h)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++
        if (p.life > p.maxLife) {
          particles[i] = createParticle()
          particles[i].life = 0
          continue
        }

        const lifeRatio = p.life / p.maxLife
        const fadeIn = Math.min(lifeRatio * 10, 1)
        const fadeOut = 1 - Math.max(0, (lifeRatio - 0.8) * 5)
        const alpha = p.opacity * fadeIn * fadeOut

        // Attraction toward mouse
        const dx = mouseX * w - p.x
        const dy = mouseY * h - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const maxDist = 300
        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * 0.03
          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force
        }

        // Viscosity
        p.vx *= 0.99
        p.vy *= 0.99
        p.vx += (Math.random() - 0.5) * 0.02
        p.vy += (Math.random() - 0.5) * 0.02

        p.x += p.vx
        p.y += p.vy

        // Wrap
        if (p.x < -50) p.x = w + 50
        if (p.x > w + 50) p.x = -50
        if (p.y < -50) p.y = h + 50
        if (p.y > h + 50) p.y = -50

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(230,57,70,${alpha})`
        ctx.fill()

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx2 = p.x - p2.x
          const dy2 = p.y - p2.y
          const d2 = dx2 * dx2 + dy2 * dy2
          if (d2 < 15000) {
            const lineAlpha = (1 - d2 / 15000) * alpha * p2.opacity * 0.3
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(244,211,94,${lineAlpha})`
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  )
}
