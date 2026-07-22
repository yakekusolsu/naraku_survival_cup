import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['M PLUS Rounded 1c', 'Noto Sans JP', 'sans-serif'],
        sans: ['M PLUS Rounded 1c', 'Noto Sans JP', 'sans-serif'],
      },
      colors: {
        nsc: {
          cyan: '#00CFFF',
          blue: '#009DFF',
          sky: '#83D7FF',
          orange: '#FF6B35',
          amber: '#E6FF0A',
          gold: '#FFE66D',
          navy: '#153C66',
          deep: '#275382',
          steel: '#F5F6F8',
          text: '#153C66',
        },
      },
      boxShadow: {
        neon: '0 0 28px rgba(0, 207, 255, .35), inset 0 0 18px rgba(0, 207, 255, .08)',
        ember: '0 0 28px rgba(255, 107, 53, .3)',
      },
      backgroundImage: {
        'nsc-radial': 'radial-gradient(circle at 20% 20%, rgba(0,207,255,.22), transparent 36%), radial-gradient(circle at 80% 10%, rgba(255,107,53,.2), transparent 34%)',
      },
    },
  },
  plugins: [],
} satisfies Config
