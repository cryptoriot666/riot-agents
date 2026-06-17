import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F4EFE6',
        ink: '#111111',
        blood: '#E63946',
        highlight: '#F4D35E',
        'blood-dark': '#B82D38'
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'Impact', 'sans-serif'],
        mono: ['var(--font-plex)', 'Courier New', 'monospace']
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'marquee': 'marquee 20s linear infinite',
        'stamp-in': 'stampIn 0.3s ease-out forwards',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'slide-left': 'slideLeft 0.3s ease-out forwards',
        'dot-pulse': 'dotPulse 1.4s infinite ease-in-out both'
      },
      keyframes: {
        blink: { '50%': { opacity: '0' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        stampIn: {
          '0%': { transform: 'scale(3) rotate(-15deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(-12deg)', opacity: '1' }
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        dotPulse: {
          '0%,80%,100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' }
        }
      },
      backgroundImage: {
        'paper-grain': "url('/textures/paper.svg')",
        'halftone': "url('/textures/halftone.png')"
      }
    }
  },
  plugins: []
}

export default config
